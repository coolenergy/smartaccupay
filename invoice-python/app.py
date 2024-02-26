from flask import Flask, request
from flask_cors import CORS, cross_origin
import os
import numpy as np
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.llms import OpenAI
from langchain.chains.question_answering import load_qa_chain
from langchain.vectorstores import utils
from langchain.document_loaders.csv_loader import CSVLoader
from langchain.docstore.document import Document
import json
from textract import create_textract, analyze_invoice, get_summary, get_table, type_invoice, get_object
from csv_embed import embeding
from utils import parse_file_path, convert_epoch, remove_first_space, get_current_epoch
from schema import schema_generator, find_relationship, send_notification
from dotenv import load_dotenv
import pymongo
from bson.objectid import ObjectId
from sshtunnel import SSHTunnelForwarder
from datetime import datetime
import time
app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

load_dotenv()
AWS_ACCESS_KEY = os.getenv('AWS_ACCESS_KEY')
AWS_SECRET_KEY = os.getenv('AWS_SECRET_KEY')
AWS_REGION = os.getenv('AWS_REGION')

WASABI_ACCESS_KEY = os.getenv('WASABI_ACCESS_KEY')
WASABI_SECRET_KEY = os.getenv('WASABI_SECRET_KEY')

OPEN_AI_KEY = os.getenv('OPEN_AI_KEY')
DB_URL = os.getenv("DB_URL")

# myclient = pymongo.MongoClient(DB_URL)
# admin_db = myclient["rovuk_admin"]

MONGO_HOST = os.getenv('MONGO_HOST')
MONGO_DB = os.getenv('MONGO_DB')
MONGO_USER = os.getenv('MONGO_USER')
MONGO_PASS = os.getenv('MONGO_PASS')

server = SSHTunnelForwarder(
    MONGO_HOST,
    ssh_username=MONGO_USER,
    ssh_password=MONGO_PASS,
    remote_bind_address=('127.0.0.1', 27017)
)

server.start()

myclient = pymongo.MongoClient('127.0.0.1', server.local_bind_port) # server.local_bind_port is assigned local port
admin_db = myclient[MONGO_DB]

admin_collections = {
    "COMPANY": "tenants",
    "API_COUNT": "api_count"
}

main_document_type = ["INVOICE", "PURCHASE_ORDER", "PACKING_SLIP", 'RECEIVING_SLIP', "QUOTE"]

company_collections = {
    "INVOICE": "ap_invoices", 
    "CREDIT_MEMO": "ap_invoices", 
    "PURCHASE_ORDER": "ap_pos", 
    "PACKING_SLIP": "ap_packaging_slips", 
    "RECEIVING_SLIP": "ap_receiving_slips",
    "INVOICE_LIST": "ap_document_processes",
    "QUOTE": "ap_quotes",
    "OTHER": "ap_otherdocuments",
    "VENDOR": "invoice_vendors",
    "API_COUNT": "api_count",
    "HISTORY": "ap_invoice_histories",
    "TERMS": "invoice_terms",
    "USER": "invoice_users",
    "ALERT": "ap_alerts",
    "DUPLICATED": "ap_duplicate_documents"
}

list_to_convertINT = ["tax", "sub_total", "quote_total", "invoice_total_amount", "amount_due", "po_total", "tax_amount"]

message_text = {
    "MANUAL": 'Invoice manual upload by {}',
    "EMAIL": 'Invoice imported from email. Sender: {}',
    "SUCCESS": 'SmartAccuPay processed Invoice Document successfully.',
    "VENDOR": "SmartAccuPay processed Invoice document and detected Vendor {}",
    "INVOICE_NO": 'SmartAccuPay processed Invoice document and detected Invoice no: {}',
    "PO_NO": 'SmartAccuPay processed Invoice document and detected PO No: {}',
    "FAIL": "SmartAccuPay processed Invoice Document failed.",
    "NO_VENDOR": "SmartAccuPay processed failed to detected: Vendor Name",
    "NO_INVOICE_NO": "SmartAccuPay processed failed to detected: Invoice No",
    "NO_PO_NO": "SmartAccuPay processed failed to detected: PO No",
    "NO_DUE": "SmartAccuPay processed failed to detected:Invoice Due Date"
}

