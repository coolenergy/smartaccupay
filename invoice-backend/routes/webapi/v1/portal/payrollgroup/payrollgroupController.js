var payrollgroupSchema = require('../../../../../model/payroll_group');
var userSchema = require('../../../../../model/user');
const mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
let db_connection = require('../../../../../controller/common/connectiondb');
let common = require('../../../../../controller/common/common');
let collectionConstant = require('../../../../../config/collectionConstant');

module.exports.getAllpayroll_group = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let payrollgroupCollection = connection_db_api.model(collectionConstant.PAYROLL_GROUP, payrollgroupSchema);
            let all_payrollgroup = await payrollgroupCollection.find({ is_delete: 0 });
            res.send({ message: translator.getStr('PayrollGroupListing'), data: all_payrollgroup, status: true });
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

module.exports.savePayrollgroup = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let payrollgroupCollection = connection_db_api.model(collectionConstant.PAYROLL_GROUP, payrollgroupSchema);
            let get_one = await payrollgroupCollection.findOne({ payroll_group_name: requestObject.payroll_group_name, is_delete: 0 });
            if (requestObject._id) {
                if (get_one != null) {
                    if (get_one._id == requestObject._id) {
                        let update_payroll_group = await payrollgroupCollection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
                        if (update_payroll_group) {
                            res.send({ message: translator.getStr('PayrollGroupUpdated'), data: update_payroll_group, status: true });
                        } else {
                            res.send({ message: translator.getStr('SomethingWrong'), status: false });
                        }
                    } else {
                        res.send({ message: translator.getStr('PayrollGroupAlreadyExist'), status: false });
                    }
                } else {
                    let update_payroll_group = await payrollgroupCollection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
                    if (update_payroll_group) {
                        res.send({ message: translator.getStr('PayrollGroupUpdated'), data: update_payroll_group, status: true });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), status: false });
                    }
                }
            } else {
                if (get_one == null) {
                    let add_payroll_group = new payrollgroupCollection(requestObject);
                    let save_payroll_group = await add_payroll_group.save();
                    if (save_payroll_group) {
                        res.send({ message: translator.getStr('PayrollGroupAdded'), data: save_payroll_group, status: true });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), status: false });
                    }
                } else {
                    res.send({ message: translator.getStr('PayrollGroupAlreadyExist'), status: false });
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

module.exports.deletePayrollgroup = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let userCollection = connection_db_api.model(collectionConstant.USER, userSchema);
            let userObject = await userCollection.find({ user_id_payroll_group: ObjectID(req.body._id) });
            if (userObject.length > 0) {
                res.send({ message: translator.getStr('PayrollGroupHasData'), status: false });
            } else {
                let payrollgroupCollection = connection_db_api.model(collectionConstant.PAYROLL_GROUP, payrollgroupSchema);
                let jobTitleObject = await payrollgroupCollection.updateOne({ _id: ObjectID(req.body._id) }, { is_delete: 1 });
                if (jobTitleObject) {
                    res.send({ message: translator.getStr('PayrollGroupDeleted'), status: true });
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