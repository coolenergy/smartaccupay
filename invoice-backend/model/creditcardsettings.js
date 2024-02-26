var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var creditcardsettingsSchema = new Schema({
    name: { type: String },
    is_delete: { type: Number, default: 0 },
});

module.exports = creditcardsettingsSchema