query_list_total = {"OTHER": {
        "invoice_no": "Answer only invoice number",
        "po_no": "Answer only PO number",
        "invoice_date_epoch": "Answer only date into YYYY-MM-DD format or NONE",
        "vendor": "answer only all vendor names"
    }, "QUOTE": {
        "date_epoch": "Answer only due date into YYYY-MM-DD format",
        "quote_no": "answer only quote number without any string",
        "terms": "Answer only terms",
        "address": "Answer only address",
        "shipping_method": "Answer only ship method",
        "sub_total": "Answer only subtotal without $ symbol or 0",
        "tax": "Answer only tax without $ symbol or 0",
        "quote_total": "Answer only quote total without $ symbol or 0",
        "receiver_phone": "Answer only phone number",
        "vendor": "answer only all vendor names",
        "invoice_no": "Answer only invoice number",
    }, "INVOICE": {
        "customer_id": "Answer only customer id",
        "invoice_no": "Answer only invoice number",
        "po_no": "Answer only PO number",
        "invoice_date_epoch": "Answer only date into YYYY-MM-DD format",
        "due_date_epoch": "Answer only due date into YYYY-MM-DD format",
        "order_date_epoch": "Answer only order date into YYYY-MM-DD format",
        "ship_date_epoch": "Answer only ship date into YYYY-MM-DD format",
        "terms": "Answer only terms",
        "invoice_total_amount": "Answer only total without $ symbol or 0",
        "tax_amount": "Answer only tax without $ symbol or 0",
        "tax_id": "Answer only tax id",
        "sub_total": "Answer only subtotal without $ symbol or 0",
        "amount_due": "count due amount and Answer only the result without $ symbol or 0",
        "receiving_date_epoch": "Answer only receiving date into YYYY-MM-DD",
        "delivery_address": "Answer only delivery address",
        "contact_no": "Answer only phone number",
        "vendor": "answer only all vendor names",
    }, "CREDIT_MEMO": {
        "customer_id": "Answer only customer id",
        "invoice_no": "Answer only invoice number",
        "po_no": "Answer only PO number",
        "invoice_date_epoch": "Answer only date into YYYY-MM-DD format",
        "due_date_epoch": "Answer only due date into YYYY-MM-DD format",
        "order_date_epoch": "Answer only order date into YYYY-MM-DD format",
        "ship_date_epoch": "Answer only ship date into YYYY-MM-DD format",
        "terms": "Answer only terms",
        "invoice_total_amount": "Answer only negative value of total without $ symbol or 0",
        "tax_amount": "Answer only tax without $ symbol or 0",
        "tax_id": "Answer only tax id",
        "sub_total": "Answer only negative value of subtotal without $ symbol or 0",
        "amount_due": "count due amount and Answer only the negative value of the result without $ symbol or 0",
        "receiving_date_epoch": "Answer only receiving date into YYYY-MM-DD",
        "delivery_address": "Answer only delivery address",
        "contact_no": "Answer only phone number",
        "vendor": "answer only all vendor names",
    }, "PURCHASE_ORDER": {
        "date_epoch": "Answer only due date into YYYY-MM-DD format",
        "invoice_no": "Answer only invoice number",
        "po_no": "Answer only PO number",
        "customer_id": "Answer only customer id",
        "terms": "Answer only terms",
        "delivery_date_epoch": "Answer only delivery date into YYYY-MM-DD format",
        "delivery_address": "Answer only delivery address",
        "contact_no": "Answer only phone number",
        "quote_no": "answer only quote number without any string",
        "sub_total": "Answer only subtotal without $ symbol or 0",
        "tax": "Answer only tax without $ symbol or 0",
        "po_total": "Answer only total without $ symbol or 0",
        "vendor": "answer only all vendor names sperated into ,",
    }, "PACKING_SLIP": {
        "date_epoch": "Answer only date into YYYY-MM-DD format",
        "invoice_no": "Answer only invoice number",
        "ship_to_address": "Answer only ship to address",
        "vendor": "answer only all vendor names",
    }, "RECEIVING_SLIP": {
        "date_epoch": "Answer only  date into YYYY-MM-DD format",
        "invoice_no": "Answer only invoice number",
        "ship_to_address": "Answer only ship to address",
        "vendor": "answer only all vendor names",
        "po_no": "Answer only po number",
    }}

# PATH /
# DESC TEST SERVER RUNNING


@app.route("/", methods=["GET"])
@cross_origin()
def home():
    return "Hello World !"


