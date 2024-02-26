var payrollgroupSchema = require('./../../../../../model/payroll_group');
const mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
let db_connection = require('./../../../../../controller/common/connectiondb');
let common = require('./../../../../../controller/common/common');
let collectionConstant = require('./../../../../../config/collectionConstant');


module.exports.getAllpayroll_group = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let payrollgroupCollection = connection_db_api.model(collectionConstant.PAYROLL_GROUP, payrollgroupSchema);
            let all_payrollgroup = await payrollgroupCollection.find({});
            res.send({ message: "Payroll Group", data: all_payrollgroup, status: true });
        } catch (e) {
            console.log(e);
            res.send({ message: "Something went wrong.!", error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: "Invalid user for this action", status: false });
    }
};