var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var locationSchema = new Schema({
    location_customer_id: { type: mongoose.ObjectId, default: null },
    location_name: { type: String },
    location_full_address: { type: String },
    location_street1: { type: String },
    location_street2: { type: String },
    location_city: { type: String },
    location_state: { type: String },
    location_postcode: { type: String },
    location_contact_name: { type: String },
    location_contact_number: { type: String },
    location_country: { type: String },
    location_lat: { type: Number },
    location_lng: { type: Number },
    location_created_by: { type: mongoose.ObjectId, default: null },
    location_updated_by: { type: mongoose.ObjectId, default: null },
    is_delete: { type: Number, default: 0 },
    location_attachment: { type: Array, default: [] },
    deleted_id: { type: mongoose.ObjectId, default: "" },
    updated_id: { type: mongoose.ObjectId, default: "" },
    inserted_id: { type: mongoose.ObjectId, default: "" },
    created_at: { type: Number },
    created_by: { type: mongoose.ObjectId },
    action: { type: String, enum: ["Insert", "Update", "Delete"] },
    alert_team_members: { type: Boolean, default: true },
    is_first: { type: Boolean, default: false },
    taken_device: { type: String, enum: ["Mobile", "Web"] },
}, { timestamps: true });

module.exports = locationSchema;