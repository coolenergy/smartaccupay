var mongoose = require('mongoose');

var quote_schema = new mongoose.Schema({
    invoice_id: { type: mongoose.ObjectId, default: "" }, // Invoice Id
    pdf_url: { type: String, default: "" }, // Wasabi s3 bucket quote document url
    document_id: { type: mongoose.ObjectId, default: "" }, // Process document id
    document_type: { type: String, default: "" }, // Process document type
    date_epoch: { type: Number, default: 0 },
    invoice_no: { type: String, default: "" },
    po_no: { type: String, default: "" },
    quote_no: { type: String, default: "" },
    terms: { type: mongoose.ObjectId, default: "" },
    address: { type: String, default: "" },
    vendor: { type: mongoose.ObjectId, default: "" }, // Vendor Collection - Vendor Id
    shipping_method: { type: String, default: "" },
    sub_total: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    quote_total: { type: Number, default: 0 },
    receiver_phone: { type: String, default: "" },
    items: { type: Array, default: [] },
    is_delete: { type: Number, default: 0 },
    is_orphan: { type: Boolean, default: false }, // true - Orphan document, false - already relationship with invoice document
    created_by: { type: mongoose.ObjectId, default: "" },
    created_at: { type: Number, default: 0 },
    updated_by: { type: mongoose.ObjectId, default: "" },
    updated_at: { type: Number, default: 0 },
});

module.exports = quote_schema;
