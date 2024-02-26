var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var termSchema = new Schema({
    name: { type: String },
    due_days: { type: Number, default: 0 },
    is_discount: { type: Boolean, default: false },
    discount: { type: Number, default: 0 },
    is_quickbooks: { type: Boolean, default: false },
    is_delete: { type: Number, default: 0 },
    created_at: { type: Number },
    updated_at: { type: Number },
});

module.exports = termSchema;