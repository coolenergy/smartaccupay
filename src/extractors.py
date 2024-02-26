from collections import namedtuple
import json
import boto3
import time
import os
import trp
from PyPDF2 import PdfReader, PdfWriter
from io import BytesIO
from typing import List
from datetime import datetime

from dotenv import load_dotenv
load_dotenv()


class ExpensesCreator:
    def __init__(self, s3_docs_bundle_url):
        self.s3_docs_bundle_url = s3_docs_bundle_url

    def create(self):
        job_id = self._start_analysis()
        return self._wait_and_get_analysis_result(job_id)

    def _start_analysis(self):
        # Parse input s3 object url
        indices = [i for i in range(len(self.s3_docs_bundle_url)) if self.s3_docs_bundle_url[i] == '/']
        endpoint_url = self.s3_docs_bundle_url[:indices[2]]
        bucket = self.s3_docs_bundle_url[indices[2] + 1: indices[3]]
        key = self.s3_docs_bundle_url[indices[3] + 1:]

        # Connect to source s3
        input_s3 = boto3.client(
            's3',
            endpoint_url=endpoint_url,
            aws_access_key_id=os.getenv('INPUT_AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('INPUT_AWS_SECRET_ACCESS_KEY')
        )

        # Get bucket object
        result = input_s3.get_object(Bucket=bucket, Key=key)

        # Copy to destination s3
        textract_s3_bucket = 'rovuk-analysis-input'
        s3 = boto3.client('s3')
        s3.put_object(Body=result['Body'].read(), Bucket=textract_s3_bucket, Key=key)

        # Analyze
        return self._start_job(textract_s3_bucket, key)

    @staticmethod
    def _start_job(bucket_name, object_name):
        client = boto3.client('textract')
        response = client.start_expense_analysis(
            DocumentLocation={
                'S3Object': {
                    'Bucket': bucket_name,
                    'Name': object_name
                }
            })

        return response["JobId"]

    @staticmethod
    def _wait_and_get_analysis_result(job_id):
        print(f'expense_job_id: {job_id}')
        sleep_sec = 1
        time.sleep(sleep_sec)
        client = boto3.client('textract')
        response = client.get_expense_analysis(JobId=job_id)
        print(f'expense_job_status: {response["JobStatus"]}')

        while response["JobStatus"] == "IN_PROGRESS":
            time.sleep(sleep_sec)
            response = client.get_expense_analysis(JobId=job_id)
            print(f'expense_job_status: {response["JobStatus"]}')

        return response


ExpenseAnalysisField = namedtuple("ExpenseAnalysisField", "type label value")
ExpenseAnalysisLineItem = namedtuple("ExpenseAnalysisLineItem", "item unit_price product_code quantity price")


class ExpenseParser:
    """
    List of Expense Analysis Standard Fields:
    https://docs.aws.amazon.com/textract/latest/dg/invoices-receipts.html
    """

    def __init__(self, document):
        self.document = document
        self.classified_fields = None
        self.all_classified_fields = None
        self.other_fields = None
        self.expense_groups = None

    def parse(self):
        (self.classified_fields,
         self.all_classified_fields,
         self.other_fields,
         self.expense_groups) = self._parse_document()

        return self

    def _parse_document(self):
        classified = {}
        all_classified = {}
        other = []

        # Parse fields
        for sf in self.document['SummaryFields']:
            field_type = sf['Type']['Text']
            field = ExpenseAnalysisField(
                type=field_type,
                label=sf['LabelDetection']['Text'] if 'LabelDetection' in sf else None,
                value=sf['ValueDetection']['Text']
            )

            if field_type != 'OTHER':
                if field.value:
                    # Classified
                    classified[field_type] = field

                    # All classified
                    if field_type not in all_classified:
                        all_classified[field_type] = []
                    all_classified[field_type].append(field)
            else:
                other.append(field)

        # Parse expense line item groups
        parsed_groups = []
        for group in self.document['LineItemGroups']:
            if len(group['LineItems']) == 0:
                continue

            parsed_group = []
            for line_item in group['LineItems']:
                expense_fields = {
                    field['Type']['Text']: field['ValueDetection']['Text']
                    for field in line_item['LineItemExpenseFields']
                }

                extracted_line_item = ExpenseAnalysisLineItem(
                    item=expense_fields.get('ITEM'),
                    unit_price=expense_fields.get('UNIT_PRICE'),
                    product_code=expense_fields.get('PRODUCT_CODE'),
                    quantity=expense_fields.get('QUANTITY'),
                    price=expense_fields.get('PRICE')
                )
                parsed_group.append(extracted_line_item)

            parsed_groups.append(parsed_group)

        return classified, all_classified, other, parsed_groups


    def get_clf_field_value(self, key_name: str):
        if key_name in self.classified_fields:
            value = self.classified_fields[key_name].value
            return value if value.strip() != '' else None
        else:
            return None


    def get_clf_fields(self, key_name: str) -> List[ExpenseAnalysisField]:
        return self.all_classified_fields.get(key_name)


    def get_other_field_value(self, label: str):
        label = label.lower()
        for field in self.other_fields:
            if field.label.lower() == label:
                return field.value if field.value.strip() != '' else None

        return None



class FormsParser:
    def __init__(self, s3_or_json_page, i_page, documents_bundle_url):
        self.i_page = i_page
        self.documents_bundle_url = documents_bundle_url
        self.s3_or_json_page = s3_or_json_page
        self.fields = None
        if not isinstance(s3_or_json_page, tuple):
            self.fields = self._parse_response(s3_or_json_page)

    @staticmethod
    def _parse_response(json_page):
        fields = {}

        doc = trp.Document(json_page)
        for field in doc.pages[0].form.fields:
            fields[str(field.key).lower()] = str(field.value)

        return fields

    def get_field_value(self, key_name: str, equals: bool):
        key_name = key_name.lower()
        if self.fields is None:
            # Get
            job_id = self._start_job(self.s3_or_json_page[0], self.s3_or_json_page[1])
            cont = self._wait_and_get_analysis_result(job_id)
            self.fields = self._parse_response(cont)

            # Save
            indices = [i for i in range(len(self.documents_bundle_url)) if self.documents_bundle_url[i] == '/']
            endpoint_url = self.documents_bundle_url[:indices[2]]
            key = self.documents_bundle_url[indices[2] + 1:]
            key = f'forms/{key}.{self.i_page}.json'
            bucket_name = 'rovuk-textract'
            s3 = boto3.client(
                's3',
                endpoint_url=endpoint_url,
                aws_access_key_id=os.getenv('INPUT_AWS_ACCESS_KEY_ID'),
                aws_secret_access_key=os.getenv('INPUT_AWS_SECRET_ACCESS_KEY')
            )
            s3.put_object(Body=json.dumps(cont), Bucket=bucket_name, Key=key)

        if equals:
            return self.fields.get(key_name)
        else:
            for key, value in self.fields.items():
                if key_name in key:
                    return value
            return None

    @staticmethod
    def _start_job(bucket_name, object_name):
        client = boto3.client('textract')
        response = client.start_document_analysis(
            DocumentLocation={
                'S3Object': {
                    'Bucket': bucket_name,
                    'Name': object_name
                }
            },
            FeatureTypes=["FORMS"]
        )
        return response["JobId"]

    @staticmethod
    def _wait_and_get_analysis_result(job_id):
        print(f'forms_job_id: {job_id}')
        sleep_sec = 1
        time.sleep(sleep_sec)
        client = boto3.client('textract')
        response = client.get_document_analysis(JobId=job_id)
        print(f'forms_job_status: {response["JobStatus"]}')

        while response["JobStatus"] == "IN_PROGRESS":
            time.sleep(sleep_sec)
            response = client.get_document_analysis(JobId=job_id)
            print(f'forms_job_status: {response["JobStatus"]}')

        return response


class ExtractorsManager:
    def __init__(self, documents_bundle_url, custom_fields_conf):
        # Get expenses
        expenses = ExpensesCreator(documents_bundle_url).create()

        # Save expenses
        indices = [i for i in range(len(documents_bundle_url)) if documents_bundle_url[i] == '/']
        endpoint_url = documents_bundle_url[:indices[2]]
        key = documents_bundle_url[indices[2] + 1:]
        key = f'expenses/{key}.json'
        bucket_name = 'rovuk-textract'
        s3 = boto3.client(
            's3',
            endpoint_url=endpoint_url,
            aws_access_key_id=os.getenv('INPUT_AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('INPUT_AWS_SECRET_ACCESS_KEY')
        )
        s3.put_object(Body=json.dumps(expenses), Bucket=bucket_name, Key=key)

        # Extract pages
        pages_on_s3 = self._extract_documents_bundle_pages(documents_bundle_url)

        # Init instance
        self.documents_bundle_expenses = expenses['ExpenseDocuments']
        self.documents_bundle_pages = pages_on_s3
        self.custom_fields_conf = custom_fields_conf
        self.documents_bundle_url = documents_bundle_url

    @staticmethod
    def _extract_documents_bundle_pages(documents_bundle_url):
        indices = [i for i in range(len(documents_bundle_url)) if documents_bundle_url[i] == '/']
        endpoint_url = documents_bundle_url[:indices[2]]
        bucket = documents_bundle_url[indices[2] + 1: indices[3]]
        key = documents_bundle_url[indices[3] + 1:]

        # Connect to source s3
        input_s3 = boto3.client(
            's3',
            endpoint_url=endpoint_url,
            aws_access_key_id=os.getenv('INPUT_AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('INPUT_AWS_SECRET_ACCESS_KEY')
        )

        # Get bucket object
        result = input_s3.get_object(Bucket=bucket, Key=key)
        raw_bytes_data = result['Body'].read()
        reader = PdfReader(BytesIO(raw_bytes_data))

        results = []
        for i in range(reader.numPages):
            writer = PdfWriter()
            writer.addPage(reader.getPage(i))

            with BytesIO() as bytes_stream:
                writer.write(bytes_stream)
                bytes_stream.seek(0)

                # Copy to destination s3
                textract_s3_bucket = 'rovuk-analysis-input'
                s3 = boto3.client('s3')
                key_i = f'{key}_{i}.pdf'
                s3.put_object(Body=bytes_stream, Bucket=textract_s3_bucket, Key=key_i)

                results.append((textract_s3_bucket, key_i))

        return results

    def extract(self):
        results = []
        for i_page, (expense_json, s3_document_page) in enumerate(zip(
                self.documents_bundle_expenses,
                self.documents_bundle_pages
        )):
            doc_type = self._detect_doc_type(expense_json)
            print(f'\n{doc_type=}')

            print(f'{i_page=}')

            parent_i_page = -1
            if not doc_type:
                for ii_page in range(i_page - 1, -1, -1):
                    print(f'{ii_page=}')
                    print(f"{results[ii_page]['document_type']=}")

                    if results[ii_page]['document_type'] != 'UNKNOWN':
                        doc_type = results[ii_page]['document_type']
                        parent_i_page = (results[ii_page]['parent_i_page']
                                         if results[ii_page]['parent_i_page'] != -1
                                         else ii_page)
                        print(f"{results[ii_page]['parent_i_page']=}")
                        break

                print(f'Inferred doc_type: {doc_type}')

            expense_parser = ExpenseParser(expense_json).parse()
            forms_parser = FormsParser(s3_document_page, i_page, self.documents_bundle_url)

            if doc_type == 'PURCHASE_ORDER':
                extractor = PurchaseOrderExtractor(expense_parser, forms_parser,
                                                   self.custom_fields_conf.get('PURCHASE_ORDER'))
            elif doc_type == 'PACKING_SLIP':
                extractor = PackingSlipExtractor(expense_parser, forms_parser,
                                                 self.custom_fields_conf.get('PACKING_SLIP'))
            elif doc_type == 'RECEIVING_SLIP':
                extractor = ReceivingSlipExtractor(expense_parser, forms_parser,
                                                   self.custom_fields_conf.get('RECEIVING_SLIP'))
            elif doc_type == 'QUOTE':
                extractor = QuoteExtractor(expense_parser, forms_parser,
                                           self.custom_fields_conf.get('QUOTE'))
            elif doc_type == 'INVOICE':
                extractor = InvoiceExtractor(expense_parser, forms_parser,
                                             self.custom_fields_conf.get('INVOICE'))
            else:
                extractor = UnknownExtractor(expense_parser, forms_parser, self.custom_fields_conf)

            result = extractor.extract()
            result['i_page'] = i_page
            result['parent_i_page'] = parent_i_page

            results.append(result)

        return results

    @staticmethod
    def _detect_doc_type(expense_doc):
        if ExtractorsManager._contains_text(expense_doc, 'Purchase Order'):
            return 'PURCHASE_ORDER'
        elif ExtractorsManager._contains_text(expense_doc, 'Packing Slip'):
            return 'PACKING_SLIP'
        elif ExtractorsManager._contains_text(expense_doc, 'Receiving Slip'):
            return 'RECEIVING_SLIP'
        elif ExtractorsManager._contains_text(expense_doc, 'Quote'):
            return 'QUOTE'
        elif ExtractorsManager._contains_text(expense_doc, 'Invoice'):
            return 'INVOICE'
        else:
            return None

    @staticmethod
    def _contains_text(expense_doc, text):
        text = text.lower()
        for block in expense_doc['Blocks']:
            if block['BlockType'] == 'LINE':
                if block['Text'].lower() == text:
                    return True

        return False


class Extractor:
    def __init__(self, document_type, expense_parser, forms_parser, conf):
        self.document_type = document_type
        self.expense_parser = expense_parser
        self.forms_parser = forms_parser
        self.conf = conf

    def extract(self):
        result = self._extract()
        if self.conf:
            try:
                custom_fields = self._extract_custom()
                result['fields'].update(custom_fields)
            except Exception as e:
                print(f'Exception occurred while parsing custom_fields_conf for doctype: {self.document_type}, '
                      f'exception: {e}')

        result['paid'] = ['EXPENSE']
        if self.forms_parser is not None and self.forms_parser.fields is not None:
            result['paid'].append('FORMS')

        result['created_date'] = datetime.utcnow()

        return result

    def _extract_custom(self):
        fields = {}
        for dst_key, sources in self.conf.items():
            value = None
            for src, act in sources.items():
                if src == 'EXPENSES':
                    value = self.get_clf_field_value(act['SRC_KEY'])

                    if value:
                        if act.get('ONLY_DIGITS', False):
                            value = ''.join([ch for ch in value if ch.isdigit()])

                    if value:
                        break

                if src == 'FORMS':
                    value = self.get_forms_field_value(act['SRC_KEY'], equals=False)

                    if value:
                        if act.get('ONLY_DIGITS', False):
                            value = ''.join([ch for ch in value if ch.isdigit()])

                    if value:
                        break

            fields[dst_key] = value


        print('custom_fields:', fields)
        return fields

    def _extract(self) -> dict:
        pass

    @staticmethod
    def _clean_extracted_value(value):
        if value is not None:
            value = value.replace('\n', ' ')
        return value

    def get_clf_field_value(self, key_name: str):
        value = self.expense_parser.get_clf_field_value(key_name)
        value = self._clean_extracted_value(value)
        return value

    def get_clf_fields(self, key_name: str):
        fields = self.expense_parser.get_clf_fields(key_name)
        if fields is None:
            return None

        return [field._replace(value=self._clean_extracted_value(field.value))
                for field in fields]

    def get_other_field_value(self, label: str):
        value = self.expense_parser.get_other_field_value(label)
        value = self._clean_extracted_value(value)
        return value

    def get_forms_field_value(self, key_name: str, equals=True):
        value = self.forms_parser.get_field_value(key_name, equals)
        value = self._clean_extracted_value(value)
        return value

    def get_expense_groups(self):
        groups = []
        for expense_group in self.expense_parser.expense_groups:
            group = []
            groups.append(group)

            for item_desc in expense_group:
                group.append({
                    'ITEM': self._clean_extracted_value(item_desc.item),
                    'PRODUCT_CODE': self._clean_extracted_value(item_desc.product_code),
                    'UNIT_PRICE': self._clean_extracted_value(item_desc.unit_price),
                    'QUANTITY': self._clean_extracted_value(item_desc.quantity),
                    'PRICE': self._clean_extracted_value(item_desc.price)
                })

        return groups

    @staticmethod
    def clean_extracted_id(value):
        if value is None:
            return None

        cleaned_value = ''
        for ch in value:
            if ch.isdigit():
                cleaned_value += ch
            elif ch.isalpha():
                cleaned_value += ch
            elif ch in ['-', '_', ' ']:
                cleaned_value += ch

        return cleaned_value

    @staticmethod
    def to_epoch(str_date):
        import datetime

        try:
            epoch = datetime.datetime(1970, 1, 1)
            if '/' in str_date:
                try:
                    p = '%m/%d/%Y'
                    return int((datetime.datetime.strptime(str_date, p) - epoch).total_seconds())
                except Exception as e:
                    p = '%m/%d/%y'
                    return int((datetime.datetime.strptime(str_date, p) - epoch).total_seconds())

            elif '-' in str_date:
                try:
                    p = '%m-%d-%Y'
                    return int((datetime.datetime.strptime(str_date, p) - epoch).total_seconds())
                except Exception as e:
                    p = '%m-%d-%y'
                    return int((datetime.datetime.strptime(str_date, p) - epoch).total_seconds())

            else:
                # April 8, 2015
                month_day = str_date.split(',')[0]
                month_day = month_day.split()
                month = dict(January=1, February=2, March=3, April=4, May=5, June=6, July=7, August=8, September=9,
                             October=10, November=11, December=12)[month_day[0]]
                day = int(month_day[1])
                year = int(str_date.split(',')[1])

                d = datetime.datetime(year, month, day)
                return int((d - epoch).total_seconds())

        except Exception as e:
            return None

    @staticmethod
    def make_date_resp(str_date):
        if not type(str_date) == str:
            return dict(orig=None, epoch=None)
        return dict(orig=str_date, epoch=Extractor.to_epoch(str_date))


class PackingSlipExtractor(Extractor):
    def __init__(self, expense_parser, forms_parser, conf):
        super().__init__('PACKING_SLIP', expense_parser, forms_parser, conf)

    def _extract(self):
        date = self._extract_date()
        invoice_number = self.clean_extracted_id(self.get_clf_field_value('INVOICE_RECEIPT_ID'))
        ship_to_address = self.get_clf_field_value('RECEIVER_ADDRESS')
        vendor_name = self.get_clf_field_value('VENDOR_NAME')
        vendor_address = self.get_clf_field_value('VENDOR_ADDRESS')
        po_number = self.clean_extracted_id(self.get_clf_field_value('PO_NUMBER'))
        received_by = self.get_clf_field_value('RECEIVER_NAME')

        fields = {
            'DATE': date,
            'INVOICE_NUMBER': invoice_number,
            'PO_NUMBER': po_number,
            'SHIP_TO_ADDRESS': ship_to_address,
            'VENDOR_NAME': vendor_name,
            'VENDOR_ADDRESS': vendor_address,
            'RECEIVED_BY': received_by
        }

        return {
            'document_type': 'PACKING_SLIP',
            'fields': fields,
            'expense_groups': self.get_expense_groups()
        }

    def _extract_date(self):
        value = self.get_clf_field_value('INVOICE_RECEIPT_DATE') or self.get_clf_field_value('ORDER_DATE')
        return self.make_date_resp(value)


class ReceivingSlipExtractor(Extractor):
    def __init__(self, expense_parser, forms_parser, conf):
        super().__init__('RECEIVING_SLIP', expense_parser, forms_parser, conf)

    def _extract(self):
        date = self._extract_date()
        invoice_number = self._extract_invoice_number()
        ship_to_address = self.get_clf_field_value('RECEIVER_ADDRESS')
        vendor_name = self.get_clf_field_value('VENDOR_NAME')
        vendor_address = self._extract_vendor_address(vendor_name)
        po_number = self.clean_extracted_id(self.get_clf_field_value('PO_NUMBER'))
        received_by = self.get_clf_field_value('RECEIVER_NAME')

        fields = {
            'DATE': date,
            'INVOICE_NUMBER': invoice_number,
            'PO_NUMBER': po_number,
            'SHIP_TO_ADDRESS': ship_to_address,
            'VENDOR_NAME': vendor_name,
            'VENDOR_ADDRESS': vendor_address,
            'RECEIVED_BY': received_by
        }

        return {
            'document_type': 'RECEIVING_SLIP',
            'fields': fields,
            'expense_groups': self.get_expense_groups()
        }

    def _extract_vendor_address(self, vendor_name):
        vendor_address = self.get_clf_field_value('VENDOR_ADDRESS')
        if vendor_name and vendor_address:
            return vendor_address.replace(vendor_name, '').strip()

        return vendor_address

    def _extract_invoice_number(self):
        value = self.get_clf_field_value('INVOICE_RECEIPT_ID')
        if not value:
            value = self.get_other_field_value('Sales Order #')

        return self.clean_extracted_id(value)

    def _extract_date(self):
        value = self.get_clf_field_value('INVOICE_RECEIPT_DATE') or self.get_clf_field_value('ORDER_DATE')
        return self.make_date_resp(value)


class QuoteExtractor(Extractor):
    def __init__(self, expense_parser, forms_parser, conf):
        super().__init__('QUOTE', expense_parser, forms_parser, conf)

    def _extract(self):
        quote_number = self.clean_extracted_id(self.get_clf_field_value('INVOICE_RECEIPT_ID'))
        quote_date = self.make_date_resp(self.get_clf_field_value('INVOICE_RECEIPT_DATE'))
        terms = self.get_clf_field_value('PAYMENT_TERMS')
        address = self.get_clf_field_value('RECEIVER_ADDRESS')
        vendor_name = self._extract_vendor_name()
        vendor_address = self.get_clf_field_value('VENDOR_ADDRESS')
        shipping_method = self.get_other_field_value('Shipping Method')
        sub_total = self.get_clf_field_value('SUBTOTAL')
        tax = self.get_clf_field_value('TAX')
        quote_order_total = self.get_clf_field_value('TOTAL')

        fields = {
            'QUOTE_NUMBER': quote_number,
            'QUOTE_DATE': quote_date,
            'TERMS': terms,
            'ADDRESS': address,
            'VENDOR_NAME': vendor_name,
            'VENDOR_ADDRESS': vendor_address,
            'SHIPPING_METHOD': shipping_method,
            'SUB_TOTAL': sub_total,
            'TAX': tax,
            'QUOTE_ORDER_TOTAL': quote_order_total,
            'RECEIVER_PHONE': self.get_clf_field_value('RECEIVER_PHONE'),
            'VENDOR_PHONE': self.get_clf_field_value('VENDOR_PHONE')
        }

        groups = self.get_expense_groups()

        return {
            'document_type': 'QUOTE',
            'fields': fields,
            'expense_groups': groups
        }

    def _extract_vendor_name(self):
        value = self.get_clf_field_value('VENDOR_NAME')
        if value:
            value = value.replace('ON ACCOUNT', '').strip()
        else:
            for block in self.expense_parser.document['Blocks']:
                if block['BlockType'] == 'LINE':
                    value = block['Text']
                    break

        return self.clean_extracted_id(value)



class InvoiceExtractor(Extractor):
    def __init__(self, expense_parser, forms_parser, conf):
        super().__init__('INVOICE', expense_parser, forms_parser, conf)

    def _extract(self):
        fields = {
            'INVOICE_NUMBER': self.clean_extracted_id(self._extract_invoice_number()),

            'INVOICE_DATE': self._extract_invoice_date(),
            'DUE_DATE': self.make_date_resp(self.get_clf_field_value('DUE_DATE')),
            'SHIP_DATE': self.make_date_resp(self.get_other_field_value('DATE SHIPPED')),
            'ORDER_DATE': self._extract_order_date(),

            'PO_NUMBER': self.clean_extracted_id(self._extract_po()),
            'INVOICE_TO': self.get_clf_field_value('RECEIVER_NAME'),
            'ADDRESS': self.get_clf_field_value('RECEIVER_ADDRESS'),
            'SUBTOTAL': self.get_clf_field_value('SUBTOTAL'),
            'TOTAL': self.get_clf_field_value('TOTAL'),
            'TAX': self.get_clf_field_value('TAX'),
            'INVOICE_TOTAL': self.get_clf_field_value('TOTAL'),
            'VENDOR_NAME': self._extract_vendor_name(),
            'VENDOR_ADDRESS': self.get_clf_field_value('VENDOR_ADDRESS'),
            'VENDOR_PHONE': self.get_clf_field_value('VENDOR_PHONE'),
            'JOB_NUMBER': self.get_other_field_value('JOB NUMBER'),
            'DELIVERY_ADDRESS': self.get_clf_field_value('RECEIVER_ADDRESS'),
            'TERMS': self._extract_terms(),
            'CONTRACT_NUMBER': self.clean_extracted_id(self._extract_contract_number()),
            'DISCOUNT': self.get_clf_field_value('DISCOUNT'),
            'ACCOUNT_NUMBER': self.clean_extracted_id(self._extract_account_number())
        }

        groups = self.get_expense_groups()

        return {
            'document_type': 'INVOICE',
            'fields': fields,
            'expense_groups': groups
        }

    def _extract_invoice_date(self):
        value = self.get_clf_field_value('INVOICE_RECEIPT_DATE') or self.get_clf_field_value('ORDER_DATE')
        return self.make_date_resp(value)

    def _extract_order_date(self):
        value = self.get_clf_field_value('ORDER_DATE'),
        return self.make_date_resp(value)

    def _extract_po(self):
        po = self.expense_parser.get_clf_field_value('PO_NUMBER')
        if po is not None:
            return po
        else:
            return self.get_other_field_value('ORDER #')

    def _extract_terms(self):
        terms = self.get_clf_field_value('PAYMENT_TERMS')
        if terms is not None:
            return terms
        else:
            return self.get_other_field_value('Gateway')

    def _extract_invoice_number(self):
        value = self.get_clf_field_value('INVOICE_RECEIPT_ID')
        if value is None:
            value = self.get_forms_field_value('Invoice')

        return value

    def _extract_contract_number(self):
        value = self.get_other_field_value('CONTRACT NUMBER')
        return value

    def _extract_account_number(self):
        value = self.get_clf_field_value('ACCOUNT_NUMBER')
        return value

    def _extract_vendor_name(self):
        clf_fields = self.get_clf_fields('VENDOR_NAME')
        if clf_fields:
            return self.clean_extracted_id(clf_fields[0].value)
        else:
            return None


class PurchaseOrderExtractor(Extractor):
    def __init__(self, expense_parser, forms_parser, conf):
        super().__init__('PURCHASE_ORDER', expense_parser, forms_parser, conf)

    def _extract(self):
        fields = {
            'PO_CREATE_DATE': self.make_date_resp(self.get_clf_field_value('INVOICE_RECEIPT_DATE')),
            'DUE_DATE': self.make_date_resp(self.get_clf_field_value('DUE_DATE')),
            'DELIVERY_DATE': self.make_date_resp(self.get_clf_field_value('DELIVERY_DATE')),

            'PO_NUMBER': self.clean_extracted_id(self._extract_po_number()),
            'CUSTOMER_ID': self.get_clf_field_value('CUSTOMER_NUMBER'),
            'TERMS': self.get_clf_field_value('PAYMENT_TERMS'),
            'QUOTE_NUMBER': self.extract_quote_number(),
            'CONTRACT_NUMBER': self.get_clf_field_value('RECEIVER_PHONE'),
            'DELIVERY_ADDRESS': self.get_clf_field_value('RECEIVER_ADDRESS'),
            'VENDOR_ID': self.get_other_field_value('Vendor'),
            'VENDOR_NAME': self._extract_vendor_name(),
            'VENDOR_ADDRESS': self._extract_vendor_address(),
            'SUBTOTAL': self.get_clf_field_value('SUBTOTAL'),
            'TAX': self.get_clf_field_value('TAX'),
            'PURCHASE_ORDER_TOTAL': self.get_clf_field_value('TOTAL'),
        }

        groups = self.get_expense_groups()

        return {
            'document_type': 'PURCHASE_ORDER',
            'fields': fields,
            'expense_groups': groups
        }

    def _extract_po_number(self):
        value = self.get_clf_field_value('PO_NUMBER')
        if value is None:
            value = self.get_forms_field_value('P.O. #')

        return value

    def _extract_vendor_name(self):
        forms_vendor_value = self.get_forms_field_value('Vendor')

        # High confidence
        if forms_vendor_value and self.get_clf_fields('VENDOR_NAME'):
            for clf_field in self.get_clf_fields('VENDOR_NAME'):
                if all(k_value in forms_vendor_value for k_value in clf_field.value.split()):
                    return clf_field.value

        # High confidence
        receiver_name_fields = self.get_clf_fields('RECEIVER_NAME')
        forms_to_value = self.get_forms_field_value('To:')
        if not forms_vendor_value and receiver_name_fields and forms_to_value:
            for clf_field in receiver_name_fields:
                if all(k_value in forms_to_value for k_value in clf_field.value.split()):
                    return clf_field.value

        # Low confidence
        if forms_vendor_value:
            return forms_vendor_value.split()[0]

        return self.get_clf_field_value('VENDOR_NAME')

    def _extract_vendor_address(self):
        vendor_name = self._extract_vendor_name()
        forms_vendor_value = self.get_forms_field_value('Vendor')

        # High confidence
        if forms_vendor_value and self.get_clf_fields('VENDOR_ADDRESS'):
            for vendor_address_field in self.get_clf_fields('VENDOR_ADDRESS'):
                if all(k_value in forms_vendor_value for k_value in vendor_address_field.value.split()):
                    return vendor_address_field.value.replace(vendor_name, '').strip()

        # High confidence
        receiver_address_fields = self.get_clf_fields('RECEIVER_ADDRESS')
        forms_to_value = self.get_forms_field_value('To:')
        if not forms_vendor_value and receiver_address_fields and forms_to_value:
            for receiver_address_field in receiver_address_fields:
                if all(k_value in forms_to_value for k_value in receiver_address_field.value.split()):
                    return receiver_address_field.value.replace(vendor_name, '').strip()

        return None

    def extract_quote_number(self):
        value = self.get_clf_field_value('INVOICE_RECEIPT_ID')
        if not value:
            value = self.get_other_field_value('QUOTE NUMBER')

        return self.clean_extracted_id(value)


class UnknownExtractor(Extractor):
    def __init__(self, expense_parser, forms_parser, confs):
        super().__init__('UNKNOWN', expense_parser, forms_parser, None)
        self.confs = confs

    def _extract(self):
        po = PurchaseOrderExtractor(self.expense_parser, self.forms_parser, self.confs.get('PURCHASE_ORDER')).extract()
        ps = PackingSlipExtractor(self.expense_parser, self.forms_parser, self.confs.get('PACKING_SLIP')).extract()
        qo = QuoteExtractor(self.expense_parser, self.forms_parser, self.confs.get('QUOTE')).extract()
        inv = InvoiceExtractor(self.expense_parser, self.forms_parser, self.confs.get('INVOICE')).extract()

        result = max([po, ps, qo, inv], key=lambda r: sum(1 for v in r['fields'].values() if v) / len(r['fields']))
        print(f"Unknown extracted as: {result['document_type']}")
        result['document_type'] = 'UNKNOWN'
        return result


if __name__ == '__main__':
    def load_resp(fn):
        with open(fn) as f:
            response = f.read()
            response = json.loads(response)

        return response

    # fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_PSs_aws_analyze_api/ps_packingslip.pdf.json'
    # print(json.dumps(PackingSlipExtractor(load_resp(fn)['ExpenseDocuments'][0]).extract(), indent=2))

    # exp_fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_QUOTEs_aws_analyze_api/quote_1.pdf.json'
    # forms_fn = ''
    # # print(json.dumps(QuoteExtractor(load_resp(fn)['ExpenseDocuments'][0]).extract(), indent=2))
    # print(json.dumps(
    #     QuoteExtractor(
    #         ExpenseParser(load_resp(exp_fn)['ExpenseDocuments'][0]).parse(),
    #         None, {}
    #     ).extract(), indent=2, default=str))


    # fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_invoices_aws_analyze_api/' \
    #      'Invoice,8042209225,38077982,PJ WG Renewal 1 year.PDF.json'
    # print(json.dumps(InvoiceExtractor(load_resp(fn)['ExpenseDocuments'][0]).extract(), indent=2))

    # fn_exp = '/home/yuri/upwork/ridaro/data/demo_2/po3_6266b4fa53a358c32e41a022po1675345707726_edited.pdf_expense.json'
    # fn_form = '/home/yuri/upwork/ridaro/data/demo_2/po3_6266b4fa53a358c32e41a022po1675345707726_edited.pdf_page_0_FT.json'
    # print(json.dumps(
    #     PurchaseOrderExtractor(
    #         ExpenseParser(load_resp(fn_exp)['ExpenseDocuments'][0]).parse(),
    #         FormsParser(load_resp(fn_form), 0, 'some_url'), {}
    #     ).extract(), indent=2, default=str))




    # fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_POs_aws_analyze_api/po_PO FNC for Anil.pdf.json'
    # results_ = ExtractorsManager([load_resp(fn)['ExpenseDocuments'][0]]).extract()
    # print(json.dumps(results_, indent=2))

    # fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_QUOTEs_aws_analyze_api/quote_1.pdf.json'
    # results_ = ExtractorsManager(load_resp(fn)['ExpenseDocuments']).extract()
    # print(json.dumps(results_, indent=2))

    # ExpensesCreator('https://s3.us-west-1.wasabisys.com/bicket1/folder1/invoice_page-1.pdf')._start_job()

    #
    #
    #
    # inv_fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_invoices_aws_analyze_api/invoice_page-1.pdf.json'
    # frm_fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_invoices_aws_forms_and_tables_api/' \
    #          'invoice_page-1.pdf.json'
    #
    # """Test custom fields"""
    # print(json.dumps(
    #     InvoiceExtractor(
    #         ExpenseParser(load_resp(inv_fn)['ExpenseDocuments'][0]).parse(),
    #         FormsParser(load_resp(frm_fn)),  {
    #             'INVOICE_DATE_2': {
    #                 'EXPENSES': {
    #                     'SRC_KEY': 'XXX___INVOICE_RECEIPT_DATE'
    #                 },
    #                 'FORMS': {
    #                     'SRC_KEY': 'voice Dat',
    #                     'ONLY_DIGITS': True
    #                 }
    #             }
    #         }
    #     ).extract(), indent=2))



    # inv_fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_invoices_aws_analyze_api/invoice_adrian@vmgconstructioninc10.com8a83e28d7dc522e9017e253dfe203d5b21458d07f1c756ee4ad62d25a33dbd1e07bbb.pdf.json'
    # frm_fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_invoices_aws_forms_and_tables_api/invoice_adrian@vmgconstructioninc10.com8a83e28d7dc522e9017e253dfe203d5b21458d07f1c756ee4ad62d25a33dbd1e07bbb.pdf.json'
    # """Test fields"""
    # print(json.dumps(
    #     InvoiceExtractor(
    #         ExpenseParser(load_resp(inv_fn)['ExpenseDocuments'][0]).parse(),
    #         FormsParser(load_resp(frm_fn), 0, 'some_url'), None
    #     ).extract(), indent=2))


    # po_exp_fn = '/home/yuri/upwork/ridaro/data/processed/docs_3_POs_aws_analyze_api/po3_60c31f3dc5ba8494a2b1070fpo1675153979115.pdf.json'
    # po_forms_fn = '/home/yuri/upwork/ridaro/data/processed/docs_3_POs_aws_forms_and_tables_api/po3_60c31f3dc5ba8494a2b1070fpo1675153979115.pdf.json'
    # po_exp_fn = '/home/yuri/upwork/ridaro/data/processed/docs_3_POs_aws_analyze_api/po3_6266b4fa53a358c32e41a022po1675345707726.pdf.json'
    # po_forms_fn = '/home/yuri/upwork/ridaro/data/processed/docs_3_POs_aws_forms_and_tables_api/po3_6266b4fa53a358c32e41a022po1675345707726.pdf.json'
    # po_exp_fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_POs_aws_analyze_api/po_61cc7994d2045c72475f9ed4po1646925766302.pdf.json'
    # po_forms_fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_POs_aws_forms_and_tables_api/po_61cc7994d2045c72475f9ed4po1646925766302.pdf.json'
    # po_exp_fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_POs_aws_analyze_api/po_PO FNC for Anil.pdf.json'
    # po_forms_fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_POs_aws_forms_and_tables_api/po_PO FNC for Anil.pdf.json'


    def test_demo_2():
        # fn_exp = '/home/yuri/upwork/ridaro/data/demo_2/po3_6266b4fa53a358c32e41a022po1675345707726_edited.pdf_expense.json'
        # fn_form = '/home/yuri/upwork/ridaro/data/demo_2/po3_6266b4fa53a358c32e41a022po1675345707726_edited.pdf_page_0_FT.json'
        # fn_exp = '/home/yuri/upwork/ridaro/data/processed/docs_2_POs_aws_analyze_api/po_6132f0d8d1b45f620259d4fdpo1638946256490.pdf.json'
        # fn_form = '/home/yuri/upwork/ridaro/data/processed/docs_2_POs_aws_forms_and_tables_api/po_6132f0d8d1b45f620259d4fdpo1638946256490.pdf.json'
        # print(json.dumps(
        #     PurchaseOrderExtractor(
        #         ExpenseParser(load_resp(fn_exp)['ExpenseDocuments'][0]).parse(),
        #         FormsParser(load_resp(fn_form), 0, 'some_url'), {}
        #     ).extract(), indent=2, default=str))


        # fn_exp = '/home/yuri/upwork/ridaro/data/processed/docs_2_invoices_aws_analyze_api/invoice_page-1.pdf.json'
        # fn_frm = '/home/yuri/upwork/ridaro/data/processed/docs_2_invoices_aws_forms_and_tables_api/invoice_page-1.pdf.json'
        # fn_exp = '/home/yuri/upwork/ridaro/data/processed/docs_2_invoices_aws_analyze_api/Invoice_2431_from_Ridaro_Inc.pdf.json'
        # fn_frm = '/home/yuri/upwork/ridaro/data/processed/docs_2_invoices_aws_forms_and_tables_api/Invoice_2431_from_Ridaro_Inc.pdf.json'
        # fn_exp = '/home/yuri/upwork/ridaro/data/processed/docs_2_invoices_aws_analyze_api/invoice_Ridaro FCNS22-9185_122.50_10202022.pdf.json'
        # fn_frm = '/home/yuri/upwork/ridaro/data/processed/docs_2_invoices_aws_forms_and_tables_api/invoice_Ridaro FCNS22-9185_122.50_10202022.pdf.json'
        # fn_exp = '/home/yuri/upwork/ridaro/data/processed/docs_2_invoices_aws_analyze_api/Invoice,8042350956,38077982,Smart International.PDF.json'
        # fn_frm = '/home/yuri/upwork/ridaro/data/processed/docs_2_invoices_aws_forms_and_tables_api/Invoice,8042350956,38077982,Smart International.PDF.json'
        # fn_exp = '/home/yuri/upwork/ridaro/data/processed/docs_2_invoices_aws_analyze_api/Invoice,8042209225,38077982,PJ WG Renewal 1 year.PDF.json'
        # fn_frm = '/home/yuri/upwork/ridaro/data/processed/docs_2_invoices_aws_forms_and_tables_api/Invoice,8042209225,38077982,PJ WG Renewal 1 year.PDF.json'
        # fn_exp = '/home/yuri/upwork/ridaro/data/processed/docs_2_invoices_aws_analyze_api/invoice_adrian@vmgconstructioninc10.com8a83e28d7dc522e9017e6b71ce2c17ee18190d18579a948ad5962f737df31db01fdad.pdf.json'
        # fn_frm = '/home/yuri/upwork/ridaro/data/processed/docs_2_invoices_aws_forms_and_tables_api/invoice_adrian@vmgconstructioninc10.com8a83e28d7dc522e9017e6b71ce2c17ee18190d18579a948ad5962f737df31db01fdad.pdf.json'
        # fn_exp = '/home/yuri/upwork/ridaro/data/processed/docs_2_invoices_aws_analyze_api/invoice_adrian@vmgconstructioninc10.com8a83e28d7dc522e9017e253dfe203d5b21458d07f1c756ee4ad62d25a33dbd1e07bbb.pdf.json'
        # fn_frm = '/home/yuri/upwork/ridaro/data/processed/docs_2_invoices_aws_forms_and_tables_api/invoice_adrian@vmgconstructioninc10.com8a83e28d7dc522e9017e253dfe203d5b21458d07f1c756ee4ad62d25a33dbd1e07bbb.pdf.json'
        # fn_exp = '/home/yuri/upwork/ridaro/data/processed/docs_2_invoices_aws_analyze_api/invoice_adrian@vmgconstructioninc10.comae95eb347d143714017d21f295de0449112194196aa89c3932ce0cbb7d3d574882405.pdf.json'
        # fn_frm = '/home/yuri/upwork/ridaro/data/processed/docs_2_invoices_aws_forms_and_tables_api/invoice_adrian@vmgconstructioninc10.comae95eb347d143714017d21f295de0449112194196aa89c3932ce0cbb7d3d574882405.pdf.json'
        # print(json.dumps(
        #     InvoiceExtractor(
        #         ExpenseParser(load_resp(fn_exp)['ExpenseDocuments'][0]).parse(),
        #         FormsParser(load_resp(fn_frm), 0, 'some_url'), None,
        #     ).extract(), indent=2, default=str))

        # fn_exp = '/home/yuri/upwork/ridaro/data/processed/docs_2_QUOTEs_aws_analyze_api/quote_1.pdf.json'
        # fn_exp = '/home/yuri/upwork/ridaro/data/demo_2/quote_1.pdf_expense.json'
        # fn_exp = '/home/yuri/upwork/ridaro/data/demo_2/quote_1_1p.pdf_expense.json'  # date_v
        # fn_exp = '/home/yuri/upwork/ridaro/data/processed/docs_2_QUOTEs_aws_analyze_api/quote_[Untitled].pdf.json'  # date_v
        # fn_exp = '/home/yuri/upwork/ridaro/data/demo_2/quote_1_1p_pic.pdf_expense.json'
        # fn_exp = '/home/yuri/upwork/ridaro/data/processed/docs_2_QUOTEs_aws_analyze_api/quote_[Untitled].pdf.json'
        # print(json.dumps(
        #     QuoteExtractor(
        #         ExpenseParser(load_resp(fn_exp)['ExpenseDocuments'][0]).parse(),
        #         None, {}
        #     ).extract(), indent=2, default=str))

        # fn_exp = '/home/yuri/upwork/ridaro/data/processed/docs_4/ps4_Packing slip.pdf_expense.json'
        # fn_exp = '/home/yuri/upwork/ridaro/data/processed/docs_2_PSs_aws_analyze_api/ps_Intuit - Ridaro FCNS22-9185_PackingSlip_10202022_test.pdf.json'
        # fn_exp = '/home/yuri/upwork/ridaro/data/processed/docs_2_PSs_aws_analyze_api/ps_packingslip.pdf.json'
        # fn_exp = '/home/yuri/upwork/ridaro/data/processed/docs_2_PSs_aws_analyze_api/ps_Ridaro FCNS22-9185_PackingSlip_10202022_test.pdf.json'
        # print(json.dumps(
        #     PackingSlipExtractor(
        #         ExpenseParser(load_resp(fn_exp)['ExpenseDocuments'][0]).parse(),
        #         None, {}
        #     ).extract(), indent=2, default=str))

        fn_exp = '/home/yuri/upwork/ridaro/data/processed/docs_4/rs4_packing-slip-2x.pdf_expense.json'
        print(json.dumps(
            ReceivingSlipExtractor(
                ExpenseParser(load_resp(fn_exp)['ExpenseDocuments'][0]).parse(),
                None, {}
            ).extract(), indent=2, default=str))



    test_demo_2()


    def test_docs4():
        # po_exp_fn = '/home/yuri/upwork/ridaro/data/processed/docs_4/po4_Book4.pdf_expense.json'
        # po_forms_fn = '/home/yuri/upwork/ridaro/data/processed/docs_4/po4_Book4.pdf_FT.json'

        # print('detected_doctype:', ExtractorsManager._detect_doc_type(load_resp(po_exp_fn)['ExpenseDocuments'][0]))
        # print(json.dumps(
        #     PurchaseOrderExtractor(
        #         ExpenseParser(load_resp(po_exp_fn)['ExpenseDocuments'][0]).parse(),
        #         FormsParser(load_resp(po_forms_fn), 0, 'some_url'), None
        #     ).extract(), indent=2, default=str))

        # ps_exp_fn = '/home/yuri/upwork/ridaro/data/processed/docs_4/ps4_Packing slip.pdf_expense.json'
        # ps_forms_fn = '/home/yuri/upwork/ridaro/data/processed/docs_4/ps4_Packing slip.pdf_FT.json'
        #
        # print('detected_doctype:', ExtractorsManager._detect_doc_type(load_resp(ps_exp_fn)['ExpenseDocuments'][0]))
        # print(json.dumps(
        #     PackingSlipExtractor(
        #         ExpenseParser(load_resp(ps_exp_fn)['ExpenseDocuments'][0]).parse(),
        #         FormsParser(load_resp(ps_forms_fn), 0, 'some_url'), None
        #     ).extract(), indent=2, default=str))
        #
        # in_exp_fn = '/home/yuri/upwork/ridaro/data/processed/docs_4/invoice4_Amazon.com order number 113-1939597-2877857.pdf_expense.json'
        # in_forms_fn = '/home/yuri/upwork/ridaro/data/processed/docs_4/invoice4_Amazon.com order number 113-1939597-2877857.pdf_FT.json'
        #
        # print('detected_doctype:', ExtractorsManager._detect_doc_type(load_resp(in_exp_fn)['ExpenseDocuments'][0]))
        # print(json.dumps(
        #     InvoiceExtractor(
        #         ExpenseParser(load_resp(in_exp_fn)['ExpenseDocuments'][0]).parse(),
        #         FormsParser(load_resp(in_forms_fn), 0, 'some_url'), None
        #     ).extract(), indent=2))

        rs_exp_fn = '/home/yuri/upwork/ridaro/data/processed/docs_4/rs4_packing-slip-2x.pdf_expense.json'  #date_v

        print('detected_doctype:', ExtractorsManager._detect_doc_type(load_resp(rs_exp_fn)['ExpenseDocuments'][0]))
        print(json.dumps(
            ReceivingSlipExtractor(
                ExpenseParser(load_resp(rs_exp_fn)['ExpenseDocuments'][0]).parse(),
                None,
                None
            ).extract(), indent=2, default=str))




    def test_unknown_extractor():
        # po_exp_fn = '/home/yuri/upwork/ridaro/data/processed/docs_4/po4_Book4.pdf_expense.json'
        # po_forms_fn = '/home/yuri/upwork/ridaro/data/processed/docs_4/po4_Book4.pdf_FT.json'

        # po_exp_fn = '/home/yuri/upwork/ridaro/data/processed/docs_3_POs_aws_analyze_api/po3_60c31f3dc5ba8494a2b1070fpo1675153979115.pdf.json'
        # po_forms_fn = '/home/yuri/upwork/ridaro/data/processed/docs_3_POs_aws_forms_and_tables_api/po3_60c31f3dc5ba8494a2b1070fpo1675153979115.pdf.json'
        # po_exp_fn = '/home/yuri/upwork/ridaro/data/processed/docs_3_POs_aws_analyze_api/po3_6266b4fa53a358c32e41a022po1675345707726.pdf.json'
        # po_forms_fn = '/home/yuri/upwork/ridaro/data/processed/docs_3_POs_aws_forms_and_tables_api/po3_6266b4fa53a358c32e41a022po1675345707726.pdf.json'
        po_exp_fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_POs_aws_analyze_api/po_61cc7994d2045c72475f9ed4po1646925766302.pdf.json'
        po_forms_fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_POs_aws_forms_and_tables_api/po_61cc7994d2045c72475f9ed4po1646925766302.pdf.json'
        # po_exp_fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_POs_aws_analyze_api/po_PO FNC for Anil.pdf.json'
        # po_forms_fn = '/home/yuri/upwork/ridaro/data/processed/docs_2_POs_aws_forms_and_tables_api/po_PO FNC for Anil.pdf.json'

        # print('detected_doctype:', ExtractorsManager._detect_doc_type(load_resp(po_exp_fn)['ExpenseDocuments'][0]))
        print(json.dumps(
            UnknownExtractor(
                ExpenseParser(load_resp(po_exp_fn)['ExpenseDocuments'][0]).parse(),
                FormsParser(load_resp(po_forms_fn), 0, 'some_url'), {}
            ).extract(), indent=2, default=str))


    # test_unknown_extractor()


    # test_docs4()



# self.conf = {
# 'DUE_DATE_2': {
#     'FORMS': {
#         'SRC_KEY': 'Due Date'
#     }
# },
# 'INVOICE_DATE_2': {
#     'EXPENSES': {
#         'SRC_KEY': 'INVOICE_RECEIPT_DATE'
#     },
#     'FORMS': {
#         'SRC_KEY': 'voice Dat'
#     }
# },
# 'INVOICE_DATE_2': {
#     'FORMS': {
#         'SRC_KEY': 'voice Dat'
#     },
#     'EXPENSES': {
#         'SRC_KEY': 'INVOICE_RECEIPT_DATE'
#     }
# }

# 'INVOICE_DATE_2': {
#     'FORMS': {
#         'SRC_KEY': 'XXXvoice Dat'
#     },
#     'EXPENSES': {
#         'SRC_KEY': 'INVOICE_RECEIPT_DATE'
#     }
# }

# 'INVOICE_DATE_2': {
#     'EXPENSES': {
#         'SRC_KEY': 'XXX___INVOICE_RECEIPT_DATE'
#     },
#     'FORMS': {
#         'SRC_KEY': 'voice Dat'
#     }
# },

# }
