var invoiceSchema = require('../../../../model/invoice');
var vendorSchema = require('../../../../model/vendor');
var processInvoiceSchema = require('../../../../model/process_invoice');
var invoice_history_Schema = require('../../../../model/history/invoice_history');
var recentActivitySchema = require('../../../../model/recent_activities');
var settingsSchema = require('../../../../model/settings');
var rolesSchema = require('../../../../model/invoice_roles');
var userSchema = require('../../../../model/user');
let db_connection = require('../../../../controller/common/connectiondb');
let collectionConstant = require('../../../../config/collectionConstant');
let config = require('../../../../config/config');
let common = require('../../../../controller/common/common');
const historyCollectionConstant = require('../../../../config/historyCollectionConstant');
var ObjectID = require('mongodb').ObjectID;
let rest_Api = require('./../../../../config/db_rest_api');
var _ = require('lodash');
const excel = require("exceljs");
var handlebars = require('handlebars');
let sendEmail = require('./../../../../controller/common/sendEmail');
var fs = require('fs');
var bucketOpration = require('../../../../controller/common/s3-wasabi');
var moment = require('moment');
var _ = require('lodash');
var recentActivity = require('./../recent_activity/recentActivityController');

module.exports.getInvoiceList = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var get_data = await invoicesConnection.aggregate([
                { $match: { is_delete: 0 } },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_VENDOR,
                        localField: "vendor",
                        foreignField: "_id",
                        as: "vendor"
                    }
                },
                { $unwind: "$vendor" },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "created_by",
                        foreignField: "_id",
                        as: "created_by"
                    }
                },
                {
                    $unwind: {
                        path: "$created_by",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $project: {
                        status: 1,
                        tmpObject: {
                            _id: "$_id",
                            assign_to: "$assign_to",
                            vendor: "$vendor",
                            vendor_id: "$vendor_id",
                            customer_id: "$customer_id",
                            invoice: "$invoice",
                            p_o: "$p_o",
                            invoice_date: "$invoice_date",
                            invoice_date_epoch: "$invoice_date_epoch",
                            due_date: "$due_date",
                            due_date_epoch: "$due_date_epoch",
                            order_date: "$order_date",
                            order_date_epoch: "$order_date_epoch",
                            ship_date: "$ship_date",
                            ship_date_epoch: "$ship_date_epoch",
                            terms: "$terms",
                            total: "$total",
                            invoice_total: "$invoice_total",
                            tax_amount: "$tax_amount",
                            tax_id: "$tax_id",
                            sub_total: "$sub_total",
                            amount_due: "$amount_due",
                            cost_code: "$cost_code",
                            receiving_date: "$receiving_date",
                            notes: "$notes",
                            status: "$status",
                            job_number: "$job_number",
                            delivery_address: "$delivery_address",
                            contract_number: "$contract_number",
                            account_number: "$account_number",
                            discount: "$discount",
                            pdf_url: "$pdf_url",
                            items: "$items",
                            packing_slip: "$packing_slip",
                            receiving_slip: "$receiving_slip",
                            badge: "$badge",
                            gl_account: "$gl_account",
                            created_by: { $ifNull: ["$created_by.userfullname", "$created_by_mail"] },
                            created_at: "$created_at",
                            invoice_notes: {
                                $filter: {
                                    input: '$invoice_notes',
                                    as: 'note',
                                    cond: { $eq: ['$$note.is_delete', 0] }
                                }
                            },
                            invoice_attachments: "$invoice_attachments",
                            has_packing_slip: "$has_packing_slip",
                            packing_slip_data: "$packing_slip_data",
                            packing_slip_notes: {
                                $filter: {
                                    input: '$packing_slip_notes',
                                    as: 'note',
                                    cond: { $eq: ['$$note.is_delete', 0] }
                                }
                            },
                            packing_slip_attachments: "$packing_slip_attachments",
                            has_receiving_slip: "$has_receiving_slip",
                            receiving_slip_data: "$receiving_slip_data",
                            receiving_slip_notes: {
                                $filter: {
                                    input: '$receiving_slip_notes',
                                    as: 'note',
                                    cond: { $eq: ['$$note.is_delete', 0] }
                                }
                            },
                            receiving_slip_attachments: "$receiving_slip_attachments",
                            has_po: "$has_po",
                            po_data: "$po_data",
                            po_notes: {
                                $filter: {
                                    input: '$po_notes',
                                    as: 'note',
                                    cond: { $eq: ['$$note.is_delete', 0] }
                                }
                            },
                            po_attachments: "$po_attachments",
                            has_quote: "$has_quote",
                            quote_data: "$quote_data",
                            quote_notes: {
                                $filter: {
                                    input: '$quote_notes',
                                    as: 'note',
                                    cond: { $eq: ['$$note.is_delete', 0] }
                                }
                            },
                            quote_attachments: "$quote_attachments",
                            document_type: { $ifNull: ["$document_type", "INVOICE"] },
                            attach_files: {
                                $sum: [
                                    1, {
                                        $cond: [
                                            { $eq: ["$has_packing_slip", true] },
                                            1, 0
                                        ]
                                    }, {
                                        $cond: [
                                            { $eq: ["$has_receiving_slip", true] },
                                            1, 0
                                        ]
                                    }, {
                                        $cond: [
                                            { $eq: ["$has_po", true] },
                                            1, 0
                                        ]
                                    }, {
                                        $cond: [
                                            { $eq: ["$has_quote", true] },
                                            1, 0
                                        ]
                                    }
                                ]
                            },
                            reject_reason: 1,
                        },
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
                let pending = [], approved = [], rejected = [], late = [];
                for (let i = 0; i < get_data.length; i++) {
                    if (get_data[i]._id == 'Pending') {
                        pending = get_data[i].data;
                    } else if (get_data[i]._id == 'Approved') {
                        approved = get_data[i].data;
                    } else if (get_data[i]._id == 'Rejected') {
                        rejected = get_data[i].data;
                    } else if (get_data[i]._id == 'Late') {
                        late = get_data[i].data;
                    }
                }
                res.send({ status: true, message: "Invoice data", pending, approved, rejected, late });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
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

module.exports.getStatusWiseInvoice = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var get_data = await invoicesConnection.aggregate([
                { $match: { is_delete: 0, status: requestObject.status } },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_VENDOR,
                        localField: "vendor",
                        foreignField: "_id",
                        as: "vendor"
                    }
                },
                { $unwind: "$vendor" },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "created_by",
                        foreignField: "_id",
                        as: "created_by"
                    }
                },
                {
                    $unwind: {
                        path: "$created_by",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $project: {
                        _id: "$_id",
                        assign_to: "$assign_to",
                        vendor: "$vendor",
                        vendor_id: "$vendor_id",
                        customer_id: "$customer_id",
                        invoice: "$invoice",
                        p_o: "$p_o",
                        invoice_date: "$invoice_date",
                        invoice_date_epoch: "$invoice_date_epoch",
                        due_date: "$due_date",
                        due_date_epoch: "$due_date_epoch",
                        order_date: "$order_date",
                        order_date_epoch: "$order_date_epoch",
                        ship_date: "$ship_date",
                        ship_date_epoch: "$ship_date_epoch",
                        terms: "$terms",
                        total: "$total",
                        invoice_total: "$invoice_total",
                        tax_amount: "$tax_amount",
                        tax_id: "$tax_id",
                        sub_total: "$sub_total",
                        amount_due: "$amount_due",
                        cost_code: "$cost_code",
                        receiving_date: "$receiving_date",
                        notes: "$notes",
                        status: "$status",
                        job_number: "$job_number",
                        delivery_address: "$delivery_address",
                        contract_number: "$contract_number",
                        account_number: "$account_number",
                        discount: "$discount",
                        pdf_url: "$pdf_url",
                        items: "$items",
                        packing_slip: "$packing_slip",
                        receiving_slip: "$receiving_slip",
                        badge: "$badge",
                        gl_account: "$gl_account",
                        created_by: { $ifNull: ["$created_by.userfullname", "$created_by_mail"] },
                        created_at: "$created_at",
                        invoice_notes: {
                            $filter: {
                                input: '$invoice_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },
                        invoice_attachments: "$invoice_attachments",
                        has_packing_slip: "$has_packing_slip",
                        packing_slip_data: "$packing_slip_data",
                        packing_slip_notes: {
                            $filter: {
                                input: '$packing_slip_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },
                        packing_slip_attachments: "$packing_slip_attachments",
                        has_receiving_slip: "$has_receiving_slip",
                        receiving_slip_data: "$receiving_slip_data",
                        receiving_slip_notes: {
                            $filter: {
                                input: '$receiving_slip_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },
                        receiving_slip_attachments: "$receiving_slip_attachments",
                        has_po: "$has_po",
                        po_data: "$po_data",
                        po_notes: {
                            $filter: {
                                input: '$po_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },
                        po_attachments: "$po_attachments",
                        has_quote: "$has_quote",
                        quote_data: "$quote_data",
                        quote_notes: {
                            $filter: {
                                input: '$quote_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },
                        quote_attachments: "$quote_attachments",
                        document_type: { $ifNull: ["$document_type", "INVOICE"] },
                        attach_files: {
                            $sum: [
                                1, {
                                    $cond: [
                                        { $eq: ["$has_packing_slip", true] },
                                        1, 0
                                    ]
                                }, {
                                    $cond: [
                                        { $eq: ["$has_receiving_slip", true] },
                                        1, 0
                                    ]
                                }, {
                                    $cond: [
                                        { $eq: ["$has_po", true] },
                                        1, 0
                                    ]
                                }, {
                                    $cond: [
                                        { $eq: ["$has_quote", true] },
                                        1, 0
                                    ]
                                }
                            ]
                        },
                        reject_reason: 1,
                    }
                },
            ]);
            if (get_data) {
                res.send({ status: true, message: "Invoice data", data: get_data });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
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

module.exports.getOneInvoice = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            var get_data = await invoicesConnection.aggregate([
                { $match: { _id: ObjectID(requestObject._id) } },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_VENDOR,
                        localField: "vendor",
                        foreignField: "_id",
                        as: "vendor"
                    }
                },
                { $unwind: "$vendor" },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "created_by",
                        foreignField: "_id",
                        as: "created_by"
                    }
                },
                {
                    $unwind: {
                        path: "$created_by",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $project: {
                        assign_to: 1,
                        vendor: "$vendor",
                        vendor_id: 1,
                        customer_id: 1,
                        invoice: 1,
                        p_o: 1,
                        invoice_date: 1,
                        invoice_date_epoch: 1,
                        due_date: 1,
                        due_date_epoch: 1,
                        order_date: 1,
                        order_date_epoch: 1,
                        ship_date: 1,
                        ship_date_epoch: 1,
                        terms: 1,
                        total: 1,
                        invoice_total: 1,
                        tax_amount: 1,
                        tax_id: 1,
                        sub_total: 1,
                        amount_due: 1,
                        cost_code: 1,
                        receiving_date: 1,
                        notes: 1,
                        status: 1,
                        job_number: 1,
                        delivery_address: 1,
                        contract_number: 1,
                        account_number: 1,
                        discount: 1,
                        pdf_url: 1,
                        items: 1,
                        packing_slip: 1,
                        receiving_slip: 1,
                        badge: 1,
                        gl_account: 1,
                        created_by: { $ifNull: ["$created_by.userfullname", "$created_by_mail"] },
                        created_at: 1,
                        // invoice_notes: { $elemMatch: { is_delete: 0 } },
                        invoice_notes: {
                            $filter: {
                                input: '$invoice_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },
                        invoice_attachments: 1,
                        has_packing_slip: 1,
                        packing_slip_data: 1,
                        packing_slip_notes: {
                            $filter: {
                                input: '$packing_slip_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },
                        packing_slip_attachments: 1,
                        has_receiving_slip: 1,
                        receiving_slip_data: 1,
                        receiving_slip_notes: {
                            $filter: {
                                input: '$receiving_slip_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },
                        receiving_slip_attachments: 1,
                        has_po: 1,
                        po_data: 1,
                        po_notes: {
                            $filter: {
                                input: '$po_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },
                        po_attachments: 1,
                        has_quote: 1,
                        quote_data: 1,
                        quote_notes: {
                            $filter: {
                                input: '$quote_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },
                        quote_attachments: 1,
                        document_type: { $ifNull: ["$document_type", "INVOICE"] },
                        attach_files: {
                            $sum: [
                                1, {
                                    $cond: [
                                        { $eq: ["$has_packing_slip", true] },
                                        1, 0
                                    ]
                                }, {
                                    $cond: [
                                        { $eq: ["$has_receiving_slip", true] },
                                        1, 0
                                    ]
                                }, {
                                    $cond: [
                                        { $eq: ["$has_po", true] },
                                        1, 0
                                    ]
                                }, {
                                    $cond: [
                                        { $eq: ["$has_quote", true] },
                                        1, 0
                                    ]
                                }
                            ]
                        },
                        reject_reason: 1,
                    }
                },
            ]);
            if (get_data.length > 0) {
                get_data = get_data[0];
            }
            get_data.invoice_notes = await getNotesUserDetails(get_data.invoice_notes, userConnection);
            get_data.packing_slip_notes = await getNotesUserDetails(get_data.packing_slip_notes, userConnection);
            get_data.receiving_slip_notes = await getNotesUserDetails(get_data.receiving_slip_notes, userConnection);
            get_data.po_notes = await getNotesUserDetails(get_data.po_notes, userConnection);
            get_data.quote_notes = await getNotesUserDetails(get_data.quote_notes, userConnection);
            res.send({ status: true, message: "Invoice data", data: get_data });
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

module.exports.updateInvoiceStatus = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var id = requestObject._id;
            delete requestObject._id;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            var get_invoice = await invoicesConnection.findOne({ _id: ObjectID(id) });
            var update_data = await invoicesConnection.updateOne({ _id: ObjectID(id) }, requestObject);
            let isDelete = update_data.nModified;
            if (isDelete == 0) {
                res.send({ status: false, message: "There is no data with this id." });
            } else {
                var get_one = await invoicesConnection.findOne({ _id: ObjectID(id) }, { _id: 0, __v: 0 });
                let reqObj = { invoice_id: id, ...get_one._doc };
                addchangeInvoice_History("Update", reqObj, decodedToken, get_one.updated_at);
                recentActivity.saveRecentActivity({
                    user_id: decodedToken.UserData._id,
                    username: decodedToken.UserData.userfullname,
                    userpicture: decodedToken.UserData.userpicture,
                    data_id: id,
                    title: `Invoice #${get_invoice.invoice}`,
                    module: 'Invoice',
                    action: requestObject.status,
                    action_from: 'Mobile',
                }, decodedToken);
                res.send({ message: `Invoice ${requestObject.status.toLowerCase()} successfully`, status: true, data: update_data });
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

async function addchangeInvoice_History(action, data, decodedToken, updatedAt) {
    var connection_db_api = await db_connection.connection_db_api(decodedToken);
    try {
        let invoice_Histroy_Connection = connection_db_api.model(historyCollectionConstant.INVOICES_HISTORY, invoice_history_Schema);
        data.action = action;
        data.taken_device = config.WEB_ALL;
        data.history_created_at = updatedAt;
        data.history_created_by = decodedToken.UserData._id;
        var add_invoice_history = new invoice_Histroy_Connection(data);
        var save_invoice_history = await add_invoice_history.save();
    } catch (e) {
        console.log(e);
    } finally {
        connection_db_api.close();
    }
}


module.exports.saveInvoiceNotes = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var invoice_id = requestObject.invoice_id;
            delete requestObject.invoice_id;
            var id = requestObject._id;
            delete requestObject._id;
            if (id) {
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id), "invoice_notes._id": id }, { $set: { "invoice_notes.$.updated_by": decodedToken.UserData._id, "invoice_notes.$.updated_at": Math.round(new Date().getTime() / 1000), "invoice_notes.$.notes": requestObject.notes } });
                let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
                if (update_invoice) {
                    requestObject.invoice_id = invoice_id;
                    addchangeInvoice_History("Update Note", requestObject, decodedToken, requestObject.updated_at);
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: invoice_id,
                        title: `Invoice #${get_invoice.invoice}`,
                        module: 'Invoice',
                        action: 'Update Note',
                        action_from: 'Mobile',
                    }, decodedToken);
                    res.send({ status: true, message: "Invoice note updated successfully.", data: update_invoice });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                //save invoice note
                requestObject.created_by = decodedToken.UserData._id;
                requestObject.created_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let save_invoice_note = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id) }, { $push: { invoice_notes: requestObject } });
                let one_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
                if (save_invoice_note) {
                    requestObject.invoice_id = invoice_id;
                    addchangeInvoice_History("Insert Note", requestObject, decodedToken, requestObject.updated_at);
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: invoice_id,
                        title: `Invoice #${one_invoice.invoice}`,
                        module: 'Invoice',
                        action: 'Insert Note in',
                        action_from: 'Mobile',
                    }, decodedToken);
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

module.exports.deleteInvoiceNote = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var invoice_id = requestObject.invoice_id;
            delete requestObject.invoice_id;
            var id = requestObject._id;
            delete requestObject._id;
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id), "invoice_notes._id": id }, { $set: { "invoice_notes.$.updated_by": decodedToken.UserData._id, "invoice_notes.$.updated_at": Math.round(new Date().getTime() / 1000), "invoice_notes.$.is_delete": 1 } });
            let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
            if (update_invoice) {
                requestObject.invoice_id = invoice_id;
                addchangeInvoice_History("Delete Note", requestObject, decodedToken, requestObject.updated_at);
                recentActivity.saveRecentActivity({
                    user_id: decodedToken.UserData._id,
                    username: decodedToken.UserData.userfullname,
                    userpicture: decodedToken.UserData.userpicture,
                    data_id: invoice_id,
                    title: `Invoice #${get_invoice.invoice}`,
                    module: 'Invoice',
                    action: 'Delete Note in',
                    action_from: 'Mobile',
                }, decodedToken);
                res.send({ status: true, message: "Invoice note deleted successfully.", data: update_invoice });
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

module.exports.saveInvoiceAttachment = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(requestObject._id) });
            let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
            if (update_invoice) {
                requestObject.invoice_id = requestObject._id;
                addchangeInvoice_History("Update Attachment", requestObject, decodedToken, requestObject.updated_at);
                recentActivity.saveRecentActivity({
                    user_id: decodedToken.UserData._id,
                    username: decodedToken.UserData.userfullname,
                    userpicture: decodedToken.UserData.userpicture,
                    data_id: requestObject._id,
                    title: `Invoice #${get_invoice.invoice}`,
                    module: 'Invoice',
                    action: 'Update Attachment in',
                    action_from: 'Mobile',
                }, decodedToken);
                res.send({ status: true, message: "Invoice attachment updated successfully..", data: update_invoice });
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


module.exports.savePackingSlipNotes = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var invoice_id = requestObject.invoice_id;
            delete requestObject.invoice_id;
            var id = requestObject._id;
            delete requestObject._id;
            if (id) {
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id), "packing_slip_notes._id": id }, { $set: { "packing_slip_notes.$.updated_by": decodedToken.UserData._id, "packing_slip_notes.$.updated_at": Math.round(new Date().getTime() / 1000), "packing_slip_notes.$.notes": requestObject.notes } });
                let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
                if (update_invoice) {
                    requestObject.invoice_id = invoice_id;
                    addchangeInvoice_History("Update Packing Slip Note", requestObject, decodedToken, requestObject.updated_at);
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: invoice_id,
                        title: `Invoice #${get_invoice.invoice}`,
                        module: 'Packing Slip',
                        action: 'Update Note in',
                        action_from: 'Mobile',
                    }, decodedToken);
                    res.send({ status: true, message: "Packing slip note updated successfully.", data: update_invoice });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                //save invoice note
                requestObject.created_by = decodedToken.UserData._id;
                requestObject.created_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let save_invoice_note = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id) }, { $push: { packing_slip_notes: requestObject } });
                let one_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
                if (save_invoice_note) {
                    requestObject.invoice_id = invoice_id;
                    addchangeInvoice_History("Insert Packing Slip Note", requestObject, decodedToken, requestObject.updated_at);
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: invoice_id,
                        title: `Invoice #${one_invoice.invoice}`,
                        module: 'Packing Slip',
                        action: 'Insert Note in',
                        action_from: 'Mobile',
                    }, decodedToken);
                    res.send({ status: true, message: "Packing slip note saved successfully." });
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

module.exports.deletePackingSlipNote = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var invoice_id = requestObject.invoice_id;
            delete requestObject.invoice_id;
            var id = requestObject._id;
            delete requestObject._id;
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id), "packing_slip_notes._id": id }, { $set: { "packing_slip_notes.$.updated_by": decodedToken.UserData._id, "packing_slip_notes.$.updated_at": Math.round(new Date().getTime() / 1000), "packing_slip_notes.$.is_delete": 1 } });
            let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
            if (update_invoice) {
                requestObject.invoice_id = invoice_id;
                addchangeInvoice_History("Delete Packing Slip Note", requestObject, decodedToken, requestObject.updated_at);
                recentActivity.saveRecentActivity({
                    user_id: decodedToken.UserData._id,
                    username: decodedToken.UserData.userfullname,
                    userpicture: decodedToken.UserData.userpicture,
                    data_id: invoice_id,
                    title: `Invoice #${get_invoice.invoice}`,
                    module: 'Packing Slip',
                    action: 'Delete Note in',
                    action_from: 'Mobile',
                }, decodedToken);
                res.send({ status: true, message: "Packing slip note deleted successfully.", data: update_invoice });
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

module.exports.savePackingSlipAttachment = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(requestObject._id) });
            let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
            if (update_invoice) {
                requestObject.invoice_id = requestObject._id;
                addchangeInvoice_History("Update Packing Slip Attachment", requestObject, decodedToken, requestObject.updated_at);
                recentActivity.saveRecentActivity({
                    user_id: decodedToken.UserData._id,
                    username: decodedToken.UserData.userfullname,
                    userpicture: decodedToken.UserData.userpicture,
                    data_id: requestObject._id,
                    title: `Invoice #${get_invoice.invoice}`,
                    module: 'Packing Slip',
                    action: 'Update Attachment in',
                    action_from: 'Mobile',
                }, decodedToken);
                res.send({ status: true, message: "Packing slip attachment updated successfully..", data: update_invoice });
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


module.exports.saveReceivingSlipNotes = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var invoice_id = requestObject.invoice_id;
            delete requestObject.invoice_id;
            var id = requestObject._id;
            delete requestObject._id;
            if (id) {
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id), "receiving_slip_notes._id": id }, { $set: { "receiving_slip_notes.$.updated_by": decodedToken.UserData._id, "receiving_slip_notes.$.updated_at": Math.round(new Date().getTime() / 1000), "receiving_slip_notes.$.notes": requestObject.notes } });
                let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
                if (update_invoice) {
                    requestObject.invoice_id = invoice_id;
                    addchangeInvoice_History("Update Receiving Slip Note", requestObject, decodedToken, requestObject.updated_at);
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: invoice_id,
                        title: `Invoice #${get_invoice.invoice}`,
                        module: 'Receiving Slip',
                        action: 'Update Note in',
                        action_from: 'Mobile',
                    }, decodedToken);
                    res.send({ status: true, message: "Receiving slip note updated successfully.", data: update_invoice });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                //save invoice note
                requestObject.created_by = decodedToken.UserData._id;
                requestObject.created_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let save_invoice_note = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id) }, { $push: { receiving_slip_notes: requestObject } });
                let one_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
                if (save_invoice_note) {
                    requestObject.invoice_id = invoice_id;
                    addchangeInvoice_History("Insert Receiving Slip Note", requestObject, decodedToken, requestObject.updated_at);
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: invoice_id,
                        title: `Invoice #${one_invoice.invoice}`,
                        module: 'Receiving Slip',
                        action: 'Insert Note in',
                        action_from: 'Mobile',
                    }, decodedToken);
                    res.send({ status: true, message: "Receiving slip note saved successfully." });
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

