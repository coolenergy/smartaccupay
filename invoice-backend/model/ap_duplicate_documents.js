var mongoose = require('mongoose');

var duplicateDocumentSchema = new mongoose.Schema({
    pdf_url: { type: String, default: "" },
    status: { type: String, default: "Pending" }, // Pending, Already Exists, Process, Complete
    document_type: { type: String, default: "" },
    invoice_no: { type: String, default: "" },
    po_no: { type: String, default: "" },
    vendor: { type: mongoose.ObjectId, default: "" }, // Vendor Collection 
    created_by: { type: mongoose.ObjectId, default: "" },
    created_at: { type: Number, default: 0 },
    updated_by: { type: mongoose.ObjectId, default: "" },
    updated_at: { type: Number, default: 0 },
    is_delete: { type: Number, default: 0 },
});

module.exports = duplicateDocumentSchema;