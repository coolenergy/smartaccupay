var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const castObjectId = mongoose.ObjectId.cast();
mongoose.ObjectId.cast(v => v === '' ? v : castObjectId(v));
var locationSchema = new Schema({
    location_customer_id: { type: mongoose.ObjectId, default: "" },
    location_contact_name: { type: String, default: "" },
    location_contact_number: { type: String, default: "" },
    location_name: { type: String },
    // location_full_address: { type: String },
    location_street1: { type: String, default: "" },
    location_street2: { type: String, default: "" },
    location_city: { type: String, default: "" },
    location_state: { type: String, default: "" },
    location_postcode: { type: String, default: "" },
    location_country: { type: String, default: "" },
    location_lat: { type: Number, default: 0 },
    location_lng: { type: Number, default: 0 },
    location_created_by: { type: mongoose.ObjectId, default: "" },
    location_updated_by: { type: mongoose.ObjectId, default: "" },
    is_delete: { type: Number, default: 0 },
    location_attachment: { type: Array, default: [] },
    alert_team_members: { type: Boolean, default: true },
    is_first: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = locationSchema;