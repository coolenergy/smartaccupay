var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var job_nameSchema = new Schema({
    name: { type: String, default: "" },
    email_contact: { type: String, default: "" },
    is_delete: { type: Number, default: 0 }
});

module.exports = job_nameSchema;