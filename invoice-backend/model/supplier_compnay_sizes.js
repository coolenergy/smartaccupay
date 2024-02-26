var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var supplier_compnay_sizesSchema = new Schema({
    name: { type: String },
    is_delete: { type: Number, default: 0 }
});

module.exports = supplier_compnay_sizesSchema