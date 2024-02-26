var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var jobtitleSchema = new Schema({
    job_title_name: { type: String },
    is_delete: { type: Number, default: 0 },
    created_at: { type: Number },
    updated_at: { type: Number },
});

module.exports = jobtitleSchema;