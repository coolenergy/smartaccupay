var documentSchema = require('../../../../../model/document');
let db_connection = require('../../../../../controller/common/connectiondb');
let collectionConstant = require('../../../../../config/collectionConstant');
let common = require('./../../../../../controller/common/common');
var ObjectID = require('mongodb').ObjectID;
var formidable = require('formidable');
const reader = require('xlsx');

// insert invoice_document
module.exports.saveInvoicedocument = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var documentConnection = connection_db_api.model(collectionConstant.INVOICE_DOCUMENT, documentSchema);
            let id = requestObject._id;
            delete requestObject._id;

            let get_data = await documentConnection.findOne({ name: requestObject.name, is_delete: 0 });

            if (id) {
                //update invoice document
                if (get_data != null) {
                    if (get_data._id == id) {
                        requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                        let updateDocument = await documentConnection.updateOne({ _id: ObjectID(id) }, requestObject);
                        if (updateDocument) {
                            res.send({ status: true, message: "document update successfully..!" });
                        } else {
                            res.send({ message: translator.getStr('SomethingWrong'), status: false });
                        }
                    } else {
                        res.send({ message: "document allready exist", status: false });

                    }
                } else {
                    let updateDocument = await documentConnection.updateOne({ _id: ObjectID(id) }, requestObject);
                    if (updateDocument) {
                        res.send({ status: true, message: "document update succesfully..!" });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });

                    }
                }

            }
            else {
                //insert invoice document

                var nameexist = await documentConnection.findOne({ "name": requestObject.name });
                if (nameexist) {
                    res.send({ status: false, message: "document allready exist" });
                }
                else {
                    requestObject.created_at = Math.round(new Date().getTime() / 1000);
                    requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                    var add_document = new documentConnection(requestObject);
                    var save_document = await add_document.save();
                    res.send({ status: true, message: "Document insert successfully..!", data: save_document });
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

// get invoice_document
module.exports.getInvoiceDocument = async function (req, res) {

    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);

    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let invoiceDocumentConnection = connection_db_api.model(collectionConstant.INVOICE_DOCUMENT, documentSchema);
            let get_data = await invoiceDocumentConnection.find({ is_delete: 0 });
            res.send({ status: true, message: "Get Document", data: get_data });

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

//delete invoice Document

module.exports.deleteInvoiceDocument = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);

    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {

            var requestObject = req.body;
            let id = requestObject._id;
            delete requestObject._id;
            let invoiceDocumentConnection = connection_db_api.model(collectionConstant.INVOICE_DOCUMENT, documentSchema);
            let updated_data = await invoiceDocumentConnection.updateOne({ _id: ObjectID(id) }, { is_delete: 1 });
            var is_delete = updated_data.nModified;
            if (is_delete == 0) {
                res.send({ status: false, message: "There is no data with this id" });
            }
            else {
                res.send({ status: true, message: "Document deleted successfully..!", data: updated_data });

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

// bulk upload 
module.exports.checkImportInvoiceDocument = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let invoiceDocumentConnection = connection_db_api.model(collectionConstant.INVOICE_DOCUMENT, documentSchema);

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
                            var get_one = await invoiceDocumentConnection.findOne({ name: data[m].name, is_delete: 0 });
                            if (get_one != null) {
                                allowImport = false;
                                exitdata.push({ message: 'Already exist', valid: false, data: data[m], name: data[m].name });
                            } else {
                                exitdata.push({ message: 'Data is correct', valid: true, data: data[m], name: data[m].name });
                            }
                        }
                        res.send({ status: true, allow_import: allowImport, data: exitdata, message: 'Document listing' });
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

module.exports.importInvoiceDocument = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let invoiceDocumentConnection = connection_db_api.model(collectionConstant.INVOICE_DOCUMENT, documentSchema);

            let reqObject = [];
            for (let i = 0; i < requestObject.length; i++) {
                let one_client = await invoiceDocumentConnection.findOne({ name: requestObject[i].data.name, is_delete: 0 });
                if (one_client) { } else {
                    reqObject.push({
                        name: requestObject[i].data.name,
                        is_expiration: requestObject[i].data.is_expiration.toString().toLowerCase() == "true",
                    });
                }
            }
            let insert_data = await invoiceDocumentConnection.insertMany(reqObject);
            if (insert_data) {
                res.send({ status: true, message: 'Document added successfully.', data: insert_data });
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

module.exports.getInvoiceDocumentForTable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let invoiceDocumentConnection = connection_db_api.model(collectionConstant.INVOICE_DOCUMENT, documentSchema);
            var getdata = await invoiceDocumentConnection.find({ is_delete: requestObject.is_delete }).sort({ created_at: -1 });
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

