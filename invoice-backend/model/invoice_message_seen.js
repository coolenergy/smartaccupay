var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var invoiceMessageSchema = new Schema({
    invoice_message_id: { type: mongoose.ObjectId, default: "" },
    user_id: { type: mongoose.ObjectId, default: "" },
    is_seen: { type: Boolean, default: false },
    seen_at: { type: Number, default: 0 },
    created_at: { type: Number, default: 0 },
});

module.exports = invoiceMessageSchema;