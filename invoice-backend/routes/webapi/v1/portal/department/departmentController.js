var departmentSchema = require('./../../../../../model/departments');
var userSchema = require('./../../../../../model/user');
const mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var common = require("./../../../../../controller/common/common");
let db_connection = require('./../../../../../controller/common/connectiondb');
let collectionConstant = require('./../../../../../config/collectionConstant');
var formidable = require('formidable');
const reader = require('xlsx');

module.exports.getalldepartment = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let departmentCollection = connection_db_api.model(collectionConstant.DEPARTMENTS, departmentSchema);
            let all_department = await departmentCollection.find({ is_delete: 0 });
            res.send({ message: translator.getStr('DepartmentListing'), data: all_department, status: true });
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

module.exports.savedepartment = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let departmentCollection = connection_db_api.model(collectionConstant.DEPARTMENTS, departmentSchema);
            let get_one = await departmentCollection.findOne({ department_name: requestObject.department_name, is_delete: 0 });
            if (requestObject._id) {
                if (get_one != null) {
                    if (get_one._id == requestObject._id) {
                        requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                        let update_doc_type = await departmentCollection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
                        if (update_doc_type) {
                            res.send({ message: translator.getStr('DepartmentUpdated'), data: update_doc_type, status: true });
                        } else {
                            res.send({ message: translator.getStr('SomethingWrong'), status: false });
                        }
                    } else {
                        res.send({ message: translator.getStr('DepartmentAlreadyExist'), status: false });
                    }
                } else {
                    let update_doc_type = await departmentCollection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
                    if (update_doc_type) {
                        res.send({ message: translator.getStr('DepartmentUpdated'), data: update_doc_type, status: true });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), status: false });
                    }
                }
            } else {
                if (get_one == null) {
                    requestObject.created_at = Math.round(new Date().getTime() / 1000);
                    requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                    let add_doc_type = new departmentCollection(requestObject);
                    let save_doc_type = await add_doc_type.save();
                    if (save_doc_type) {
                        res.send({ message: translator.getStr('DepartmentAdded'), data: save_doc_type, status: true });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), status: false });
                    }
                } else {
                    res.send({ message: translator.getStr('DepartmentAlreadyExist'), status: false });
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

module.exports.deleteDepartment = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let userCollection = connection_db_api.model(collectionConstant.USER, userSchema);
            let userObject = await userCollection.find({ userdepartment_id: ObjectID(req.body._id) });
            if (userObject.length > 0) {
                res.send({ message: translator.getStr('DepartmentHasData'), status: false });
            } else {
                let departmentCollection = connection_db_api.model(collectionConstant.DEPARTMENTS, departmentSchema);
                let departmentObject = await departmentCollection.updateOne({ _id: ObjectID(req.body._id) }, { is_delete: 1 });
                if (departmentObject) {
                    res.send({ message: translator.getStr('DepartmentDeleted'), status: true });
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

module.exports.getdepartmentForTable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let departmentCollection = connection_db_api.model(collectionConstant.DEPARTMENTS, departmentSchema);
            var getdata = await departmentCollection.find({ is_delete: requestObject.is_delete }).sort({ created_at: -1 });
            if (getdata) {
                res.send(getdata);
            } else {
                res.send([]);
            }
        } catch (e) {
            console.log(e);
            res.send([]);
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

// bulk upload 
module.exports.checkImportDepartment = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let departmentCollection = connection_db_api.model(collectionConstant.DEPARTMENTS, departmentSchema);
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
                            var get_one = await departmentCollection.findOne({ department_name: data[m].department_name, is_delete: 0 });
                            if (get_one != null) {
                                allowImport = false;
                                exitdata.push({ message: 'Already exist', valid: false, data: data[m], name: data[m].department_name });
                            } else {
                                exitdata.push({ message: 'Data is correct', valid: true, data: data[m], name: data[m].department_name });
                            }
                        }
                        res.send({ status: true, allow_import: allowImport, data: exitdata, message: translator.getStr('DepartmentListing') });
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

module.exports.importDepartment = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let departmentCollection = connection_db_api.model(collectionConstant.DEPARTMENTS, departmentSchema);

            let reqObject = [];
            for (let i = 0; i < requestObject.length; i++) {
                let one_client = await departmentCollection.findOne({ department_name: requestObject[i].data.department_name, is_delete: 0 });
                if (one_client) { } else {
                    reqObject.push({
                        department_name: requestObject[i].data.department_name,
                        created_at: Math.round(new Date().getTime() / 1000),
                        updated_at: Math.round(new Date().getTime() / 1000),
                        created_by: decodedToken.UserData._id,
                        updated_by: decodedToken.UserData._id,
                    });
                }
            }
            let insert_data = await departmentCollection.insertMany(reqObject);
            if (insert_data) {
                res.send({ status: true, message: translator.getStr('DepartmentAdded'), data: insert_data });
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