var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var settingSchema = new Schema({
    settings: { type: Schema.Types.Mixed },
});

module.exports = settingSchema;