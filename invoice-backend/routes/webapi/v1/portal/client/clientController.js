var clientSchema = require('../../../../../model/client');
var userSchema = require('../../../../../model/user');
var costCodeSchema = require('../../../../../model/invoice_cost_code');
let db_connection = require('../../../../../controller/common/connectiondb');
let collectionConstant = require('../../../../../config/collectionConstant');
let common = require('../../../../../controller/common/common');
var client_history_Schema = require('../../../../../model/history/client_history');
const historyCollectionConstant = require('../../../../../config/historyCollectionConstant');
let config = require('../../../../../config/config');
var ObjectID = require('mongodb').ObjectID;
var formidable = require('formidable');
const reader = require('xlsx');
const _ = require("lodash");

// client insert Edit 
module.exports.saveclient = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var clientConnection = connection_db_api.model(collectionConstant.INVOICE_CLIENT, clientSchema);
            var userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            var costCodeConnection = connection_db_api.model(collectionConstant.COSTCODES, costCodeSchema);

            let id = requestObject._id;
            delete requestObject._id;
            if (id) {
                let one_client = await clientConnection.findOne({ _id: ObjectID(id) });
                //update invoice client
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_by = decodedToken.UserData._id;
                let updateclient = await clientConnection.updateOne({ _id: id }, requestObject);
                if (updateclient) {
                    delete requestObject.created_at;
                    delete requestObject.created_by;
                    delete requestObject.updated_at;
                    delete requestObject.updated_by;
                    delete requestObject.is_delete;
                    delete requestObject.is_quickbooks;

                    // find difference of object 
                    let updatedData = await common.findUpdatedFieldHistory(requestObject, one_client._doc);

                    if (requestObject.approver_id !== '') {
                        let found_approver = _.findIndex(updatedData, function (tmp_data) { return tmp_data.key == 'approver_id'; });
                        if (found_approver != -1) {
                            let one_term = await userConnection.findOne({ _id: ObjectID(updatedData[found_approver].value) });
                            updatedData[found_approver].value = one_term.userfullname;
                        }
                    }

                    if (requestObject.client_cost_cost_id !== '') {
                        let found_costcode = _.findIndex(updatedData, function (tmp_data) { return tmp_data.key == 'client_cost_cost_id'; });
                        if (found_costcode != -1) {
                            let one_term = await costCodeConnection.findOne({ _id: ObjectID(updatedData[found_costcode].value) });
                            updatedData[found_costcode].value = one_term.value;
                        }
                    }

                    let found_status = _.findIndex(updatedData, function (tmp_data) { return tmp_data.key == 'client_status'; });
                    if (found_status != -1) {
                        updatedData[found_status].value = updatedData[found_status].value == 1 ? 'Active' : updatedData[found_status].value == 2 ? 'Inactive' : '';
                    }

                    for (let i = 0; i < updatedData.length; i++) {
                        updatedData[i]['key'] = translator.getStr(`Client_History.${updatedData[i]['key']}`);
                    }
                    let histioryObject = {
                        data: updatedData,
                        client_id: id,
                    };
                    addClientHistory("Update", histioryObject, decodedToken);

                    res.send({ status: true, message: "client update successfully..!" });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            }
            else {
                //insert invoice client
                var nameexist = await clientConnection.findOne({ "client_name": requestObject.client_name });
                if (nameexist) {
                    res.send({ status: false, message: "client allready exist" });
                } else {
                    requestObject.created_at = Math.round(new Date().getTime() / 1000);
                    requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                    requestObject.created_by = decodedToken.UserData._id;
                    requestObject.updated_by = decodedToken.UserData._id;
                    var add_client = new clientConnection(requestObject);
                    var save_client = await add_client.save();
                    if (save_client) {
                        delete requestObject.created_at;
                        delete requestObject.updated_at;
                        delete requestObject.created_by;
                        delete requestObject.updated_by;

                        // find difference of object 
                        let insertedData = await common.setInsertedFieldHistory(requestObject);

                        if (requestObject.approver_id !== '') {
                            let found_approver = _.findIndex(insertedData, function (tmp_data) { return tmp_data.key == 'approver_id'; });
                            if (found_approver != -1) {
                                let one_term = await userConnection.findOne({ _id: ObjectID(insertedData[found_approver].value) });
                                insertedData[found_approver].value = one_term.userfullname;
                            }
                        }

                        if (requestObject.client_cost_cost_id !== '') {
                            let found_costcode = _.findIndex(insertedData, function (tmp_data) { return tmp_data.key == 'client_cost_cost_id'; });
                            if (found_costcode != -1) {
                                let one_term = await costCodeConnection.findOne({ _id: ObjectID(insertedData[found_costcode].value) });
                                insertedData[found_costcode].value = one_term.value;
                            }
                        }

                        let found_status = _.findIndex(insertedData, function (tmp_data) { return tmp_data.key == 'client_status'; });
                        if (found_status != -1) {
                            insertedData[found_status].value = insertedData[found_status].value == 1 ? 'Active' : insertedData[found_status].value == 2 ? 'Inactive' : '';
                        }

                        for (let i = 0; i < insertedData.length; i++) {
                            insertedData[i]['key'] = translator.getStr(`Client_History.${insertedData[i]['key']}`);
                        }
                        let histioryObject = {
                            data: insertedData,
                            client_id: save_client.id,
                        };
                        addClientHistory("Insert", histioryObject, decodedToken);
                        res.send({ status: true, message: "client insert successfully..!", data: add_client });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), status: false });
                    }
                }
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        }
        finally {
            connection_db_api.close();
        }
    }
    else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

