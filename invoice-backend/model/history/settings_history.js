var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var settingSchema = new Schema({
    settings: { type: Schema.Types.Mixed },
    deleted_id: { type: mongoose.ObjectId, default: "" },
    updated_id: { type: mongoose.ObjectId, default: "" },
    inserted_id: { type: mongoose.ObjectId, default: "" },
    created_at: { type: Number },
    created_by: { type: mongoose.ObjectId },
    action: { type: String, enum: ["Insert", "Update", "Delete"] },
    taken_device: { type: String, enum: ["Mobile", "Web"] },
});

module.exports = settingSchema