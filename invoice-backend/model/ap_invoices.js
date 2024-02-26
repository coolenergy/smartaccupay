var mongoose = require('mongoose');

var notesSchema = new mongoose.Schema({
    notes: { type: String, default: "" },
    created_at: { type: Number },
    created_by: { type: mongoose.ObjectId },
    updated_at: { type: Number },
    updated_by: { type: mongoose.ObjectId },
    is_delete: { type: Number, default: 0 },
});

var infoSchema = new mongoose.Schema({
    amount: { type: Number, default: 0 },
    job_client_name: { type: mongoose.ObjectId, default: "" },
    class_name: { type: mongoose.ObjectId, default: "" },
    cost_code_gl_account: { type: mongoose.ObjectId, default: "" },
    assign_to: { type: mongoose.ObjectId, default: "" },
    notes: { type: String, default: "" },
    created_by: { type: mongoose.ObjectId },
    created_at: { type: Number },
    created_by: { type: mongoose.ObjectId },
    updated_at: { type: Number },
    updated_by: { type: mongoose.ObjectId },
    is_delete: { type: Number, default: 0 },
});

var invoiceSchema = new mongoose.Schema({
    assign_to: { type: mongoose.ObjectId, default: "" }, //user collection - All By default empty like rillion
    vendor: { type: mongoose.ObjectId, default: "" }, // vendor collection
    // vendor_name: { type: String, default: "" }, // Vendor collection
    is_quickbooks: { type: Boolean, default: false }, // This is for future for Quickbooks sync
    vendor_id: { type: String, default: "" }, // vendor collection
    customer_id: { type: String, default: "" }, // vendor collection
    invoice_no: { type: String, default: "" },
    po_no: { type: String, default: "" },
    packing_slip_no: { type: String, default: "" },
    receiving_slip_no: { type: String, default: "" },
    invoice_date_epoch: { type: Number, default: 0 }, // Epoch 
    due_date_epoch: { type: Number, default: 0 },
    order_date_epoch: { type: Number, default: 0 },
    ship_date_epoch: { type: Number, default: 0 },
    terms: { type: mongoose.ObjectId, default: "" }, // Vendor terms OR coming from Terms Setting master
    invoice_total_amount: { type: Number, default: 0 },
    tax_amount: { type: Number, default: 0 },
    tax_id: { type: String, default: "" },
    sub_total: { type: Number, default: 0 },
    amount_due: { type: Number, default: 0 },
    gl_account: { type: mongoose.ObjectId, default: "" }, // Coming from settings costcode/glaccount table  - Job #
    receiving_date_epoch: { type: Number, default: 0 },
    status: { type: String, default: "Pending", enum: ['Pending', 'Approved', 'Rejected', 'On Hold', 'Late', 'Paid', 'Unpaid', 'Overdue'] },
    reject_reason: { type: String, default: "" },
    job_client_name: { type: mongoose.ObjectId, default: "" }, // Coming from job client name Side menu - collection name is
    class_name: { type: mongoose.ObjectId, default: "" }, // Coming from class name settings
    delivery_address: { type: String, default: "" },
    contract_number: { type: String, default: "" },
    account_number: { type: String, default: "" },
    discount: { type: String, default: "" },
    pdf_url: { type: String, default: "" }, // Wasabi s3 bucket invoice document url
    items: { type: Array, default: [] }, // This will be the list of items inside the invoice document
    notes: { type: String, default: "" },

    invoice_notes: { type: [notesSchema], default: [] },
    invoice_info: { type: [infoSchema], default: [] },

    document_type: { type: String, default: "INVOICE" }, // Fixed Invoice document type
    created_by: { type: mongoose.ObjectId, default: "" },  // User collection
    created_at: { type: Number, default: 0 }, // Epoch Date - When action taken
    updated_by: { type: mongoose.ObjectId, default: "" },  // User collection
    updated_at: { type: Number, default: 0 }, // Epoch Data - When action taken
    is_delete: { type: Number, default: 0 }, // 0 - for not archive, 1 - for archive
});

module.exports = invoiceSchema;
