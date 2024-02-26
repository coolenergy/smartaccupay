var recentActivitySchema = require('../../../../model/recent_activities');
let db_connection = require('../../../../controller/common/connectiondb');
let collectionConstant = require('../../../../config/collectionConstant');
let config = require('../../../../config/config');
let common = require('../../../../controller/common/common');
var ObjectID = require('mongodb').ObjectID;

module.exports.saveRecentActivity = async function (requestObject, decodedToken) {
    var connection_db_api = await db_connection.connection_db_api(decodedToken);
    try {
        var recentActivityConnection = connection_db_api.model(collectionConstant.INVOICE_RECENT_ACTIVITY, recentActivitySchema);
        requestObject.created_by = decodedToken.UserData._id;
        requestObject.created_at = Math.round(new Date().getTime() / 1000);
        requestObject.updated_by = decodedToken.UserData._id;
        requestObject.updated_at = Math.round(new Date().getTime() / 1000);
        var add_activity = new recentActivityConnection(requestObject);
        var save_activity = await add_activity.save();
        console.log("save recent activity", save_activity._id);
    } catch (e) {
        console.log(e);
        // res.send({ message: translator.getStr('SomethingWrong'), status: false });
    }
};

module.exports.getRecentActivity = async function (req, res) {
    var translator = new common.Language('en');
    var decodedToken = common.decodedJWT(req.headers.authorization);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let perpage = 10;
            if (requestObject.start) { } else {
                requestObject.start = 0;
            }
            let start = requestObject.start == 0 ? 0 : perpage * requestObject.start;
            var recentActivityConnection = connection_db_api.model(collectionConstant.INVOICE_RECENT_ACTIVITY, recentActivitySchema);
            let get_data = await recentActivityConnection.aggregate([
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_VENDOR,
                        localField: "data_id",
                        foreignField: "_id",
                        as: "vendor"
                    }
                },
                {
                    $unwind: {
                        path: "$vendor",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "data_id",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $unwind: {
                        path: "$user",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE,
                        localField: "data_id",
                        foreignField: "_id",
                        as: "invoice"
                    }
                },
                {
                    $unwind: {
                        path: "$invoice",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "created_by",
                        foreignField: "_id",
                        as: "created_by"
                    }
                },
                { $unwind: "$created_by" },
                { $sort: { created_at: -1 } },
                { $limit: perpage + start },
                { $skip: start }
            ]);
            res.send({ data: get_data, status: true });
        } catch (e) {
            console.log("e", e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};