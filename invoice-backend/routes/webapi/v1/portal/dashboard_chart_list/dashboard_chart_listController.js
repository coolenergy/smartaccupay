var dashboardChartListSchema = require('../../../../../model/dashboardChartList');
let db_connection = require('./../../../../../controller/common/connectiondb');
var ObjectID = require('mongodb').ObjectID;
let common = require('../../../../../controller/common/common');
let collectionConstant = require('../../../../../config/collectionConstant');

/*
 *
 * Last Updated API : 24-06-2022
 * BY:- Krunal T Tailor
 *
 * Get Dashboard Chart List
 *
 */

module.exports.getDashboardChartList = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let dashboardChartListConnection = connection_db_api.model(collectionConstant.DASHBOARDCHARTLIST, dashboardChartListSchema);
            let chart_list = await dashboardChartListConnection.findOne({ user_id: ObjectID(requestObject.user_id) })
            res.send({ data: chart_list, message: "array list", status: true })
        } catch (e) {
            console.log("error:-------------------------------", e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false, success: 'error' });
        } finally {
            connection_db_api.close()
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false, success: 'error' });
    }
}

/*
 *
 * Last Updated API : 24-06-2022
 * BY:- Krunal T Tailor
 *
 * Save Dashboard Chart List
 *
 */

module.exports.saveDashboardChartList = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let dashboardChartListConnection = connection_db_api.model(collectionConstant.DASHBOARDCHARTLIST, dashboardChartListSchema);
            if (requestObject._id) {
                let chart_list = await dashboardChartListConnection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
                if (chart_list) {
                    res.send({ message: "Save", data: chart_list, status: true });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                let add_chart_list = new dashboardChartListConnection(requestObject);
                let save_chart_list = await add_chart_list.save();
                if (save_chart_list) {
                    res.send({ message: "Save", data: save_chart_list, status: true });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            }

        } catch (e) {
            console.log("error:", e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false, success: 'error' });
        } finally {
            connection_db_api.close()
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false, success: 'error' });
    }
}