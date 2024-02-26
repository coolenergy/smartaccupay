var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var vendorSchema = new Schema({
    data: { type: Array, default: [] },

    vendor_id: { type: mongoose.ObjectId, default: "" },
    history_created_at: { type: Number, default: 0 },
    history_created_by: { type: mongoose.ObjectId, default: "" },
    action: { type: String, enum: ["Insert", "Update", "Archive", "Restore", "Active", "Inactive"] },
    taken_device: { type: String, default: "Web", enum: ["Mobile", "Web", "iFrame"] },
    vendor_data_id: { type: mongoose.ObjectId, default: "" }
});

module.exports = vendorSchema;