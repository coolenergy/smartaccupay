var apPOSchema = require('./../../../../../model/ap_pos');
var apQuoteSchema = require('./../../../../../model/ap_quotes');
var apPackingSlipSchema = require('./../../../../../model/ap_packagingslips');
var apReceivingSlipSchema = require('./../../../../../model/ap_receivingslips');
var apOtherDocumentSchema = require('./../../../../../model/ap_other_documents');
let db_connection = require('./../../../../../controller/common/connectiondb');
let collectionConstant = require('./../../../../../config/collectionConstant');
let common = require('./../../../../../controller/common/common');
var ObjectID = require('mongodb').ObjectID;
var apInvoiceController = require('./../ap_invoice/apInvoiceController');
let config = require('./../../../../../config/config');

module.exports.getAPReceivingSlip = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var apReceivingSlipConnection = connection_db_api.model(collectionConstant.AP_RECEIVING_SLIP, apReceivingSlipSchema);
            var get_data = await apReceivingSlipConnection.find({ is_delete: 0 });
            res.send({ status: true, message: "Receiving Slip Listing", data: get_data });
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

module.exports.getOrphanAPReceivingSlip = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var apReceivingSlipConnection = connection_db_api.model(collectionConstant.AP_RECEIVING_SLIP, apReceivingSlipSchema);

            let start = parseInt(requestObject.start);
            var perpage = parseInt(requestObject.length);

            var columnName = (requestObject.sort != undefined && requestObject.sort != '') ? requestObject.sort.field : '';
            var columnOrder = (requestObject.sort != undefined && requestObject.sort != '') ? requestObject.sort.order : '';
            var sort = {};
            sort[columnName] = (columnOrder == 'asc') ? 1 : -1;

            let match = { is_delete: 0, is_orphan: true };
            var query = {
                $or: [
                    { "document_type": new RegExp(requestObject.search, 'i') },
                    { "po_no": new RegExp(requestObject.search, 'i') },
                    { "invoice_no": new RegExp(requestObject.search, 'i') },
                    { "vendor_name": new RegExp(requestObject.search, 'i') },
                    { "userfullname": new RegExp(requestObject.search, 'i') },
                ]
            };

            var get_data = await apReceivingSlipConnection.aggregate([
                { $match: match },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "updated_by",
                        foreignField: "_id",
                        as: "updated_by"
                    }
                },
                { $unwind: "$updated_by" },
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
                    $project: {
                        invoice_id: 1,
                        pdf_url: 1,
                        document_id: 1,
                        document_type: 1,
                        date_epoch: 1,
                        invoice_no: 1,
                        po_no: 1,
                        ship_to_address: 1,
                        vendor: 1,
                        received_by: 1,
                        is_delete: 1,
                        is_orphan: 1,
                        created_by: 1,
                        created_at: 1,
                        updated_by: 1,
                        updated_at: 1,

                        vendor_name: "$vendor_data.vendor_name",
                        userfullname: "$updated_by.userfullname",
                    }
                },
                { $sort: sort },
                { $match: query },
                { $limit: perpage + start },
                { $skip: start },
            ]).collation({ locale: "en_US" });
            let total_count = await apReceivingSlipConnection.find(match).countDocuments();
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

