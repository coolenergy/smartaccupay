var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var apInvoiceSchema = new Schema({
    data: { type: Array, default: [] },
    invoice_id: { type: mongoose.ObjectId, default: '' },
    history_created_at: { type: Number, default: 0 },
    history_created_by: { type: mongoose.ObjectId, default: '' },
    action: { type: String, default: '' },
    taken_device: { type: String, default: "Web", enum: ["Mobile", "Web", "iFrame"] },
});

module.exports = apInvoiceSchema;