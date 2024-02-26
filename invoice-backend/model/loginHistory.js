var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const castObjectId = mongoose.ObjectId.cast();
mongoose.ObjectId.cast(v => v === '' ? v : castObjectId(v));
var loginHistorySchema = new Schema({
    ip_address: { type: String, default: '' },
    mac_address: { type: String, default: '' },
    uuid: { type: String, default: '' },
    device_type: { type: String, enum: ['Web', 'Mobile'] },
    device_name: { type: String, default: '' },
    os: { type: String, default: '' },
    os_version: { type: String, default: '' },
    browser: { type: String, default: '' },
    browser_version: { type: String, default: '' },
    user_id: { type: mongoose.ObjectId },
    is_login: { type: Boolean, default: true },
    location: { type: String, default: '' },
    location_lat: { type: String, default: 0 },
    location_lng: { type: String, default: 0 },
    companycode: { type: String, default: '' },
    created_date: { type: String },
    created_at: { type: Number },
    logout_at: { type: Number, default: 0 },
    updated_at: { type: Number },
});
module.exports = loginHistorySchema