// get client
module.exports.getclient = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var clientConnection = connection_db_api.model(collectionConstant.INVOICE_CLIENT, clientSchema);
            let get_data = await clientConnection.find({ is_delete: 0 });
            res.send({ status: true, message: "Get client", data: get_data });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    }
    else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

//delete client
module.exports.deleteclient = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);

    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {

            var requestObject = req.body;
            let id = requestObject._id;
            delete requestObject._id;
            var clientConnection = connection_db_api.model(collectionConstant.INVOICE_CLIENT, clientSchema);

            requestObject.client_updated_by = decodedToken.UserData._id;
            requestObject.client_updated_at = Math.round(new Date().getTime() / 1000);

            var one_client = await clientConnection.findOne({ _id: ObjectID(id) });

            if (one_client) {
                var delete_client = await clientConnection.updateMany({ _id: id }, { is_delete: requestObject.is_delete });

                if (delete_client) {
                    let action = '';
                    let message = '';
                    if (requestObject.is_delete == 1) {
                        action = "Archive";
                        message = "Client archive successfully.";
                    } else {
                        action = "Restore";
                        message = "Client restore successfully.";
                    }

                    let histioryObject = {
                        data: [],
                        client_id: id,
                    };
                    addClientHistory(action, histioryObject, decodedToken);
                    res.send({ message: message, status: true });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                res.send({ message: "client not found with this id.", status: false });
            }
        } catch (e) {
            console.log(e);
            res.send({ status: false, message: translator.getStr('SomethingWrong'), rerror: e });
        } finally {
            connection_db_api.close();
        }
    }
    else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });

    }
};

// client history function
async function addClientHistory(action, data, decodedToken) {
    var connection_db_api = await db_connection.connection_db_api(decodedToken);
    try {
        var client_history_connection = connection_db_api.model(historyCollectionConstant.INVOICE_CLIENT_HISTORY, client_history_Schema);
        data.action = action;
        data.taken_device = config.WEB_ALL;
        data.history_created_at = Math.round(new Date().getTime() / 1000);
        data.history_created_by = decodedToken.UserData._id;
        var add_client_history = new client_history_connection(data);
        var save_client_history = await add_client_history.save();
    } catch (e) {
        console.log(e);
    } finally {
        // connection_db_api.close();
    }
}

module.exports.getClinetHistory = async function (req, res) {
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
            var client_history_connection = connection_db_api.model(historyCollectionConstant.INVOICE_CLIENT_HISTORY, client_history_Schema);
            let get_data = await client_history_connection.aggregate([
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_CLIENT,
                        localField: "client_id",
                        foreignField: "_id",
                        as: "client_id"
                    }
                },
                { $unwind: "$client_id" },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "history_created_by",
                        foreignField: "_id",
                        as: "history_created_by"
                    }
                },
                { $unwind: "$history_created_by" },
                { $sort: { history_created_at: -1 } },
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
//client active or inactive
module.exports.updateClientStatus = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var clientConnection = connection_db_api.model(collectionConstant.INVOICE_CLIENT, clientSchema);
            var requestObject = req.body;
            var id = requestObject._id;
            delete requestObject._id;

            var one_client = await clientConnection.findOne({ _id: ObjectID(id) });
            if (one_client) {
                var updateStatus = await clientConnection.updateOne({ _id: ObjectID(id) }, { client_status: requestObject.client_status });
                if (updateStatus) {
                    let action = '';
                    let message = '';
                    if (requestObject.client_status == 1) {
                        action = "Active";
                        message = "client status active successfully.";
                    } else {
                        action = "Inactive";
                        message = "client status inactive successfully.";
                    }

                    let histioryObject = {
                        data: [],
                        client_id: id,
                    };

                    addClientHistory(action, histioryObject, decodedToken);

                    res.send({ message: message, status: true });

                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                res.send({ message: "client not found with this id.", status: false });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false, error: e });

        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

