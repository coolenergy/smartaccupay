var taxRateSchema = require('./../../../../../model/tax_rate');
let db_connection = require('./../../../../../controller/common/connectiondb');
let config = require('./../../../../../config/config');
let collectionConstant = require('./../../../../../config/collectionConstant');
let common = require('./../../../../../controller/common/common');
var ObjectID = require('mongodb').ObjectID;
var formidable = require('formidable');
const reader = require('xlsx');


module.exports.getTaxRate = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let taxRateConnection = connection_db_api.model(collectionConstant.INVOICE_TAX_RATE, taxRateSchema);
            let get_data = await taxRateConnection.find({ is_delete: 0 });
            res.send({ status: true, message: 'Tax rate data', data: get_data });
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

// NOTE: need to check duplication of name before update or save
module.exports.saveTaxRate = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let taxRateConnection = connection_db_api.model(collectionConstant.INVOICE_TAX_RATE, taxRateSchema);
            var get_name = await taxRateConnection.findOne({ "name": requestObject.name, is_delete: 0 });
            let id = requestObject._id;
            delete requestObject._id;
            if (id) {
                //Update
                if (get_name != null) {
                    if (get_name._id == id) {
                        requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                        let update_data = await taxRateConnection.updateOne({ _id: ObjectID(id) }, requestObject);
                        if (update_data) {
                            res.send({ status: true, message: 'Tax rate updated successfully.', data: update_data });
                        } else {
                            res.send({ message: translator.getStr('SomethingWrong'), status: false });
                        }
                    }
                    else {
                        res.send({ status: false, message: 'Tax rate allready exist.' });
                    }
                } else {
                    let update_data = await taxRateConnection.updateOne({ _id: ObjectID(id) }, requestObject);
                    if (update_data) {
                        res.send({ status: true, message: 'Tax rate updated successfully.', data: update_data });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), status: false });
                    }
                }


            } else {
                //Insert 
                var nameexist = await taxRateConnection.findOne({ "name": requestObject.name });
                if (nameexist) {
                    res.send({ status: false, message: "Tax rate allready exist." });
                }
                else {
                    requestObject.created_at = Math.round(new Date().getTime() / 1000);
                    requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                    let add_tax_rate = new taxRateConnection(requestObject);
                    let save_tax_rate = await add_tax_rate.save();
                    res.send({ status: true, message: 'Tax rate saved successfully.', data: save_tax_rate });
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

module.exports.deleteTaxRate = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let id = requestObject._id;
            delete requestObject._id;
            let taxRateConnection = connection_db_api.model(collectionConstant.INVOICE_TAX_RATE, taxRateSchema);
            let update_data = await taxRateConnection.updateOne({ _id: ObjectID(id) }, { is_delete: 1 });
            let isDelete = update_data.nModified;
            if (isDelete == 0) {
                res.send({ status: false, message: 'There is no data with this id.' });
            } else {
                res.send({ status: true, message: 'Tax rate deleted successfully.', data: update_data });
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

// bulk upload 
module.exports.checkImportTaxRate = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let taxRateConnection = connection_db_api.model(collectionConstant.INVOICE_TAX_RATE, taxRateSchema);

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

                        for (let i = 0; i < sheets.length; i++) {
                            const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[i]]);
                            temp.forEach((ress) => {
                                data.push(ress);
                            });
                        }
                        let exitdata = [];
                        var allowImport = true;
                        for (let m = 0; m < data.length; m++) {
                            var get_one = await taxRateConnection.findOne({ name: data[m].name, is_delete: 0 });
                            if (get_one != null) {
                                allowImport = false;
                                exitdata.push({ message: 'Already exist', valid: false, data: data[m], name: data[m].name });
                            } else {
                                exitdata.push({ message: 'Data is correct', valid: true, data: data[m], name: data[m].name });
                            }
                        }
                        res.send({ status: true, allow_import: allowImport, data: exitdata, message: 'Tax Rate Listing' });
                    } else {
                        res.send({ status: false, message: translator.getStr('SomethingWrong'), rerror: e });
                    }
                });
        } catch (error) {
            console.log(error);
            res.send({ status: false, message: translator.getStr('SomethingWrong'), rerror: e });
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.importTaxRate = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let taxRateConnection = connection_db_api.model(collectionConstant.INVOICE_TAX_RATE, taxRateSchema);

            let reqObject = [];
            for (let i = 0; i < requestObject.length; i++) {
                let one_client = await taxRateConnection.findOne({ name: requestObject[i].data.name, is_delete: 0 });
                if (one_client) { } else {
                    reqObject.push({
                        name: requestObject[i].data.name
                    });
                }
            }
            let insert_data = await taxRateConnection.insertMany(reqObject);
            if (insert_data) {
                res.send({ status: true, message: 'Tax rate added successfully.', data: insert_data });
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

module.exports.gettax_rateForTable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let taxRateConnection = connection_db_api.model(collectionConstant.INVOICE_TAX_RATE, taxRateSchema);
            var getdata = await taxRateConnection.find({ is_delete: requestObject.is_delete }).sort({ created_at: -1 });
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