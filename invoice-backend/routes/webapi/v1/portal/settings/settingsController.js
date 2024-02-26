let db_connection = require('../../../../../controller/common/connectiondb');
let collectionConstant = require('../../../../../config/collectionConstant');
let config = require('../../../../../config/config');
let rest_Api = require('../../../../../config/db_rest_api');
let common = require('../../../../../controller/common/common');
var userSchema = require('../../../../../model/user');
var rolesSchema = require('../../../../../model/roles');
var rolesandpermissionsSchema = require('../../../../../model/rolesandpermissions');
var settingsSchema = require('../../../../../model/settings');
var bucketOpration = require('../../../../../controller/common/s3-wasabi');
var ObjectID = require('mongodb').ObjectID;
var settingsCron = require('./settingsCron');

module.exports.compnayinformation = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        try {
            var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
            let company_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_COMPANY, { _id: ObjectID(req.body._id) });
            res.send({ message: translator.getStr('CompanyListing'), data: company_data, status: true });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.getAllSetting = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let settingsConnection = connection_db_api.model(collectionConstant.INVOICE_SETTING, settingsSchema);
            let OneSettig = await settingsConnection.findOne();
            res.send({ message: translator.getStr('CompanySetting'), data: OneSettig, status: true });
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

module.exports.getUpdateSetting = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let reqObject = req.body;
            let id = reqObject._id;
            delete reqObject["_id"];
            let settingsConnection = connection_db_api.model(collectionConstant.INVOICE_SETTING, settingsSchema);
            let updateSettingObject = await settingsConnection.updateOne({ _id: ObjectID(id) }, { $set: reqObject });
            let updated = updateSettingObject['n'];
            if (updated == 1) {
                /* let reqObject_new = {
                    updated_id: id,
                    settings: {
                        [Object.keys(reqObject)[0].split(".")[1]]: reqObject[Object.keys(reqObject)[0]]
                    }
                };
                addsettings_History("Update", reqObject_new, decodedToken); */
                settingsCron.pendingInvoiceToAssignedToUserCronAPI();
                res.send({ message: translator.getStr('CompanySettingUpdated'), status: true });
            } else {
                res.send({ message: translator.getStr('CompanySettingAlreadyUpdated'), status: true });
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

var settings_historySchema = require('./../../../../../model/history/settings_history');
let historyCollectionConstant = require('./../../../../../config/historyCollectionConstant');

async function addsettings_History(action, data, decodedToken) {
    let connection_db_api = await db_connection.connection_db_api(decodedToken);
    try {
        let settings_historyCollection = connection_db_api.model(historyCollectionConstant.INVOICE_SETTINGS_HISTORY, settings_historySchema);
        data.action = action;
        data.created_at = Math.round(new Date().getTime() / 1000);
        data.created_by = decodedToken.UserData._id;
        let save_settings_histories = new settings_historyCollection(data);
        save_settings_histories.save();
    } catch (e) {
        console.log("=====settings_ And  Permissions  History ERROR=========", e);
    } finally {
        //connection_db_api.close();
    }
}