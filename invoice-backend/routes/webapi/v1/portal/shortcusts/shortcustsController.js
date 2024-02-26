var usershortcutsSchema = require('../../../../../model/usershortcuts');
const mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
let db_connection = require('../../../../../controller/common/connectiondb');
let common = require('../../../../../controller/common/common');
let collectionConstant = require('../../../../../config/collectionConstant');
let rest_Api = require('./../../../../../config/db_rest_api');
let config = require('./../../../../../config/config');
let companyCollection = "company";

/*
    Get User shortcuts - API
*/
module.exports.getusershortcuts = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let connection_MDM_main = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
            let one_Compnay = await rest_Api.findOne(connection_MDM_main, companyCollection, { companystatus: 1, companycode: decodedToken.companycode });
            let usershortcutsCollection = connection_db_api.model(collectionConstant.SHORTCUTS, usershortcutsSchema);
            let all_usershortcuts = await usershortcutsCollection.findOne({ is_delete: 0, user_id: ObjectID(decodedToken.UserData._id) });
            res.send({ message: translator.getStr('UsershortcutsListing'), data: all_usershortcuts, otherApp: one_Compnay.otherstool, status: true });
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

/*
    Save/Add User shortcuts - API
*/
module.exports.saveusershortcuts = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let usershortcutsCollection = connection_db_api.model(collectionConstant.SHORTCUTS, usershortcutsSchema);
            if (requestObject._id) {
                let update_usershortcuts = await usershortcutsCollection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
                if (update_usershortcuts) {

                    res.send({ message: translator.getStr('UsershortcutsUpdated'), data: update_usershortcuts, status: true });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                let add_usershortcuts = new usershortcutsCollection(requestObject);
                let save_usershortcuts = await add_usershortcuts.save();
                if (save_usershortcuts) {

                    res.send({ message: translator.getStr('UsershortcutsAdded'), data: save_usershortcuts, status: true });
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

/*
    Delete User shortcuts - API
*/
module.exports.deleteusershortcuts = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            requestObject = req.body;
            let usershortcutsCollection = connection_db_api.model(collectionConstant.SHORTCUTS, usershortcutsSchema);
            let update_usershortcuts = await usershortcutsCollection.updateOne({ _id: ObjectID(requestObject._id) }, { is_delete: 1 });
            let isDelete = update_usershortcuts.nModified;
            if (update_usershortcuts) {
                if (isDelete == 0) {
                    res.send({ message: translator.getStr('NoDataWithId'), status: false });
                } else {

                    res.send({ message: translator.getStr('UsershortcutsDeleted'), status: true });
                }
            } else {
                console.log(e);
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