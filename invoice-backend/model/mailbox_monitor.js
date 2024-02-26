var mongoose = require('mongoose');
const config = require('../config/config');
var Schema = mongoose.Schema;
const castObjectId = mongoose.ObjectId.cast();
mongoose.ObjectId.cast(v => v === '' ? v : castObjectId(v));

var mailboxMonitorSchema = new Schema({
    email: { type: String, default: '' },
    password: { type: String, default: '' },
    imap: { type: String, default: '' },
    port: { type: Number, default: 0 },
    time: { type: String, default: '' },
    cron_time: { type: String, default: '' },
    created_at: { type: Number, default: 0 },
    created_by: { type: mongoose.ObjectId, default: '' },
    updated_at: { type: Number, default: 0 },
    updated_by: { type: mongoose.ObjectId, default: '' },
    is_delete: { type: Number, default: 0 },
});

module.exports = mailboxMonitorSchema; 