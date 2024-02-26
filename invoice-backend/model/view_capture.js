const { create } = require('lodash');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const castObjectId = mongoose.ObjectId.cast();
mongoose.ObjectId.cast(v => v === '' ? v : castObjectId(v));

var view_capture = new Schema({

    performby_id: { type: mongoose.ObjectId, default: "" },
    create_date: { type: Number, default: 0 },
    update_date: { type: Number, default: 0 },
    module: { type: String, default: "" },
    data_name: { type: String, default: "" },
    extra: { type: Array, default: [] },
    for: { type: String, default: "" },
    action: { type: String, default: "" },
    text: { type: String, default: "" },
    reason: { type: String, default: "" }
}, { timestamps: false });

module.exports = view_capture;