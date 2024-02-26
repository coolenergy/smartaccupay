var invoiceMessageSchema = require('./../../../../../model/invoice_message');
var invoiceMessageSeenSchema = require('./../../../../../model/invoice_message_seen');
let db_connection = require('./../../../../../controller/common/connectiondb');
let common = require('./../../../../../controller/common/common');
let collectionConstant = require('./../../../../../config/collectionConstant');
var userSchema = require('./../../../../../model/user');
const mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var formidable = require('formidable');
var fs = require('fs');
var bucketOpration = require('../../../../../controller/common/s3-wasabi');
var config = require('./../../../../../config/config');
let rest_Api = require('./../../../../../config/db_rest_api');
let sendEmail = require('./../../../../../controller/common/sendEmail');
var handlebars = require('handlebars');
// let supplierAlertController = require('./../supplier_alert/supplierAlertController');

module.exports.getInvoiceMessageCount = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let invoiceMessageCollection = connection_db_api.model(collectionConstant.INVOICE_MESSAGE, invoiceMessageSchema);
            let invoiceMessageSeenCollection = connection_db_api.model(collectionConstant.INVOICE_MESSAGE_SEEN, invoiceMessageSeenSchema);
            let get_data = await invoiceMessageCollection.find({
                /* $or: [
                    { sender_id: ObjectID(decodedToken.UserData._id) },
                    { receiver_id: ObjectID(decodedToken.UserData._id) },
                ], */
                participants: ObjectID(decodedToken.UserData._id),
                is_delete: 0,
                is_first: true
            });
            let unseenCount = 0;
            for (let i = 0; i < get_data.length; i++) {
                unseenCount += await invoiceMessageSeenCollection.find({ invoice_message_id: get_data[i]._id, user_id: ObjectID(decodedToken.UserData._id), is_seen: false, is_delete: 0 }).countDocuments();
                /* if (get_data[i].receiver_id.toString() == decodedToken.UserData._id) {
                   if (!get_data[i].is_seen) {
                       unseenCount++;
                   }
               }
               let get_messages = await invoiceMessageCollection.find({
                   receiver_id: ObjectID(decodedToken.UserData._id),
                   invoice_message_id: ObjectID(get_data[i]._id),
                   is_seen: false,

               });
               unseenCount += get_messages.length; */
            }
            res.send({ message: translator.getStr('INVOICE_MESSAGE_LISTING'), unseen: unseenCount, status: true });
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

module.exports.getInvoiceMessageForTable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let invoiceMessageCollection = connection_db_api.model(collectionConstant.INVOICE_MESSAGE, invoiceMessageSchema);
            let userCollection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            let get_data = await invoiceMessageCollection.aggregate([
                {
                    $match: {
                        /* $or: [
                            { sender_id: ObjectID(decodedToken.UserData._id) },
                            { receiver_id: ObjectID(decodedToken.UserData._id) },
                        ], */
                        participants: ObjectID(decodedToken.UserData._id),
                        is_delete: 0,
                        is_first: true
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.AP_INVOICE,
                        let: { id: "$invoice_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$_id", "$$id"] },
                                        ]
                                    }
                                },
                            },
                            {
                                $lookup: {
                                    from: collectionConstant.INVOICE_VENDOR,
                                    localField: "vendor",
                                    foreignField: "_id",
                                    as: "vendor"
                                }
                            },
                            { $unwind: "$vendor" },
                        ],
                        as: "invoice"
                    }
                },
                { $unwind: "$invoice" },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "sender_id",
                        foreignField: "_id",
                        as: "sender"
                    }
                },
                { $unwind: "$sender" },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "receiver_id",
                        foreignField: "_id",
                        as: "receiver"
                    }
                },
                { $unwind: "$receiver" },
                { $sort: { created_at: -1 } }
            ]);
            for (let i = 0; i < get_data.length; i++) {
                console.log("get_data[i]._id", get_data[i]._id);
                let last_messages = await invoiceMessageCollection.findOne({
                    $or: [
                        { _id: ObjectID(get_data[i]._id) },
                        { invoice_message_id: ObjectID(get_data[i]._id) },
                    ]
                }).sort({ created_at: -1 });
                if (last_messages) {
                    get_data[i].last_message = last_messages;
                } else {
                    get_data[i].last_message = get_data[i];
                }
                if (get_data[i].last_message.message[0] == '@') {
                    let endIndex = 25;
                    // let mentionId = get_data[i].last_message.substring(index, endIndex).toString().trim();
                    // let one_user = await getUser(userCollection, mentionId);
                    get_data[i].last_message.message = get_data[i].last_message.message.substring(endIndex);
                }
                get_data[i].last_message_sender = await getUser(userCollection, get_data[i].last_message.sender_id);
            }
            res.json(get_data);
        } catch (e) {
            console.log(e);
            res.send([]);
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send([]);
    }
};