def get_fields(mydb, doc_type, filepath):
    
    result = {"document_type": doc_type}
    query_list = query_list_total[doc_type]


    llm = OpenAI(
            temperature=0, openai_api_key=OPEN_AI_KEY)
    chain = load_qa_chain(llm, chain_type="stuff")

    with open('./JSON/vector-{}.json'.format(filepath), 'r') as infile:
        data = json.load(infile)
    embeddings = OpenAIEmbeddings(
        openai_api_key=OPEN_AI_KEY)
    loader = CSVLoader(
            file_path='./CSV/index-{}.csv'.format(filepath), encoding="utf8")
    csv_text = loader.load()
    
    for item in query_list:
        query = query_list[item]

        query_result = embeddings.embed_query(query)
        query_results = np.array(query_result)
        doclist = utils.maximal_marginal_relevance(query_results, data)
        docs = []
        for res in doclist:
            docs.append(Document(
                page_content=csv_text[res].page_content, metadata=csv_text[res].metadata))

        result[item] = str(chain.run(input_documents=docs, question=query))
        result[item] = remove_first_space(result[item])

        if(result[item].find("I don't know") >= 0 ):
            result[item] = ""

        if(item == "contact_no" or item == "receiver_phone"):
            result[item] = result[item].replace("-", "")
            result[item] = result[item].replace("(", "")
            result[item] = result[item].replace(")", "")
            result[item] = result[item].replace(" ", "")
        
        if(item == "invoice_no" or item == "po_no"):
            result[item] = result[item].replace(" ", "")

        if(item == "vendor"):
            vendors = result[item].split(", ")
            print(doc_type, vendors)
            vendor_flag = False
            for vendor in vendors:
                x = mydb[company_collections["VENDOR"]].find_one({"vendor_name": vendor}, collation={ "locale": 'en_US', "strength": 1 })
                if x != None:
                    vendor_flag = True
                    result[item] = x["_id"]
            if(vendor_flag == False):
                result[item] = ""

        if(item == "terms"):
            x = mydb[company_collections["TERMS"]].find_one({"name": result[item]})
            if x != None:
                result[item] = x["_id"]
            else:
                result[item] = ""

        if(item.find("epoch") >= 0):
            result[item] = convert_epoch(result[item])
        try:
            list_to_convertINT.index(item)
        except:
            result[item] = result[item]
        else:
            try: 
                float(result[item].replace(",", "").replace(" ", ""))
            except:
                result[item] = result[item] 
            else:
                result[item] = float(result[item].replace(",", "").replace(" ", ""))
    return result


