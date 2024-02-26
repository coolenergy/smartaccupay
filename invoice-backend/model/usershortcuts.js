
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var shortcustsSchema = new Schema({
    user_id: { type: mongoose.ObjectId },
    shortcusts: { type: Array, default: [] },
    is_delete: { type: Number, default: 0 }
}, { timestamps: false });

module.exports = shortcustsSchema