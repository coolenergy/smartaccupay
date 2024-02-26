var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var documentSchema = new Schema({
    name: { type: String },
    is_expiration: { type: Boolean, default: false },
    is_delete: { type: Number, default: 0 },
    created_at: { type: Number },
    updated_at: { type: Number },
});

module.exports = documentSchema;