module.exports.deleteReceivingSlipNote = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var invoice_id = requestObject.invoice_id;
            delete requestObject.invoice_id;
            var id = requestObject._id;
            delete requestObject._id;
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id), "receiving_slip_notes._id": id }, { $set: { "receiving_slip_notes.$.updated_by": decodedToken.UserData._id, "receiving_slip_notes.$.updated_at": Math.round(new Date().getTime() / 1000), "receiving_slip_notes.$.is_delete": 1 } });
            let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
            if (update_invoice) {
                requestObject.invoice_id = invoice_id;
                addchangeInvoice_History("Delete Receiving Slip Note", requestObject, decodedToken, requestObject.updated_at);
                recentActivity.saveRecentActivity({
                    user_id: decodedToken.UserData._id,
                    username: decodedToken.UserData.userfullname,
                    userpicture: decodedToken.UserData.userpicture,
                    data_id: invoice_id,
                    title: `Invoice #${get_invoice.invoice}`,
                    module: 'Receiving Slip',
                    action: 'Delete Note in',
                    action_from: 'Mobile',
                }, decodedToken);
                res.send({ status: true, message: "Receiving slip note deleted successfully.", data: update_invoice });
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

module.exports.saveReceivingSlipAttachment = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(requestObject._id) });
            let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
            if (update_invoice) {
                requestObject.invoice_id = requestObject._id;
                addchangeInvoice_History("Update Receiving Slip Attachment", requestObject, decodedToken, requestObject.updated_at);
                recentActivity.saveRecentActivity({
                    user_id: decodedToken.UserData._id,
                    username: decodedToken.UserData.userfullname,
                    userpicture: decodedToken.UserData.userpicture,
                    data_id: requestObject._id,
                    title: `Invoice #${get_invoice.invoice}`,
                    module: 'Receiving Slip',
                    action: 'Update Attachment in',
                    action_from: 'Mobile',
                }, decodedToken);
                res.send({ status: true, message: "Receiving slip attachment updated successfully..", data: update_invoice });
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


module.exports.savePONotes = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var invoice_id = requestObject.invoice_id;
            delete requestObject.invoice_id;
            var id = requestObject._id;
            delete requestObject._id;
            if (id) {
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id), "quote_notes._id": id }, { $set: { "po_notes.$.updated_by": decodedToken.UserData._id, "po_notes.$.updated_at": Math.round(new Date().getTime() / 1000), "po_notes.$.notes": requestObject.notes } });
                let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
                if (update_invoice) {
                    requestObject.invoice_id = invoice_id;
                    addchangeInvoice_History("Update PO Note", requestObject, decodedToken, requestObject.updated_at);
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: invoice_id,
                        title: `Invoice #${get_invoice.invoice}`,
                        module: 'PO',
                        action: 'Update Note in',
                        action_from: 'Mobile',
                    }, decodedToken);
                    res.send({ status: true, message: "PO note updated successfully.", data: update_invoice });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                //save invoice note
                requestObject.created_by = decodedToken.UserData._id;
                requestObject.created_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let save_invoice_note = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id) }, { $push: { po_notes: requestObject } });
                let one_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
                if (save_invoice_note) {
                    requestObject.invoice_id = invoice_id;
                    addchangeInvoice_History("Insert PO Note", requestObject, decodedToken, requestObject.updated_at);
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: invoice_id,
                        title: `Invoice #${one_invoice.invoice}`,
                        module: 'PO',
                        action: 'Insert Note in',
                        action_from: 'Mobile',
                    }, decodedToken);
                    res.send({ status: true, message: "PO note saved successfully." });
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

