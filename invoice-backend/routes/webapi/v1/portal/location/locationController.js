var locationSchema = require('./../../../../../model/locations');
let db_connection = require('./../../../../../controller/common/connectiondb');
let common = require('./../../../../../controller/common/common');
let collectionConstant = require('./../../../../../config/collectionConstant');
var locationSchema = require('./../../../../../model/locations');
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

module.exports.getAllLocation = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let locationCollection = connection_db_api.model(collectionConstant.LOCATIONS, locationSchema);
            var col = [];
            userid = { is_delete: 0 };
            col.push("location_name", "location_full_address", "location_city", "location_state",
                "location_postcode", "location_country", "location_contact_name", "location_contact_number");
            var start = parseInt(req.body.start) || 0;
            var perpage = parseInt(req.body.length);

            var columnData = (req.body.order != undefined && req.body.order != '') ? req.body.order[0].column : '';
            var columntype = (req.body.order != undefined && req.body.order != '') ? req.body.order[0].dir : '';

            var sort = {};
            if (req.body.draw == 1) {
                sort = { "createdAt": -1 };
            } else {
                sort[col[columnData]] = (columntype == 'asc') ? 1 : -1;
            }
            let query = {};
            if (req.body.search.value) {
                query = {
                    $or: [{ "location_name": new RegExp(req.body.search.value, 'i') },
                    { "location_full_address": new RegExp(req.body.search.value, 'i') },
                    { "location_city": new RegExp(req.body.search.value, 'i') },
                    { "location_state": new RegExp(req.body.search.value, 'i') },
                    { "location_postcode": new RegExp(req.body.search.value, 'i') },
                    { "location_country": new RegExp(req.body.search.value, 'i') },
                    { "location_contact_name": new RegExp(req.body.search.value, 'i') },
                    { "location_contact_number": new RegExp(req.body.search.value, 'i') }
                    ]
                };
            }
            var aggregateQuery = [
                { $match: userid },
                { $match: query },
                { $sort: sort },
                { $limit: perpage + start },
                { $skip: start }
            ];
            let count = 0;
            count = await locationCollection.countDocuments(userid);
            let all_location = await locationCollection.aggregate(aggregateQuery);
            var dataResponce = {};
            dataResponce.data = all_location;
            dataResponce.draw = req.body.draw;
            dataResponce.recordsTotal = count;
            dataResponce.recordsFiltered = (req.body.search.value) ? all_location.length : count;
            res.json(dataResponce);
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

