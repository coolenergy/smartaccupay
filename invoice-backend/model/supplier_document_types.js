var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var supplier_documentTypesSchema = new Schema({
    name: { type: String },
    is_expiration: { type: Boolean, default: false },
    is_delete: { type: Number, default: 0 },
});

module.exports = supplier_documentTypesSchema