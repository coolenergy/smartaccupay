var ObjectID = require('mongodb').ObjectID;
let collectionConstant = require('../../../../../config/collectionConstant');
var ObjectID = require('mongodb').ObjectID;
var projectTypeSchema = require('../../../../../model/supplier_project_type');
let common = require('../../../../../controller/common/common');
let db_connection = require('../../../../../controller/common/connectiondb');
var formidable = require('formidable');
const reader = require('xlsx');

module.exports.getProjectType = async function (req, res) {
    var translator = new common.Language('en');
    var decodedToken = common.decodedJWT(req.headers.authorization);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let projectTypeConnection = connection_db_api.model(collectionConstant.SUPPLIER_PROJECT_TYPE, projectTypeSchema);
            let getData = await projectTypeConnection.find({ is_delete: 0 });
            res.send({ data: getData, status: true });
        } catch (e) {
            res.send({ message: translator.getStr('SomethingWrong'), status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.saveProjectType = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let _id = requestObject._id;
            delete requestObject._id;
            let projectTypeConnection = connection_db_api.model(collectionConstant.SUPPLIER_PROJECT_TYPE, projectTypeSchema);
            let get_one = await projectTypeConnection.findOne({ name: requestObject.name, is_delete: 0 });
            if (_id) {
                if (get_one != null) {
                    if (get_one._id == _id) {
                        let update_project_type = await projectTypeConnection.updateOne({ _id: ObjectID(_id) }, requestObject);
                        if (update_project_type) {
                            res.send({ message: translator.getStr('ProjectTypeUpdate'), data: update_project_type, status: true });
                        } else {
                            res.send({ message: translator.getStr('SomethingWrong'), status: false });
                        }
                    } else {
                        res.send({ message: translator.getStr('ProjectTypeAlreadyExist'), status: false });
                    }
                } else {
                    let update_project_type = await projectTypeConnection.updateOne({ _id: ObjectID(_id) }, requestObject);
                    if (update_project_type) {
                        res.send({ message: translator.getStr('ProjectTypeUpdate'), data: update_project_type, status: true });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), status: false });
                    }
                }
            } else {
                if (get_one == null) {
                    let add_project_type = new projectTypeConnection(requestObject);
                    let save_project_type = await add_project_type.save();
                    if (save_project_type) {
                        res.send({ message: translator.getStr('ProjectTypeAdd'), data: save_project_type, status: true });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), status: false });
                    }
                } else {
                    res.send({ message: translator.getStr('ProjectTypeAlreadyExist'), status: false });
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

module.exports.deleteProjectType = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let projectTypeConnection = connection_db_api.model(collectionConstant.SUPPLIER_PROJECT_TYPE, projectTypeSchema);
            let deleteObject = await projectTypeConnection.updateOne({ _id: ObjectID(requestObject._id) }, { is_delete: 1 });
            if (deleteObject) {
                let isDelete = deleteObject.nModified;
                if (isDelete == 0) {
                    res.send({ message: translator.getStr('NoDataWithId'), status: false });
                } else {
                    res.send({ message: translator.getStr('ProjectTypeDelete'), status: true });
                }
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
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

module.exports.importProjectType = async function (req, res) {

    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let projectTypeConnection = connection_db_api.model(collectionConstant.SUPPLIER_PROJECT_TYPE, projectTypeSchema);
            var form = new formidable.IncomingForm();
            var fields = [];
            var notFonud = 0;
            var newOpenFile;
            // var fileType;
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
                        for (let i = 0; i < sheets.length; i++) {
                            const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[i]]);
                            temp.forEach((ress) => {
                                data.push(ress);
                            });
                        }
                        for (let m = 0; m < data.length; m++) {
                            requestObject = {};
                            let onecategory_main = await projectTypeConnection.findOne({ name: data[m].name, is_delete: 0 });
                            //let onecategory_main = await db_rest_api.findOne(main_db, collectionConstantOcps.SUPPLIER_PROJECT_TYPE, { name: data[m].name, is_delete: 0 });
                            if (onecategory_main == null) {
                                requestObject.name = data[m].name;
                                requestObject.is_delete = 0;
                                let add_project_type = new projectTypeConnection(requestObject);
                                await add_project_type.save();
                            } else {
                            }
                        }
                        res.send({ status: true, message: "Project type added successfully" });
                    }
                });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {

        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.exportProjectType = async function (req, res) {

    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let projectTypeConnection = connection_db_api.model(collectionConstant.SUPPLIER_PROJECT_TYPE, projectTypeSchema);
            let getData = await projectTypeConnection.find({ is_delete: 0 });
            res.send({ data: getData, status: true });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {

        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};