//multiple client active or inactive
module.exports.updateMultipleClientStatus = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var clientConnection = connection_db_api.model(collectionConstant.INVOICE_CLIENT, clientSchema);
            var requestObject = req.body;

            var updateStatus = await clientConnection.updateMany({ _id: { $in: requestObject._id } }, { client_status: requestObject.client_status });

            if (updateStatus) {
                let action = '';
                let message = '';
                if (requestObject.client_status == 1) {
                    action = "Active";
                    message = "client status active successfully.";
                } else {
                    action = "Inactive";
                    message = "client status inactive successfully.";
                }

                for (let i = 0; i < requestObject._id.length; i++) {
                    let histioryObject = {
                        data: [],
                        client_id: requestObject._id[i],
                    };

                    addClientHistory(action, histioryObject, decodedToken);
                }
                res.send({ message: message, status: true });

            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false, error: e });

        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

//multiple delete client
module.exports.deleteMultipleClient = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;

            var clientConnection = connection_db_api.model(collectionConstant.INVOICE_CLIENT, clientSchema);


            requestObject.client_updated_by = decodedToken.UserData._id;
            requestObject.client_updated_at = Math.round(new Date().getTime() / 1000);
            var delete_client = await clientConnection.updateMany({ _id: { $in: requestObject._id } }, { is_delete: requestObject.is_delete });

            if (delete_client) {
                let action = '';
                let message = '';
                if (requestObject.is_delete == 1) {
                    action = "Archive";
                    message = "client archive successfully";
                } else {
                    action = "Restore";
                    message = "client restore successfully";
                }

                for (let i = 0; i < requestObject._id.length; i++) {
                    //var one_client = await clientConnection.findOne({ _id: ObjectID(requestObject._id[i]) });

                    let histioryObject = {
                        data: [],
                        client_id: requestObject._id[i],
                    };

                    addClientHistory(action, histioryObject, decodedToken);
                }
                res.send({ message: message, status: true });

            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
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

module.exports.getClientForTable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var clientConnection = connection_db_api.model(collectionConstant.INVOICE_CLIENT, clientSchema);

            let start = parseInt(requestObject.start);
            var perpage = parseInt(requestObject.length);

            var columnName = (requestObject.sort != undefined && requestObject.sort != '') ? requestObject.sort.field : '';
            var columnOrder = (requestObject.sort != undefined && requestObject.sort != '') ? requestObject.sort.order : '';
            var sort = {};
            sort[columnName] = (columnOrder == 'asc') ? 1 : -1;

            let match = { is_delete: requestObject.is_delete };
            var query = {
                $or: [
                    { "client_name": new RegExp(requestObject.search, 'i') },
                    { "client_number": new RegExp(requestObject.search, 'i') },
                    { "client_email": new RegExp(requestObject.search, 'i') },
                    { "approver.userfullname": new RegExp(requestObject.search, 'i') },
                    { "client_cost_cost.value": new RegExp(requestObject.search, 'i') },
                    { "department_name": new RegExp(requestObject.search, 'i') },
                ]
            };
            var get_data = await clientConnection.aggregate([
                { $match: match },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "approver_id",
                        foreignField: "_id",
                        as: "approver"
                    }
                },
                {
                    $unwind: {
                        preserveNullAndEmptyArrays: true,
                        path: "$approver"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.COSTCODES,
                        localField: "client_cost_cost_id",
                        foreignField: "_id",
                        as: "client_cost_cost"
                    }
                },
                {
                    $unwind: {
                        preserveNullAndEmptyArrays: true,
                        path: "$client_cost_cost"
                    }
                },
                { $sort: sort },
                { $match: query },
                { $limit: perpage + start },
                { $skip: start },
            ]).collation({ locale: "en_US" });
            let total_count = await clientConnection.find(match).countDocuments();
            let pager = {
                start: start,
                length: perpage,
                total: total_count
            };
            res.send({ status: true, data: get_data, pager });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false, error: e });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};


