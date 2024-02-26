var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var costCodeSchema = new Schema({
    cost_code: { type: String },
    division: { type: String },
    module: { type: String, enum: ["Invoice"], default: "Invoice" },
    description: { type: String, default: "" },
    value: { type: String },
    is_quickbooks: { type: Boolean, default: false },
    cost_code_created_at: { type: Number },
    cost_code_created_by: { type: mongoose.ObjectId },
    cost_code_updated_at: { type: Number },
    cost_code_updated_by: { type: mongoose.ObjectId },
    is_delete: { type: Number, default: 0 },
}, { timestamps: false });

module.exports = costCodeSchema;
