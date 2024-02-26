var relationshipSchema = require('../../../../../model/relationships');
var ObjectID = require('mongodb').ObjectID;
let db_connection = require('../../../../../controller/common/connectiondb');
let common = require('../../../../../controller/common/common');
let collectionConstant = require('../../../../../config/collectionConstant');
var formidable = require('formidable');
const reader = require('xlsx');
var emergency_contactsSchema = require('./../../../../../model/emergency_contacts');

module.exports.getAllRelationships = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let relationshipsCollection = connection_db_api.model(collectionConstant.RELATIONSHIP, relationshipSchema);
            let all_relationships = await relationshipsCollection.find({ is_delete: 0 });
            res.send({ message: translator.getStr('RelationshipListing'), data: all_relationships, status: true });
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

module.exports.saveRelationship = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let relationshipsCollection = connection_db_api.model(collectionConstant.RELATIONSHIP, relationshipSchema);
            let get_one = await relationshipsCollection.findOne({ relationship_name: requestObject.relationship_name, is_delete: 0 });
            if (requestObject._id) {
                requestObject.relationship_updated_at = Math.round(new Date().getTime() / 1000);
                requestObject.relationship_updated_by = decodedToken.UserData._id;
                if (get_one != null) {
                    if (get_one._id == requestObject._id) {
                        requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                        let update_relationship = await relationshipsCollection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
                        if (update_relationship) {
                            res.send({ message: translator.getStr('RelationshipUpdated'), data: update_relationship, status: true });
                        } else {
                            res.send({ message: translator.getStr('SomethingWrong'), status: false });
                        }
                    } else {
                        res.send({ message: translator.getStr('RelationshipAlreadyExist'), status: false });
                    }
                } else {
                    let update_relationship = await relationshipsCollection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
                    if (update_relationship) {
                        res.send({ message: translator.getStr('RelationshipUpdated'), data: update_relationship, status: true });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), status: false });
                    }
                }
            } else {
                if (get_one == null) {
                    requestObject.created_at = Math.round(new Date().getTime() / 1000);
                    requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                    let add_relationship = new relationshipsCollection(requestObject);
                    let save_relationship = await add_relationship.save();
                    if (save_relationship) {
                        res.send({ message: translator.getStr('RelationshipAdded'), data: save_relationship, status: true });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), status: false });
                    }
                } else {
                    res.send({ message: translator.getStr('RelationshipAlreadyExist'), status: false });
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

module.exports.deleteRelationship = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var requestObject = req.body;
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let relationshipsCollection = connection_db_api.model(collectionConstant.RELATIONSHIP, relationshipSchema);

            let emergencycontactsCollection = connection_db_api.model(collectionConstant.EMERGENCY_CONTACT, emergency_contactsSchema);
            let emergencycontactdocObject = await emergencycontactsCollection.find({ emergency_contact_relation: ObjectID(requestObject._id) });

            if (emergencycontactdocObject.length > 0) {
                res.send({ message: translator.getStr('RelationshipHasData'), status: false });
            }
            else {

                let jobTitleObject = await relationshipsCollection.updateOne({ _id: ObjectID(req.body._id) }, { is_delete: 1 });
                if (jobTitleObject) {
                    res.send({ message: translator.getStr('RelationshipDeleted'), status: true });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            }

        } catch (e) {
            console.log("e: ", e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

//get Relationship
module.exports.getRelationshipForTable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let relationshipsCollection = connection_db_api.model(collectionConstant.RELATIONSHIP, relationshipSchema);
            var getdata = await relationshipsCollection.find({ is_delete: requestObject.is_delete }).sort({ created_at: -1 });
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
module.exports.checkImportRelationship = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let relationshipsCollection = connection_db_api.model(collectionConstant.RELATIONSHIP, relationshipSchema);
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
                            var get_one = await relationshipsCollection.findOne({ relationship_name: data[m].relationship_name, is_delete: 0 });
                            if (get_one != null) {
                                allowImport = false;
                                exitdata.push({ message: 'Already exist', valid: false, data: data[m], name: data[m].relationship_name });
                            } else {
                                exitdata.push({ message: 'Data is correct', valid: true, data: data[m], name: data[m].relationship_name });
                            }
                        }
                        res.send({ status: true, allow_import: allowImport, data: exitdata, message: translator.getStr('RelationshipListing') });
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

module.exports.importRelationship = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let relationshipsCollection = connection_db_api.model(collectionConstant.RELATIONSHIP, relationshipSchema);

            let reqObject = [];
            for (let i = 0; i < requestObject.length; i++) {
                let one_client = await relationshipsCollection.findOne({ relationship_name: requestObject[i].data.relationship_name, is_delete: 0 });
                if (one_client) { } else {
                    reqObject.push({
                        relationship_name: requestObject[i].data.relationship_name,
                    });
                }
            }
            let insert_data = await relationshipsCollection.insertMany(reqObject);
            if (insert_data) {
                res.send({ status: true, message: translator.getStr('RelationshipAdded'), data: insert_data });
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