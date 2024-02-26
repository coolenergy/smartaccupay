var mongoose = require('mongoose');
const collectionConstant = require('./../config/collectionConstant');

var invoiceSchema = new mongoose.Schema({
    year: { type: Number, default: 0 },
    month: { type: Number, default: 0 },
    INVOICE: { type: Number, default: 0 },
    PURCHASE_ORDER: { type: Number, default: 0 },
    PACKING_SLIP: { type: Number, default: 0 },
    RECEIVING_SLIP: { type: Number, default: 0 },
    QUOTE: { type: Number, default: 0 },
    OTHER: { type: Number, default: 0 },
    is_delete: { type: Number, default: 0 },
}, { collection: collectionConstant.API_COUNT }, { timestamps: false });

module.exports = invoiceSchema;
