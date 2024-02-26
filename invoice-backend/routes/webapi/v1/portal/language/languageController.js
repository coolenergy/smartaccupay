var languageSchema = require('../../../../../model/language');
const mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var common = require("../../../../../controller/common/common");
let db_connection = require('../../../../../controller/common/connectiondb');
let collectionConstant = require('../../../../../config/collectionConstant');
//let activityController = require("../todaysActivity/todaysActivityController");
var formidable = require('formidable');
const reader = require('xlsx');
var userSchema = require('./../../../../../model/user');

module.exports.getlanguage = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let lanaguageCollection = connection_db_api.model(collectionConstant.LANGUAGE, languageSchema);
            let all_language = await lanaguageCollection.find({ is_delete: 0 }).sort({ name: 1 });
            res.send({ message: translator.getStr('LanguageListing'), data: all_language, status: true });
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

module.exports.savelanguage = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;

            let lanaguageCollection = connection_db_api.model(collectionConstant.LANGUAGE, languageSchema);
            if (requestObject._id) {
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let update_language = await lanaguageCollection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
                if (update_language) {
                    //activityController.updateAllUser({ "api_setting.term": true }, decodedToken);
                    res.send({ message: translator.getStr('LanguageUpdated'), data: update_language, status: true });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                requestObject.created_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let add_language = new lanaguageCollection(requestObject);
                let save_language = await add_language.save();
                if (save_language) {
                    //activityController.updateAllUser({ "api_setting.term": true }, decodedToken);
                    res.send({ message: translator.getStr('LanguageAdded'), data: save_language, status: true });
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

module.exports.deletelanguage = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            requestObject = req.body;

            let lanaguageCollection = connection_db_api.model(collectionConstant.LANGUAGE, languageSchema);

            let userCollection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            let userObject = await userCollection.find({ user_languages: ObjectID(requestObject._id) });
            if (userObject.length > 0) {
                res.send({ message: translator.getStr('LanguageHasData'), status: false });
            }
            else {
                let update_language = await lanaguageCollection.updateOne({ _id: ObjectID(requestObject._id) }, { is_delete: 1 });
                let isDelete = update_language.nModified;
                if (update_language) {
                    if (isDelete == 0) {
                        res.send({ message: translator.getStr('NoDataWithId'), status: false });
                    } else {
                        //activityController.updateAllUser({ "api_setting.term": true }, decodedToken);
                        res.send({ message: translator.getStr('LanguageDeleted'), status: true });
                    }
                }
                else {
                    console.log(e);
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

//get Relationship
module.exports.getlanguageForTable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let lanaguageCollection = connection_db_api.model(collectionConstant.LANGUAGE, languageSchema);
            var getdata = await lanaguageCollection.find({ is_delete: requestObject.is_delete }).sort({ created_at: -1 });
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
module.exports.checkImportlanguage = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let lanaguageCollection = connection_db_api.model(collectionConstant.LANGUAGE, languageSchema);

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
                            var get_one = await lanaguageCollection.findOne({ name: data[m].name, is_delete: 0 });
                            if (get_one != null) {
                                allowImport = false;
                                exitdata.push({ message: 'Already exist', valid: false, data: data[m], name: data[m].name });
                            } else {
                                exitdata.push({ message: 'Data is correct', valid: true, data: data[m], name: data[m].name });
                            }
                        }
                        res.send({ status: true, allow_import: allowImport, data: exitdata, message: translator.getStr('LanguageListing') });
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

module.exports.importLanguage = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let lanaguageCollection = connection_db_api.model(collectionConstant.LANGUAGE, languageSchema);

            let reqObject = [];
            for (let i = 0; i < requestObject.length; i++) {
                let one_client = await lanaguageCollection.findOne({ name: requestObject[i].data.name, is_delete: 0 });
                if (one_client) { } else {
                    reqObject.push({
                        name: requestObject[i].data.name
                    });
                }
            }
            let insert_data = await lanaguageCollection.insertMany(reqObject);
            if (insert_data) {
                res.send({ status: true, message: translator.getStr('LanguageAdded'), data: insert_data });
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