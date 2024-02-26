var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var costcodeSchema = new Schema({
    division: { type: String },
    cost_code: { type: String },
    description: { type: String, default: "" },
    value: { type: String },
    is_delete: { type: Number, default: 0 }
});

module.exports = costcodeSchema;