module.exports.saveLocation = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let locationCollection = connection_db_api.model(collectionConstant.LOCATIONS, locationSchema);
            // let attachmentCollection = connection_db_api.model(collectionConstant.ATTACHMENT, attachmentSchema);
            if (requestObject._id) {
                requestObject.note_updated_by = decodedToken.UserData._id;
                let update_location = await locationCollection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);

                let updated = update_location['n'];
                if (updated) {
                    if (requestObject.location_attachment != undefined) {
                        let attachmentObject = {};
                        attachmentObject.module_id = requestObject._id;
                        attachmentObject.attachment_module = "Location";
                        attachmentObject.attachment = requestObject.location_attachment;
                        attachmentObject.attachment_updated_by = decodedToken.UserData._id;
                        attachmentObject.attachment_updated_at = Math.round(new Date().getTime() / 1000);
                        //let update_attachment = await attachmentCollection.updateOne({ module_id: ObjectID(requestObject._id) }, attachmentObject);

                    }

                    if (requestObject.alert_team_members) {

                        await sendLocationUpdateMail(requestObject, decodedToken, translator);
                    }
                    requestObject.updated_id = requestObject._id;
                    delete requestObject["_id"];
                    addLocationsHistory("Update", requestObject, decodedToken);
                    // activityController.updateAllUser({ "api_setting.location": true }, decodedToken);
                    res.send({ message: translator.getStr('LocationUpdated'), data: update_location, status: true });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                requestObject.location_created_by = decodedToken.UserData._id;
                requestObject.location_updated_by = decodedToken.UserData._id;
                let add_location = new locationCollection(requestObject);
                let save_location = await add_location.save();
                if (save_location) {
                    if (requestObject.location_attachment != undefined) {
                        let attachmentObject = {};
                        attachmentObject.module_id = save_location['_id'];
                        attachmentObject.attachment_module = "Location";
                        attachmentObject.attachment = requestObject.location_attachment;
                        attachmentObject.attachment_created_by = decodedToken.UserData._id;
                        attachmentObject.attachment_created_at = Math.round(new Date().getTime() / 1000);
                        attachmentObject.attachment_updated_by = decodedToken.UserData._id;
                        attachmentObject.attachment_updated_at = Math.round(new Date().getTime() / 1000);
                        // let add_attachment = new attachmentCollection(attachmentObject);
                        // let save_attachment = await add_attachment.save();

                    }
                    requestObject.inserted_id = save_location._id;
                    addLocationsHistory("Insert", requestObject, decodedToken);
                    // activityController.updateAllUser({ "api_setting.location": true }, decodedToken);
                    res.send({ message: translator.getStr('LocationAdded'), data: save_location, status: true });
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

async function sendLocationUpdateMail(locationData, decodedToken, translator) {
    console.log("send mail and notification");
    let connection_db_api = await db_connection.connection_db_api(decodedToken);
    try {
        let userCollection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
        let all_user = await userCollection.find({ userlocation_id: ObjectID(locationData._id) }, { _id: 1, useremail: 1, userfirebase_token: 1, });
        let userEmailList = [];
        let firebaseTokenList = [];
        for (let i = 0; i < all_user.length; i++) {
            userEmailList.push(all_user[i]['useremail']);
            firebaseTokenList.push(all_user[i]['invoice_firebase_token']);
            let alertObject = {
                user_id: all_user[i]._id,
                module_name: 'Location',
                module_route: { _id: locationData._id },
                notification_title: 'Location Update',
                notification_description: `${locationData.location_name} assigned to you is updated.`,
            };
            // supplierAlertController.saveSupplierAlert(alertObject, connection_db_api);
        }
        // //Mobile Notification
        // let notification_data = {
        //     body: `${translator.getStr("Location_Alert_Assigned_To_You")} ${locationData.location_name} ${translator.getStr("Location_Alert_has_been_change")}`,
        //     title: translator.getStr('Location_Mail_Subject')
        // };
        // let temp_data = {
        //     "module": "Location",
        // };
        // await common.sendNotificationWithData(firebaseTokenList, notification_data, temp_data);

        // Mail
        if (userEmailList.length > 0) {
            var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
            let talnate_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_TENANTS, { companycode: decodedToken.companycode });
            let company_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: decodedToken.companycode });
            let emailTmp = {
                HELP: `${translator.getStr('EmailTemplateHelpEmailAt')} ${config.HELPEMAIL} ${translator.getStr('EmailTemplateCallSupportAt')} ${config.NUMBERPHONE}`,
                SUPPORT: `${translator.getStr('EmailTemplateEmail')} ${config.SUPPORTEMAIL} l ${translator.getStr('EmailTemplatePhone')} ${translator.getStr('EmailTemplatePhone')} ${config.NUMBERPHONE2}`,
                ALL_RIGHTS_RESERVED: `${translator.getStr('EmailTemplateAllRightsReserved')}`,
                THANKS: translator.getStr('EmailTemplateThanks'),
                ROVUK_TEAM: translator.getStr('EmailTemplateRovukTeam'),
                COPYRIGHTNAME: `${config.COPYRIGHTNAME}`,

                TITLE: translator.getStr("Location_Alert_TITLE"),
                LINE1: new handlebars.SafeString(`${translator.getStr("Location_Alert_Assigned_To_You")} <b>${locationData.old_location_name}</b> ${translator.getStr("Location_Alert_has_been_change")} <b>${locationData.location_name}</b> ${translator.getStr("Location_Alert_line1_last")}`),
                LINE2: translator.getStr("Location_Alert_Update_Info_Text"),
                LOCATION_CONTACT_NAME: new handlebars.SafeString(`<b>${translator.getStr('Location_contact_name')}  ${locationData.location_contact_name}</b>`),
                EMERGENCY_PHONE_NUMBER: new handlebars.SafeString(`<b>${translator.getStr('Location_contact_number')} ${locationData.location_contact_number}</b>`),
                LINE3: translator.getStr("new_address_location"),
                ADDRESS_LINE: new handlebars.SafeString(`<b>${locationData.location_street1},${locationData.location_city},${locationData.location_state},${locationData.location_postcode}</b>`),

                COMPANYNAME: `${translator.getStr('EmailCompanyName')} ${company_data.companyname}`,
                COMPANYCODE: `${translator.getStr('EmailCompanyCode')} ${company_data.companycode}`,

                // LOCATION_NAME: `${translator.getStr('Location_name')} : ${locationData.location_name}`,
                // STREET1: `${translator.getStr('Location_Street_1')} : ${locationData.location_street1}`,
                // STREET2: `${translator.getStr('Location_Street_2')} : ${locationData.location_street2}`,
                // CITY: `${translator.getStr('Location_City')} : ${locationData.location_city}`,
                // STATE: `${translator.getStr('Location_State')} : ${locationData.location_state}`,
                // POSTAL_CODE: `${translator.getStr('Location_Postal_Code')} : ${locationData.location_postcode}`,
                // COUNTRY: `${translator.getStr('Location_Country')} : ${locationData.location_country}`,
                // LATITUDE: `${translator.getStr('Location_Latitude')} : ${locationData.location_lat}`,
                // LONGITUDE: `${translator.getStr('Location_Longitude')} : ${locationData.location_lng}`,
            };
            const file_data = fs.readFileSync(config.EMAIL_TEMPLATE_PATH + '/controller/emailtemplates/locationAlert.html', 'utf8');
            var template = handlebars.compile(file_data);
            var HtmlData = await template(emailTmp);
            sendEmail.sendEmail_client(talnate_data.smartaccupay_tenants.tenant_smtp_username, userEmailList, translator.getStr('Location_Mail_Subject'), HtmlData,
                talnate_data.smartaccupay_tenants.tenant_smtp_server, talnate_data.smartaccupay_tenants.tenant_smtp_port, talnate_data.smartaccupay_tenants.tenant_smtp_reply_to_mail,
                talnate_data.smartaccupay_tenants.tenant_smtp_password, talnate_data.smartaccupay_tenants.tenant_smtp_timeout, talnate_data.smartaccupay_tenants.tenant_smtp_security);
        }
    } catch (e) {
        console.log(e);
    } finally {
        connection_db_api.close();
    }

}

