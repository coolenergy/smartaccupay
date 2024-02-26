var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const castObjectId = mongoose.ObjectId.cast();
mongoose.ObjectId.cast(v => v === '' ? v : castObjectId(v));

var emailTemplatesSchema = new Schema({
    email_template_name: { type: String, default: "" },
    email_header: { type: String, default: "" },
    email_header_image: { type: String, default: "" },
    email_subject: { type: String, default: "" },
    email_body: { type: String, default: "" },
    email_footer: { type: String, default: "" },
    created_at: { type: Number, default: 0 },
    created_by: { type: mongoose.ObjectId, default: "" },
    updated_at: { type: Number, default: 0 },
    updated_by: { type: mongoose.ObjectId, default: "" },
    email_template_status: { type: Number, default: 1 },
    email_html: { type: String, default: '' },
    is_delete: { type: Number, default: 0 },

}, { timestamps: false });

module.exports = emailTemplatesSchema