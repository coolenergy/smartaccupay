var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var supplier_compnay_codesSchema = new Schema({
    category_code: { type: String },
    category_name: { type: String },
    sub_category_code: { type: String },
    sub_category_code_name: { type: String },
    is_delete: { type: Number, default: 0 },
});

module.exports = supplier_compnay_codesSchema