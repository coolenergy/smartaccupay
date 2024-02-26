var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var emergencycontacts_historiesSchema = new Schema({
    emergency_contact_userid: { type: mongoose.ObjectId },
    emergency_contact_name: { type: String },
    emergency_contact_relation: { type: mongoose.ObjectId },
    emergency_contact_phone: { type: String },
    emergency_contact_email: { type: String },
    emergency_contact_fulladdress: { type: String },
    emergency_contact_street1: { type: String },
    emergency_contact_street2: { type: String },
    emergency_contact_city: { type: String },
    emergency_contact_state: { type: String },
    emergency_contact_zipcode: { type: String },
    emergency_contact_country: { type: String },
    is_delete: { type: Number, default: 0 },
    deleted_id: { type: mongoose.ObjectId, default: "" },
    updated_id: { type: mongoose.ObjectId, default: "" },
    inserted_id: { type: mongoose.ObjectId, default: "" },
    created_at: { type: Number },
    created_by: { type: mongoose.ObjectId },
    action: { type: String, enum: ["Insert", "Update", "Delete"] },
    is_validated: { type: Boolean, default: false },
    validated_at: { type: Number, default: 0 },
    taken_device: { type: String, enum: ["Mobile", "Web"] },
}, { timestamps: true });

module.exports = emergencycontacts_historiesSchema;