module.exports.getOneInvoiceMessage = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let invoiceMessageCollection = connection_db_api.model(collectionConstant.INVOICE_MESSAGE, invoiceMessageSchema);
            let userCollection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            let get_data = await invoiceMessageCollection.aggregate([
                { $match: { invoice_id: ObjectID(requestObject.invoice_id) } },
                {
                    $lookup: {
                        from: collectionConstant.AP_INVOICE,
                        let: { id: "$invoice_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$_id", "$$id"] },
                                        ]
                                    }
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
                            { $unwind: "$vendor_data" },
                        ],
                        as: "invoice"
                    }
                },
                { $unwind: "$invoice" },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "sender_id",
                        foreignField: "_id",
                        as: "sender"
                    }
                },
                { $unwind: "$sender" },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "receiver_id",
                        foreignField: "_id",
                        as: "receiver"
                    }
                },
                { $unwind: "$receiver" },
            ]);
            if (get_data) {
                if (get_data.length > 0) {
                    get_data = get_data[0];
                }
                let get_messages = await invoiceMessageCollection.aggregate([
                    {
                        $match: {
                            is_delete: 0,
                            $or: [
                                { invoice_id: ObjectID(requestObject.invoice_id) },
                                // { invoice_message_id: ObjectID(requestObject._id) },
                            ]
                        }
                    },
                    {
                        $lookup: {
                            from: collectionConstant.INVOICE_USER,
                            localField: "sender_id",
                            foreignField: "_id",
                            as: "sender"
                        }
                    },
                    { $unwind: "$sender" },
                    { $sort: { created_at: 1 } },
                ]);
                for (let i = 0; i < get_messages.length; i++) {
                    if (get_messages[i].message[0] == '@') {
                        let index = 1, endIndex = 25;
                        let mentionId = get_messages[i].message.substring(index, endIndex).toString().trim();
                        let one_user = await getUser(userCollection, mentionId);
                        get_messages[i].message = `@${one_user.userfullname}${get_messages[i].message.substring(endIndex)}`;
                    }
                }
                res.send({ message: translator.getStr('INVOICE_MESSAGE_LISTING'), data: get_data, messages: get_messages, status: true });
            } else {
                res.send({ message: translator.getStr('NoDataWithId'), status: false });
            }
        } catch (e) {
            console.log("e", e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

function getUser(collection, id) {
    return new Promise(async function (resolve, reject) {
        let one_user = await collection.findOne({ _id: ObjectID(id) });
        resolve(one_user);
    });
}

module.exports.sendInvoiceMessage = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let invoiceMessageCollection = connection_db_api.model(collectionConstant.INVOICE_MESSAGE, invoiceMessageSchema);
            let invoiceMessageSeenCollection = connection_db_api.model(collectionConstant.INVOICE_MESSAGE_SEEN, invoiceMessageSeenSchema);
            let userCollection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            let reqObject = [];
            for (let i = 0; i < requestObject.users.length; i++) {
                let obj = {
                    invoice_id: requestObject.invoice_id,
                    sender_id: decodedToken.UserData._id,
                    receiver_id: requestObject.users[i],
                    message: requestObject.message,
                    created_at: Math.round(new Date().getTime() / 1000),
                    is_first: requestObject.is_first,
                    is_attachment: requestObject.is_attachment == undefined || requestObject.is_attachment == undefined ? false : requestObject.is_attachment,
                    invoice_message_id: requestObject.invoice_message_id,
                    mention_user: requestObject.mention_user,
                    participants: []
                };
                if (obj.is_first) {
                    obj.participants.push(decodedToken.UserData._id);
                    obj.participants.push(requestObject.users[i]);
                }
                if (obj.invoice_message_id == undefined || obj.invoice_message_id == null) {
                    obj.invoice_message_id = '';
                }
                reqObject.push(obj);
            }
            let save_invoice_message = await invoiceMessageCollection.insertMany(reqObject);
            if (save_invoice_message) {
                var ids = [];
                for (let i = 0; i < save_invoice_message.length; i++) {
                    ids.push(ObjectID(save_invoice_message[i]._id));

                    let seenObject = [];
                    for (let j = 0; j < save_invoice_message[i].participants.length; j++) {
                        seenObject.push({
                            invoice_message_id: save_invoice_message[i]._id,
                            user_id: save_invoice_message[i].participants[j],
                            is_seen: save_invoice_message[i].participants[j] == decodedToken.UserData._id,
                            seen_at: 0,
                            created_at: Math.round(new Date().getTime() / 1000),
                        });
                    }
                    let save_seen_obj = await invoiceMessageSeenCollection.insertMany(seenObject);
                }
                let get_message = await invoiceMessageCollection.aggregate([
                    { $match: { _id: { $in: ids } } },
                    {
                        $lookup: {
                            from: collectionConstant.INVOICE_USER,
                            localField: "sender_id",
                            foreignField: "_id",
                            as: "sender"
                        }
                    },
                    { $unwind: "$sender" },
                    { $sort: { created_at: 1 } },
                ]);
                if (get_message.length > 0) {
                    get_message = get_message[0];
                }
                if (get_message) {
                    if (get_message.message[0] == '@') {
                        let index = 1, endIndex = 25;
                        let mentionId = get_message.message.substring(index, endIndex).toString().trim();
                        let one_user = await userCollection.findOne({ _id: ObjectID(mentionId) });
                        get_message.message = `@${one_user.userfullname}${get_message.message.substring(endIndex)}`;
                        await invoiceMessageCollection.updateMany({ invoice_id: requestObject.invoice_id, is_first: true }, { $push: { participants: ObjectID(mentionId) } });
                    }
                }
                res.send({ message: translator.getStr('INVOICE_MESSAGE_SEND'), data: get_message, status: true });
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
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.updateInvoiceMessageSeenFlag = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let invoiceMessageCollection = connection_db_api.model(collectionConstant.INVOICE_MESSAGE, invoiceMessageSchema);
            let invoiceMessageSeenCollection = connection_db_api.model(collectionConstant.INVOICE_MESSAGE_SEEN, invoiceMessageSeenSchema);
            let get_data = await invoiceMessageCollection.find({
                participants: ObjectID(decodedToken.UserData._id),
                is_delete: 0,
                is_first: true
            });
            for (let i = 0; i < get_data.length; i++) {
                let updateObject = {
                    is_seen: true,
                    seen_at: Math.round(new Date().getTime() / 1000),
                };
                await invoiceMessageSeenCollection.updateMany({ invoice_message_id: get_data[i]._id, user_id: ObjectID(decodedToken.UserData._id), is_seen: false }, updateObject);
            }
            res.send({ message: 'Flag updated successfully.', status: true });
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

module.exports.deleteInvoiceMessage = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let invoiceMessageCollection = connection_db_api.model(collectionConstant.INVOICE_MESSAGE, invoiceMessageSchema);
            let deleteMessage = await invoiceMessageCollection.updateOne({ _id: ObjectID(requestObject._id) }, { is_delete: 1 });
            if (deleteMessage) {
                res.send({ message: translator.getStr('INVOICE_MESSAGE_DELETED'), status: true });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
            }
        } catch (e) {
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};