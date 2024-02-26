var mongoose = require('mongoose');
const config = require('../config/config');
var Schema = mongoose.Schema;
const castObjectId = mongoose.ObjectId.cast();
mongoose.ObjectId.cast(v => v === '' ? v : castObjectId(v));

var itemSchema = new mongoose.Schema({
    item_id: { type: mongoose.ObjectId, default: '' },
    quantity: { type: Number, default: 0 },
});

var invoiceSchema = new Schema({
    invoice_no: { type: Number, default: 0 },
    client_id: { type: mongoose.ObjectId, default: '' },
    date: { type: Number, default: 0 },
    due_date: { type: Number, default: 0 },
    status: { type: String, enum: config.MANAGEMENT_INVOICE_STATUS, default: config.MANAGEMENT_INVOICE_STATUS[0] },
    ship_via: { type: String, default: '' },
    ship_to: { type: mongoose.ObjectId, default: '' },
    project_id: { type: mongoose.ObjectId, default: '' },
    po_no: { type: String, default: '' },
    shipping_charge: { type: Number, default: 0 },
    terms: { type: String, default: '' },
    note: { type: String, default: '' },
    sales_tax: { type: mongoose.ObjectId, default: '' },
    items: { type: [itemSchema], default: [] },
    pdf_url: { type: String, default: '' },
    payment_method: { type: mongoose.ObjectId, default: '' },
    reference_no: { type: String, default: '' },
    deposit_to: { type: mongoose.ObjectId, default: '' },
    amount: { type: Number, default: 0 },
    attachment: { type: Array, default: [] },
    thumbnail_attachment: { type: Array, default: [] },
    include_attachment: { type: Boolean, default: true },
    created_at: { type: Number, default: 0 },
    created_by: { type: mongoose.ObjectId, default: '' },
    updated_at: { type: Number, default: 0 },
    updated_by: { type: mongoose.ObjectId, default: '' },
    is_delete: { type: Number, default: 0 },
});

module.exports = invoiceSchema;