var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var supplier_minority_codesSchema = new Schema({
    name: { type: String },
    description: { type: String },
    is_delete: { type: Number, default: 0 }
});

module.exports = supplier_minority_codesSchema