@app.route("/process_invoice", methods=["POST"])
@cross_origin()
def process_invoice():
    count = {
        "PURCHASE_ORDER" : 0,
        "PACKING_SLIP" : 0,
        "RECEIVING_SLIP" : 0,
        "QUOTE" : 0,
        "INVOICE" : 0,
        "OTHER" : 0,
        "DUPLICATED" : 0
    }
    req_data = request.get_json()

    pdf_urls = []
    company_code = token = api_base_url = ""

    try:
        pdf_urls = req_data["pdf_urls"]
        company_code = req_data["company"]
        token = req_data["authorization"]
        api_base_url = req_data["api_base_url"]
    except:
        return "Fail"   

    admin_col = admin_db[admin_collections["COMPANY"]]    
    Y = admin_col.find_one({"companycode": company_code})

    if Y == None:
        list_col.update_one({"_id" : ObjectId(id)}, {"$set" :{"status": "PROCESS_ERROR"}})
        return "Fail"
    
    mydb = myclient[Y["DB_NAME"]]
    list_col = mydb[company_collections["INVOICE_LIST"]]

    inserted_info = []
    invoice_id = ""
    result = {}

    for id in pdf_urls:
        result = {}
        X = list_col.find_one({"_id" : ObjectId(id)})
        if(X == None):
            continue
        pdf_url = X["pdf_url"]
        parse_result = parse_file_path(X["pdf_url"])
        filename = parse_result["path"]
        bucket = parse_result["bucket"]
        region = parse_result["region"]
        endpoint = parse_result["endpoint"]

        # filepath = filename.replace("/", "-")
        filepath = id
        # Get Bytes Data From 'rovukdata'
        filebytes = get_object(WASABI_ACCESS_KEY, WASABI_SECRET_KEY, region,
                            endpoint, bucket, filename)
        textract = create_textract(
            AWS_REGION, AWS_ACCESS_KEY, AWS_SECRET_KEY)
        response = {}

        try:
            response = analyze_invoice(textract, filebytes)
        except:
            list_col.update_one({"_id" : ObjectId(id)}, {"$set" :{"status": "PROCESS_ERROR"}})
            continue
        type_doc = type_invoice(textract, filebytes)

        get_summary(response, filepath)

        embeding("./CSV/index-{}.csv".format(filepath), filepath)
        result = get_fields(mydb ,type_doc, filepath)
        table_items = get_table(response, filepath)

        result["items"] = table_items
        result["pdf_url"] = X["pdf_url"]
        result["document_id"] = ObjectId(id)
        result["created_at"] = get_current_epoch()
        result["created_by"] = X["created_by"]
        result["updated_at"] = get_current_epoch()
        result["updated_by"] = X["created_by"]

        if(result["document_type"] == "CREDIT_MEMO"):
            count["INVOICE"] +=1
        else:
            count[result["document_type"]] +=1

        if os.path.exists("./CSV/index-{}.csv".format(filepath)):
            os.remove("./CSV/index-{}.csv".format(filepath))

        if os.path.exists("./JSON/vector-{}.json".format(filepath)):
            os.remove("./JSON/vector-{}.json".format(filepath))

        dup_col = mydb[company_collections[result["document_type"]]]
        dup = dup_col.find({"vendor": result["vendor"], "invoice_no": result["invoice_no"]})
        list_col.update_one({"_id" : ObjectId(id)}, {"$set" :{"status": "PROCESS_COMPLETE"}})

        if(len(list(dup)) >0):
            duplicate_document = {
                "pdf_url": pdf_url,
                "invoice_no": result["invoice_no"],
                "po_no": "",
                "status": "Pending",
                "vendor": result["vendor"],
                "document_type": result["document_type"],
                "created_by": result["created_by"],
                "created_at": result["created_at"],
                "updated_by": result["updated_by"],
                "updated_at": result["updated_at"],
                "is_delete": 0
            }

            if("po_no" in result):
                duplicate_document["po_no"] = result["po_no"]

            mydb[company_collections["DUPLICATED"]].insert_one(duplicate_document)

            count["DUPLICATED"] = count["DUPLICATED"] + 1
            continue

        inserted_id = schema_generator(mydb,result)
        
        if(result["document_type"] in main_document_type):
            inserted_obj = {"id": str(inserted_id)}
            inserted_obj["document_type"] = result["document_type"]

            inserted_obj["vendor"] = str(result["vendor"])
            if(result["vendor"] == ""):
                inserted_obj["document_type"] = "UNKNOWN"

            if(inserted_obj["document_type"] == "PURCHASE_ORDER" or inserted_obj["document_type"] == "QUOTE" or inserted_obj["document_type"] == "UNKNOWN"): 
                if("quote_no" in result):
                    inserted_obj["quote_no"] = result["quote_no"]
                else:
                    inserted_obj["quote_no"] = ""

            if(inserted_obj["document_type"] == "INVOICE" or inserted_obj["document_type"] == "PURCHASE_ORDER"): 
                if "po_no" in result:
                    inserted_obj["po_no"] = result["po_no"]
                else:
                    inserted_obj["po_no"] = ""

            if(inserted_obj["document_type"] == "PACKING_SLIP" or inserted_obj["document_type"] == "RECEIVING_SLIP"): 
                if "invoice_no" in result:
                    inserted_obj["invoice_no"] = result["invoice_no"]
                else:
                    inserted_obj["invoice_no"] = ""

            inserted_info.append(inserted_obj)

        if(result["document_type"] == "INVOICE"):
            text = {}
            invoice_id = inserted_id
            result_msg = mydb[company_collections["USER"]].find_one({"_id": result["created_by"]})
            text["MANUAL"] = message_text["MANUAL"].format(result_msg["username"])
            text["SUCCESS"] = message_text["SUCCESS"]
            
            if(result["vendor"] == ""):
                text["NO_VENDOR"] = message_text["NO_VENDOR"]
            else:
                result_msg = mydb[company_collections["VENDOR"]].find_one({"_id": result["vendor"]})
                text["VENDOR"] = message_text["VENDOR"].format(result_msg["vendor_name"])
            
            if(result["invoice_no"] == ""):
                text["NO_INVOICE_NO"] = message_text["NO_INVOICE_NO"]
            else:
                text["INVOICE_NO"] = message_text["INVOICE_NO"].format(result["invoice_no"])

            if(result["po_no"] == ""):
                text["NO_PO_NO"] = message_text["NO_PO_NO"]
            else:
                text["PO_NO"] = message_text["PO_NO"].format(result["po_no"])
            
            if(result["due_date_epoch"] == 0):
                text["NO_DUE"] = message_text["NO_DUE"]

            for message_item in text:
                mydb[company_collections["HISTORY"]].insert_one({
                    "data": [],
                    "invoice_id": inserted_id,
                    "history_created_at": get_current_epoch(),
                    "history_created_by": "",
                    "action": "AI Processing",
                    "taken_device": "Web",
                    "message": text[message_item],
                    "is_system": True
                })
        
    count_col = mydb[company_collections["API_COUNT"]]
    x = count_col.find_one({"year": datetime.now().year, "month": datetime.now().month})
    if x == None:
        count_obj = {"year": datetime.now().year, "month": datetime.now().month, "is_delete" : 0}
        for item in count:
            count_obj[item] = count[item]
        count_col.insert_one(count_obj)
    else:
        count_obj = {}
        for item in count:
            count_obj[item] = count[item] + x[item]

        count_col.update_one({"year": datetime.now().year, "month": datetime.now().month}, {"$set": count_obj})
        
    find_relationship(inserted_info, token, api_base_url)
    send_notification(mydb, result["created_by"], invoice_id)
    

    return "Success"

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)