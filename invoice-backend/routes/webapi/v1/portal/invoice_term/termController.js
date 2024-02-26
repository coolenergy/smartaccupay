var termSchema = require('./../../../../../model/invoice_term');
let db_connection = require('./../../../../../controller/common/connectiondb');
let config = require('./../../../../../config/config');
let collectionConstant = require('./../../../../../config/collectionConstant');
let common = require('./../../../../../controller/common/common');
var ObjectID = require('mongodb').ObjectID;
var formidable = require('formidable');
const reader = require('xlsx');
var apInvoiceSchema = require('./../../../../../model/ap_invoices');

//save term
module.exports.saveTerm = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var termConnection = connection_db_api.model(collectionConstant.INVOICE_TERM, termSchema);
            var get_one = await termConnection.findOne({ "name": requestObject.name, is_delete: 0 });
            var id = requestObject._id;
            delete requestObject._id;
            if (id) {
                if (get_one != null) {
                    if (get_one._id == id) {
                        requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                        let update_term = await termConnection.updateOne({ _id: ObjectID(id) }, requestObject);
                        if (update_term) {
                            res.send({ status: true, message: "Term update succesfully", data: update_term });
                        } else {
                            res.send({ message: translator.getStr('SomethingWrong'), status: false });
                        }
                    } else {
                        res.send({ status: false, message: "Term is already exist" });
                    }
                } else {
                    let update_term = await termConnection.updateOne({ _id: ObjectID(id) }, requestObject);
                    if (update_term) {
                        res.send({ status: true, message: "Term update succesfull", data: update_term });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), status: false });
                    }
                }

            } else {
                if (get_one == null) {
                    requestObject.created_at = Math.round(new Date().getTime() / 1000);
                    requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                    let add_term = new termConnection(requestObject);
                    let save_term = await add_term.save();
                    if (save_term) {
                        res.send({ status: true, message: "Term saved successfully", data: save_term });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), status: false });
                    }
                } else {
                    res.send({ status: false, message: "Term is already exist" });
                }
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

// get term
module.exports.getTerm = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var termConnection = connection_db_api.model(collectionConstant.INVOICE_TERM, termSchema);
            let get_data = await termConnection.find({ is_delete: 0 }).sort({ name: 1 }).collation({ locale: "en_US" });
            res.send({ status: true, message: "Term data", data: get_data });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

// delete term
module.exports.deleteTerm = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);

    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var id = requestObject._id;
            delete requestObject._id;

            let termConnection = connection_db_api.model(collectionConstant.INVOICE_TERM, termSchema);

            var apInvoiceConnection = connection_db_api.model(collectionConstant.AP_INVOICE, apInvoiceSchema);
            let apInvoicedocObject = await apInvoiceConnection.find({ terms: ObjectID(id) });

            if (apInvoicedocObject.length > 0) {
                res.send({ message: translator.getStr('TermHasData'), status: false });
            }
            else {
                let update_data = await termConnection.updateOne({ _id: ObjectID(id) }, { is_delete: 1 });
                let isDelete = update_data.nModified;
                if (update_data) {
                    if (isDelete == 0) {
                        res.send({ status: false, message: 'There is no data with this id.' });
                    } else {
                        res.send({ status: true, message: 'Term deleted successfully.', data: update_data });
                    }
                } else {
                    res.send({ status: false, message: "something wrong" });
                }
            }

        } catch (e) {
            console.log(e);
            res.send({ status: false, message: "something wrong", error: e });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: "invalid user" });
    }
};

// bulk upload 
module.exports.checkImportTerm = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var termConnection = connection_db_api.model(collectionConstant.INVOICE_TERM, termSchema);

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
                            var get_one = await termConnection.findOne({ name: data[m].name, is_delete: 0 });
                            if (get_one != null) {
                                allowImport = false;
                                exitdata.push({ message: 'Already exist', valid: false, data: data[m], name: data[m].name });
                            } else {
                                exitdata.push({ message: 'Data is correct', valid: true, data: data[m], name: data[m].name });
                            }
                        }
                        res.send({ status: true, allow_import: allowImport, data: exitdata, message: "Term Listing" });
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

module.exports.importTerm = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var termConnection = connection_db_api.model(collectionConstant.INVOICE_TERM, termSchema);

            let reqObject = [];
            for (let i = 0; i < requestObject.length; i++) {
                let one_client = await termConnection.findOne({ name: requestObject[i].data.name, is_delete: 0 });
                if (one_client) { } else {
                    reqObject.push({
                        name: requestObject[i].data.name,
                        due_days: requestObject[i].data.due_days,
                        is_discount: requestObject[i].data.is_discount,
                        is_discount: requestObject[i].data.is_discount.toString().toLowerCase() == "true",
                        discount: requestObject[i].data.discount,
                    });
                }
            }
            let insert_data = await termConnection.insertMany(reqObject);
            if (insert_data) {
                res.send({ status: true, message: "Term added successfully.", data: insert_data });
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


module.exports.gettermForTable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var termConnection = connection_db_api.model(collectionConstant.INVOICE_TERM, termSchema);
            var getdata = await termConnection.find({ is_delete: requestObject.is_delete }).sort({ created_at: -1 });
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