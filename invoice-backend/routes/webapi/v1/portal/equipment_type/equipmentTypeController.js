var ObjectID = require('mongodb').ObjectID;
let collectionConstant = require('../../../../../config/collectionConstant');
var ObjectID = require('mongodb').ObjectID;
let common = require('../../../../../controller/common/common');
let db_connection = require('../../../../../controller/common/connectiondb');
var supplier_equipment_typeSchema = require('../../../../../model/supplier_equipment_types');
var formidable = require('formidable');
const reader = require('xlsx');

module.exports.getEquipmentTypeOcpr = async function (req, res) {
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
                            let equipmentTypeConnection = connection_db_api.model(collectionConstant.SUPPLIER_EQUIPMENT_TYPE, supplier_equipment_typeSchema);
                            let getData = await equipmentTypeConnection.find({ is_delete: 0 });
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

module.exports.getEquipmentType = async function (req, res) {
    var translator = new common.Language('en');
    var decodedToken = common.decodedJWT(req.headers.authorization);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let equipmentTypeConnection = connection_db_api.model(collectionConstant.SUPPLIER_EQUIPMENT_TYPE, supplier_equipment_typeSchema);
            let getData = await equipmentTypeConnection.find({ is_delete: 0 });
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

module.exports.saveEquipmentType = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let _id = requestObject._id;
            delete requestObject._id;
            let equipmentTypeConnection = connection_db_api.model(collectionConstant.SUPPLIER_EQUIPMENT_TYPE, supplier_equipment_typeSchema);
            let get_one = await equipmentTypeConnection.findOne({ name: requestObject.name, is_delete: 0 });
            if (_id) {
                if (get_one != null) {
                    if (get_one._id == _id) {
                        let update_equipment_type = await equipmentTypeConnection.updateOne({ _id: ObjectID(_id) }, requestObject);
                        if (update_equipment_type) {
                            res.send({ message: translator.getStr('EquipmentTypeUpdate'), data: update_equipment_type, status: true });
                        } else {
                            res.send({ message: translator.getStr('SomethingWrong'), status: false });
                        }
                    } else {
                        res.send({ message: translator.getStr('EquipmentTypeAlreadyExist'), status: false });
                    }
                } else {
                    let update_equipment_type = await equipmentTypeConnection.updateOne({ _id: ObjectID(_id) }, requestObject);
                    if (update_equipment_type) {
                        res.send({ message: translator.getStr('EquipmentTypeUpdate'), data: update_equipment_type, status: true });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), status: false });
                    }
                }
            } else {
                if (get_one == null) {
                    let add_equipment_type = new equipmentTypeConnection(requestObject);
                    let save_equipment_type = await add_equipment_type.save();
                    if (save_equipment_type) {
                        res.send({ message: translator.getStr('EquipmentTypeAdd'), data: save_equipment_type, status: true });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), status: false });
                    }
                } else {
                    res.send({ message: translator.getStr('EquipmentTypeAlreadyExist'), status: false });
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

module.exports.deleteEquipmentType = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let equipmentTypeConnection = connection_db_api.model(collectionConstant.SUPPLIER_EQUIPMENT_TYPE, supplier_equipment_typeSchema);
            let deleteObject = await equipmentTypeConnection.updateOne({ _id: ObjectID(requestObject._id) }, { is_delete: 1 });
            if (deleteObject) {
                let isDelete = deleteObject.nModified;
                if (isDelete == 0) {
                    res.send({ message: translator.getStr('NoDataWithId'), status: false });
                } else {
                    res.send({ message: translator.getStr('EquipmentTypeDelete'), status: true });
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


module.exports.importEquipmentType = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let equipmentTypeConnection = connection_db_api.model(collectionConstant.SUPPLIER_EQUIPMENT_TYPE, supplier_equipment_typeSchema);
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
                            let onecategory_main = await equipmentTypeConnection.findOne({ name: data[m].name, is_delete: 0 });

                            if (onecategory_main == null) {
                                requestObject.name = data[m].name;
                                requestObject.is_delete = 0;
                                let add_equipment_type = new equipmentTypeConnection(requestObject);
                                let save_equipment_type = await add_equipment_type.save();
                            } else {
                            }
                        }
                        res.send({
                            status: true, message: translator.getStr('EquipmentTypeAdd')
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


module.exports.exportEquipmentType = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let equipmentTypeConnection = connection_db_api.model(collectionConstant.SUPPLIER_EQUIPMENT_TYPE, supplier_equipment_typeSchema);
            let getData = await equipmentTypeConnection.find({ is_delete: 0 });
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