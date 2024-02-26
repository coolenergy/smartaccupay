var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var templateSchema = new Schema({
    template_name: { type: String, default: "" },
    note: { type: String, default: "" },
    status: { type: String, default: "Draft", enum: ["Draft", "active", "Inactive"] },
    company_name: { type: String, default: "" },
    company_address: { type: String, default: "" },
    bill_to: { type: String, default: "" },
    ship_to: { type: String, default: "" },
    invoice: { type: String, default: "" },
    due_date: { type: Number, default: 0 },
    description: { type: String, default: "" },
    p_o: { type: String, default: "" },
    gl_account: { type: String, default: "" },
    amount: { type: Number, default: 0 },
    sub_total: { type: Number, default: 0 },
    total: { type: Number, default: 0 },


    created_by: { type: mongoose.ObjectId, default: "" },
    created_at: { type: Number, default: 0 },
    updated_by: { type: mongoose.ObjectId, default: "" },
    updated_at: { type: Number, default: 0 },
    is_delete: { type: Number, default: 0 },

    history_created_at: { type: Number, default: 0 },
    history_created_by: { type: mongoose.ObjectId, default: "" },
    action: { type: String, enum: ["Insert", "Update", "Archive", "Restore"] },
    taken_device: { type: String, default: "Web", enum: ["Mobile", "Web"] },
    template_data_id: { type: mongoose.ObjectId, default: "" }

});

module.exports = templateSchema;