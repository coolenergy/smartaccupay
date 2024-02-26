var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var clientSchema = new Schema({
    client_name: { type: String, default: "" },
    client_number: { type: String, default: "" },
    client_email: { type: String, default: "" },
    client_status: { type: Number, default: 1 },
    client_notes: { type: String, default: "" },
    approver_id: { type: mongoose.ObjectId, default: '' }, //User id 
    // gl_account: { type: mongoose.ObjectId, default: '' },
    client_cost_cost_id: { type: mongoose.ObjectId, default: '' },
    is_quickbooks: { type: Boolean, default: false },
    is_delete: { type: Number, default: 0 },
    created_at: { type: Number },
    updated_at: { type: Number },
    created_by: { type: mongoose.ObjectId },
    updated_by: { type: mongoose.ObjectId },
}, { timestamps: false });

module.exports = clientSchema;