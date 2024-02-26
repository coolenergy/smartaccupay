
var userDocumentSchema = require('./../../../../../model/userdocument');
var ObjectID = require('mongodb').ObjectID;
var common = require("./../../../../../controller/common/common");
let db_connection = require('./../../../../../controller/common/connectiondb');
let collectionConstant = require('./../../../../../config/collectionConstant');
var bucketOpration = require('../../../../../controller/common/s3-wasabi');
var formidable = require('formidable');
var config = require('./../../../../../config/config');
var fs = require('fs');
var moment = require('moment');
let attachmentLocations = require('./../../../../../config/attachmentLocations');

module.exports.getUserDocument = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let userDocumentConnection = connection_db_api.model(collectionConstant.INVOICE_USER_DOCUMENT, userDocumentSchema);
            let get_data = await userDocumentConnection.aggregate([
                {
                    $match: { userdocument_user_id: ObjectID(req.body._id), is_delete: 0 },
                },
                {
                    $lookup: {
                        from: collectionConstant.DOCUMENTTYPE,
                        localField: "userdocument_type_id",
                        foreignField: "_id",
                        as: "DOCUMENTTYPE"
                    }
                },
                {
                    $unwind: "$DOCUMENTTYPE"
                },
                {
                    $project: {
                        document_name: "$DOCUMENTTYPE.document_type_name",
                        userdocument_url: 1,
                        userdocument_type_id: 1,
                        userdocument_expire_date: 1,
                        show_on_qrcode_scan: 1,
                        _id: 1,
                        createdAt: 1
                    }
                },
                { $sort: { createdAt: -1 } }
            ]);
            if (get_data) {
                res.send(get_data);
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
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.getOneUserDocument = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let requestObject = req.body;
            let userDocumentConnection = connection_db_api.model(collectionConstant.INVOICE_USER_DOCUMENT, userDocumentSchema);
            let get_data = await userDocumentConnection.findOne({ _id: ObjectID(requestObject._id) });
            if (get_data) {
                res.send({ message: translator.getStr('UserDocumentListing'), data: get_data, status: true });
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

module.exports.deleteUserDocument = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        reqObject = req.body;
        if (reqObject.userdocument_url != undefined && reqObject.userdocument_url != "") {
            tmp_urlArray = reqObject.userdocument_url.split("/");
            last_array = tmp_urlArray.splice(0, 4);
            let params = {
                Bucket: last_array[last_array.length - 1],
                Key: tmp_urlArray.join("/")
            };
            bucketOpration.deleteObject(params, async function (err, resultUpload) {
                console.log(err, resultUpload);
                if (err) {
                    res.send({ message: translator.getStr('SomethingWrong'), error: err, status: false });
                } else {
                    let connection_db_api = await db_connection.connection_db_api(decodedToken);
                    let userDocumentConnection = connection_db_api.model(collectionConstant.INVOICE_USER_DOCUMENT, userDocumentSchema);
                    let userDocumentremove = await userDocumentConnection.updateOne({ _id: ObjectID(req.body._id) }, { is_delete: 1 },);

                    if (userDocumentremove.nModified >= 1) {
                        addUserDocumentHistory("Delete", { deleted_id: req.body._id }, decodedToken);
                        res.send({ message: translator.getStr('UserDocumentDeleted'), status: true });
                    } else {
                        res.send({ message: translator.getStr('NoDataWithId'), status: false });
                    }
                }
            });
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.editUserDocument = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {

            let userDocumentConnection = connection_db_api.model(collectionConstant.INVOICE_USER_DOCUMENT, userDocumentSchema);
            var form = new formidable.IncomingForm();
            var fields = [];
            var notFonud = 0;
            var newOpenFile;
            var fileName;
            form.parse(req)
                .on('file', function (name, file) {
                    notFonud = 1;
                    fileName = file;
                })
                .on('field', function (name, field) {
                    fields[name] = field;
                })
                .on('error', function (err) {
                    throw err;
                }).on('end', async function () {
                    newOpenFile = this.openedFiles;
                    var body = JSON.parse(fields.reqObject);
                    let LowerCase_bucket = decodedToken.companycode.toLowerCase();
                    body.userdocument_updated_by = decodedToken.UserData._id;
                    body.userdocument_updated_at = Math.round(new Date().getTime() / 1000);
                    body.userdocument_user_id = fields.user_id;
                    body.show_on_qrcode_scan = body.show_on_qrcode_scan == "true" || body.show_on_qrcode_scan == true ? true : false;
                    let edit_document_id = fields._id;
                    if (notFonud == 1) {
                        var temp_path = newOpenFile[0].path;
                        var file_name = newOpenFile[0].name;
                        let date = moment().format('D_MMM_YYYY_hh_mm_ss_SSS_A');
                        let array_name = newOpenFile[0].name.split(".");
                        var file_name_ext = array_name[array_name.length - 1];
                        //var file_name_ext = newOpenFile[0].name.split(".")[1];
                        var file_name = attachmentLocations.USER_DOCUMENT + "_" + date + "." + file_name_ext;
                        dirKeyName = "employee/" + fields.user_id + "/document/" + file_name;
                        var fileBody = fs.readFileSync(temp_path);
                        params = { Bucket: LowerCase_bucket, Key: dirKeyName, Body: fileBody, ACL: 'public-read-write' };
                        bucketOpration.uploadFile(params, async function (err, resultUpload) {
                            if (err) {
                                res.send({ message: translator.getStr('SomethingWrong'), error: err, status: false });
                            } else {
                                urlProfile = config.wasabisys_url + "/" + LowerCase_bucket + "/" + dirKeyName;
                                body.userdocument_url = urlProfile;
                                update_doc = await userDocumentConnection.updateOne({ _id: ObjectID(edit_document_id) }, body);
                                if (update_doc.nModified >= 1) {
                                    let history_object = body;
                                    history_object.updated_id = edit_document_id;
                                    addUserDocumentHistory("Update", history_object, decodedToken);
                                    res.send({ message: translator.getStr('UserDocumentUpdated'), status: true });
                                } else {
                                    res.send({ message: translator.getStr('NoDataWithId'), status: false });
                                }
                            }
                            //fs.unlinkSync(PROJECTROOT + "/" + filename)
                        });
                    } else {
                        update_doc = await userDocumentConnection.updateOne({ _id: ObjectID(edit_document_id) }, body);
                        if (update_doc.nModified >= 1) {
                            let history_object = body;
                            history_object.updated_id = edit_document_id;
                            addUserDocumentHistory("Update", history_object, decodedToken);
                            res.send({ message: translator.getStr('UserDocumentUpdated'), status: true });
                        } else {
                            res.send({ message: translator.getStr('NoDataWithId'), status: false });
                        }
                    }
                });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            //connection_db_api.close()
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};


var usersdocument_historiesSchema = require('./../../../../../model/history/userdocument_history');
let historyCollectionConstant = require('./../../../../../config/historyCollectionConstant');

async function addUserDocumentHistory(action, data, decodedToken) {
    try {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        let usersdocument_historiesConnection = connection_db_api.model(historyCollectionConstant.INVOICE_USER_DOCUMENT_HISTORY, usersdocument_historiesSchema);
        data.action = action;
        data.created_at = Math.round(new Date().getTime() / 1000);
        data.created_by = decodedToken.UserData._id;
        let save_usersdocument_histories = new usersdocument_historiesConnection(data);
        save_usersdocument_histories.save();

    } catch (e) {
        console.log("=====USER DOCUMENT HISTORY ERROR=========", e);
    }
}
