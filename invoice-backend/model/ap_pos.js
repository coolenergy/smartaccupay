var mongoose = require('mongoose');

var po_schema = new mongoose.Schema({
    invoice_id: { type: mongoose.ObjectId, default: "" }, // Invoice Id
    pdf_url: { type: String, default: "" }, // Wasabi s3 bucket po document url
    document_id: { type: mongoose.ObjectId, default: "" }, // Process document id
    document_type: { type: String, default: "" }, // Process document type PO
    date_epoch: { type: Number, default: 0 },
    invoice_no: { type: String, default: "" },
    po_no: { type: String, default: "" },
    customer_id: { type: String, default: "" },
    terms: { type: mongoose.ObjectId, default: "" },
    delivery_date_epoch: { type: Number, default: 0 },
    delivery_address: { type: String, default: "" },
    due_date_epoch: { type: Number, default: 0 },
    quote_no: { type: String, default: "" },
    contract_number: { type: String, default: "" },
    vendor_id: { type: String, default: "" },
    vendor: { type: mongoose.ObjectId, default: "" },
    sub_total: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    po_total: { type: Number, default: 0 },
    items: { type: Array, default: [] },
    is_delete: { type: Number, default: 0 },
    is_orphan: { type: Boolean, default: false }, // true - Orphan document, false - already relationship with invoice document
    created_by: { type: mongoose.ObjectId, default: "" },
    created_at: { type: Number, default: 0 },
    updated_by: { type: mongoose.ObjectId, default: "" },
    updated_at: { type: Number, default: 0 },
});

module.exports = po_schema;
