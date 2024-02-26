var diversityRolesSchema = require('./../../../../../model/diversity_roles');
const mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
let db_connection = require('./../../../../../controller/common/connectiondb');
let common = require('./../../../../../controller/common/common');
let collectionConstant = require('./../../../../../config/collectionConstant');


module.exports.getAllRoles = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let rolesCollection = connection_db_api.model(collectionConstant.INVOICE_ROLES, diversityRolesSchema);
            let all_roles = await rolesCollection.find({ is_delete: 0 }).sort({ sequence: 1 });
            res.send({ message: translator.getStr('RoleListing'), data: all_roles, status: true });
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


module.exports.saveRoles = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let rolesCollection = connection_db_api.model(collectionConstant.INVOICE_ROLES, diversityRolesSchema);
            if (requestObject._id) {
                let id = ObjectID(requestObject._id);
                delete requestObject['_id'];
                let update_role = await rolesCollection.updateOne({ _id: id }, requestObject);
                if (update_role) {
                    requestObject.updated_id = id;
                    // addRolesandpermissions_History("Update", requestObject, decodedToken);
                    res.send({ message: translator.getStr('RoleUpdated'), status: true });
                }
            } else {
                let add_roles = new rolesCollection(requestObject);
                let save_roles = await add_roles.save();
                if (save_roles) {
                    requestObject.inserted_id = save_roles._id;
                    //addRolesandpermissions_History("Insert", requestObject, decodedToken);
                    res.send({ message: translator.getStr('RoleAdded'), data: save_roles, status: true });
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

// var RoleshistorySchema = require('./../../../../../model/history/rolesandpermissions_history');
// let historyCollectionConstant = require('./../../../../../config/historyCollectionConstant');

// async function addRolesandpermissions_History(action, data, decodedToken) {
//     let connection_db_api = await db_connection.connection_db_api(decodedToken);
//     try {
//         let RoleshistoryCollection = connection_db_api.model(historyCollectionConstant.SUPPLIER_ROLE_HISTORY, RoleshistorySchema);
//         data.action = action;
//         data.created_at = Math.round(new Date().getTime() / 1000);
//         data.created_by = decodedToken.UserData._id;
//         let save_Roleshistories = new RoleshistoryCollection(data);
//         save_Roleshistories.save();
//     } catch (e) {
//         console.log("=====Roles And  Permissions  History ERROR=========", e);
//     } finally {
//         //connection_db_api.close();
//     }
// }