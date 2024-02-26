var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var usersdocumentSchema = new Schema({
    userdocument_user_id: { type: mongoose.ObjectId, default: null, ref: "users" },
    userdocument_type_id: { type: mongoose.ObjectId, default: null, ref: "document_type" },
    userdocument_url: { type: String, default: "" },
    show_on_qrcode_scan: { type: Boolean, default: false },
    userdocument_expire_date: { type: Number, default: 0 },
    userdocument_created_by: { type: mongoose.ObjectId, default: null, ref: "users" },
    userdocument_updated_by: { type: mongoose.ObjectId, default: null, ref: "users" },
    userdocument_created_at: { type: Number, },
    userdocument_updated_at: { type: Number, },
    is_delete: { type: Number, default: 0 },
}, { timestamps: false });

module.exports = usersdocumentSchema;