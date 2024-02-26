var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const castObjectId = mongoose.ObjectId.cast();
mongoose.ObjectId.cast(v => v === '' ? v : castObjectId(v));

var vendorSchema = new Schema({
    vendor_name: { type: String },
    vendor_phone: { type: String },
    vendor_email: { type: String },
    vendor_image: { type: String, default: "" },
    gl_account: { type: mongoose.ObjectId, default: '' },
    vendor_address: { type: String },
    vendor_address2: { type: String, default: "" },
    vendor_city: { type: String },
    vendor_state: { type: String, default: "" },
    vendor_zipcode: { type: String, default: "" },
    vendor_country: { type: String, default: "" },
    vendor_terms: { type: mongoose.ObjectId, default: '' },
    vendor_status: { type: Number, enum: [1, 2], default: 1 },//1- Active / 2-Inactive
    vendor_description: { type: String, default: "" },
    vendor_attachment: { type: Array, default: [] },

    vendor_created_at: { type: Number },
    vendor_created_by: { type: mongoose.ObjectId },
    vendor_updated_at: { type: Number },
    vendor_updated_by: { type: mongoose.ObjectId },
    is_delete: { type: Number, default: 0 },

    invitation_sent: { type: Boolean, default: false },
    is_password_temp: { type: Boolean, default: false },
    password: { type: String, default: "" },
    vendor_id: { type: String, default: "" },
    customer_id: { type: String, default: "" },
    vendor_type_id: { type: mongoose.ObjectId },
    isVendorfromQBO: { type: Boolean },
    is_quickbooks: { type: Boolean, default: false },
}, { timestamps: false });

module.exports = vendorSchema;