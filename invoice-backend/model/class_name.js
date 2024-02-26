var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var classnameSchema = new Schema({
    name: { type: String, default: "" },
    number: { type: String, default: "" },
    description: { type: String, default: "" },
    status: { type: Number, default: 1 },
    is_quickbooks: { type: Boolean, default: false },
    is_delete: { type: Number, default: 0 },
    created_at: { type: Number },
    updated_at: { type: Number },
}, { timestamps: false });

module.exports = classnameSchema;