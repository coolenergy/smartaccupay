import pymongo
from bson.objectid import ObjectId
from utils import get_current_epoch
myclient = pymongo.MongoClient("mongodb://localhost:27017/")
import requests

collections = {
    "INVOICE": "ap_invoices", 
    "PURCHASE_ORDER": "ap_pos", 
    "PACKING_SLIP": "ap_packaging_slips", 
    "RECEIVING_SLIP": "ap_receiving_slips",
    "INVOICE_LIST": "ap_document_processes",
    "QUOTE": "ap_quotes",
    "OTHER": "ap_otherdocuments",
    "VENDOR": "invoice_vendors",
    "API_COUNT": "api_count",
    "ALERT": "ap_alerts"
}

messages = {
    "MANUAL": 'Invoice manual upload by {}',
    "EMAIL": 'Invoice imported from email. Sender: {}',
    "SUCCESS": 'SmartAccuPay processed Invoice Document successfully.',
    "VENDOR": "SmartAccuPay processed Invoice document and detected {}",
    "INVOICE_NO": 'SmartAccuPay processed Invoice document and detected {}',
    "PO_NO": 'SmartAccuPay processed Invoice and detected {}',
    "FAIL": "SmartAccuPay processed Invoice Document failed.",
    "NO_VENDOR": "SmartAccuPay processed failed to detected: Vendor Name",
    "NO_INVOICE_NO": "SmartAccuPay processed failed to detected: Invoice No",
    "NO_PO_NO": "SmartAccuPay processed failed to detected: PO No",
    "NO_DUE": "SmartAccuPay processed failed to detected:Invoice Due Date"
}

def send_notification(mydb, user_id, invoice_id):
    alert_history = {
        "user_id" : user_id,
        "module_name" : "Invoice",
        "tab_index" : -1,
        "notification_title" : "Processing completed",
        "notification_description" : "Document processing is finished and data is updated for your Organiztion.",
        "is_seen" : False,
        "is_complete" : False,
        "is_delete" : 0,
        "module_route" : {
            "_id" : invoice_id
        },
        "created_at" : get_current_epoch(),
        "updated_at" : get_current_epoch(),
        "__v" : 0
    }
    mydb[collections["ALERT"]].insert_one(alert_history)


