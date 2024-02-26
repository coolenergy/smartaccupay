var template_Schema = require('../../../../../model/template');
var template_history_Schema = require('../../../../../model/history/template_history');
let db_connection = require('../../../../../controller/common/connectiondb');
let collectionConstant = require('../../../../../config/collectionConstant');
let config = require('../../../../../config/config');
let common = require('../../../../../controller/common/common');
const historyCollectionConstant = require('../../../../../config/historyCollectionConstant');
const { route } = require('../portal_index');
const { ObjectId } = require('mongodb');
const { update, parseInt } = require('lodash');
const { Anchor } = require('exceljs');
const { sendDocumentExpirationValidation } = require('../employee/employeeValidation');
var ObjectID = require('mongodb').ObjectID;


//save template

module.exports.savetemplate = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.decodedJWT(req.headers.language);

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var templateConnection = connection_db_api.model(collectionConstant.INVOICE_TEMPLATE, template_Schema);
            var id = requestObject._id;
            delete requestObject._id;

            if (id) {
                // update
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                var update_template = await templateConnection.updateOne({ _id: ObjectID(id) }, requestObject);
                if (update_template) {
                    requestObject.template_data_id = id;
                    addChangeTemplateHistory("Update", requestObject, decodedToken, requestObject.updated_at);
                    res.send({ status: true, message: "Template updated successfully", data: update_template });
                } else {
                    res.send({ status: false, message: translator.getStr('SomethingWrong') });
                }
            } else {
                // insert
                requestObject.created_by = decodedToken.UserData._id;
                requestObject.created_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                var add_template = new templateConnection(requestObject);
                var save_template = await add_template.save();

                if (save_template) {
                    requestObject.template_data_id = save_template._id;
                    addChangeTemplateHistory("Insert", requestObject, decodedToken, requestObject.updated_at);
                    res.send({ status: true, message: "Template saved successfully", data: update_template });
                } else {
                    res.send({ status: false, message: translator.getStr('SomethingWrong') });
                }
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });

    }

};

//get template

module.exports.gettemplate = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.decodedJWT(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var templateConnection = connection_db_api.model(collectionConstant.INVOICE_TEMPLATE, template_Schema);
            var getdata = await templateConnection.find({ is_delete: 0 });
            if (getdata) {
                res.send({ status: true, message: "Template data", data: getdata });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};


// delete template
module.exports.deleteTemplate = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.decodedJWT(req.headers.language);
    if (decodedToken) {

        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var id = requestObject._id;
            delete requestObject._id;

            var templateConnection = connection_db_api.model(collectionConstant.INVOICE_TEMPLATE, template_Schema);
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            var delete_template = await templateConnection.updateOne({ _id: ObjectID(id) }, requestObject);
            if (delete_template) {
                var get_one = await templateConnection.findOne({ _id: ObjectID(id) }, { _id: 0, __v: 0 });
                let req_obj = { template_data_id: id, ...get_one._doc };
                if (delete_template.nModified == 1) {
                    if (requestObject.is_delete == 1) {
                        addChangeTemplateHistory("Archive", req_obj, decodedToken, requestObject.updated_at);
                        res.send({ message: "Template archive successfully.", status: true });
                    } else {
                        addChangeTemplateHistory("Restore", req_obj, decodedToken, requestObject.updated_at);
                        res.send({ message: "Template restore successfully", status: true });
                    }
                } else {
                    res.send({ message: "No data with this id", status: false });
                }
            }

        } catch (e) {
            console.log(e);
            res.send({ status: false, message: translator.getStr('SomethingWrong') });
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }

};

//data table for template

