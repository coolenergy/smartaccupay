var apInvoiceSchema = require('./../../../../../model/ap_invoices');
var apDuplicateDocumentSchema = require('./../../../../../model/ap_duplicate_documents');
var clientJobSchema = require('./../../../../../model/client');
let db_connection = require('./../../../../../controller/common/connectiondb');
let collectionConstant = require('./../../../../../config/collectionConstant');
let common = require('./../../../../../controller/common/common');
var ObjectID = require('mongodb').ObjectID;
var moment = require('moment');
const _ = require("lodash");

//get dashboard count
module.exports.getDashboardCount = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let connection_db_api = await db_connection.connection_db_api(decodedToken);
            var apInvoiceConnection = connection_db_api.model(collectionConstant.AP_INVOICE, apInvoiceSchema);
            var apDuplicateDocumentConnection = connection_db_api.model(collectionConstant.AP_DUPLICATE_DOCUMENT, apDuplicateDocumentSchema);
            var get_data = await apInvoiceConnection.aggregate([
                { $match: { is_delete: 0 } },
                {
                    $project: {
                        pending: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] },
                        approved: { $cond: [{ $eq: ["$status", "Approved"] }, 1, 0] },
                        rejected: { $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0] },
                        late: { $cond: [{ $eq: ["$status", "Late"] }, 1, 0] },
                        on_hold: { $cond: [{ $eq: ["$status", "On Hold"] }, 1, 0] },
                        overdue: { $cond: [{ $eq: ["$status", "Overdue"] }, 1, 0] },
                    }
                },
                {
                    $group: {
                        _id: null,
                        pending_invoices: { $sum: "$pending" },
                        approved_invoices: { $sum: "$approved" },
                        rejected_invoices: { $sum: "$rejected" },
                        late_invoices: { $sum: "$late" },
                        on_hold: { $sum: "$on_hold" },
                        overdue: { $sum: "$overdue" },
                    }
                },
            ]);
            if (get_data) {
                if (get_data.length > 0) {
                    get_data = get_data[0];
                    get_data.duplicates = await apDuplicateDocumentConnection.find({ status: 'Pending', is_delete: 0 }).countDocuments();
                } else {
                    get_data = { pending_invoices: 0, approved_invoices: 0, rejected_invoices: 0, late_invoices: 0, on_hold: 0, overdue: 0, duplicates: 0 };
                }
                res.send({ status: true, message: "Invoice data", data: get_data });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
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

//panding invoice
module.exports.dashboardInvoiceList = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var apInvoiceConnection = connection_db_api.model(collectionConstant.AP_INVOICE, apInvoiceSchema);
            var pending_data = await apInvoiceConnection.aggregate([
                { $match: { is_delete: 0, status: 'Pending' } },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_VENDOR,
                        localField: "vendor",
                        foreignField: "_id",
                        as: "vendor_data"
                    }
                },
                { $unwind: "$vendor_data" },
                { $sort: { created_at: -1 } },
                { $limit: 2 }
            ]);
            // var process_data = await apInvoiceConnection.find({ is_delete: 0, status: 'Generated' }).sort({ created_at: -1 }).limit(2);
            var cancel_data = await apInvoiceConnection.aggregate([
                { $match: { is_delete: 0, status: 'Rejected' } },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_VENDOR,
                        localField: "vendor",
                        foreignField: "_id",
                        as: "vendor_data"
                    }
                },
                { $unwind: "$vendor_data" },
                { $sort: { created_at: -1 } },
                { $limit: 2 }
            ]);
            let data = {
                pending_invoices: pending_data,
                process_invoices: [],
                cancelled_invoices: cancel_data,
            };
            res.send({ status: true, message: 'Invoice data', data });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {

        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

module.exports.getDashboardMonthlyInvoiceChart = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    let local_offset = Number(req.headers.local_offset);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let requestObject = req.body;
            let endOfMonth = moment().clone().endOf('month').unix();
            let epoch = [];
            epoch.push(endOfMonth);
            let currentEpoch = moment().unix();
            let limit = requestObject.data_type == "top" ? 3 : 12;
            for (let i = 0; i < limit; i++) {
                let temp_date = moment(moment.unix(currentEpoch)).startOf('month');
                epoch.push(temp_date.unix());
                currentEpoch = moment(moment.unix(currentEpoch)).subtract(1, 'M').unix();
            }
            epoch = _.reverse(epoch);
            var invoicesConnection = connection_db_api.model(collectionConstant.AP_INVOICE, apInvoiceSchema);
            let get_invoice = await invoicesConnection.aggregate([
                {
                    $match: {
                        is_delete: 0,
                    }
                },
                {
                    $bucket: {
                        groupBy: "$invoice_date_epoch",
                        boundaries: epoch,
                        default: "Other",
                        output: {
                            data: {
                                $push: {
                                    status: "$status",
                                }
                            }
                        }
                    }
                },
            ]);

            epoch = epoch.slice(0, -1);
            let month = [];
            let pendingList = [];
            let approvedList = [];
            let rejectedList = [];
            epoch.forEach((date) => {
                let found = _.find(get_invoice, ['_id', date]);
                if (found) {
                    let pending = _.filter(found.data, function (o) { return o.status == 'Pending'; });
                    let approved = _.filter(found.data, function (o) { return o.status == 'Approved'; });
                    let rejected = _.filter(found.data, function (o) { return o.status == 'Rejected'; });
                    pendingList.push(pending.length);
                    approvedList.push(approved.length);
                    rejectedList.push(rejected.length);
                    month.push(common.FULL_MONTH(date + local_offset));
                } else {
                    pendingList.push(0);
                    approvedList.push(0);
                    rejectedList.push(0);
                    month.push(common.FULL_MONTH(date + local_offset));
                }
            });
            let data = [
                {
                    status: 'Pending Invoice',
                    data: pendingList
                },
                {
                    status: 'Approved Invoice',
                    data: approvedList
                },
                {
                    status: 'Rejected Invoice',
                    data: rejectedList
                },
            ];
            res.send({ month, data, status: true });
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

module.exports.getDashboardMonthlyHistoryChart = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    let local_offset = Number(req.headers.local_offset);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let requestObject = req.body;
            let endOfMonth = moment().clone().endOf('month').unix();
            let epoch = [];
            epoch.push(endOfMonth);
            let currentEpoch = moment().unix();
            let limit = requestObject.data_type == "top" ? 3 : 12;
            for (let i = 0; i < limit; i++) {
                let temp_date = moment(moment.unix(currentEpoch)).startOf('month');
                epoch.push(temp_date.unix());
                currentEpoch = moment(moment.unix(currentEpoch)).subtract(1, 'M').unix();
            }
            epoch = _.reverse(epoch);
            var invoicesConnection = connection_db_api.model(collectionConstant.AP_INVOICE, apInvoiceSchema);
            let get_invoice = await invoicesConnection.aggregate([
                {
                    $match: {
                        is_delete: 0,
                    }
                },
                {
                    $bucket: {
                        groupBy: "$invoice_date_epoch",
                        boundaries: epoch,
                        default: "Other",
                        output: {
                            data: {
                                $push: {
                                    invoice_total_amount: "$invoice_total_amount",
                                    status: "$status",
                                }
                            }
                        }
                    }
                },
            ]);

            epoch = epoch.slice(0, -1);
            let month = [];
            let pendingList = [];
            let approvedList = [];
            let rejectedList = [];
            epoch.forEach((date) => {
                let found = _.find(get_invoice, ['_id', date]);
                if (found) {
                    let pending = _.filter(found.data, function (o) { return o.status == 'Pending'; });
                    let approved = _.filter(found.data, function (o) { return o.status == 'Approved'; });
                    let rejected = _.filter(found.data, function (o) { return o.status == 'Rejected'; });

                    pendingList.push(_.sumBy(pending, 'invoice_total_amount'));
                    approvedList.push(_.sumBy(approved, 'invoice_total_amount'));
                    rejectedList.push(_.sumBy(rejected, 'invoice_total_amount'));
                    month.push(common.FULL_MONTH(date + local_offset));
                } else {
                    pendingList.push(0);
                    approvedList.push(0);
                    rejectedList.push(0);
                    month.push(common.FULL_MONTH(date + local_offset));
                }
            });
            let data = [
                {
                    status: 'Pending Invoice',
                    data: pendingList
                },
                {
                    status: 'Approved Invoice',
                    data: approvedList
                },
                {
                    status: 'Rejected Invoice',
                    data: rejectedList
                },
            ];
            res.send({ get_invoice, month, data, status: true });
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

module.exports.getDuplicateDocumentsForTable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let connection_db_api = await db_connection.connection_db_api(decodedToken);
            var apDuplicateDocumentConnection = connection_db_api.model(collectionConstant.AP_DUPLICATE_DOCUMENT, apDuplicateDocumentSchema);
            var get_data = await apDuplicateDocumentConnection.aggregate([
                { $match: { status: 'Pending', is_delete: 0 } },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_VENDOR,
                        localField: "vendor",
                        foreignField: "_id",
                        as: "vendor_data"
                    }
                },
                { $unwind: "$vendor_data" },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "created_by",
                        foreignField: "_id",
                        as: "created_by"
                    }
                },
                { $unwind: "$created_by" },
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
    }
    else {
        res.send([]);
    }
};

module.exports.getDashboardJobCost = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let connection_db_api = await db_connection.connection_db_api(decodedToken);
            var clientJobConnection = connection_db_api.model(collectionConstant.INVOICE_CLIENT, clientJobSchema);
            var get_data = await clientJobConnection.aggregate([
                { $match: { is_delete: 0 } },
                {
                    $lookup: {
                        from: collectionConstant.AP_INVOICE,
                        let: { id: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$job_client_name", "$$id"] },
                                        ]
                                    }
                                },
                            },
                        ],
                        as: "invoice"
                    }
                },
                {
                    $project: {
                        client_name: 1,
                        total: { $sum: "$invoice.invoice_total_amount" },
                    }
                },
                { $sort: { total: -1 } },
                { $limit: 10 },
            ]);
            if (get_data) {
                res.send({ message: 'Job Cost Listing', data: get_data, status: true });
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