module.exports.deleteLocation = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            // let scheduleCollection = connection_db_api.model(collectionConstant.SCHEDULES, scheduleSchema);
            // let scheduleObject = await scheduleCollection.find({ schedule_location_id: ObjectID(req.body._id) });
            // let timecardCollection = connection_db_api.model(collectionConstant.TIMECARDS, timecardSchema);
            // let timecardObject = await timecardCollection.find({ timecard_location_id: ObjectID(req.body._id) });
            // let usedMaterialCollection = connection_db_api.model(collectionConstant.PROJECTUSED_MATERIALS, usedMaterialSchema);
            // let usedMaterialObject = await usedMaterialCollection.find({ used_material_location_id: ObjectID(req.body._id) });
            // let extraMaterialCollection = connection_db_api.model(collectionConstant.PROJECTEXTRA_MATERIALS, extraMaterialSchema);
            // let extraMaterialObject = await extraMaterialCollection.find({ $or: [{ available_location_id: ObjectID(req.body._id) }, { transfer_location_id: ObjectID(req.body._id) }] });
            // let equipmentCollection = connection_db_api.model(collectionConstant.PROJECTEQUIPMENTS, equipmentSchema);
            // let equipmrntObject = await equipmentCollection.find({ $or: [{ equipment_location_id: ObjectID(req.body._id) }, { transfer_location_id: ObjectID(req.body._id) }] });
            // let poCollection = connection_db_api.model(collectionConstant.PROJECT_PO, poSchema);
            // let poObject = await poCollection.find({ po_ship_to: ObjectID(req.body._id) });
            // let taskCollection = connection_db_api.model(collectionConstant.PROJECTTASK, taskSchema);
            // let taskObject = await taskCollection.find({ task_location: ObjectID(req.body._id) });
            let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            let userObject = await userConnection.find({ userlocation_id: ObjectID(req.body._id) });
            if (userObject.length > 0) {
                res.send({ message: translator.getStr('LocationHasData'), status: false });
            } else {
                let locationCollection = connection_db_api.model(collectionConstant.LOCATIONS, locationSchema);
                let locationObject = await locationCollection.updateOne({ _id: ObjectID(req.body._id) }, { is_delete: 1 }); console.log("n", locationObject);
                if (locationObject) {
                    addLocationsHistory("Delete", { deleted_id: ObjectID(req.body._id) }, decodedToken);
                    // activityController.updateAllUser({ "api_setting.location": true }, decodedToken);
                    res.send({ message: translator.getStr('LocationDeleted'), status: true });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
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

module.exports.getOneLocation = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let locationCollection = connection_db_api.model(collectionConstant.LOCATIONS, locationSchema);
            let locationObject = await locationCollection.findOne({ _id: ObjectID(req.body._id), is_delete: 0 });
            if (locationObject) {
                res.send({ message: translator.getStr('LocationListing'), data: locationObject, status: true });
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

module.exports.getAll_Location = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let locationCollection = connection_db_api.model(collectionConstant.LOCATIONS, locationSchema);
            let get_all_location = await locationCollection.find({ is_delete: 0 }).sort({ "createdAt": -1 });
            res.send({ message: translator.getStr('LocationListing'), data: get_all_location, status: true });
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

module.exports.saveLocationXslx = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let locationCollection = connection_db_api.model(collectionConstant.LOCATIONS, locationSchema);
            let insert_data = await locationCollection.insertMany(requestObject);
            if (insert_data) {
                res.send({ message: translator.getStr('LocationAdded'), status: true });
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

var locations_historySchema = require('./../../../../../model/history/locations_history');
let historyCollectionConstant = require('./../../../../../config/historyCollectionConstant');

async function addLocationsHistory(action, data, decodedToken) {
    let connection_db_api = await db_connection.connection_db_api(decodedToken);
    try {
        let locations_historyCollection = connection_db_api.model(historyCollectionConstant.LOCATIONS_HISTORY, locations_historySchema);
        data.action = action;
        data.taken_device = config.WEB_ALL;
        data.created_at = Math.round(new Date().getTime() / 1000);
        data.created_by = decodedToken.UserData._id;
        let save_usersdocument_histories = new locations_historyCollection(data);
        save_usersdocument_histories.save();
    } catch (e) {
        console.log("=====Locations_ History ERROR=========", e);
    } finally {
        //connection_db_api.close();
    }
}

module.exports.getAllLocationHistory = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let locationCollection = connection_db_api.model(historyCollectionConstant.LOCATIONS_HISTORY, locations_historySchema);
            var col = [];
            userid = { is_delete: 0 };
            col.push("created_at", "action", "created_by", "taken_device");
            var start = parseInt(req.body.start) || 0;
            var perpage = parseInt(req.body.length);

            var columnData = (req.body.order != undefined && req.body.order != '') ? req.body.order[0].column : '';
            var columntype = (req.body.order != undefined && req.body.order != '') ? req.body.order[0].dir : '';
            var sort = {};
            sort[col[columnData]] = (columntype == 'asc') ? 1 : -1;
            let query = {};
            if (req.body.search.value) {
                query = {
                    $or: [{ "location_name": new RegExp(req.body.search.value, 'i') },
                    { "location_street1": new RegExp(req.body.search.value, 'i') },
                    { "location_street2": new RegExp(req.body.search.value, 'i') },
                    { "location_city": new RegExp(req.body.search.value, 'i') },
                    { "location_state": new RegExp(req.body.search.value, 'i') },
                    { "location_postcode": new RegExp(req.body.search.value, 'i') },
                    { "location_country": new RegExp(req.body.search.value, 'i') },
                    { "location_contact_name": new RegExp(req.body.search.value, 'i') },
                    { "location_contact_number": new RegExp(req.body.search.value, 'i') }
                    ]
                };
            }
            var aggregateQuery = [
                { $match: userid },
                {
                    $lookup: {
                        from: collectionConstant.LOCATIONS,
                        let: { id: "$deleted_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $and: [{ $eq: ["$_id", "$$id"] }] }
                                },
                            },
                            {

                                $lookup: {
                                    from: collectionConstant.INVOICE_USER,
                                    localField: "created_by",
                                    foreignField: "_id",
                                    as: "user"
                                }

                            }, {
                                $project: {
                                    location_name: 1,
                                    location_full_address: 1,
                                    location_city: 1,
                                    location_street1: 1,
                                    location_street2: 1,
                                    location_state: 1,
                                    location_postcode: 1,
                                    location_country: 1,
                                    location_contact_name: 1,
                                    location_contact_number: 1,
                                    created_at: 1,
                                    action: 1,
                                    created_by: { $ifNull: ["$user.userfullname", ""] },
                                    alert_team_members: 1,
                                    taken_device: 1,
                                }
                            }
                        ],
                        as: "deleted_location"
                    }
                },
                {
                    $unwind: {
                        path: "$deleted_location",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {

                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "created_by",
                        foreignField: "_id",
                        as: "user"
                    }

                }, {
                    $project: {
                        location_name: 1,
                        location_full_address: 1,
                        location_city: 1,
                        location_street1: 1,
                        location_street2: 1,
                        location_state: 1,
                        location_postcode: 1,
                        location_country: 1,
                        location_contact_name: 1,
                        location_contact_number: 1,
                        created_at: 1,
                        action: 1,
                        created_by: { $ifNull: ["$user.userfullname", ""] },
                        alert_team_members: 1,
                        taken_device: 1,
                        deleted_location: "$deleted_location"
                    }
                },
                { $sort: sort },
                { $match: query },
                { $limit: perpage + start },
                { $skip: start }
            ];
            let count = 0;
            count = await locationCollection.countDocuments(userid);
            let all_location = await locationCollection.aggregate(aggregateQuery);
            var dataResponce = {};
            dataResponce.data = all_location;
            dataResponce.draw = req.body.draw;
            dataResponce.recordsTotal = count;
            dataResponce.recordsFiltered = (req.body.search.value) ? all_location.length : count;
            res.json(dataResponce);
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

