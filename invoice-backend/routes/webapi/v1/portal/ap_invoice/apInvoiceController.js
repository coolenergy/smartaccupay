var apInvoiceSchema = require('./../../../../../model/ap_invoices');
var userSchema = require('./../../../../../model/user');
var vendorSchema = require('./../../../../../model/vendor');
var termSchema = require('./../../../../../model/invoice_term');
var costCodeSchema = require('./../../../../../model/invoice_cost_code');
var clientSchema = require('./../../../../../model/client');
var classNameSchema = require('./../../../../../model/class_name');
var companySchema = require('./../../../../../model/company');
var tenantSchema = require('./../../../../../model/tenants');
var apOtherDocumentSchema = require('./../../../../../model/ap_other_documents');
var settingsSchema = require('./../../../../../model/settings');
var invoiceRoleSchema = require('./../../../../../model/invoice_roles');
var userSchema = require('./../../../../../model/user');
var apInvoiceHistorySchema = require('./../../../../../model/history/ap_invoice_history');
let db_connection = require('./../../../../../controller/common/connectiondb');
let config = require('./../../../../../config/config');
let collectionConstant = require('./../../../../../config/collectionConstant');
let historyCollectionConstant = require('./../../../../../config/historyCollectionConstant');
let common = require('./../../../../../controller/common/common');
var ObjectID = require('mongodb').ObjectID;
var formidable = require('formidable');
const reader = require('xlsx');
var _ = require('lodash');
var alertController = require('./../alert/alertController');
var handlebars = require('handlebars');
let sendEmail = require('./../../../../../controller/common/sendEmail');
var fs = require('fs');
let rest_Api = require('./../../../../../config/db_rest_api');
var costcodeSchema = require('../../../../../model/costcode');