def schema_generator(mydb, schema_param):
    schemas = {
        "PACKING_SLIP" : {
            "invoice_id": "",
            "pdf_url": "", # Wasabi s3 bucket packaging slip document url
            "document_id": "", # Process document id
            "document_type": "", # Process document type
            "date_epoch": 0,
            "invoice_no": "",
            "po_no": "",
            "ship_to_address": "",
            "vendor": "", # Vendor Collection - Vendor Id
            
            "is_delete": 0,
            "is_orphan": True, # 0 - Orphan document, 1 - already relationship with invoice document
            "created_by": "",
            "created_at": 0,
            "updated_by": "",
            "updated_at": 0,
        }, "INVOICE" : {
            "assign_to": "", #user collection ID - All By default empty like rillion
            "vendor": "", # vendor collection ID
            # "vendor_name": "", # Vendor collection
            "is_quickbooks": False, # This is for future for Quickbooks sync
            "vendor_id": "", # vendor collection
            "customer_id": "", # vendor collection
            "invoice_no": "",
            "po_no": "",
            "packing_slip_no": "",
            "receiving_slip_no": "",
            "invoice_date_epoch": 0, # Epoch 
            "due_date_epoch": 0,
            "order_date_epoch": 0,
            "ship_date_epoch": 0,
            "terms": "", # Vendor terms OR coming from Terms Setting master : ID
            "invoice_total_amount": 0,
            "tax_amount": 0,
            "tax_id": "",
            "sub_total": 0,
            "amount_due": 0,
            "gl_account": "", # Coming from settings costcode/glaccount table  - Job # ID
            "receiving_date_epoch": 0,
            "status": "Pending",
            # { type: String, default: "Pending", enum: ['Pending', 'Approved', 'Rejected', 'On Hold', 'Late', 'Paid', 'Unpaid', 'Overdue'] },
            "reject_reason": "",
            "job_client_name": "", # Coming from job client name Side menu - collection name is ID,
            "class_name": "", # ID
            "delivery_address": "",
            "contact_no": "",
            "account_number": "",
            "discount": "",
            "pdf_url": "", # Wasabi s3 bucket invoice document url
            "items": [], # This will be the list of items inside the invoice document,
            "notes": "",
            "invoice_notes": [], # Notes Schema Array
            "document_type": "INVOICE", # Fixed Invoice document type
            
            "document_id": "",
            "invoice_info": [],

            "created_by": "",  # User collection ID
            "created_at": 0, # Epoch Date - When action taken
            "updated_by": "",  # User collection ID
            "updated_at": 0, # Epoch Data - When action taken
            "is_delete": 0, # 0 - for not archive, 1 - for archive   
        },"CREDIT_MEMO" : {
            "assign_to": "", #user collection ID - All By default empty like rillion
            "vendor": "", # vendor collection ID
            # "vendor_name": "", # Vendor collection
            "is_quickbooks": False, # This is for future for Quickbooks sync
            "vendor_id": "", # vendor collection
            "customer_id": "", # vendor collection
            "invoice_no": "",
            "po_no": "",
            "packing_slip_no": "",
            "receiving_slip_no": "",
            "invoice_date_epoch": 0, # Epoch 
            "due_date_epoch": 0,
            "order_date_epoch": 0,
            "ship_date_epoch": 0,
            "terms": "", # Vendor terms OR coming from Terms Setting master : ID
            "invoice_total_amount": 0,
            "tax_amount": 0,
            "tax_id": "",
            "sub_total": 0,
            "amount_due": 0,
            "gl_account": "", # Coming from settings costcode/glaccount table  - Job # ID
            "receiving_date_epoch": 0,
            "status": "Pending",
            # { type: String, default: "Pending", enum: ['Pending', 'Approved', 'Rejected', 'On Hold', 'Late', 'Paid', 'Unpaid', 'Overdue'] },
            "reject_reason": "",
            "job_client_name": "", # Coming from job client name Side menu - collection name is ID,
            "class_name": "", # ID
            "delivery_address": "",
            "contact_no": "",
            "account_number": "",
            "discount": "",
            "pdf_url": "", # Wasabi s3 bucket invoice document url
            "items": [], # This will be the list of items inside the invoice document,
            "notes": "",
            "invoice_notes": [], # Notes Schema Array
            "document_type": "INVOICE", # Fixed Invoice document type
            
            "document_id": "",
            "invoice_info": [],

            "created_by": "",  # User collection ID
            "created_at": 0, # Epoch Date - When action taken
            "updated_by": "",  # User collection ID
            "updated_at": 0, # Epoch Data - When action taken
            "is_delete": 0, # 0 - for not archive, 1 - for archive   
        }, "PURCHASE_ORDER" : {
            "invoice_id": "",
            "pdf_url": "", # Wasabi s3 bucket po document url
            "document_id": "", # Process document id
            "document_type": "", # Process document type PO
            "date_epoch": 0,
            "invoice_no": "",
            "po_no": "",
            "customer_id": "",
            "terms": "",
            "delivery_date_epoch": 0,
            "delivery_address": "",
            "due_date_epoch": 0,
            "quote_no": "",
            "contact_no": "",
            "vendor_id": "",
            "vendor": "",
            "sub_total": 0,
            "tax": 0,
            "po_total": 0,
            "items": [],
            
            "is_delete": 0,
            "is_orphan": True, # 0 - Orphan document, 1 - already relationship with invoice document
            "created_by": "",
            "created_at": 0,
            "updated_by": "",
            "updated_at": 0
        }, "RECEIVING_SLIP" : {
            "invoice_id": "",
            "pdf_url": "", # Wasabi s3 bucket receiving slip document url
            "document_id": "", # Process document id
            "document_type": "", # Process document type
            "date_epoch": 0,
            "invoice_no": "",
            "po_no": "",
            "ship_to_address": "",
            "vendor": "", # Vendor Collection - Vendor Id
            
            "is_delete": 0,
            "is_orphan": True, # 0 - Orphan document, 1 - already relationship with invoice document
            "created_by": "",
            "created_at": 0,
            "updated_by": "",
            "updated_at": 0,            
        }, "NOTES" : {
            "notes": "",
            "created_at": 0,
            "created_by": "",
            "updated_at": 0,
            "updated_by": "",
            "is_delete": 0,
        }, "OTHER" : {
            "pdf_url": "", # Wasabi s3 bucket receiving slip document url
            "document_id": "", # Process document id
            "document_type": "", # Process document type
            "date_epoch": 0,
            "invoice_no": "",
            "po_no": "",
            "vendor": "", # Vendor Collection - Vendor Id
            
            "is_delete": 0,
            "is_orphan": True, # 0 - Orphan document, 1 - already relationship with invoice document
            "created_by": "",
            "created_at": 0,
            "updated_by": "",
            "updated_at": 0,
        }, "QUOTE" : {
                "invoice_id": "",
                "document_id": "", # Process document id
                "invoice_no": "",

                # Available Part to be save from result of OCR
                "pdf_url": "", # Wasabi s3 bucket quote document url
                "document_type": "", # Process document type
                "date_epoch": 0,
                "quote_no": "",
                "terms": "",
                "address": "",
                "vendor": "", # Vendor Collection - Vendor Id
                "shipping_method": "",
                "sub_total": 0,
                "tax": 0,
                "quote_total": 0,
                "receiver_phone": "",
                "items": [],

                "is_delete": 0,
                "is_orphan": True, # 0 - Orphan document, 1 - already relationship with invoice document
                "created_by": "",
                "created_at": 0,
                "updated_by": "",
                "updated_at": 0
            }
    } 
    schema_obj = {}
    schema_obj = schemas[schema_param["document_type"]]
    for x in schema_param:
        schema_obj[x] = schema_param[x]

    if(schema_param["document_type"] == "CREDIT_MEMO"):
        mycol = mydb[collections["INVOICE"]]
        x = mycol.insert_one(schema_obj)
        return x.inserted_id
    else:
        mycol = mydb[collections[schema_param["document_type"]]]
        x = mycol.insert_one(schema_obj)
        return x.inserted_id

def find_relationship(inserted_info, token, api_base_url):

    url = '{}/webapi/v1/portal/makeapdocumentrelationship'.format(api_base_url)
    body = inserted_info
    headers = {'Authorization': token}
    x = requests.post(url, json = body, headers=headers, verify=False)

