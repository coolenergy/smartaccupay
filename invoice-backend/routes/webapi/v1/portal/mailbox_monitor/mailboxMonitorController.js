var mailboxMonitorSchema = require('../../../../../model/mailbox_monitor');
const mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var common = require("../../../../../controller/common/common");
let db_connection = require('../../../../../controller/common/connectiondb');
let collectionConstant = require('../../../../../config/collectionConstant');

module.exports.getAllMailboxMonitor = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let mailboxMonitorCollection = connection_db_api.model(collectionConstant.INVOICE_MAILBOX_MONITORS, mailboxMonitorSchema);
            let get_all = await mailboxMonitorCollection.find({ is_delete: 0 }, { email: 1, imap: 1, port: 1, time: 1, cron_time: 1, created_at: 1, created_by: 1, updated_at: 1, updated_by: 1, is_delete: 1 });
            res.send({ message: translator.getStr('MailboxMonitorListing'), data: get_all, status: true });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.getOneMailboxMonitor = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let mailboxMonitorCollection = connection_db_api.model(collectionConstant.INVOICE_MAILBOX_MONITORS, mailboxMonitorSchema);
            let get_all = await mailboxMonitorCollection.findOne({ _id: ObjectID(requestObject._id) }, { email: 1, imap: 1, port: 1, time: 1, cron_time: 1, created_at: 1, created_by: 1, updated_at: 1, updated_by: 1, is_delete: 1 });
            res.send({ message: translator.getStr('MailboxMonitorListing'), data: get_all, status: true });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.getMailboxMonitorDatatable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let mailboxMonitorCollection = connection_db_api.model(collectionConstant.INVOICE_MAILBOX_MONITORS, mailboxMonitorSchema);
            var col = [];
            match = { is_delete: 0, module: requestObject.module };
            col.push("email", "imap", "port", "time");
            var start = parseInt(req.body.start);
            var perpage = parseInt(req.body.length);
            var columnData = (req.body.order != undefined && req.body.order != '') ? req.body.order[0].column : '';
            var columntype = (req.body.order != undefined && req.body.order != '') ? req.body.order[0].dir : '';
            var sort = {};
            sort[col[columnData]] = (columntype == 'asc') ? 1 : -1;
            var query = {
                $or: [
                    { "email": new RegExp(req.body.search.value, 'i') },
                    { "imap": new RegExp(req.body.search.value, 'i') },
                    { "port": new RegExp(req.body.search.value, 'i') },
                    { "time": new RegExp(req.body.search.value, 'i') },
                ]
            };
            var aggregateQuery = [
                { $match: match },
                {
                    $project: {
                        email: 1,
                        imap: 1,
                        port: 1,
                        time: 1,
                        cron_time: 1,
                        created_at: 1,
                        created_by: 1,
                        updated_at: 1,
                        updated_by: 1,
                        is_delete: 1,
                    }
                },
                { $match: query },
                { $limit: perpage },
                { $skip: start },
                { $sort: sort },
            ];
            let count = 0;
            count = await mailboxMonitorCollection.countDocuments(match);
            let get_shift = await mailboxMonitorCollection.aggregate(aggregateQuery);
            var dataResponce = {};
            dataResponce.data = get_shift;
            dataResponce.draw = req.body.draw;
            dataResponce.recordsTotal = count;
            dataResponce.recordsFiltered = (req.body.search.value) ? get_shift.length : count;
            res.json(dataResponce);
        } catch (e) {
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.saveMailboxMonitor = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var id = requestObject._id;
            delete requestObject._id;
            let mailboxMonitorCollection = connection_db_api.model(collectionConstant.INVOICE_MAILBOX_MONITORS, mailboxMonitorSchema);
            if (id) {
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let update_mailbox_monitor = await mailboxMonitorCollection.updateOne({ _id: ObjectID(id) }, requestObject);
                if (update_mailbox_monitor) {
                    res.send({ message: translator.getStr('MailboxMonitorUpdated'), status: true });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                requestObject.created_by = decodedToken.UserData._id;
                requestObject.created_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let add_mailbox_monitor = new mailboxMonitorCollection(requestObject);
                let save_mailbox_monitor = await add_mailbox_monitor.save();
                if (save_mailbox_monitor) {
                    res.send({ message: translator.getStr('MailboxMonitorAdded'), status: true });
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
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.deleteMailboxMonitor = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var requestObject = req.body;


        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = {
                is_delete: requestObject.is_delete,
                updated_by: decodedToken.UserData._id,
                updated_at: Math.round(new Date().getTime() / 1000),
            };
            let mailboxMonitorCollection = connection_db_api.model(collectionConstant.INVOICE_MAILBOX_MONITORS, mailboxMonitorSchema);
            let deleteObject = await mailboxMonitorCollection.updateOne({ _id: ObjectID(req.body._id) }, requestObject);
            let isDelete = deleteObject.nModified;
            if (deleteObject) {
                if (isDelete == 0) {
                    res.send({ message: translator.getStr('NoDataWithId'), status: false });
                } else {
                    let message = '';
                    if (requestObject.is_delete == 0) {
                        message = 'MailboxMonitor restored successfully.';
                    } else {
                        message = 'MailboxMonitor archived successfully.';
                    }
                    res.send({ message, status: true });
                }
            } else {

                console.log(e);
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

//get Mailbox Monitor
module.exports.getMailboxMonitorForTable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let mailboxMonitorCollection = connection_db_api.model(collectionConstant.INVOICE_MAILBOX_MONITORS, mailboxMonitorSchema);
            match = { is_delete: requestObject.is_delete };
            var aggregateQuery = [
                { $match: match }
            ];
            let get_shift = await mailboxMonitorCollection.aggregate(aggregateQuery);
            res.send(get_shift);

        } catch (e) {
            res.send([]);
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};
