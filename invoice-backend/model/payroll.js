var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var payrollSchema = new Schema({
    start_date: { type: Number },
    end_date: { type: Number },
    amount_paid: { type: Number, default: 0 },
    total_rth: { type: Number, default: 0 },
    total_oth: { type: Number, default: 0 },
    total_dth: { type: Number, default: 0 },
    total_hours: { type: Number, default: 0 },
    noofemployee: { type: Number, default: 0 },
    created_by : { type: mongoose.ObjectId },
    created_at: { type: Number },
    timecard_ids : {type: [mongoose.ObjectId],default:[]},
    project_ids : {type: [mongoose.ObjectId],default:[]},
    users_ids:{type: [mongoose.ObjectId],default:[]},
    user_payroll_rules: { type: Number },
    created_at : { type: Number },
}, { timestamps: false });

module.exports = payrollSchema