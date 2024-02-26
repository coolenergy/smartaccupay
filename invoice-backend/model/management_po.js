var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const castObjectId = mongoose.ObjectId.cast();
mongoose.ObjectId.cast(v => v === '' ? v : castObjectId(v));
var poSchema = new Schema({
    po_no: { type: String },
    po_vendor_id: { type: mongoose.ObjectId },
    po_date: { type: Number },
    po_expected_date: { type: Number },
    po_status: { type: String, enum: ['Pending', 'Partial Received', 'Received', 'Approve Pending', 'Denied'], default: 'Approve Pending' },
    po_ship_via: { type: String },
    po_ship_to: { type: mongoose.ObjectId },
    po_project_id: { type: mongoose.ObjectId },
    po_quote_number: { type: String },
    po_valid_until: { type: Number },
    po_shipping_method: { type: String, default: '' },
    po_shipping_charge: { type: Number },
    po_attachment: { type: Array, default: [] },
    po_terms: { type: String, default: '' },
    sales_tax: { type: mongoose.ObjectId, default: '' },
    po_note: { type: String, default: '' },
    is_po_received: { type: Boolean, default: false },
    po_received_by: { type: mongoose.ObjectId, default: '' },
    po_received_at: { type: Number, default: 0 },
    po_signature: { type: String, default: '' },
    po_url: { type: String, default: '' },
    received_url: { type: String, default: '' },
    po_created_at: { type: Number },
    po_created_by: { type: mongoose.ObjectId },
    po_updated_at: { type: Number },
    po_updated_by: { type: mongoose.ObjectId },
    is_delete: { type: Number, default: 0 },
}, { collection: 'project_po' }, { timestamps: false });

module.exports = poSchema;