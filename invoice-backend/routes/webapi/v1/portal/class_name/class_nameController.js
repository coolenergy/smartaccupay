var classnameSchema = require('../../../../../model/class_name');
var tenantsSchema = require('../../../../../model/tenants');
let db_connection = require('../../../../../controller/common/connectiondb');
let collectionConstant = require('../../../../../config/collectionConstant');
let common = require('../../../../../controller/common/common');
var ObjectID = require('mongodb').ObjectID;
var formidable = require('formidable');
const reader = require('xlsx');
const config = require('../../../../../config/config');
var apInvoiceSchema = require('./../../../../../model/ap_invoices');

// class name  insert Edit 
module.exports.saveclassname = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var classNameConnection = connection_db_api.model(collectionConstant.INVOICE_CLASS_NAME, classnameSchema);
            let id = requestObject._id;
            delete requestObject._id;

            let get_data = await classNameConnection.findOne({ name: requestObject.name, is_delete: 0 });

            if (id) {
                //update invoice class name
                if (get_data != null) {
                    if (get_data._id == id) {
                        requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                        let updateclass_name = await classNameConnection.updateOne({ _id: ObjectID(id) }, requestObject);
                        if (updateclass_name) {
                            res.send({ status: true, message: "class name update successfully..!" });
                        } else {
                            res.send({ message: translator.getStr('SomethingWrong'), status: false });
                        }
                    } else {
                        res.send({ message: "class name allready exist", status: false });

                    }
                } else {
                    let updateclass_name = await classNameConnection.updateOne({ _id: ObjectID(id) }, requestObject);
                    if (updateclass_name) {
                        res.send({ status: true, message: "class name update succesfully..!" });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });

                    }
                }

            }
            else {
                //insert invoice class name

                var nameexist = await classNameConnection.findOne({ "name": requestObject.name });
                if (nameexist) {
                    res.send({ status: false, message: "class name allready exist" });
                }
                else {
                    requestObject.created_at = Math.round(new Date().getTime() / 1000);
                    requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                    var add_vendortype = new classNameConnection(requestObject);
                    var save_vendortype = await add_vendortype.save();
                    res.send({ status: true, message: "class name insert successfully..!", data: add_vendortype });
                }

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

// get class name
module.exports.getclassname = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var classNameConnection = connection_db_api.model(collectionConstant.INVOICE_CLASS_NAME, classnameSchema);
            let get_data = await classNameConnection.find({ is_delete: 0 });
            res.send({ status: true, message: "Get class name", data: get_data });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    }
    else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

//delete invoice class name
module.exports.deleteclassname = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let id = requestObject._id;
            delete requestObject._id;
            var classNameConnection = connection_db_api.model(collectionConstant.INVOICE_CLASS_NAME, classnameSchema);

            var apInvoiceConnection = connection_db_api.model(collectionConstant.AP_INVOICE, apInvoiceSchema);
            let apInvoicedocObject = await apInvoiceConnection.find({ class_name: ObjectID(id) });

            if (apInvoicedocObject.length > 0) {
                res.send({ message: translator.getStr('ClassNameHasData'), status: false });
            }
            else {
                let updated_data = await classNameConnection.updateOne({ _id: ObjectID(id) }, { is_delete: 1 });
                var is_delete = updated_data.nModified;
                if (is_delete == 0) {
                    res.send({ status: false, message: "There is no data with this id" });
                }
                else {
                    res.send({ status: true, message: translator.getStr('ClassNameDeleted'), data: updated_data });
                }
            }

        } catch (e) {
            console.log(e);
            res.send({ status: false, message: translator.getStr('SomethingWrong'), rerror: e });
        } finally {
            connection_db_api.close();
        }
    }
    else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.getclassnameForTable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var classNameConnection = connection_db_api.model(collectionConstant.INVOICE_CLASS_NAME, classnameSchema);
            var getdata = await classNameConnection.find({ is_delete: requestObject.is_delete }).sort({ created_at: -1 });
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
module.exports.checkImportClassName = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var classNameConnection = connection_db_api.model(collectionConstant.INVOICE_CLASS_NAME, classnameSchema);
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
                            var get_one = await classNameConnection.findOne({ name: data[m].name, is_delete: 0 });
                            if (get_one != null) {
                                allowImport = false;
                                exitdata.push({ message: 'Already exist', valid: false, data: data[m], name: data[m].name });
                            } else {
                                exitdata.push({ message: 'Data is correct', valid: true, data: data[m], name: data[m].name });
                            }
                        }
                        res.send({ status: true, allow_import: allowImport, data: exitdata, message: 'Class name listing' });
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

module.exports.importClassName = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var classNameConnection = connection_db_api.model(collectionConstant.INVOICE_CLASS_NAME, classnameSchema);

            let reqObject = [];
            for (let i = 0; i < requestObject.length; i++) {
                let one_data = await classNameConnection.findOne({ name: requestObject[i].data.name, is_delete: 0 });
                if (one_data) { } else {
                    reqObject.push({
                        name: requestObject[i].data.name,
                        number: requestObject[i].data.number,
                        description: requestObject[i].data.description,
                        status: requestObject[i].data.status,
                    });
                }
            }
            let insert_data = await classNameConnection.insertMany(reqObject);
            if (insert_data) {
                res.send({ status: true, message: 'CLass name added successfully.', data: insert_data });
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


module.exports.checkQBDImportClassName = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;

            var classNameConnection = connection_db_api.model(collectionConstant.INVOICE_CLASS_NAME, classnameSchema);

            for (let m = 0; m < requestObject.length; m++) {
                var nameexist = await classNameConnection.findOne({ "name": requestObject[m].Name });
                if (nameexist == null) {
                    delete requestObject[m].ListID;
                    delete requestObject[m].TimeCreated;
                    requestObject.created_at = Math.round(new Date().getTime() / 1000);
                    requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                    requestObject.is_quickbooks = true;
                    requestObject.name = requestObject[m].Name;
                    if (requestObject[m].IsActive == true) {
                        requestObject.status = 1;
                    }
                    else if (requestObject[m].IsActive == false) {
                        requestObject.status = 2;
                    }

                    var add_vendortype = new classNameConnection(requestObject);
                    var save_vendortype = await add_vendortype.save();

                }
                // else {

                //     delete requestObject[m].ListID;
                //     delete requestObject[m].TimeCreated;
                //     console.log(requestObject[m]);
                //     if (requestObject[m].IsActive == true) {
                //         requestObject.status = 1;
                //     }
                //     else if (requestObject[m].IsActive == false) {
                //         requestObject.status = 2;
                //     }

                //     let updateclass_name = await classNameConnection.updateOne({ name: requestObject[m].Name }, requestObject);
                // }

            }
            res.send({ status: true, message: "Class name inserted successfully..!" });

        } catch (error) {
            console.log(error);
            res.send({ status: false, message: translator.getStr('SomethingWrong'), error: error });
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

