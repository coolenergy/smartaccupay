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
    deleted_id: { type: mongoose.ObjectId, default: "" },
    updated_id: { type: mongoose.ObjectId, default: "" },
    inserted_id: { type: mongoose.ObjectId, default: "" },
    history_created_at: { type: Number },
    history_created_by: { type: mongoose.ObjectId },
    action: { type: String, enum: ["Insert", "Update", "Delete", "Archive", "Restore"] },
    taken_device: { type: String, default: "Web", enum: ["Mobile", "Web", "iFrame"] },
    template_id: { type: mongoose.ObjectId, default: "" }
}, { timestamps: false });

module.exports = emailTemplatesSchema