module.exports.getOneAPReceivingSlip = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var apReceivingSlipConnection = connection_db_api.model(collectionConstant.AP_RECEIVING_SLIP, apReceivingSlipSchema);
            var get_data = await apReceivingSlipConnection.aggregate([
                { $match: { _id: ObjectID(requestObject._id) } },
                {
                    $lookup: {
                        from: collectionConstant.AP_INVOICE,
                        localField: "invoice_id",
                        foreignField: "_id",
                        as: "invoice"
                    }
                },
                {
                    $unwind: {
                        path: "$invoice",
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
            ]);
            if (get_data) {
                if (get_data.length > 0) {
                    get_data = get_data[0];
                }
                res.send({ status: true, message: "Receiving Slip Listing", data: get_data });
            } else {
                res.send({ message: translator.getStr('NoDataWithId'), status: false });
            }
            // var get_data = await apReceivingSlipConnection.findOne({ _id: ObjectID(requestObject._id) });
            // res.send({ status: true, message: "Receiving Slip Listing", data: get_data });
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

module.exports.saveAPReceivingSlip = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    var local_offset = Number(req.headers.local_offset);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var apPOConnection = connection_db_api.model(collectionConstant.AP_PO, apPOSchema);
            var apQuoteConnection = connection_db_api.model(collectionConstant.AP_QUOUTE, apQuoteSchema);
            var apPackingSlipConnection = connection_db_api.model(collectionConstant.AP_PACKING_SLIP, apPackingSlipSchema);
            var apReceivingSlipConnection = connection_db_api.model(collectionConstant.AP_RECEIVING_SLIP, apReceivingSlipSchema);

            var id = requestObject._id;
            delete requestObject._id;
            if (id) {
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_by = decodedToken.UserData._id;
                let update_ap_receiving_slip = await apReceivingSlipConnection.updateOne({ _id: ObjectID(id) }, requestObject);
                if (update_ap_receiving_slip) {
                    let get_one = await apReceivingSlipConnection.findOne({ _id: ObjectID(id) });
                    apInvoiceController.sendInvoiceUpdateAlerts(decodedToken, get_one._id, get_one.invoice_id, config.DOCUMENT_TYPES.receivingSlip.name, translator);
                    res.send({ status: true, message: "Receiving Slip updated successfully.", data: update_ap_receiving_slip });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                requestObject.created_at = Math.round(new Date().getTime() / 1000);
                requestObject.created_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_by = decodedToken.UserData._id;
                let add_ap_receiving_slip = new apReceivingSlipConnection(requestObject);
                let save_ap_receiving_slip = await add_ap_receiving_slip.save();
                if (save_ap_receiving_slip) {
                    if (requestObject.old_id) {
                        if (requestObject.old_type == config.DOCUMENT_TYPES.po.key) {
                            await apPOConnection.updateOne({ _id: ObjectID(requestObject.old_id) }, { is_delete: 1 });
                        } else if (requestObject.old_type == config.DOCUMENT_TYPES.quote.key) {
                            await apQuoteConnection.updateOne({ _id: ObjectID(requestObject.old_id) }, { is_delete: 1 });
                        } else if (requestObject.old_type == config.DOCUMENT_TYPES.packingSlip.key) {
                            await apPackingSlipConnection.updateOne({ _id: ObjectID(requestObject.old_id) }, { is_delete: 1 });
                        }
                    }
                    if (save_ap_receiving_slip.invoice_id != null && save_ap_receiving_slip.invoice_id != undefined && save_ap_receiving_slip.invoice_id != '') {
                        apInvoiceController.sendInvoiceUpdateAlerts(decodedToken, save_ap_receiving_slip._id, save_ap_receiving_slip.invoice_id, config.DOCUMENT_TYPES.receivingSlip.name, translator);
                    }
                    res.send({ status: true, message: "Receiving Slip added successfully.", data: save_ap_receiving_slip });
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

module.exports.saveAPOtherDocumentReceivingSlip = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    var local_offset = Number(req.headers.local_offset);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var apReceivingSlipConnection = connection_db_api.model(collectionConstant.AP_RECEIVING_SLIP, apReceivingSlipSchema);
            var apOtherDocumentConnection = connection_db_api.model(collectionConstant.AP_OTHER_DOCUMENT, apOtherDocumentSchema);
            var documentId = requestObject.document_id;
            delete requestObject.document_id;

            requestObject.is_orphan = true;
            requestObject.created_at = Math.round(new Date().getTime() / 1000);
            requestObject.created_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            requestObject.updated_by = decodedToken.UserData._id;
            let add_ap_receiving_slip = new apReceivingSlipConnection(requestObject);
            let save_ap_receiving_slip = await add_ap_receiving_slip.save();
            if (save_ap_receiving_slip) {
                await apOtherDocumentConnection.updateOne({ _id: ObjectID(documentId) }, { is_delete: 1 });
                res.send({ status: true, message: "Receiving Slip added successfully.", data: save_ap_receiving_slip });
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

module.exports.deleteAPReceivingSlip = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    var local_offset = Number(req.headers.local_offset);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var apReceivingSlipConnection = connection_db_api.model(collectionConstant.AP_RECEIVING_SLIP, apReceivingSlipSchema);
            var id = requestObject._id;
            delete requestObject._id;

            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            requestObject.updated_by = decodedToken.UserData._id;
            let update_ap_receiving_slip = await apReceivingSlipConnection.updateOne({ _id: ObjectID(id) }, requestObject);
            if (update_ap_receiving_slip) {
                res.send({ status: true, message: "Receiving Slip deleted successfully.", data: update_ap_receiving_slip });
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