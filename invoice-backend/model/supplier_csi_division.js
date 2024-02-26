var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var csiDivisionSchema = new Schema({
    name: { type: String },
    prime_work_performed: { type: Boolean, default: false },
    is_delete: { type: Number, default: 0 },
}, { collection: 'supplier_csi_division' });

module.exports = csiDivisionSchema