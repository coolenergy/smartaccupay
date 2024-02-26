var ObjectID = require('mongodb').ObjectID;
let collectionConstant = require('../../../../../config/collectionConstant');
var csiDivisionSchema = require('../../../../../model/supplier_csi_division');
let common = require('../../../../../controller/common/common');
let db_connection = require('../../../../../controller/common/connectiondb');
var formidable = require('formidable');
const reader = require('xlsx');

/*
    prime_work_performed-false means it is for CSI Division
*/
module.exports.getCSIDivisionOcpr = async function (req, res) {
    var requestObject = req.body;
    var translator = new common.Language('en');
    DB.findOne(collectionConstant.SUPER_ADMIN_COMPANY, { _id: ObjectID(requestObject.sponsor_id) }, function (err, resultfind) {
        if (err) {
            res.send({ message: translator.getStr('SomethingWrong'), error: err, status: false });
        } else {
            if (resultfind != null) {
                DB.findOne(collectionConstant.SUPER_ADMIN_TENANTS, { companycode: resultfind.companycode }, async function (err, resulttanent) {
                    if (err) {
                        res.send({ message: translator.getStr('SomethingWrong'), error: err, status: false });
                    } else {
                        var translator = new common.Language('en');
                        let connection_db_api = await db_connection.connection_db_api(resulttanent);
                        try {
                            let csiDivisionConnection = connection_db_api.model(collectionConstant.SUPPLIER_CSI_DIVISION, csiDivisionSchema);
                            let getData = await csiDivisionConnection.find({ is_delete: 0, prime_work_performed: false });
                            res.send({ data: getData, status: true });
                        } catch (e) {
                            console.log("e", e);
                            res.send({ message: translator.getStr('SomethingWrong'), status: false });
                        } finally {
                            connection_db_api.close();
                        }
                    }
                });
            } else {
                res.send({ message: translator.getStr('SponsorNotExist'), error: err, status: false });
            }
        }
    });
};

module.exports.getCSIDivision = async function (req, res) {
    var translator = new common.Language('en');
    var decodedToken = common.decodedJWT(req.headers.authorization);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let csiDivisionConnection = connection_db_api.model(collectionConstant.SUPPLIER_CSI_DIVISION, csiDivisionSchema);
            let getData = await csiDivisionConnection.find({ is_delete: 0, prime_work_performed: false });
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

module.exports.saveCSIDivision = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let _id = requestObject._id;
            delete requestObject._id;
            let csiDivisionConnection = connection_db_api.model(collectionConstant.SUPPLIER_CSI_DIVISION, csiDivisionSchema);
            let get_one = await csiDivisionConnection.findOne({ name: requestObject.name, prime_work_performed: false, is_delete: 0 });
            if (_id) {
                if (get_one != null) {
                    if (get_one._id == _id) {
                        let update_csi_division = await csiDivisionConnection.updateOne({ _id: ObjectID(_id) }, requestObject);
                        if (update_csi_division) {
                            res.send({ message: translator.getStr('CSIDivisionUpdate'), data: update_csi_division, status: true });
                        } else {
                            res.send({ message: translator.getStr('SomethingWrong'), status: false });
                        }
                    } else {
                        res.send({ message: translator.getStr('CSIDivisionAlreadyExist'), status: false });
                    }
                } else {
                    let update_csi_division = await csiDivisionConnection.updateOne({ _id: ObjectID(_id) }, requestObject);
                    if (update_csi_division) {
                        res.send({ message: translator.getStr('CSIDivisionUpdate'), data: update_csi_division, status: true });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), status: false });
                    }
                }
            } else {
                if (get_one == null) {
                    let add_csi_division = new csiDivisionConnection(requestObject);
                    let save_csi_division = await add_csi_division.save();
                    if (save_csi_division) {
                        res.send({ message: translator.getStr('CSIDivisionAdd'), data: save_csi_division, status: true });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), status: false });
                    }
                } else {
                    res.send({ message: translator.getStr('CSIDivisionAlreadyExist'), status: false });
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

module.exports.deleteCSIDivision = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let csiDivisionConnection = connection_db_api.model(collectionConstant.SUPPLIER_CSI_DIVISION, csiDivisionSchema);
            let deleteObject = await csiDivisionConnection.updateOne({ _id: ObjectID(requestObject._id) }, { is_delete: 1 });
            if (deleteObject) {
                let isDelete = deleteObject.nModified;
                if (isDelete == 0) {
                    res.send({ message: translator.getStr('NoDataWithId'), status: false });
                } else {
                    res.send({ message: translator.getStr('CSIDivisionDelete'), status: true });
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

module.exports.importCSIDivision = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let csiDivisionConnection = connection_db_api.model(collectionConstant.SUPPLIER_CSI_DIVISION, csiDivisionSchema);
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
                            let onecategory_main = await csiDivisionConnection.findOne({ name: data[m].name, is_delete: 0 });

                            if (onecategory_main == null) {
                                requestObject.name = data[m].name;
                                requestObject.is_delete = 0;
                                requestObject.prime_work_performed = false;
                                let add_csi_division = new csiDivisionConnection(requestObject);
                                let save_csi_division = await add_csi_division.save();

                                //res.send({ message: "Category added successfully", data: requestObject, status: true })
                            } else {
                                //res.send({ message: "Category already exist", status: false })
                            }
                        }
                        res.send({ status: true, message: "CSI division added successfully" });
                    }
                });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            // connection_db_api.close()
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.exportCSIDivision = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let csiDivisionConnection = connection_db_api.model(collectionConstant.SUPPLIER_CSI_DIVISION, csiDivisionSchema);
            let getData = await csiDivisionConnection.find({ is_delete: 0, prime_work_performed: false });
            res.send({ data: getData, status: true });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            // connection_db_api.close()
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};