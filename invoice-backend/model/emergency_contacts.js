var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var emergencycontactsSchema = new Schema({
    emergency_contact_userid: { type: mongoose.ObjectId, default: "", ref: "users" },
    emergency_contact_name: { type: String, default: "" },
    emergency_contact_relation: { type: mongoose.ObjectId, ref: "relationship" },
    emergency_contact_phone: { type: String, default: "" },
    emergency_contact_email: { type: String, default: "" },
    emergency_contact_fulladdress: { type: String, default: "" },
    emergency_contact_street1: { type: String, default: "" },
    emergency_contact_street2: { type: String, default: "" },
    emergency_contact_city: { type: String, default: "" },
    emergency_contact_state: { type: String, default: "" },
    emergency_contact_zipcode: { type: String, default: "" },
    emergency_contact_country: { type: String, default: "" },
    is_delete: { type: Number, default: 0 },
    is_validated: { type: Boolean, default: false },
    validated_at: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = emergencycontactsSchema;