//get one invoice client
module.exports.getOneClient = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var clientConnection = connection_db_api.model(collectionConstant.INVOICE_CLIENT, clientSchema);

            var getdata = await clientConnection.findOne({ _id: requestObject._id });
            if (getdata) {
                res.send({ status: true, message: "Client data", data: getdata });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false, error: e });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

// bulk upload 
module.exports.checkImportClient = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var clientConnection = connection_db_api.model(collectionConstant.INVOICE_CLIENT, clientSchema);
            var form = new formidable.IncomingForm();
            var fields = [];
            var notFonud = 0;
            var newOpenFile;
            var fileName;
            form.parse(req)
                .on('file', function (name, file) {
                    notFonud = 1;
                    fileName = file;
                }).on('field', function (name, field) {
                    fields[name] = field;
                })
                .on('error', function (err) {
                    throw err;
                }).on('end', async function () {
                    newOpenFile = this.openedFiles;
                    if (notFonud == 1) {
                        const file = reader.readFile(newOpenFile[0].path);
                        const sheets = file.SheetNames;
                        let data = [];
                        let exitdata = [];
                        for (let i = 0; i < sheets.length; i++) {
                            const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[i]]);
                            temp.forEach((ress) => {
                                data.push(ress);
                            });
                        }
                        var allowImport = true;
                        for (let m = 0; m < data.length; m++) {
                            var get_one = await clientConnection.findOne({ client_name: data[m].client_name, is_delete: 0 });
                            if (get_one != null) {
                                allowImport = false;
                                exitdata.push({ message: 'Already exist', valid: false, data: data[m], name: data[m].client_name });
                            } else {
                                exitdata.push({ message: 'Data is correct', valid: true, data: data[m], name: data[m].client_name });
                            }
                        }
                        res.send({ status: true, allow_import: allowImport, data: exitdata, message: "Client Listing" });
                    } else {
                        res.send({ status: false, message: translator.getStr('SomethingWrong') });
                    }
                });
        } catch (error) {
            console.log(error);
            res.send({ status: false, message: translator.getStr('SomethingWrong'), error: error });
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.importClient = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var clientConnection = connection_db_api.model(collectionConstant.INVOICE_CLIENT, clientSchema);
            let reqObject = [];
            for (let i = 0; i < requestObject.length; i++) {
                let one_client = await clientConnection.findOne({ client_name: requestObject[i].data.client_name, is_delete: 0 });
                if (one_client) { } else {
                    reqObject.push({
                        client_name: requestObject[i].data.client_name,
                        client_number: requestObject[i].data.client_number,
                        client_email: requestObject[i].data.client_email,
                        client_notes: requestObject[i].data.client_notes,
                        approver_id: requestObject[i].data.approver_id,
                        gl_account: requestObject[i].data.gl_account,
                        client_cost_cost_id: requestObject[i].data.client_cost_cost_id,
                        created_at: Math.round(new Date().getTime() / 1000),
                        updated_at: Math.round(new Date().getTime() / 1000),
                        created_by: decodedToken.UserData._id,
                        updated_by: decodedToken.UserData._id,
                    });
                }
            }
            let insert_data = await clientConnection.insertMany(reqObject);
            if (insert_data) {
                for (let i = 0; i < insert_data.length; i++) {
                    let histioryObject = {
                        data: [
                            {
                                key: translator.getStr(`Client_History.client_name`),
                                value: insert_data[i].client_name,
                            }
                        ],
                        client_id: insert_data[i].id,
                    };
                    addClientHistory("Insert", histioryObject, decodedToken);
                }
                res.send({ status: true, message: "Client imported successfully.", data: insert_data });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        }
        finally {
            connection_db_api.close();
        }
    }
    else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};


