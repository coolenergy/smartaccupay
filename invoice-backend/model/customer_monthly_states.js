var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var customerStatesSchema = new Schema({
    year: { type: Number, default: 0 },
    month: { type: Number, default: 0 },
    po_expense: { type: Number, default: 0 },
    po_forms: { type: Number, default: 0 },
    packing_slip_expense: { type: Number, default: 0 },
    packing_slip_forms: { type: Number, default: 0 },
    receiving_slip_expense: { type: Number, default: 0 },
    receiving_slip_forms: { type: Number, default: 0 },
    quote_expense: { type: Number, default: 0 },
    quote_forms: { type: Number, default: 0 },
    invoice_expense: { type: Number, default: 0 },
    invoice_forms: { type: Number, default: 0 },
    unknown_expense: { type: Number, default: 0 },
    unknown_forms: { type: Number, default: 0 },
    is_delete: { type: Number, default: 0 },
}, { timestamps: false });

module.exports = customerStatesSchema;