module.exports.deletePONote = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var invoice_id = requestObject.invoice_id;
            delete requestObject.invoice_id;
            var id = requestObject._id;
            delete requestObject._id;
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id), "po_notes._id": id }, { $set: { "po_notes.$.updated_by": decodedToken.UserData._id, "po_notes.$.updated_at": Math.round(new Date().getTime() / 1000), "po_notes.$.is_delete": 1 } });
            let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
            if (update_invoice) {
                requestObject.invoice_id = invoice_id;
                addchangeInvoice_History("Delete PO Note", requestObject, decodedToken, requestObject.updated_at);
                recentActivity.saveRecentActivity({
                    user_id: decodedToken.UserData._id,
                    username: decodedToken.UserData.userfullname,
                    userpicture: decodedToken.UserData.userpicture,
                    data_id: invoice_id,
                    title: `Invoice #${get_invoice.invoice}`,
                    module: 'PO',
                    action: 'Delete Note in',
                    action_from: 'Mobile',
                }, decodedToken);
                res.send({ status: true, message: "PO note deleted successfully.", data: update_invoice });
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

module.exports.savePOAttachment = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(requestObject._id) });
            let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
            if (update_invoice) {
                requestObject.invoice_id = requestObject._id;
                addchangeInvoice_History("Update PO Attachment", requestObject, decodedToken, requestObject.updated_at);
                recentActivity.saveRecentActivity({
                    user_id: decodedToken.UserData._id,
                    username: decodedToken.UserData.userfullname,
                    userpicture: decodedToken.UserData.userpicture,
                    data_id: requestObject._id,
                    title: `Invoice #${get_invoice.invoice}`,
                    module: 'PO',
                    action: 'Update Attachment in',
                    action_from: 'Mobile',
                }, decodedToken);
                res.send({ status: true, message: "PO attachment updated successfully..", data: update_invoice });
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


module.exports.saveQuoteNotes = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var invoice_id = requestObject.invoice_id;
            delete requestObject.invoice_id;
            var id = requestObject._id;
            delete requestObject._id;
            if (id) {
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id), "quote_notes._id": id }, { $set: { "quote_notes.$.updated_by": decodedToken.UserData._id, "quote_notes.$.updated_at": Math.round(new Date().getTime() / 1000), "quote_notes.$.notes": requestObject.notes } });
                let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
                if (update_invoice) {
                    requestObject.invoice_id = invoice_id;
                    addchangeInvoice_History("Update Quote Note", requestObject, decodedToken, requestObject.updated_at);
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: invoice_id,
                        title: `Invoice #${get_invoice.invoice}`,
                        module: 'Quote',
                        action: 'Update Note in',
                        action_from: 'Mobile',
                    }, decodedToken);
                    res.send({ status: true, message: "Quote note updated successfully.", data: update_invoice });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                //save invoice note
                requestObject.created_by = decodedToken.UserData._id;
                requestObject.created_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let save_invoice_note = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id) }, { $push: { quote_notes: requestObject } });
                let one_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
                if (save_invoice_note) {
                    requestObject.invoice_id = invoice_id;
                    addchangeInvoice_History("Insert Quote Note", requestObject, decodedToken, requestObject.updated_at);
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: invoice_id,
                        title: `Invoice #${one_invoice.invoice}`,
                        module: 'Quote',
                        action: 'Insert Note in',
                        action_from: 'Mobile',
                    }, decodedToken);
                    res.send({ status: true, message: "Quote note saved successfully." });
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

