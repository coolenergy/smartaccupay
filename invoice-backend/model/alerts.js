var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const castObjectId = mongoose.ObjectId.cast();
mongoose.ObjectId.cast(v => v === '' ? v : castObjectId(v));

var alertsSchema = new mongoose.Schema({
    user_id: { type: mongoose.ObjectId, default: "" },

    module_name: { type: String, default: "" },
    module_route: { type: Object, default: {} },
    tab_index: { type: Number, default: -1 },

    notification_title: { type: String, default: "" },
    notification_description: { type: String, default: "" },
    is_seen: { type: Boolean, default: false },
    is_complete: { type: Boolean, default: false },

    created_at: { type: Number },
    updated_at: { type: Number },
    is_delete: { type: Number, default: 0 },
});

module.exports = alertsSchema;