module.exports.datatabletemplate = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.decodedJWT(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var templateConnection = connection_db_api.model(collectionConstant.INVOICE_TEMPLATE, template_Schema);
            var col = [];
            var match_query = { is_delete: req.body.is_delete };
            col.push("template_name", "created_at", "note", "status");

            var start = parseInt(req.body.start) || 0;
            var perpage = parseInt(req.body.length);
            var columnData = (req.body.order != undefined && req.body.order != '') ? req.body.order[0].common : '';
            var columntype = (req.body.order != undefined && req.body.order != '') ? req.body.order[0].dir : '';
            var sort = {};
            if (req.body.draw == 1) {
                sort = { 'created_at': -1 };
            } else {
                sort[col[columnData]] = (columntype == 'asc') ? 1 : -1;
            }

            let query = {};
            if (req.body.search.value) {
                query = {
                    $or: [
                        { "template_name": new RegExp(req.body.search.value, 'i') },
                        { "created_at": new RegExp(req.body.search.value, 'i') },
                        { "note": new RegExp(req.body.search.value, 'i') },
                        { "status": new RegExp(req.body.search.value, 'i') },
                    ]
                };
            }

            var aggregateQuery = [
                { $match: match_query },
                { $match: query },
                { $sort: sort },
                { $limit: start + perpage },
                { $skip: start }
            ];

            let count = 0;
            count = await templateConnection.countDocuments(match_query);
            let alltemplate = await templateConnection.aggregate(aggregateQuery);

            var dataResponce = {};
            dataResponce.data = alltemplate;
            dataResponce.draw = req.body.draw;
            dataResponce.recordsTotle = count;
            dataResponce.recordsFiltered = (req.body.search.value) ? alltemplate.length : count;
            res.json(dataResponce);
        } catch (e) {
            console.log(e);
            res.send({ status: false, message: translator.getStr('SomethingWrong') });
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

//history data table
module.exports.historydatatable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.decodedJWT(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var templatehistoryconnection = connection_db_api.model(historyCollectionConstant.TEMPLATE_HISTORY, template_history_Schema);
            var col = [];
            var match_query = { is_delete: req.body.is_delete };
            col.push("history_created_at", "action", "history_created_by.userfullname", "taken_device");
            var start = parseInt(req.body.start) || 0;
            var perpage = parseInt(req.body.length);
            var columnData = (req.body.order != undefined && req.body.order != '') ? req.body.order[0].common : '';
            var columntype = (req.body.order != undefined && req.body.order != '') ? req.body.order[0].dir : '';
            var sort = {};
            if (req.body.draw == 1) {
                sort = { 'created_at': -1 };
            } else {
                sort[col[columnData]] = (columntype == 'asc') ? 1 : -1;
            }
            let query = {};
            if (req.body.search.value) {
                query = {
                    $or: [
                        { "template_name": new RegExp(req.body.search.value, "i") },
                        { "created_at": new RegExp(req.body.search.value, "i") },
                        { "note": new RegExp(req.body.search.value, "i") },
                        { "status": new RegExp(req.body.search.value, "i") },
                        //history_created_by.userfullname
                    ]
                };
            }

            var aggregateQuery = [
                { $match: match_query },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "history_created_by",
                        foreignField: "_id",
                        as: "history_created_by"
                    }
                },
                { $unwind: "$history_created_by" },
                { $match: query },
                { $sort: sort },
                { $limit: start + perpage },
                { $skip: start },
            ];

            let count = 0;
            count = await templatehistoryconnection.countDocuments(match_query);
            var alltemplatehistory = await templatehistoryconnection.aggregate(aggregateQuery);
            var dataResponce = {};
            dataResponce.data = alltemplatehistory;
            dataResponce.draw = req.body.draw;
            dataResponce.recordsTotle = count;
            dataResponce.recordsFiltered = (req.body.search.value) ? alltemplatehistory.length : count;
            res.json(dataResponce);
        } catch (e) {
            console.log(e);
            res.send({ status: false, message: translator.getStr('SomethingWrong') });
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

// Template history function

async function addChangeTemplateHistory(action, data, decodedToken, updated_at) {

    var connection_db_api = await db_connection.connection_db_api(decodedToken);
    try {
        var templatehistoryconnection = connection_db_api.model(historyCollectionConstant.TEMPLATE_HISTORY, template_history_Schema);
        data.action = action;
        data.taken_device = config.WEB_ALL;
        data.history_created_at = updated_at;
        data.history_created_by = decodedToken.UserData._id;
        var addtemplate_history = new templatehistoryconnection(data);
        var savetemplatehistory = addtemplate_history.save();

    } catch (e) {
        console.log(e);
        res.send({ message: translator.getStr('SomethingWrong'), status: false });
    }
}