module.exports.getAPInvoiceForTable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var apInvoiceConnection = connection_db_api.model(collectionConstant.AP_INVOICE, apInvoiceSchema);
            let start = parseInt(requestObject.start);
            var perpage = parseInt(requestObject.length);

            var columnName = (requestObject.sort != undefined && requestObject.sort != '') ? requestObject.sort.field : '';
            var columnOrder = (requestObject.sort != undefined && requestObject.sort != '') ? requestObject.sort.order : '';
            var sort = {};
            sort[columnName] = (columnOrder == 'asc') ? 1 : -1;

            let match = { is_delete: requestObject.is_delete };
            if (requestObject.type != '' && requestObject.type != undefined && requestObject.type != null) {
                match = {
                    is_delete: requestObject.is_delete,
                    status: requestObject.type,
                };
            }
            var query = {
                $or: [
                    { "vendor_name": new RegExp(requestObject.search, 'i') },
                    { "invoice_no": new RegExp(requestObject.search, 'i') },
                    { "invoice_total_amount": new RegExp(requestObject.search, 'i') },
                    { "sub_total": new RegExp(requestObject.search, 'i') },
                    { "userfullname": new RegExp(requestObject.search, 'i') },
                    { "status": new RegExp(requestObject.search, 'i') },
                ]
            };

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
                {
                    $project: {
                        assign_to: 1,
                        vendor: 1,
                        // vendor_name:1, 
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
                        invoice_total_amount: 1,
                        tax_amount: 1,
                        tax_id: 1,
                        sub_total: 1,
                        amount_due: 1,
                        gl_account: 1,
                        receiving_date_epoch: 1,
                        status: 1,
                        reject_reason: 1,
                        job_client_name: 1,
                        class_name: 1,
                        delivery_address: 1,
                        contract_number: 1,
                        account_number: 1,
                        discount: 1,
                        pdf_url: 1,
                        items: 1,
                        notes: 1,
                        invoice_notes: 1,
                        invoice_info: 1,
                        document_type: 1,
                        created_by: 1,
                        created_at: 1,
                        updated_by: 1,
                        updated_at: 1,
                        is_delete: 1,

                        assign_to_data: "$assign_to_data",
                        vendor_data: "$vendor_data",
                        terms_data: "$terms_data",
                        gl_account_data: "$gl_account_data",
                        job_client_data: "$job_client_data",
                        class_name_data: "$class_name_data",
                        vendor_name: "$vendor_data.vendor_name",
                        // userfullname: { $ifNull: [{ $arrayElemAt: ["$assign_to_data.userfullname", 0] }, ""] },
                        userfullname: "$assign_to_data.userfullname",
                    }
                },
                { $sort: sort },
                { $match: query },
                { $limit: perpage + start },
                { $skip: start },
            ]);
            let total_count = await apInvoiceConnection.find(match).countDocuments();
            let pager = {
                start: start,
                length: perpage,
                total: total_count
            };
            res.send({ status: true, data: get_data, pager });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false, error: e });
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
                        let: { id: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$invoice_id", "$$id"] },
                                            { $eq: ["$is_delete", 0] }
                                        ]
                                    }
                                },
                            },
                        ],
                        as: "po"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.AP_QUOUTE,
                        let: { id: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$invoice_id", "$$id"] },
                                            { $eq: ["$is_delete", 0] }
                                        ]
                                    }
                                },
                            },
                        ],
                        as: "quote"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.AP_PACKING_SLIP,
                        let: { id: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$invoice_id", "$$id"] },
                                            { $eq: ["$is_delete", 0] }
                                        ]
                                    }
                                },
                            },
                        ],
                        as: "packing_slip"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.AP_RECEIVING_SLIP,
                        let: { id: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$invoice_id", "$$id"] },
                                            { $eq: ["$is_delete", 0] }
                                        ]
                                    }
                                },
                            },
                        ],
                        as: "receiving_slip"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_MESSAGE,
                        let: { id: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$invoice_id", "$$id"] },
                                            { $eq: ["$is_first", true] }
                                        ]
                                    }
                                },
                            },
                        ],
                        as: "invoice_messages"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.AP_INVOICE,
                        let: { id: "$_id", vendor: "$vendor" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $ne: ["$_id", "$$id"] },
                                            { $eq: ["$vendor", "$$vendor"] },
                                            { $eq: ["$is_delete", 0] },
                                            { $ne: [{ $size: "$invoice_info" }, 0] },
                                        ]
                                    }
                                },
                            },
                            {
                                $project: {
                                    invoice_date_epoch: 1,
                                    invoice_info: 1,
                                }
                            },
                            { $sort: { 'invoice_info.invoice_date_epoch': -1 } },
                            { $limit: 3 },
                        ],
                        as: "accounting_info"
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
                        supporting_documents: { $concatArrays: ["$po", "$quote", "$packing_slip", "$receiving_slip"] },

                        invoice_info: {
                            $filter: {
                                input: '$invoice_info',
                                as: 'info',
                                cond: { $eq: ['$$info.is_delete', 0] }
                            }
                        },

                        invoice_messages: "$invoice_messages",
                        accounting_info: "$accounting_info",

                        vendor_name: "$vendor_data.vendor_name",
                        userfullname: "$assign_to_data.userfullname",
                    }
                }
            ]);
            if (get_data) {
                if (get_data.length > 0) {
                    get_data = get_data[0];
                }
                if (get_data) {
                    get_data.invoice_notes = await getNotesUserDetails(get_data.invoice_notes, userConnection);
                    get_data.invoice_notes = _.orderBy(get_data.invoice_notes, 'created_at', 'desc');
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
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

module.exports.saveAPOtherDocumentInvoice = async function (req, res) {
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
            var apOtherDocumentConnection = connection_db_api.model(collectionConstant.AP_OTHER_DOCUMENT, apOtherDocumentSchema);
            var documentId = requestObject.document_id;
            delete requestObject.document_id;

            requestObject.created_at = Math.round(new Date().getTime() / 1000);
            requestObject.created_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            requestObject.updated_by = decodedToken.UserData._id;
            let add_ap_invoice = new apInvoiceConnection(requestObject);
            let save_ap_invoice = await add_ap_invoice.save();
            if (save_ap_invoice) {
                await apOtherDocumentConnection.updateOne({ _id: ObjectID(documentId) }, { is_delete: 1 });

                delete requestObject.updated_by;
                delete requestObject.updated_at;
                delete requestObject.created_by;
                delete requestObject.created_at;
                delete requestObject.is_delete;
                delete requestObject.pdf_url;

                // find difference of object 
                let insertedData = await common.setInsertedFieldHistory(requestObject);

                if (requestObject.assign_to !== undefined && requestObject.assign_to !== null && requestObject.assign_to !== '') {
                    let found_assign_to = _.findIndex(insertedData, function (tmp_data) { return tmp_data.key == 'assign_to'; });
                    if (found_assign_to != -1) {
                        let one_data = await userConnection.findOne({ _id: ObjectID(insertedData[found_assign_to].value) });
                        insertedData[found_assign_to].value = one_data.userfullname;
                        sendInvoiceAssignUpdateAlerts(decodedToken, id, translator);
                    }
                }

                if (requestObject.vendor !== undefined && requestObject.vendor !== null && requestObject.vendor !== '') {
                    let found_vendor = _.findIndex(insertedData, function (tmp_data) { return tmp_data.key == 'vendor'; });
                    if (found_vendor != -1) {
                        let one_data = await vendorConnection.findOne({ _id: ObjectID(insertedData[found_vendor].value) });
                        insertedData[found_vendor].value = one_data.vendor_name;
                    }
                }

                let found_invoice_date_epoch = _.findIndex(insertedData, function (tmp_data) { return tmp_data.key == 'invoice_date_epoch'; });
                if (found_invoice_date_epoch != -1) {
                    insertedData[found_invoice_date_epoch].value = common.MMDDYYYY_local_offset(insertedData[found_invoice_date_epoch].value, 'en', local_offset);
                }

                let found_due_date_epoch = _.findIndex(insertedData, function (tmp_data) { return tmp_data.key == 'due_date_epoch'; });
                if (found_due_date_epoch != -1) {
                    insertedData[found_due_date_epoch].value = common.MMDDYYYY_local_offset(insertedData[found_due_date_epoch].value, 'en', local_offset);
                }

                for (let i = 0; i < insertedData.length; i++) {
                    insertedData[i]['key'] = translator.getStr(`Invoice_History.${insertedData[i]['key']}`);
                }
                let histioryObject = {
                    data: insertedData,
                    invoice_id: save_ap_invoice._id,
                };
                addInvoiceHistory("Insert", histioryObject, decodedToken);

                res.send({ status: true, message: "Invoice added successfully.", data: save_ap_invoice });
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
                        ROVUK_TEAM_SEC: translator.getStr('EmailTemplateRovukTeamSec'),
                        VIEW_EXCEL: translator.getStr('EmailTemplateViewExcelReport'),
                        COPYRIGHTNAME: `${config.COPYRIGHTNAME}`,

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

                    let subject = translator.getStr('InvoiceNote_Added_Subject');
                    let title = translator.getStr('InvoiceNote_Added_Title');
                    let description = translator.getStr('InvoiceNote_Added_Description');
                    sendAPInvoiceNoteAlert(invoice_id, decodedToken, subject, title, description, translator);
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

                    let subject = translator.getStr('InvoiceNote_Added_Subject');
                    let title = translator.getStr('InvoiceNote_Added_Title');
                    let description = translator.getStr('InvoiceNote_Added_Description');
                    sendAPInvoiceNoteAlert(invoice_id, decodedToken, subject, title, description, translator);
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

                let subject = translator.getStr('InvoiceNote_Deleted_Subject');
                let title = translator.getStr('InvoiceNote_Deleted_Title');
                let description = translator.getStr('InvoiceNote_Deleted_Description');
                sendAPInvoiceNoteAlert(invoice_id, decodedToken, subject, title, description, translator);
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

async function sendAPInvoiceNoteAlert(id, decodedToken, subject, title, description, translator) {
    var admin_connection_db_api = await db_connection.connection_db_api(config.ADMIN_CONFIG);
    var companyConnection = admin_connection_db_api.model(collectionConstant.SUPER_ADMIN_COMPANY, companySchema);
    var tenantConnection = admin_connection_db_api.model(collectionConstant.SUPER_ADMIN_TENANTS, tenantSchema);
    let company_data = await companyConnection.findOne({ companycode: decodedToken.companycode });
    let talnate_data = await tenantConnection.findOne({ companycode: decodedToken.companycode });

    var connection_db_api = await db_connection.connection_db_api(decodedToken);
    var apInvoiceConnection = connection_db_api.model(collectionConstant.AP_INVOICE, apInvoiceSchema);

    var get_data = await apInvoiceConnection.aggregate([
        { $match: { _id: ObjectID(id) } },
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
        }
    ]);
    if (get_data) {
        if (get_data.length > 0) {
            get_data = get_data[0];
        }
        if (get_data) {
            if (get_data.assign_to != '' && get_data.assign_to != undefined && get_data.assign_to != null) {
                description = description.replace(/#user/g, decodedToken.UserData.userfullname);
                let viewRoute = `${config.SITE_URL}/invoice/details?_id=${id}`;

                // Notification 
                let notification_data = {
                    title: title,
                    body: description,
                };
                let temp_data = {
                    "module": 'Invoice',
                    "_id": get_data._id,
                    "status": get_data.status,
                };
                let notificaton = await common.sendNotificationWithData([get_data.assign_to_data.invoice_firebase_token], notification_data, temp_data);
                console.log("notificaton", notificaton);

                // Alert
                let alertObject = {
                    user_id: get_data.assign_to_data._id,
                    module_name: 'Invoice Note',
                    module_route: { _id: id },
                    notification_title: title,
                    notification_description: description,
                };
                alertController.saveAlert(alertObject, connection_db_api);

                // Email
                const file_data = fs.readFileSync(config.EMAIL_TEMPLATE_PATH + '/controller/emailtemplates/commonEmailTemplate.html', 'utf8');
                let emailTmp = {
                    HELP: `${translator.getStr('EmailTemplateHelpEmailAt')} ${config.HELPEMAIL} ${translator.getStr('EmailTemplateCallSupportAt')} ${config.NUMBERPHONE}`,
                    SUPPORT: `${translator.getStr('EmailTemplateEmail')} ${config.SUPPORTEMAIL} l ${translator.getStr('EmailTemplatePhone')} ${config.NUMBERPHONE2}`,
                    ALL_RIGHTS_RESERVED: `${translator.getStr('EmailTemplateAllRightsReserved')}`,
                    THANKS: translator.getStr('EmailTemplateThanks'),
                    ROVUK_TEAM: translator.getStr('EmailTemplateRovukTeam'),
                    ROVUK_TEAM_SEC: translator.getStr('EmailTemplateRovukTeamSec'),
                    VIEW_EXCEL: translator.getStr('EmailTemplateViewExcelReport'),
                    COPYRIGHTNAME: `${config.COPYRIGHTNAME}`,

                    TITLE: `${title}`,
                    TEXT: new handlebars.SafeString(`<h4>Hello ${get_data.assign_to_data.userfullname},</h4><h4>${description}</h4>
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
                sendEmail.sendEmail_client(talnate_data.smartaccupay_tenants.tenant_smtp_username, [get_data.assign_to_data.useremail], subject, HtmlData,
                    talnate_data.smartaccupay_tenants.tenant_smtp_server, talnate_data.smartaccupay_tenants.tenant_smtp_port, talnate_data.smartaccupay_tenants.tenant_smtp_reply_to_mail,
                    talnate_data.smartaccupay_tenants.tenant_smtp_password, talnate_data.smartaccupay_tenants.tenant_smtp_timeout, talnate_data.smartaccupay_tenants.tenant_smtp_security);
            }
        }
    } else { }
}

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
                {
                    $unwind: {
                        path: "$history_created_by",
                        preserveNullAndEmptyArrays: true
                    },
                },
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

module.exports.getAPInvoiceForReports = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var apInvoiceConnection = connection_db_api.model(collectionConstant.AP_INVOICE, apInvoiceSchema);
            let start = parseInt(requestObject.start);
            var perpage = parseInt(requestObject.length);

            var columnName = (requestObject.sort != undefined && requestObject.sort != '') ? requestObject.sort.field : '';
            var columnOrder = (requestObject.sort != undefined && requestObject.sort != '') ? requestObject.sort.order : '';
            var sort = {};
            sort[columnName] = (columnOrder == 'asc') ? 1 : -1;

            let match = { is_delete: 0 };
            if (requestObject.vendor_ids != undefined && requestObject.vendor_ids != null) {
                let data_Query = [];
                for (let i = 0; i < requestObject.vendor_ids.length; i++) {
                    data_Query.push(ObjectID(requestObject.vendor_ids[i]));
                }
                if (requestObject.open_invoice) {
                    match = {
                        is_delete: 0,
                        vendor: { $in: data_Query },
                        status: { $ne: 'Paid' },
                    };
                } else {
                    match = {
                        is_delete: 0,
                        vendor: { $in: data_Query },
                    };
                }
            } else if (requestObject.assign_to_ids != undefined && requestObject.assign_to_ids != null) {
                let data_Query = [];
                for (let i = 0; i < requestObject.assign_to_ids.length; i++) {
                    data_Query.push(ObjectID(requestObject.assign_to_ids[i]));
                }
                match = {
                    is_delete: 0,
                    assign_to: { $in: data_Query },
                    status: { $ne: 'Paid' },
                };
            } else if (requestObject.class_name_ids != undefined && requestObject.class_name_ids != null) {
                let data_Query = [];
                for (let i = 0; i < requestObject.class_name_ids.length; i++) {
                    data_Query.push(ObjectID(requestObject.class_name_ids[i]));
                }
                match = {
                    is_delete: 0,
                    class_name: { $in: data_Query },
                    status: { $ne: 'Paid' },
                };
            } else if (requestObject.job_client_name_ids != undefined && requestObject.job_client_name_ids != null) {
                let data_Query = [];
                for (let i = 0; i < requestObject.job_client_name_ids.length; i++) {
                    data_Query.push(ObjectID(requestObject.job_client_name_ids[i]));
                }
                match = {
                    is_delete: 0,
                    job_client_name: { $in: data_Query },
                    status: { $ne: 'Paid' },
                };
            }

            var query = {
                $or: [
                    { "vendor_name": new RegExp(requestObject.search, 'i') },
                    { "invoice_no": new RegExp(requestObject.search, 'i') },
                    { "invoice_total_amount": new RegExp(requestObject.search, 'i') },
                    { "sub_total": new RegExp(requestObject.search, 'i') },
                    { "userfullname": new RegExp(requestObject.search, 'i') },
                    { "status": new RegExp(requestObject.search, 'i') },
                ]
            };

            let date_query = {};
            if (requestObject.start_date != 0 && requestObject.end_date != 0) {
                date_query = { invoice_date_epoch: { $gte: requestObject.start_date, $lt: requestObject.end_date } };
            }
            var get_data = await apInvoiceConnection.aggregate([
                { $match: match },
                { $match: date_query },
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
                    $project: {
                        assign_to: 1,
                        vendor: 1,
                        // vendor_name:1, 
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
                        invoice_total_amount: 1,
                        tax_amount: 1,
                        tax_id: 1,
                        sub_total: 1,
                        amount_due: 1,
                        gl_account: 1,
                        receiving_date_epoch: 1,
                        status: 1,
                        reject_reason: 1,
                        job_client_name: 1,
                        class_name: 1,
                        delivery_address: 1,
                        contract_number: 1,
                        account_number: 1,
                        discount: 1,
                        pdf_url: 1,
                        items: 1,
                        notes: 1,
                        invoice_notes: 1,
                        invoice_info: 1,
                        document_type: 1,
                        created_by: 1,
                        created_at: 1,
                        updated_by: 1,
                        updated_at: 1,
                        is_delete: 1,

                        assign_to_data: "$assign_to_data",
                        vendor_data: "$vendor_data",
                        terms_data: "$terms_data",
                        gl_account_data: "$gl_account_data",
                        job_client_data: "$job_client_data",
                        class_name_data: "$class_name_data",
                        vendor_name: "$vendor_data.vendor_name",
                        // userfullname: { $ifNull: [{ $arrayElemAt: ["$assign_to_data.userfullname", 0] }, ""] },
                        userfullname: "$assign_to_data.userfullname",
                    }
                },
                { $sort: sort },
                { $match: query },
                { $limit: perpage + start },
                { $skip: start },
            ]);
            let total_count = await apInvoiceConnection.find(match).countDocuments();
            let pager = {
                start: start,
                length: perpage,
                total: total_count
            };
            res.send({ status: true, data: get_data, pager });
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

module.exports.getHeaderAPInvoiceSerach = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var apInvoiceConnection = connection_db_api.model(collectionConstant.AP_INVOICE, apInvoiceSchema);
            var get_data = await apInvoiceConnection.aggregate([
                { $match: { is_delete: 0 } },
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
                    $match: {
                        $or: [
                            { 'vendor_data.vendor_name': new RegExp(requestObject.search, 'i') },
                            { 'status': new RegExp(requestObject.search, 'i') },
                            { 'invoice_no': new RegExp(requestObject.search, 'i') },
                            { 'items.ITEM': new RegExp(requestObject.search, 'i') },
                        ]
                    }
                },
            ]);
            if (get_data) {
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

// Save Invoice Notes
module.exports.saveAPInvoiceInfo = async function (req, res) {
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
                let updateObject = {
                    "invoice_info.$.updated_by": decodedToken.UserData._id,
                    "invoice_info.$.updated_at": Math.round(new Date().getTime() / 1000),
                    "invoice_info.$.amount": requestObject.amount,
                    "invoice_info.$.job_client_name": requestObject.job_client_name,
                    "invoice_info.$.class_name": requestObject.class_name,
                    "invoice_info.$.cost_code_gl_account": requestObject.cost_code_gl_account,
                    "invoice_info.$.assign_to": requestObject.assign_to,
                    "invoice_info.$.notes": requestObject.notes,
                };
                let update_ap_invoice = await apInvoiceConnection.updateOne({ _id: ObjectID(invoice_id), "invoice_info._id": id }, { $set: updateObject });
                if (update_ap_invoice) {
                    res.send({ status: true, message: "Invoice info updated successfully.", data: update_ap_invoice });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                //save invoice info
                requestObject.created_by = decodedToken.UserData._id;
                requestObject.created_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let save_ap_invoice_info = await apInvoiceConnection.updateOne({ _id: ObjectID(invoice_id) }, { $push: { invoice_info: requestObject } });
                if (save_ap_invoice_info) {
                    res.send({ status: true, message: "Invoice info added successfully." });
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

module.exports.deleteAPInvoiceInfo = async function (req, res) {
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
            let update_ap_invoice = await apInvoiceConnection.updateOne({ _id: ObjectID(invoice_id), "invoice_info._id": id }, { $set: { "invoice_info.$.updated_by": decodedToken.UserData._id, "invoice_info.$.updated_at": Math.round(new Date().getTime() / 1000), "invoice_info.$.is_delete": 1 } });
            if (update_ap_invoice) {
                res.send({ status: true, message: "Invoice info deleted successfully.", data: update_ap_invoice });
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

module.exports.sendInvoiceUpdateAlerts = function (decodedToken, id, invoiceId, module, translator) {
    return sendInvoiceUpdateAlerts(decodedToken, id, invoiceId, module, translator);
};

function sendInvoiceUpdateAlerts(decodedToken, id, invoiceId, module, translator) {
    return new Promise(async function (resolve, reject) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        var apInvoiceConnection = connection_db_api.model(collectionConstant.AP_INVOICE, apInvoiceSchema);
        let settingsCollection = connection_db_api.model(collectionConstant.INVOICE_SETTING, settingsSchema);
        let userCollection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
        let one_invoice = await apInvoiceConnection.findOne({ _id: ObjectID(invoiceId) });
        if (one_invoice) {
            let get_settings = await settingsCollection.findOne({});
            if (get_settings) {
                if (get_settings.settings.Invoice_modified.setting_status == 'Active') {
                    //  && get_settings.settings.User_Notify_By.setting_status == 'Active'
                    // var notifyOptions = get_settings.settings.User_Notify_By.setting_value;
                    // var allowEmail = (notifyOptions.indexOf('Email') !== -1) ? true : false;
                    // var allowAlert = (notifyOptions.indexOf('Alert') !== -1) ? true : false;
                    // var allowNotification = (notifyOptions.indexOf('Notification') !== -1) ? true : false;

                    var allowEmail = true;
                    var allowAlert = true;
                    var allowNotification = true;

                    let roles = [];
                    get_settings.settings.Invoice_modified.setting_value.forEach((id) => {
                        roles.push(ObjectID(id));
                    });
                    let get_users = await userCollection.find({ userroleId: { $in: roles } });
                    let title = `${module} #${one_invoice.invoice_no} Update Alert`;
                    let description = `${module} #${one_invoice.invoice_no} has been updated.`;
                    let emailList = [];
                    let viewRoute = `${config.SITE_URL}/invoice/view-document?document=${module.toString().toUpperCase().replace(/ /g, "_")}&_id=${id}`;
                    if (get_users.length > 0) {
                        for (let i = 0; i < get_users.length; i++) {
                            // Notification
                            if (allowNotification) {
                                let notification_data = {
                                    title: title,
                                    body: description,
                                };
                                let temp_data = {
                                    "module": module,
                                    "_id": one_invoice._id,
                                    "status": one_invoice.status,
                                };
                                await common.sendNotificationWithData([get_users[i].invoice_firebase_token], notification_data, temp_data);
                            }

                            // Alert
                            if (allowAlert) {
                                let alertObject = {
                                    user_id: get_users[i]._id,
                                    module_name: module,
                                    module_route: { _id: id },
                                    notification_title: title,
                                    notification_description: description,
                                };
                                alertController.saveAlert(alertObject, connection_db_api);
                            }

                            emailList.push(get_users[i].useremail);
                            if (i == get_users.length - 1) {
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
                                        ROVUK_TEAM_SEC: translator.getStr('EmailTemplateRovukTeamSec'),
                                        VIEW_EXCEL: translator.getStr('EmailTemplateViewExcelReport'),
                                        COPYRIGHTNAME: `${config.COPYRIGHTNAME}`,

                                        TITLE: `${title}`,
                                        TEXT: new handlebars.SafeString(`<h4>Hello,</h4><h4>${description}</h4>
                                <div style="text-align: center;">
                                    <a style="background-color: #023E8A;border: #0077bc solid;color: white;padding: 15px 32px;
                                                text-align: center;text-decoration: none;display: inline-block;font-size: 16px; width: 20%;" 
                                                target="_blank" href="${viewRoute}">View ${module}</a>
                                </div>`),

                                        COMPANYNAME: `${translator.getStr('EmailCompanyName')} ${company_data.companyname}`,
                                        COMPANYCODE: `${translator.getStr('EmailCompanyCode')} ${company_data.companycode}`,
                                    };
                                    var template = handlebars.compile(file_data);
                                    var HtmlData = await template(emailTmp);
                                    sendEmail.sendEmail_client(talnate_data.smartaccupay_tenants.tenant_smtp_username, emailList, title, HtmlData,
                                        talnate_data.smartaccupay_tenants.tenant_smtp_server, talnate_data.smartaccupay_tenants.tenant_smtp_port, talnate_data.smartaccupay_tenants.tenant_smtp_reply_to_mail,
                                        talnate_data.smartaccupay_tenants.tenant_smtp_password, talnate_data.smartaccupay_tenants.tenant_smtp_timeout, talnate_data.smartaccupay_tenants.tenant_smtp_security);
                                }
                                resolve();
                            }
                        }
                    } else {
                        resolve();
                    }
                } else {
                    resolve();
                }
            } else {
                resolve();
            }
        } else {
            resolve();
        }
    });
};

module.exports.checkQBDImportapInvoices = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var id = requestObject._id;
            var apInvoiceConnection = connection_db_api.model(collectionConstant.AP_INVOICE, apInvoiceSchema);
            var vendorConnection = connection_db_api.model(collectionConstant.INVOICE_VENDOR, vendorSchema);
            let costcodeCollection = connection_db_api.model(collectionConstant.COSTCODES, costcodeSchema);
            for (let m = 0; m < requestObject.length; m++) {
                var getvendordata = await vendorConnection.findOne({ "vendor_name": requestObject[m].VendorRef.FullName });
                var getcostcodedata = await costcodeCollection.findOne({ "cost_code": requestObject[m].APAccountRef.FullName });
                requestObject.created_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                requestObject.is_quickbooks = true;
                requestObject.vendor = getvendordata._id;
                requestObject.gl_account = getcostcodedata._id;
                requestObject.invoice_date_epoch = new Date(requestObject[m].TxnDate).getTime() / 1000;
                requestObject.due_date_epoch = new Date(requestObject[m].DueDate).getTime() / 1000;
                requestObject.invoice_total_amount = requestObject[m].AmountDue;

                if (requestObject[m].IsActive == true) {
                    requestObject.vendor_status = 1;
                }
                else if (requestObject[m].IsActive == false) {
                    requestObject.vendor_status = 2;
                }
                var add_invoice = new apInvoiceConnection(requestObject);
                var save_invoice = await add_invoice.save();


            }
            res.send({ status: true, message: "ap invoice insert successfully..!" });

        } catch (error) {
            console.log(error);
            res.send({ status: false, message: translator.getStr('SomethingWrong'), error: error });
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.getApprovedapInvoicesForQBD = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var apInvoiceConnection = connection_db_api.model(collectionConstant.AP_INVOICE, apInvoiceSchema);

            match = {
                is_delete: 0,
                status: "Approved",
            };

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
                // {
                //     $unwind: {
                //         path: "$job_client_data",
                //         preserveNullAndEmptyArrays: true
                //     },
                // },
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
                    $project: {
                        BillAddRq: {
                            BillAdd: {
                                VendorRef: {
                                    FullName: "$vendor_data.vendor_name",
                                },
                                TxnDate: "$invoice_date_epoch",
                                DueDate: "$due_date_epoch",
                                RefNumber: "$invoice_no",
                                ExpenseLineAdd: {
                                    AccountRef: {
                                        FullName: "$job_client_data.client_name"
                                    },
                                    Amount: {
                                        $filter: {
                                            input: '$invoice_info',
                                            as: 'info',
                                            cond: { $eq: ['$$info.is_delete', 0] }
                                        }
                                    }

                                    //"$invoice_info.amount"
                                }

                            }
                        },
                    }
                },
                { $sort: { created_at: -1 } },
            ]);
            if (get_data) {
                res.send(get_data);
            } else {
                res.send([]);
            }
        } catch (e) {
            console.log(e);
            res.send([]);
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};