var ObjectID = require('mongodb').ObjectID;
let collectionConstant = require('./../../../../../config/collectionConstant');
var ObjectID = require('mongodb').ObjectID;
let common = require('./../../../../../controller/common/common');
let db_connection = require('./../../../../../controller/common/connectiondb');
var supplier_unitOfMeasureSchema = require('./../../../../../model/supplier_unit_of_measures');
var formidable = require('formidable');
const reader = require('xlsx');

module.exports.getUnitOfMeasureOcpr = async function (req, res) {
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
                            let unitOfMeasureConnection = connection_db_api.model(collectionConstant.SUPPLIER_UNIT_OF_MEASURES, supplier_unitOfMeasureSchema);
                            let getData = await unitOfMeasureConnection.find({ is_delete: 0 });
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

module.exports.getUnitOfMeasure = async function (req, res) {
    var translator = new common.Language('en');
    var decodedToken = common.decodedJWT(req.headers.authorization);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let unitOfMeasureConnection = connection_db_api.model(collectionConstant.SUPPLIER_UNIT_OF_MEASURES, supplier_unitOfMeasureSchema);
            let getData = await unitOfMeasureConnection.find({ is_delete: 0 });
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

module.exports.saveUnitOfMeasure = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let _id = requestObject._id;
            delete requestObject._id;
            let unitOfMeasureConnection = connection_db_api.model(collectionConstant.SUPPLIER_UNIT_OF_MEASURES, supplier_unitOfMeasureSchema);
            let get_one = await unitOfMeasureConnection.findOne({ name: requestObject.name, is_delete: 0 });
            if (_id) {
                if (get_one != null) {
                    if (get_one._id == _id) {
                        let update_unit_of_measure = await unitOfMeasureConnection.updateOne({ _id: ObjectID(_id) }, requestObject);
                        if (update_unit_of_measure) {
                            res.send({ message: translator.getStr('UnitOfMeasureUpdate'), data: update_unit_of_measure, status: true });
                        } else {
                            res.send({ message: translator.getStr('SomethingWrong'), status: false });
                        }
                    } else {
                        res.send({ message: translator.getStr('UnitOfMeasureAlreadyExist'), status: false });
                    }
                } else {
                    let update_unit_of_measure = await unitOfMeasureConnection.updateOne({ _id: ObjectID(_id) }, requestObject);
                    if (update_unit_of_measure) {
                        res.send({ message: translator.getStr('UnitOfMeasureUpdate'), data: update_unit_of_measure, status: true });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), status: false });
                    }
                }
            } else {
                if (get_one == null) {
                    let add_unit_of_measure = new unitOfMeasureConnection(requestObject);
                    let save_unit_of_measure = await add_unit_of_measure.save();
                    if (save_unit_of_measure) {
                        res.send({ message: translator.getStr('UnitOfMeasureAdd'), data: save_unit_of_measure, status: true });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), status: false });
                    }
                } else {
                    res.send({ message: translator.getStr('UnitOfMeasureAlreadyExist'), status: false });
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

module.exports.deleteUnitOfMeasure = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let unitOfMeasureConnection = connection_db_api.model(collectionConstant.SUPPLIER_UNIT_OF_MEASURES, supplier_unitOfMeasureSchema);
            let deleteObject = await unitOfMeasureConnection.updateOne({ _id: ObjectID(requestObject._id) }, { is_delete: 1 });
            if (deleteObject) {
                let isDelete = deleteObject.nModified;
                if (isDelete == 0) {
                    res.send({ message: translator.getStr('NoDataWithId'), status: false });
                } else {
                    res.send({ message: translator.getStr('UnitOfMeasureDelete'), status: true });
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

module.exports.importUnitOfMeasure = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let unitOfMeasureConnection = connection_db_api.model(collectionConstant.SUPPLIER_UNIT_OF_MEASURES, supplier_unitOfMeasureSchema);
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
                            let onecategory_main = await unitOfMeasureConnection.findOne({ name: data[m].name, is_delete: 0 });

                            if (onecategory_main == null) {
                                requestObject.name = data[m].name;
                                requestObject.is_delete = 0;
                                let add_unit_of_measure = new unitOfMeasureConnection(requestObject);
                                let save_unit_of_measure = await add_unit_of_measure.save();
                            } else {
                            }
                        }
                        res.send({
                            status: true, message: translator.getStr('UnitOfMeasureAdd')
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


module.exports.exportUnitOfMeasure = async function (req, res) {

    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let unitOfMeasureConnection = connection_db_api.model(collectionConstant.SUPPLIER_UNIT_OF_MEASURES, supplier_unitOfMeasureSchema);
            let getData = await unitOfMeasureConnection.find({ is_delete: 0 });
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