var ObjectID = require('mongodb').ObjectID;
let collectionConstant = require('./../../../../../config/collectionConstant');
var ObjectID = require('mongodb').ObjectID;
var supplier_minority_codesSchema = require('./../../../../../model/supplier_minority_codes');
let common = require('./../../../../../controller/common/common');
let db_connection = require('./../../../../../controller/common/connectiondb');
var formidable = require('formidable');
const reader = require('xlsx');


module.exports.getCompanyMinorityCodeOCPR = async function (req, res) {
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
                            let supplierMinorityCodeConnection = connection_db_api.model(collectionConstant.SUPPLIER_MINORITY_CODE, supplier_minority_codesSchema);
                            let getData = await supplierMinorityCodeConnection.find({ is_delete: 0 });
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

module.exports.getCompanyMinorityCode = async function (req, res) {
    var translator = new common.Language('en');
    var decodedToken = common.decodedJWT(req.headers.authorization);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let supplierMinorityCodeConnection = connection_db_api.model(collectionConstant.SUPPLIER_MINORITY_CODE, supplier_minority_codesSchema);
            let getData = await supplierMinorityCodeConnection.find({ is_delete: 0 });
            res.send({ data: getData, status: true });

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

module.exports.saveCompanyMinorityCode = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let _id = requestObject._id;
            delete requestObject._id;
            let supplierMinorityCodeConnection = connection_db_api.model(collectionConstant.SUPPLIER_MINORITY_CODE, supplier_minority_codesSchema);
            let get_one = await supplierMinorityCodeConnection.findOne({ name: requestObject.name, is_delete: 0 });
            if (_id) {
                if (get_one != null) {
                    if (get_one._id == _id) {
                        let update_company_minority_code = await supplierMinorityCodeConnection.updateOne({ _id: ObjectID(_id) }, requestObject);
                        if (update_company_minority_code) {
                            res.send({ message: translator.getStr('CompanyMinorityCodeUpdate'), data: update_company_minority_code, status: true });
                        } else {
                            res.send({ message: translator.getStr('SomethingWrong'), status: false });
                        }
                    } else {
                        res.send({ message: translator.getStr('CompanyMinorityCodeAlreadyExist'), status: false });
                    }
                } else {
                    let update_company_minority_code = await supplierMinorityCodeConnection.updateOne({ _id: ObjectID(_id) }, requestObject);
                    if (update_company_minority_code) {
                        res.send({ message: translator.getStr('CompanyMinorityCodeUpdate'), data: update_company_minority_code, status: true });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), status: false });
                    }
                }
            } else {
                if (get_one == null) {
                    let add_company_minority_code = new supplierMinorityCodeConnection(requestObject);
                    let save_company_minority_code = await add_company_minority_code.save();
                    if (save_company_minority_code) {
                        res.send({ message: translator.getStr('CompanyMinorityCodeAdd'), data: save_company_minority_code, status: true });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), status: false });
                    }
                } else {
                    res.send({ message: translator.getStr('CompanyMinorityCodeAlreadyExist'), status: false });
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

module.exports.deleteCompanyMinorityCode = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let supplierMinorityCodeConnection = connection_db_api.model(collectionConstant.SUPPLIER_MINORITY_CODE, supplier_minority_codesSchema);
            let deleteObject = await supplierMinorityCodeConnection.updateOne({ _id: ObjectID(requestObject._id) }, { is_delete: 1 });
            if (deleteObject) {
                let isDelete = deleteObject.nModified;
                if (isDelete == 0) {
                    res.send({ message: translator.getStr('NoDataWithId'), status: false });
                } else {
                    res.send({ message: translator.getStr('CompanyMinorityCodeDelete'), status: true });
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

module.exports.importMinorityType = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let _id = requestObject._id;
            delete requestObject._id;
            let supplierMinorityCodeConnection = connection_db_api.model(collectionConstant.SUPPLIER_MINORITY_CODE, supplier_minority_codesSchema);

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
                            let onecategory_main = await supplierMinorityCodeConnection.findOne({ name: data[m].name, is_delete: 0 });
                            //let onecategory_main = await db_rest_api.findOne(main_db, collectionConstantOcps.SUPPLIER_MINORITY_CODE, { name: data[m].name, is_delete: 0 });
                            if (onecategory_main == null) {
                                requestObject.name = data[m].name;
                                requestObject.description = data[m].description;
                                requestObject.is_delete = 0;
                                let add_company_minority_code = new supplierMinorityCodeConnection(requestObject);
                                let save_company_minority_code = await add_company_minority_code.save();
                            } else {
                            }
                        }
                        res.send({ status: true, message: "Minority type added successfully" });
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


module.exports.exportMinorityType = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let supplierMinorityCodeConnection = connection_db_api.model(collectionConstant.SUPPLIER_MINORITY_CODE, supplier_minority_codesSchema);
            let getData = await supplierMinorityCodeConnection.find({ is_delete: 0 });
            res.send({ data: getData, status: true });
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