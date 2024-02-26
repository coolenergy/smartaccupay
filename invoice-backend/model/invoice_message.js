var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var invoiceMessageSchema = new Schema({
    invoice_message_id: { type: mongoose.ObjectId, default: "" },
    invoice_id: { type: mongoose.ObjectId, default: "" },
    sender_id: { type: mongoose.ObjectId, default: "" },
    receiver_id: { type: mongoose.ObjectId, default: "" },
    participants: { type: [mongoose.ObjectId], default: [] },
    message: { type: String, default: "" },
    is_seen: { type: Boolean, default: false },
    is_first: { type: Boolean, default: false },
    is_attachment: { type: Boolean, default: false },
    mention_user: { type: mongoose.ObjectId, default: "" },
    is_delete: { type: Number, default: 0 },
    created_at: { type: Number, default: 0 },
});

module.exports = invoiceMessageSchema;