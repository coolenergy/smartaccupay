var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var documenttypeSchema = new Schema({
    document_type_name: { type: String },
    is_expiration: { type: Boolean, default: false },
    is_delete: { type: Number, default: 0 },
    created_at: { type: Number },
    updated_at: { type: Number },
}, { collection: 'document_type' });

module.exports = documenttypeSchema;