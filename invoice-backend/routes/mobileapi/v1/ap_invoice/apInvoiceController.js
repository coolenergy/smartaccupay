var apInvoiceSchema = require('./../../../../model/ap_invoices');
var userSchema = require('./../../../../model/user');
var vendorSchema = require('./../../../../model/vendor');
var termSchema = require('./../../../../model/invoice_term');
var costCodeSchema = require('./../../../../model/invoice_cost_code');
var clientSchema = require('./../../../../model/client');
var classNameSchema = require('./../../../../model/class_name');
var apInvoiceHistorySchema = require('./../../../../model/history/ap_invoice_history');
let db_connection = require('./../../../../controller/common/connectiondb');
let config = require('./../../../../config/config');
let collectionConstant = require('./../../../../config/collectionConstant');
let historyCollectionConstant = require('./../../../../config/historyCollectionConstant');
let common = require('./../../../../controller/common/common');
var ObjectID = require('mongodb').ObjectID;
var _ = require('lodash');
var alertController = require('./../alert/alertController');
var handlebars = require('handlebars');
let sendEmail = require('./../../../../controller/common/sendEmail');
var fs = require('fs');
let rest_Api = require('./../../../../config/db_rest_api');

module.exports.getAPInvoice = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var apInvoiceConnection = connection_db_api.model(collectionConstant.AP_INVOICE, apInvoiceSchema);
            let match = { is_delete: 0 };
            var get_data = await apInvoiceConnection.aggregate([
                { $match: match },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "assign_to",
                        foreignField: "_id",
                        as: "assign_to_data"
                    }
                },
                {
                    $unwind: {
                        path: "$assign_to_data",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_VENDOR,
                        localField: "vendor",
                        foreignField: "_id",
                        as: "vendor_data"
                    }
                },
                {
                    $unwind: {
                        path: "$vendor_data",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_TERM,
                        localField: "terms",
                        foreignField: "_id",
                        as: "terms_data"
                    }
                },
                {
                    $unwind: {
                        path: "$terms_data",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.COSTCODES,
                        localField: "gl_account",
                        foreignField: "_id",
                        as: "gl_account_data"
                    }
                },
                {
                    $unwind: {
                        path: "$gl_account_data",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_CLIENT,
                        localField: "job_client_name",
                        foreignField: "_id",
                        as: "job_client_data"
                    }
                },
                {
                    $unwind: {
                        path: "$job_client_data",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_CLASS_NAME,
                        localField: "class_name",
                        foreignField: "_id",
                        as: "class_name_data"
                    }
                },
                {
                    $unwind: {
                        path: "$class_name_data",
                        preserveNullAndEmptyArrays: true
                    },
                },
                { $sort: { created_at: -1 } },
                {
                    $project: {
                        status: 1,
                        tmpObject: {
                            _id: "$_id",
                            assign_to: "$assign_to",
                            vendor: "$vendor",
                            is_quickbooks: "$is_quickbooks",
                            vendor_id: "$vendor_id",
                            customer_id: "$customer_id",
                            invoice_no: "$invoice_no",
                            po_no: "$po_no",
                            packing_slip_no: "$packing_slip_no",
                            receiving_slip_no: "$receiving_slip_no",
                            invoice_date_epoch: "$invoice_date_epoch",
                            due_date_epoch: "$due_date_epoch",
                            order_date_epoch: "$order_date_epoch",
                            ship_date_epoch: "$ship_date_epoch",
                            terms: "$terms",
                            invoice_total_amount: "$invoice_total_amount",
                            tax_amount: "$tax_amount",
                            tax_id: "$tax_id",
                            sub_total: "$sub_total",
                            amount_due: "$amount_due",
                            gl_account: "$gl_account",
                            receiving_date_epoch: "$receiving_date_epoch",
                            status: "$status",
                            reject_reason: "$reject_reason",
                            job_client_name: "$job_client_name",
                            class_name: "$class_name",
                            delivery_address: "$delivery_address",
                            contract_number: "$contract_number",
                            account_number: "$account_number",
                            discount: "$discount",
                            pdf_url: "$pdf_url",
                            items: "$items",
                            notes: "$notes",

                            invoice_notes: {
                                $filter: {
                                    input: '$invoice_notes',
                                    as: 'note',
                                    cond: { $eq: ['$$note.is_delete', 0] }
                                }
                            },

                            document_type: "$document_type",
                            created_by: "$created_by",
                            created_at: "$created_at",
                            updated_by: "$updated_by",
                            updated_at: "$updated_at",
                            is_delete: "$is_delete",

                            assign_to_data: "$assign_to_data",
                            vendor_data: "$vendor_data",
                            terms_data: "$terms_data",
                            gl_account_data: "$gl_account_data",
                            job_client_data: "$job_client_data",
                            class_name_data: "$class_name_data",
                        }
                    }
                },
                {
                    $group: {
                        _id: "$status",
                        data: { $push: "$tmpObject" },
                    }
                },
            ]);
            if (get_data) {
                let pending, approved = [], rejected = [], late = [], on_hold = [], paid = [], unpaid = [], overdue = [];
                for (let i = 0; i < get_data.length; i++) {
                    if (get_data[i]._id == 'Pending') {
                        pending = get_data[i].data;
                    } else if (get_data[i]._id == 'Approved') {
                        approved = get_data[i].data;
                    } else if (get_data[i]._id == 'Rejected') {
                        rejected = get_data[i].data;
                    } else if (get_data[i]._id == 'Late') {
                        late = get_data[i].data;
                    } else if (get_data[i]._id == 'On Hold') {
                        on_hold = get_data[i].data;
                    } else if (get_data[i]._id == 'Paid') {
                        paid = get_data[i].data;
                    } else if (get_data[i]._id == 'Unpaid') {
                        unpaid = get_data[i].data;
                    } else if (get_data[i]._id == 'Overdue') {
                        overdue = get_data[i].data;
                    }
                }
                res.send({ status: true, message: "Invoice data", pending, approved, rejected, late, on_hold, paid, unpaid, overdue });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

module.exports.getStatusWiseAPInvoice = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var apInvoiceConnection = connection_db_api.model(collectionConstant.AP_INVOICE, apInvoiceSchema);
            let match = { status: requestObject.status, is_delete: 0 };
            var get_data = await apInvoiceConnection.aggregate([
                { $match: match },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "assign_to",
                        foreignField: "_id",
                        as: "assign_to_data"
                    }
                },
                {
                    $unwind: {
                        path: "$assign_to_data",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_VENDOR,
                        localField: "vendor",
                        foreignField: "_id",
                        as: "vendor_data"
                    }
                },
                {
                    $unwind: {
                        path: "$vendor_data",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_TERM,
                        localField: "terms",
                        foreignField: "_id",
                        as: "terms_data"
                    }
                },
                {
                    $unwind: {
                        path: "$terms_data",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.COSTCODES,
                        localField: "gl_account",
                        foreignField: "_id",
                        as: "gl_account_data"
                    }
                },
                {
                    $unwind: {
                        path: "$gl_account_data",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_CLIENT,
                        localField: "job_client_name",
                        foreignField: "_id",
                        as: "job_client_data"
                    }
                },
                {
                    $unwind: {
                        path: "$job_client_data",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_CLASS_NAME,
                        localField: "class_name",
                        foreignField: "_id",
                        as: "class_name_data"
                    }
                },
                {
                    $unwind: {
                        path: "$class_name_data",
                        preserveNullAndEmptyArrays: true
                    },
                },
                { $sort: { created_at: -1 } },
                {
                    $project: {
                        _id: "$_id",
                        assign_to: "$assign_to",
                        vendor: "$vendor",
                        is_quickbooks: "$is_quickbooks",
                        vendor_id: "$vendor_id",
                        customer_id: "$customer_id",
                        invoice_no: "$invoice_no",
                        po_no: "$po_no",
                        packing_slip_no: "$packing_slip_no",
                        receiving_slip_no: "$receiving_slip_no",
                        invoice_date_epoch: "$invoice_date_epoch",
                        due_date_epoch: "$due_date_epoch",
                        order_date_epoch: "$order_date_epoch",
                        ship_date_epoch: "$ship_date_epoch",
                        terms: "$terms",
                        invoice_total_amount: "$invoice_total_amount",
                        tax_amount: "$tax_amount",
                        tax_id: "$tax_id",
                        sub_total: "$sub_total",
                        amount_due: "$amount_due",
                        gl_account: "$gl_account",
                        receiving_date_epoch: "$receiving_date_epoch",
                        status: "$status",
                        reject_reason: "$reject_reason",
                        job_client_name: "$job_client_name",
                        class_name: "$class_name",
                        delivery_address: "$delivery_address",
                        contract_number: "$contract_number",
                        account_number: "$account_number",
                        discount: "$discount",
                        pdf_url: "$pdf_url",
                        items: "$items",
                        notes: "$notes",

                        invoice_notes: {
                            $filter: {
                                input: '$invoice_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },

                        document_type: "$document_type",
                        created_by: "$created_by",
                        created_at: "$created_at",
                        updated_by: "$updated_by",
                        updated_at: "$updated_at",
                        is_delete: "$is_delete",

                        assign_to_data: "$assign_to_data",
                        vendor_data: "$vendor_data",
                        terms_data: "$terms_data",
                        gl_account_data: "$gl_account_data",
                        job_client_data: "$job_client_data",
                        class_name_data: "$class_name_data",
                    }
                },
            ]);
            res.send({ status: true, message: "Invoice data", data: get_data });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

module.exports.getOneAPInvoice = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var apInvoiceConnection = connection_db_api.model(collectionConstant.AP_INVOICE, apInvoiceSchema);
            var userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            var get_data = await apInvoiceConnection.aggregate([
                { $match: { _id: ObjectID(requestObject._id) } },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "assign_to",
                        foreignField: "_id",
                        as: "assign_to_data"
                    }
                },
                {
                    $unwind: {
                        path: "$assign_to_data",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_VENDOR,
                        localField: "vendor",
                        foreignField: "_id",
                        as: "vendor_data"
                    }
                },
                {
                    $unwind: {
                        path: "$vendor_data",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_TERM,
                        localField: "terms",
                        foreignField: "_id",
                        as: "terms_data"
                    }
                },
                {
                    $unwind: {
                        path: "$terms_data",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.COSTCODES,
                        localField: "gl_account",
                        foreignField: "_id",
                        as: "gl_account_data"
                    }
                },
                {
                    $unwind: {
                        path: "$gl_account_data",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_CLIENT,
                        localField: "job_client_name",
                        foreignField: "_id",
                        as: "job_client_data"
                    }
                },
                {
                    $unwind: {
                        path: "$job_client_data",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_CLASS_NAME,
                        localField: "class_name",
                        foreignField: "_id",
                        as: "class_name_data"
                    }
                },
                {
                    $unwind: {
                        path: "$class_name_data",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.AP_PO,
                        localField: "_id",
                        foreignField: "invoice_id",
                        as: "po"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.AP_QUOUTE,
                        localField: "_id",
                        foreignField: "invoice_id",
                        as: "quote"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.AP_PACKING_SLIP,
                        localField: "_id",
                        foreignField: "invoice_id",
                        as: "packing_slip"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.AP_RECEIVING_SLIP,
                        localField: "_id",
                        foreignField: "invoice_id",
                        as: "receiving_slip"
                    }
                },
                {
                    $project: {
                        assign_to: 1,
                        assign_to_data: "$assign_to_data",
                        vendor: 1,
                        vendor_data: "$vendor_data",
                        is_quickbooks: 1,
                        vendor_id: 1,
                        customer_id: 1,
                        invoice_no: 1,
                        po_no: 1,
                        packing_slip_no: 1,
                        receiving_slip_no: 1,
                        invoice_date_epoch: 1,
                        due_date_epoch: 1,
                        order_date_epoch: 1,
                        ship_date_epoch: 1,
                        terms: 1,
                        terms_data: "$terms_data",
                        invoice_total_amount: 1,
                        tax_amount: 1,
                        tax_id: 1,
                        sub_total: 1,
                        amount_due: 1,
                        gl_account: 1,
                        gl_account_data: "$gl_account_data",
                        receiving_date_epoch: 1,
                        status: 1,
                        reject_reason: 1,
                        job_client_name: 1,
                        job_client_data: "$job_client_data",
                        class_name: 1,
                        class_name_data: "$class_name_data",
                        delivery_address: 1,
                        contract_number: 1,
                        account_number: 1,
                        discount: 1,
                        pdf_url: 1,
                        items: 1,

                        invoice_notes: {
                            $filter: {
                                input: '$invoice_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },

                        document_type: 1,
                        created_by: 1,
                        created_at: 1,
                        updated_by: 1,
                        updated_at: 1,
                        is_delete: 1,

                        notes: 1,
                        supporting_documents: { $concatArrays: ["$po", "$quote", "$packing_slip", "$receiving_slip"] }
                    }
                }
            ]);
            if (get_data) {
                if (get_data.length > 0) {
                    get_data = get_data[0];
                }
                if (get_data) {
                    get_data.invoice_notes = await getNotesUserDetails(get_data.invoice_notes, userConnection);
                    get_data.supporting_documents = _.orderBy(get_data.supporting_documents, ['created_at'], ['desc']);
                }
                res.send({ status: true, message: "Invoice Listing", data: get_data });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

function getNotesUserDetails(notes, userConnection) {
    return new Promise(async function (resolve, reject) {
        if (notes) {
            if (notes.length == 0) {
                resolve([]);
            } else {
                let tempData = [];
                for (let i = 0; i < notes.length; i++) {
                    var one_user = await userConnection.findOne({ _id: ObjectID(notes[i].created_by) });
                    tempData.push({
                        ...notes[i],
                        userfullname: one_user.userfullname,
                        usermobile_picture: one_user.usermobile_picture,
                        userpicture: one_user.userpicture,
                    });
                    if (i == notes.length - 1) {
                        resolve(tempData);
                    }
                }
            }
        } else {
            resolve([]);
        }
    });
}

module.exports.saveAPInvoice = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    var local_offset = Number(req.headers.local_offset);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var apInvoiceConnection = connection_db_api.model(collectionConstant.AP_INVOICE, apInvoiceSchema);
            var userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            var vendorConnection = connection_db_api.model(collectionConstant.INVOICE_VENDOR, vendorSchema);
            var termConnection = connection_db_api.model(collectionConstant.INVOICE_TERM, termSchema);
            var costCodeConnection = connection_db_api.model(collectionConstant.COSTCODES, costCodeSchema);
            var jobClientConnection = connection_db_api.model(collectionConstant.INVOICE_CLIENT, clientSchema);
            var classNameConnection = connection_db_api.model(collectionConstant.INVOICE_CLASS_NAME, classNameSchema);
            var id = requestObject._id;
            delete requestObject._id;
            if (id) {
                let newReqObj = { ...requestObject };
                newReqObj.updated_at = Math.round(new Date().getTime() / 1000);
                newReqObj.updated_by = decodedToken.UserData._id;
                let findKeys = {};
                findKeys['_id'] = 0;
                for (const property in requestObject) {
                    findKeys[property] = 1;
                }
                var get_data = await apInvoiceConnection.findOne({ _id: ObjectID(id) }, findKeys);
                if (newReqObj.status) {
                    if (newReqObj.status != 'Rejected') {
                        newReqObj.reject_reason = '';
                    }
                }
                let update_ap_invoice = await apInvoiceConnection.updateOne({ _id: ObjectID(id) }, newReqObj);
                if (update_ap_invoice) {
                    delete requestObject.updated_by;
                    delete requestObject.updated_at;
                    delete requestObject.created_by;
                    delete requestObject.created_at;
                    delete requestObject.is_delete;

                    if (requestObject.assign_to !== undefined && requestObject.assign_to !== null && requestObject.assign_to !== '') {
                        requestObject.assign_to = ObjectID(requestObject.assign_to);
                    }
                    if (requestObject.vendor !== undefined && requestObject.vendor !== null && requestObject.vendor !== '') {
                        requestObject.vendor = ObjectID(requestObject.vendor);
                    }
                    if (requestObject.terms !== undefined && requestObject.terms !== null && requestObject.terms !== '') {
                        requestObject.terms = ObjectID(requestObject.terms);
                    }
                    if (requestObject.gl_account !== undefined && requestObject.gl_account !== null && requestObject.gl_account !== '') {
                        requestObject.gl_account = ObjectID(requestObject.gl_account);
                    }
                    if (requestObject.job_client_name !== undefined && requestObject.job_client_name !== null && requestObject.job_client_name !== '') {
                        requestObject.job_client_name = ObjectID(requestObject.job_client_name);
                    }
                    if (requestObject.class_name !== undefined && requestObject.class_name !== null && requestObject.class_name !== '') {
                        requestObject.class_name = ObjectID(requestObject.class_name);
                    }
                    // Find change data
                    let updatedData = await common.findUpdatedFieldHistory(requestObject, get_data._doc);

                    // Find and change value of objectid
                    if (requestObject.assign_to !== undefined && requestObject.assign_to !== null && requestObject.assign_to !== '') {
                        let found_assign_to = _.findIndex(updatedData, function (tmp_data) { return tmp_data.key == 'assign_to'; });
                        if (found_assign_to != -1) {
                            let one_data = await userConnection.findOne({ _id: ObjectID(updatedData[found_assign_to].value) });
                            updatedData[found_assign_to].value = one_data.userfullname;
                            sendInvoiceAssignUpdateAlerts(decodedToken, id, translator);
                        }
                    }

                    if (requestObject.vendor !== undefined && requestObject.vendor !== null && requestObject.vendor !== '') {
                        let found_vendor = _.findIndex(updatedData, function (tmp_data) { return tmp_data.key == 'vendor'; });
                        if (found_vendor != -1) {
                            let one_data = await vendorConnection.findOne({ _id: ObjectID(updatedData[found_vendor].value) });
                            updatedData[found_vendor].value = one_data.vendor_name;
                        }
                    }

                    if (requestObject.terms !== undefined && requestObject.terms !== null && requestObject.terms !== '') {
                        let found_terms = _.findIndex(updatedData, function (tmp_data) { return tmp_data.key == 'terms'; });
                        if (found_terms != -1) {
                            let one_data = await termConnection.findOne({ _id: ObjectID(updatedData[found_terms].value) });
                            updatedData[found_terms].value = one_data.name;
                        }
                    }

                    if (requestObject.gl_account !== undefined && requestObject.gl_account !== null && requestObject.gl_account !== '') {
                        let found_gl_account = _.findIndex(updatedData, function (tmp_data) { return tmp_data.key == 'gl_account'; });
                        if (found_gl_account != -1) {
                            let one_data = await costCodeConnection.findOne({ _id: ObjectID(updatedData[found_gl_account].value) });
                            updatedData[found_gl_account].value = one_data.cost_code;
                        }
                    }

                    if (requestObject.job_client_name !== undefined && requestObject.job_client_name !== null && requestObject.job_client_name !== '') {
                        let found_job_client_name = _.findIndex(updatedData, function (tmp_data) { return tmp_data.key == 'job_client_name'; });
                        if (found_job_client_name != -1) {
                            let one_data = await jobClientConnection.findOne({ _id: ObjectID(updatedData[found_job_client_name].value) });
                            updatedData[found_job_client_name].value = one_data.client_name;
                        }
                    }

                    if (requestObject.class_name !== undefined && requestObject.class_name !== null && requestObject.class_name !== '') {
                        let found_class_name = _.findIndex(updatedData, function (tmp_data) { return tmp_data.key == 'class_name'; });
                        if (found_class_name != -1) {
                            let one_data = await classNameConnection.findOne({ _id: ObjectID(updatedData[found_class_name].value) });
                            updatedData[found_class_name].value = one_data.name;
                        }
                    }

                    // Find and change value of epoch                    
                    let found_invoice_date_epoch = _.findIndex(updatedData, function (tmp_data) { return tmp_data.key == 'invoice_date_epoch'; });
                    if (found_invoice_date_epoch != -1) {
                        updatedData[found_invoice_date_epoch].value = common.MMDDYYYY_local_offset(updatedData[found_invoice_date_epoch].value, 'en', local_offset);
                    }

                    let found_due_date_epoch = _.findIndex(updatedData, function (tmp_data) { return tmp_data.key == 'due_date_epoch'; });
                    if (found_due_date_epoch != -1) {
                        updatedData[found_due_date_epoch].value = common.MMDDYYYY_local_offset(updatedData[found_due_date_epoch].value, 'en', local_offset);
                    }

                    let found_order_date_epoch = _.findIndex(updatedData, function (tmp_data) { return tmp_data.key == 'order_date_epoch'; });
                    if (found_order_date_epoch != -1) {
                        updatedData[found_order_date_epoch].value = common.MMDDYYYY_local_offset(updatedData[found_order_date_epoch].value, 'en', local_offset);
                    }

                    let found_ship_date_epoch = _.findIndex(updatedData, function (tmp_data) { return tmp_data.key == 'ship_date_epoch'; });
                    if (found_ship_date_epoch != -1) {
                        updatedData[found_ship_date_epoch].value = common.MMDDYYYY_local_offset(updatedData[found_ship_date_epoch].value, 'en', local_offset);
                    }

                    let found_receiving_date_epoch = _.findIndex(updatedData, function (tmp_data) { return tmp_data.key == 'receiving_date_epoch'; });
                    if (found_receiving_date_epoch != -1) {
                        updatedData[found_receiving_date_epoch].value = common.MMDDYYYY_local_offset(updatedData[found_receiving_date_epoch].value, 'en', local_offset);
                    }
                    for (let i = 0; i < updatedData.length; i++) {
                        updatedData[i]['key'] = translator.getStr(`Invoice_History.${updatedData[i]['key']}`);
                    }
                    let histioryObject = {
                        data: updatedData,
                        invoice_id: id,
                    };
                    addInvoiceHistory("Update", histioryObject, decodedToken);
                    res.send({ status: true, message: "Invoice updated successfully.", data: update_ap_invoice });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                requestObject.created_at = Math.round(new Date().getTime() / 1000);
                requestObject.created_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_by = decodedToken.UserData._id;
                let add_ap_invoice = new apInvoiceConnection(requestObject);
                let save_ap_invoice = await add_ap_invoice.save();
                if (save_ap_invoice) {
                    res.send({ status: true, message: "Invoice added successfully.", data: save_ap_invoice });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

function sendInvoiceAssignUpdateAlerts(decodedToken, id, translator) {
    return new Promise(async function (resolve, reject) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        var apInvoiceConnection = connection_db_api.model(collectionConstant.AP_INVOICE, apInvoiceSchema);
        // let settingsCollection = connection_db_api.model(collectionConstant.INVOICE_SETTING, settingsSchema);
        let userCollection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
        let one_invoice = await apInvoiceConnection.findOne({ _id: ObjectID(id) });
        if (one_invoice) {
            if (one_invoice.assign_to) {
                // let get_settings = await settingsCollection.findOne({});
                // if (get_settings) {
                //     if (get_settings.settings.User_Notify_By.setting_status == 'Active') {
                // var notifyOptions = get_settings.settings.User_Notify_By.setting_value;
                var allowEmail = true;
                var allowAlert = true;
                var allowNotification = true;
                /* var allowEmail = (notifyOptions.indexOf('Email') !== -1) ? true : false;
                var allowAlert = (notifyOptions.indexOf('Alert') !== -1) ? true : false;
                var allowNotification = (notifyOptions.indexOf('Notification') !== -1) ? true : false; */

                let get_users = await userCollection.findOne({ _id: ObjectID(one_invoice.assign_to) });
                let title = `Invoice #${one_invoice.invoice_no} Assigned Alert`;
                let description = `Invoice #${one_invoice.invoice_no} has been assigned to you.`;
                let viewRoute = `${config.SITE_URL}/invoice/details?_id=${id}`;

                // Notification
                if (allowNotification) {
                    let notification_data = {
                        title: title,
                        body: description,
                    };
                    let temp_data = {
                        "module": 'Invoice',
                        "_id": one_invoice._id,
                        "status": one_invoice.status,
                    };
                    await common.sendNotificationWithData([get_users.invoice_firebase_token], notification_data, temp_data);
                }

                // Alert
                if (allowAlert) {
                    let alertObject = {
                        user_id: get_users._id,
                        module_name: 'Invoice',
                        module_route: { _id: id },
                        notification_title: title,
                        notification_description: description,
                    };
                    alertController.saveAlert(alertObject, connection_db_api);
                }

                // Email
                if (allowEmail) {
                    var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
                    let talnate_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_TENANTS, { companycode: decodedToken.companycode });
                    let company_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: decodedToken.companycode });
                    const file_data = fs.readFileSync(config.EMAIL_TEMPLATE_PATH + '/controller/emailtemplates/commonEmailTemplate.html', 'utf8');
                    let emailTmp = {
                        HELP: `${translator.getStr('EmailTemplateHelpEmailAt')} ${config.HELPEMAIL} ${translator.getStr('EmailTemplateCallSupportAt')} ${config.NUMBERPHONE}`,
                        SUPPORT: `${translator.getStr('EmailTemplateEmail')} ${config.SUPPORTEMAIL} l ${translator.getStr('EmailTemplatePhone')} ${config.NUMBERPHONE2}`,
                        ALL_RIGHTS_RESERVED: `${translator.getStr('EmailTemplateAllRightsReserved')}`,
                        THANKS: translator.getStr('EmailTemplateThanks'),
                        ROVUK_TEAM: translator.getStr('EmailTemplateRovukTeam'),
                        COPYRIGHTNAME: `${config.COPYRIGHTNAME}`,
                        ROVUK_TEAM_SEC: translator.getStr('EmailTemplateRovukTeamSec'),
                        VIEW_EXCEL: translator.getStr('EmailTemplateViewExcelReport'),

                        TITLE: `${title}`,
                        TEXT: new handlebars.SafeString(`<h4>Hello ${get_users.userfullname},</h4><h4>${description}</h4>
                                <div style="text-align: center;">
                                    <a style="background-color: #023E8A;border: #0077bc solid;color: white;padding: 15px 32px;
                                                text-align: center;text-decoration: none;display: inline-block;font-size: 16px; width: 20%;" 
                                                target="_blank" href="${viewRoute}">View Invoice</a>
                                </div>`),

                        COMPANYNAME: `${translator.getStr('EmailCompanyName')} ${company_data.companyname}`,
                        COMPANYCODE: `${translator.getStr('EmailCompanyCode')} ${company_data.companycode}`,
                    };
                    var template = handlebars.compile(file_data);
                    var HtmlData = await template(emailTmp);
                    sendEmail.sendEmail_client(talnate_data.smartaccupay_tenants.tenant_smtp_username, [get_users.useremail], title, HtmlData,
                        talnate_data.smartaccupay_tenants.tenant_smtp_server, talnate_data.smartaccupay_tenants.tenant_smtp_port, talnate_data.smartaccupay_tenants.tenant_smtp_reply_to_mail,
                        talnate_data.smartaccupay_tenants.tenant_smtp_password, talnate_data.smartaccupay_tenants.tenant_smtp_timeout, talnate_data.smartaccupay_tenants.tenant_smtp_security);
                }
                resolve();
            } else {
                resolve();
            }
            // } else {
            //     resolve();
            // }
            // } else {
            //     resolve();
            // }
        } else {
            resolve();
        }
    });
};

module.exports.deleteAPInvoice = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var id = requestObject._id;
            delete requestObject._id;
            var apInvoiceConnection = connection_db_api.model(collectionConstant.AP_INVOICE, apInvoiceSchema);
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            var update_data = await apInvoiceConnection.updateOne({ _id: ObjectID(id) }, requestObject);
            let isDelete = update_data.nModified;
            if (isDelete == 0) {
                res.send({ status: false, message: "There is no data with this id." });
            } else {
                let histioryObject = {
                    data: [],
                    invoice_id: id,
                };
                if (requestObject.is_delete == 0) {
                    addInvoiceHistory("Restore", histioryObject, decodedToken);
                    res.send({ message: "Invoice restored successfully.", status: true });
                } else {
                    addInvoiceHistory("Archive", histioryObject, decodedToken);
                    res.send({ message: "Invoice archived successfully.", status: true });
                }
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    }
    else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

// Save Invoice Notes
module.exports.saveAPInvoiceNote = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var apInvoiceConnection = connection_db_api.model(collectionConstant.AP_INVOICE, apInvoiceSchema);
            var invoice_id = requestObject.invoice_id;
            delete requestObject.invoice_id;
            var id = requestObject._id;
            delete requestObject._id;
            if (id) {
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let update_ap_invoice = await apInvoiceConnection.updateOne({ _id: ObjectID(invoice_id), "invoice_notes._id": id }, { $set: { "invoice_notes.$.updated_by": decodedToken.UserData._id, "invoice_notes.$.updated_at": Math.round(new Date().getTime() / 1000), "invoice_notes.$.notes": requestObject.notes } });
                if (update_ap_invoice) {
                    let histioryObject = {
                        data: [
                            {
                                key: translator.getStr('Invoice_History.notes'),
                                value: requestObject.notes,
                            }
                        ],
                        invoice_id: invoice_id,
                    };
                    addInvoiceHistory("Update Note", histioryObject, decodedToken);
                    res.send({ status: true, message: "Invoice note updated successfully.", data: update_ap_invoice });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                //save invoice note
                requestObject.created_by = decodedToken.UserData._id;
                requestObject.created_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let save_ap_invoice_note = await apInvoiceConnection.updateOne({ _id: ObjectID(invoice_id) }, { $push: { invoice_notes: requestObject } });
                if (save_ap_invoice_note) {
                    let histioryObject = {
                        data: [
                            {
                                key: translator.getStr('Invoice_History.notes'),
                                value: requestObject.notes,
                            }
                        ],
                        invoice_id: invoice_id,
                    };
                    addInvoiceHistory("Insert Note", histioryObject, decodedToken);
                    res.send({ status: true, message: "Invoice note saved successfully." });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

// Delete Invoice Notes
module.exports.deleteAPInvoiceNote = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var apInvoiceConnection = connection_db_api.model(collectionConstant.AP_INVOICE, apInvoiceSchema);
            var invoice_id = requestObject.invoice_id;
            delete requestObject.invoice_id;
            var id = requestObject._id;
            delete requestObject._id;
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            let update_ap_invoice = await apInvoiceConnection.updateOne({ _id: ObjectID(invoice_id), "invoice_notes._id": id }, { $set: { "invoice_notes.$.updated_by": decodedToken.UserData._id, "invoice_notes.$.updated_at": Math.round(new Date().getTime() / 1000), "invoice_notes.$.is_delete": 1 } });
            if (update_ap_invoice) {
                let histioryObject = {
                    data: [
                        {
                            key: translator.getStr('Invoice_History.notes'),
                            value: requestObject.notes,
                        }
                    ],
                    invoice_id: invoice_id,
                };
                addInvoiceHistory("Delete Note", histioryObject, decodedToken);
                res.send({ status: true, message: "Invoice note deleted successfully.", data: update_ap_invoice });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

async function addInvoiceHistory(action, data, decodedToken) {
    var connection_db_api = await db_connection.connection_db_api(decodedToken);
    try {
        var apInvoiceHistoryConnection = connection_db_api.model(historyCollectionConstant.AP_INVOICE_HISTORY, apInvoiceHistorySchema);
        data.action = action;
        data.taken_device = config.WEB_ALL;
        data.history_created_at = Math.round(new Date().getTime() / 1000);
        data.history_created_by = decodedToken.UserData._id;
        var add_invoice_history = new apInvoiceHistoryConnection(data);
        var save_invoice_history = await add_invoice_history.save();
    } catch (e) {
        console.log(e);
    } finally {
        // connection_db_api.close();
    }
}

module.exports.getAPInvoiceHistory = async function (req, res) {
    var translator = new common.Language('en');
    var decodedToken = common.decodedJWT(req.headers.authorization);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let perpage = 10;
            if (requestObject.start) { } else {
                requestObject.start = 0;
            }
            let start = requestObject.start == 0 ? 0 : perpage * requestObject.start;
            var apInvoiceHistoryConnection = connection_db_api.model(historyCollectionConstant.AP_INVOICE_HISTORY, apInvoiceHistorySchema);
            let get_data = await apInvoiceHistoryConnection.aggregate([
                { $match: { invoice_id: ObjectID(requestObject._id) } },
                {
                    $lookup: {
                        from: collectionConstant.AP_INVOICE,
                        localField: "invoice_id",
                        foreignField: "_id",
                        as: "invoice"
                    }
                },
                { $unwind: "$invoice" },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "history_created_by",
                        foreignField: "_id",
                        as: "history_created_by"
                    }
                },
                { $unwind: "$history_created_by" },
                { $sort: { history_created_at: -1 } },
                { $limit: perpage + start },
                { $skip: start }
            ]);
            res.send({ data: get_data, status: true });
        } catch (e) {
            console.log("e", e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
}; 