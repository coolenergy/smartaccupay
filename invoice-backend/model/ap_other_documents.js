var mongoose = require('mongoose');

var otherdocument_schema = new mongoose.Schema({
    pdf_url: { type: String, default: "" }, // Wasabi s3 bucket receiving slip document url
    document_id: { type: mongoose.ObjectId, default: "" }, // Process document id
    document_type: { type: String, default: "" }, // Process document type
    date_epoch: { type: Number, default: 0 },
    invoice_no: { type: String, default: "" },
    po_no: { type: String, default: "" },
    vendor: { type: mongoose.ObjectId, default: "" }, // Vendor Collection - Vendor Id
    is_delete: { type: Number, default: 0 },
    created_by: { type: mongoose.ObjectId, default: "" },
    created_at: { type: Number, default: 0 },
    updated_by: { type: mongoose.ObjectId, default: "" },
    updated_at: { type: Number, default: 0 },
});

module.exports = otherdocument_schema;