module.exports.deleteQuoteNote = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var invoice_id = requestObject.invoice_id;
            delete requestObject.invoice_id;
            var id = requestObject._id;
            delete requestObject._id;
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id), "quote_notes._id": id }, { $set: { "quote_notes.$.updated_by": decodedToken.UserData._id, "quote_notes.$.updated_at": Math.round(new Date().getTime() / 1000), "quote_notes.$.is_delete": 1 } });
            let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
            if (update_invoice) {
                requestObject.invoice_id = invoice_id;
                addchangeInvoice_History("Delete Quote Note", requestObject, decodedToken, requestObject.updated_at);
                recentActivity.saveRecentActivity({
                    user_id: decodedToken.UserData._id,
                    username: decodedToken.UserData.userfullname,
                    userpicture: decodedToken.UserData.userpicture,
                    data_id: invoice_id,
                    title: `Invoice #${get_invoice.invoice}`,
                    module: 'Quote',
                    action: 'Delete Note in',
                    action_from: 'Mobile',
                }, decodedToken);
                res.send({ status: true, message: "Quote note deleted successfully.", data: update_invoice });
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

module.exports.saveQuoteAttachment = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(requestObject._id) });
            let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
            if (update_invoice) {
                requestObject.invoice_id = requestObject._id;
                addchangeInvoice_History("Update Quote Attachment", requestObject, decodedToken, requestObject.updated_at);
                recentActivity.saveRecentActivity({
                    user_id: decodedToken.UserData._id,
                    username: decodedToken.UserData.userfullname,
                    userpicture: decodedToken.UserData.userpicture,
                    data_id: requestObject._id,
                    title: `Invoice #${get_invoice.invoice}`,
                    module: 'Quote',
                    action: 'Update Attachment in',
                    action_from: 'Mobile',
                }, decodedToken);
                res.send({ status: true, message: "Quote attachment updated successfully..", data: update_invoice });
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