var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var rolesandpermissionsSchema = new Schema({
    role_name: { type: String },
    sequence: { type: Number },
    role_permission: { type: Schema.Types.Mixed, default: null },
    is_delete: { type: Number, default: 0 }
});

module.exports = rolesandpermissionsSchema