module.exports.checkQBDImportClient = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var clientConnection = connection_db_api.model(collectionConstant.INVOICE_CLIENT, clientSchema);
            var userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            var costCodeConnection = connection_db_api.model(collectionConstant.COSTCODES, costCodeSchema);

            for (let m = 0; m < requestObject.length; m++) {

                var nameexist = await clientConnection.findOne({ "client_name": requestObject[m].Name });
                if (nameexist == null) {
                    requestObject.created_at = Math.round(new Date().getTime() / 1000);
                    requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                    requestObject.is_quickbooks = true;
                    requestObject.client_name = requestObject[m].Name;
                    requestObject.name = requestObject[m].Name;
                    if (requestObject[m].IsActive == true) {
                        requestObject.client_status = 1;
                    }
                    else if (requestObject[m].IsActive == false) {
                        requestObject.client_status = 2;
                    }
                    if (requestObject[m].Email != undefined) {
                        requestObject.client_email = requestObject[m].Email;
                    }
                    var add_client = new clientConnection(requestObject);
                    var save_client = await add_client.save();

                    var historyobj = {
                        client_status: requestObject[m].IsActive,
                        client_name: requestObject[m].Name,

                    };
                    // find difference of object 
                    let insertedData = await common.setInsertedFieldHistory(historyobj);

                    if (requestObject[m].approver_id !== '') {
                        let found_approver = _.findIndex(insertedData, function (tmp_data) { return tmp_data.key == 'approver_id'; });
                        if (found_approver != -1) {
                            let one_term = await userConnection.findOne({ _id: ObjectID(insertedData[found_approver].value) });
                            insertedData[found_approver].value = one_term.userfullname;
                        }
                    }

                    if (requestObject[m].client_cost_cost_id !== '') {
                        let found_costcode = _.findIndex(insertedData, function (tmp_data) { return tmp_data.key == 'client_cost_cost_id'; });
                        if (found_costcode != -1) {
                            let one_term = await costCodeConnection.findOne({ _id: ObjectID(insertedData[found_costcode].value) });
                            insertedData[found_costcode].value = one_term.value;
                        }
                    }

                    let found_status = _.findIndex(insertedData, function (tmp_data) { return tmp_data.key == 'client_status'; });
                    if (found_status != -1) {
                        insertedData[found_status].value = insertedData[found_status].value == 1 ? 'Active' : insertedData[found_status].value == 2 ? 'Inactive' : '';
                    }
                    for (let i = 0; i < insertedData.length; i++) {
                        insertedData[i]['key'] = translator.getStr(`Client_History.${insertedData[i]['key']}`);
                    }

                    let histioryObject = {
                        data: insertedData,
                        client_id: save_client.id,
                    };
                    addClientHistory("Insert", histioryObject, decodedToken);
                }
                else {
                    let one_client = await clientConnection.findOne({ client_name: requestObject[m].Name });
                    var reqdata = {};
                    if (requestObject[m].Email != undefined) {
                        reqdata.client_email = requestObject[m].Email;
                    }
                    if (requestObject[m].IsActive == true) {
                        reqdata.client_status = 1;
                    }
                    else if (requestObject[m].IsActive == false) {
                        reqdata.client_status = 2;
                    }

                    let updateclass_name = await clientConnection.updateOne({ client_name: requestObject[m].Name }, reqdata);


                    if (updateclass_name.nModified > 0) {
                        var historyobj = {
                            client_status: reqdata.client_status,
                            client_email: requestObject[m].Email,
                        };
                        console.log("historyobj", historyobj);
                        console.log("one_client", one_client._doc);

                        // find difference of object 
                        let updatedData = await common.findUpdatedFieldHistory(historyobj, one_client._doc);

                        // if (requestObject[m].approver_id !== '') {
                        //     let found_approver = _.findIndex(updatedData, function (tmp_data) { return tmp_data.key == 'approver_id'; });
                        //     if (found_approver != -1) {
                        //         let one_term = await userConnection.findOne({ _id: ObjectID(updatedData[found_approver].value) });
                        //         updatedData[found_approver].value = one_term.userfullname;
                        //     }
                        // }

                        // if (requestObject[m].client_cost_cost_id !== '') {
                        //     let found_costcode = _.findIndex(updatedData, function (tmp_data) { return tmp_data.key == 'client_cost_cost_id'; });
                        //     if (found_costcode != -1) {
                        //         let one_term = await costCodeConnection.findOne({ _id: ObjectID(updatedData[found_costcode].value) });
                        //         updatedData[found_costcode].value = one_term.value;
                        //     }
                        // }

                        let found_status = _.findIndex(updatedData, function (tmp_data) { return tmp_data.key == 'client_status'; });
                        if (found_status != -1) {
                            updatedData[found_status].value = updatedData[found_status].value == 1 ? 'Active' : updatedData[found_status].value == 2 ? 'Inactive' : '';
                        }
                        for (let i = 0; i < updatedData.length; i++) {
                            updatedData[i]['key'] = translator.getStr(`Client_History.${updatedData[i]['key']}`);
                        }
                        let histioryObject = {
                            data: updatedData,
                            client_id: one_client.id,
                        };
                        addClientHistory("Update", histioryObject, decodedToken);
                    }


                }
            }
            res.send({ status: true, message: "Client insert successfully..!" });

        } catch (error) {
            console.log(error);
            res.send({ status: false, message: translator.getStr('SomethingWrong'), error: error });
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};
