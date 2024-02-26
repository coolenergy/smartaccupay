var invoice_cost_code_Schema = require('./../../../../../model/invoice_cost_code');
let db_connection = require('./../../../../../controller/common/connectiondb');
let config = require('./../../../../../config/config');
let collectionConstant = require('./../../../../../config/collectionConstant');
let common = require('./../../../../../controller/common/common');
var ObjectID = require('mongodb').ObjectID;

//save cost code
// NOTE: need to check duplication of name before update or save

module.exports.savecostCode = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);

    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var costCodeConnection = connection_db_api.model(collectionConstant.INVOICE_COST_CODE, invoice_cost_code_Schema);
            var id = requestObject._id;
            delete requestObject._id;
            if (id) {
                requestObject.value = requestObject.division + "-" + requestObject.cost_code;

                let update_costcode = await costCodeConnection.updateOne({ _id: ObjectID(id) }, requestObject);
                if (update_costcode) {
                    res.send({ status: true, message: "Costcode update succesfully", data: update_costcode });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }

            } else {
                //insert costcode
                requestObject.value = requestObject.division + "-" + requestObject.cost_code;
                let add_costcode = new costCodeConnection(requestObject);
                let save_costcode = await add_costcode.save();
                res.send({ status: true, message: "Costcode saved successfully", data: save_costcode });

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

// get costcode

module.exports.getcostCode = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var costCodeConnection = connection_db_api.model(collectionConstant.INVOICE_COST_CODE, invoice_cost_code_Schema);
            var get_data = await costCodeConnection.find({ is_delete: 0 });
            res.send({ status: true, message: "Cost code data", data: get_data });
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

// delete term

module.exports.deleteinvoicecostCode = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);

    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var id = requestObject._id;
            delete requestObject._id;
            var costCodeConnection = connection_db_api.model(collectionConstant.INVOICE_COST_CODE, invoice_cost_code_Schema);
            let update_data = await costCodeConnection.updateOne({ _id: ObjectID(id) }, { is_delete: requestObject.is_delete });
            let isDelete = update_data.nModified;
            if (isDelete == 0) {
                res.send({ status: false, message: 'There is no data with this id.' });
            } else {
                if (requestObject.is_delete == 0) {
                    res.send({ status: true, message: 'Cost code deleted successfully.', data: update_data });
                } else {
                    res.send({ status: true, message: 'Cost code restore successfully.', data: update_data });
                }
            }
        } catch (e) {
            console.log(e);
            res.send({ status: false, message: "something wrong", error: e });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: "invalid user" });
    }
};