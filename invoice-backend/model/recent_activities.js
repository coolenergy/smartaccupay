var mongoose = require('mongoose');
let collectionConstant = require('../config/collectionConstant');
var Schema = mongoose.Schema;
const castObjectId = mongoose.ObjectId.cast();
mongoose.ObjectId.cast(v => v === '' ? v : castObjectId(v));

var recentActivitychema = new Schema({
    user_id: { type: mongoose.ObjectId, default: "" },
    username: { type: String, default: "" },
    userpicture: { type: String, default: "" },
    data_id: { type: mongoose.ObjectId, default: "" },
    title: { type: String, default: "" },
    module: { type: String, default: "" },
    action: { type: String, default: "" },
    action_from: { type: String, default: "" },

    created_at: { type: Number, default: 0 },
    created_by: { type: mongoose.ObjectId, default: "" },
    updated_at: { type: Number, default: 0 },
    updated_by: { type: mongoose.ObjectId, default: "" },
});

module.exports = recentActivitychema; 