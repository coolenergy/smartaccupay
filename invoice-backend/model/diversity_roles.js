var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// mongoose.ObjectId.cast(v => v === '' ? v : castObjectId(v));
var diversity_rolesSchema = new Schema({
    role_name: { type: String },
    role_permission: { type: Schema.Types.Mixed, default: null },
    role_id: { type: mongoose.ObjectId, default: "" },
    is_delete: { type: Number, default: 0 }
});

module.exports = diversity_rolesSchema