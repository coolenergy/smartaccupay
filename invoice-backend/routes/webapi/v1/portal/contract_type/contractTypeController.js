var ObjectID = require('mongodb').ObjectID;
let collectionConstant = require('../../../../../config/collectionConstant');
var ObjectID = require('mongodb').ObjectID;
let common = require('../../../../../controller/common/common');
let db_connection = require('../../../../../controller/common/connectiondb');
var supplierContractTypeSchema = require('../../../../../model/supplier_contract_types');
var formidable = require('formidable');
const reader = require('xlsx');

module.exports.getContractType = async function (req, res) {
    var translator = new common.Language('en');
    var decodedToken = common.decodedJWT(req.headers.authorization);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let contractTypeConnection = connection_db_api.model(collectionConstant.SUPPLIER_CONTRACT_TYPE, supplierContractTypeSchema);
            let getData = await contractTypeConnection.find({ is_delete: 0 });
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

module.exports.saveContractType = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let _id = requestObject._id;
            delete requestObject._id;
            let contractTypeConnection = connection_db_api.model(collectionConstant.SUPPLIER_CONTRACT_TYPE, supplierContractTypeSchema);
            let get_one = await contractTypeConnection.findOne({ name: requestObject.name, is_delete: 0 });
            if (_id) {
                if (get_one != null) {
                    if (get_one._id == _id) {
                        let update_contract_type = await contractTypeConnection.updateOne({ _id: ObjectID(_id) }, requestObject);
                        if (update_contract_type) {
                            res.send({ message: translator.getStr('ContractTypeUpdate'), data: update_contract_type, status: true });
                        } else {
                            res.send({ message: translator.getStr('SomethingWrong'), status: false });
                        }
                    } else {
                        res.send({ message: translator.getStr('ContractTypeAlreadyExist'), status: false });
                    }
                } else {
                    let update_contract_type = await contractTypeConnection.updateOne({ _id: ObjectID(_id) }, requestObject);
                    if (update_contract_type) {
                        res.send({ message: translator.getStr('ContractTypeUpdate'), data: update_contract_type, status: true });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), status: false });
                    }
                }
            } else {
                if (get_one == null) {
                    let add_contract_type = new contractTypeConnection(requestObject);
                    let save_contract_type = await add_contract_type.save();
                    if (save_contract_type) {
                        res.send({ message: translator.getStr('ContractTypeAdd'), data: save_contract_type, status: true });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), status: false });
                    }
                } else {
                    res.send({ message: translator.getStr('ContractTypeAlreadyExist'), status: false });
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

module.exports.deleteContractType = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let contractTypeConnection = connection_db_api.model(collectionConstant.SUPPLIER_CONTRACT_TYPE, supplierContractTypeSchema);
            let deleteObject = await contractTypeConnection.updateOne({ _id: ObjectID(requestObject._id) }, { is_delete: 1 });
            if (deleteObject) {
                let isDelete = deleteObject.nModified;
                if (isDelete == 0) {
                    res.send({ message: translator.getStr('NoDataWithId'), status: false });
                } else {
                    res.send({ message: translator.getStr('ContractTypeDelete'), status: true });
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


module.exports.importContractType = async function (req, res) {

    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {

            let contractTypeConnection = connection_db_api.model(collectionConstant.SUPPLIER_CONTRACT_TYPE, supplierContractTypeSchema);
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
                            let onecategory_main = await contractTypeConnection.findOne({ name: data[m].name, is_expiration: data[m].is_expiration, is_delete: 0 });

                            if (onecategory_main == null) {
                                requestObject.name = data[m].name;
                                requestObject.is_delete = 0;
                                if (data[m].is_expiration) {
                                    requestObject.is_expiration = data[m].is_expiration == "Yes" ||
                                        data[m].is_expiration == "yes" ? true : false;
                                } else {
                                    requestObject.is_expiration = false;
                                }
                                let add_contract_type = new contractTypeConnection(requestObject);
                                let save_contract_type = await add_contract_type.save();
                            } else {
                            }
                        }
                        res.send({
                            status: true, message: translator.getStr('ContractTypeAdd')
                        });
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


module.exports.exportContractType = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let contractTypeConnection = connection_db_api.model(collectionConstant.SUPPLIER_CONTRACT_TYPE, supplierContractTypeSchema);
            let getData = await contractTypeConnection.find({ is_delete: 0 });
            res.send({ data: getData, status: true });
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