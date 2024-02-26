var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var invoiceProgressSchema = new Schema({
    process_id: { type: String, default: "" },
    process_status: { type: Array, default: [] },
    ratio: { type: Number, default: 0 },
    final: { type: Number, default: 0 },
    total: { type: Number, default: 0 },

    status: { type: String, default: "" },

    created_by: { type: mongoose.ObjectId, default: "" },
    created_at: { type: Number, default: 0 },
    updated_by: { type: mongoose.ObjectId, default: "" },
    updated_at: { type: Number, default: 0 },
    is_delete: { type: Number, default: 0 },
});

module.exports = invoiceProgressSchema;

// 1. PROCESS_STATUS_ERROR_DUPLICATE_DOCUMENT_ID - Document id already exist for current cliet
// 2. PROCESS_STATUS_ERROR_DUPLICATE_HASH - Document is already processed
// 3. PROCESS_STATUS_EXTRACTED - Document is extracted and saved in database
// 4. PROCESS_STATUS_ENQUEUED - Process is in queue
// 5. PROCESS_STATUS_DEQUEUED - Document is taken from process queue