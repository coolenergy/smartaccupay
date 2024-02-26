var processInvoiceSchema = require('./../../../../../model/process_invoice');
var invoiceSchema = require('./../../../../../model/invoice');
var vendorSchema = require('./../../../../../model/vendor');
var invoiceProgressSchema = require('./../../../../../model/invoice_progress');
var managementInvoiceSchema = require('./../../../../../model/management_invoice');
var managementPOSchema = require('./../../../../../model/management_po');
var vendorSchema = require('./../../../../../model/vendor');
const mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
let db_connection = require('./../../../../../controller/common/connectiondb');
let common = require('./../../../../../controller/common/common');
let collectionConstant = require('./../../../../../config/collectionConstant');
var userSchema = require('../../../../../model/user');
var settingsSchema = require('../../../../../model/settings');
let config = require('../../../../../config/config');
let rest_Api = require('./../../../../../config/db_rest_api');
var handlebars = require('handlebars');
let sendEmail = require('./../../../../../controller/common/sendEmail');
var fs = require('fs');
var alertController = require('./../alert/alertController');
var invoiceProgressController = require('./../invoice_progress/invoiceProgressController');

module.exports.getAllProcessInvoice = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let invoiceProcessCollection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);
            let get_data = await invoiceProcessCollection.find({ is_delete: 0 });
            res.send({ message: 'Listing', data: get_data, status: true });
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

module.exports.getOneProcessInvoice = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let invoiceProcessCollection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);
            let vendorCollection = connection_db_api.model(collectionConstant.INVOICE_VENDOR, vendorSchema);
            let get_data = await invoiceProcessCollection.findOne({ _id: ObjectID(requestObject._id) });
            if (get_data.data) {
                if (get_data.data.vendor != '') {
                    get_data.data.vendor = await vendorCollection.findOne({ _id: ObjectID(get_data.data.vendor) });
                }
            }
            res.send({ message: 'Listing', data: get_data, status: true });
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

// Update Related document
module.exports.updateProcessInvoice = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var id = requestObject._id;
            delete requestObject._id;
            var module = requestObject.module;
            delete requestObject.module;
            let invoiceProcessCollection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            let updateBadgeObject = {};
            var vendorId = '';
            let newReqObj = {};
            if (module == 'INVOICE' || module == 'PO' || module == 'Quote' || module == 'Packing Slip' || module == 'Receiving Slip') {
                // Find changed data of module
                let findKeys = {};

                for (const property in requestObject) {
                    let key = property.toString().split(".")[1];
                    if (requestObject[property] != null && requestObject[property] != undefined) {
                        newReqObj[key] = requestObject[property];
                        findKeys[property] = 1;
                    }
                    if (key == 'vendor') {
                        vendorId = requestObject[property];
                    }
                }
                var get_data = await invoiceProcessCollection.findOne({ _id: ObjectID(id) }, findKeys);
                if (get_data.data) {
                    let updatedData = await common.findUpdatedFieldHistory(newReqObj, get_data.data);
                    for (let i = 0; i < updatedData.length; i++) {
                        let key = `data.badge.${updatedData[i]['key']}`;
                        updateBadgeObject[key] = false;
                    }
                }
            }
            if (requestObject.document_type == '' || requestObject.document_type == null || requestObject.document_type == undefined) {
                if (module == 'INVOICE') {
                    requestObject.document_type = 'INVOICE';
                } else if (module == 'PO') {
                    requestObject.document_type = 'PURCHASE_ORDER';
                } else if (module == 'Quote') {
                    requestObject.document_type = 'QUOTE';
                } else if (module == 'Packing Slip') {
                    requestObject.document_type = 'PACKING_SLIP';
                } else if (module == 'Receiving Slip') {
                    requestObject.document_type = 'RECEIVING_SLIP';
                }
            }
            var get_data = await invoiceProcessCollection.findOne({ _id: ObjectID(id) });
            var update_data = await invoiceProcessCollection.updateOne({ _id: ObjectID(id) }, requestObject);
            if (update_data) {
                // Insert Process Document as Invoice
                if (module == 'INVOICE') {
                    if (vendorId != '') {
                        let add_invoice = new invoicesConnection(newReqObj);
                        let save_invoice = await add_invoice.save();
                        if (save_invoice) {
                            await invoiceProcessCollection.updateOne({ _id: ObjectID(id) }, { status: 'Complete', invoice_id: ObjectID(save_invoice._id) });
                        }
                    }
                    // requestObject.is_delete=0;
                }

                // Send update Assigned alert 
                await sendProcessDocumentUpdateAlert(decodedToken, id, module, translator);
                // Update badges
                await invoiceProcessCollection.updateOne({ _id: ObjectID(id) }, updateBadgeObject);
                res.send({ message: `Document updated successfully.`, status: true });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    }
    else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

module.exports.saveInvoiceProcess = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let invoiceProcessCollection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);
            if (requestObject._id) {
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let update_process = await invoiceProcessCollection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
                if (update_process) {
                    res.send({ message: 'Invoice process updated successfully.', data: update_process, status: true });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                /* let apiObj = [
                     {
                        document_id: '63fc31c58860b01ecc2d81fb',
                        document_url: 'https://s3.wasabisys.com/r-988514/rovuk_invoice/invoice/27_Feb_2023_09_59_56_148_AM.pdf',
                    },//Quote  
                    {
                        document_id: '63fc32348860b01ecc2d820b',
                        document_url: 'https://s3.wasabisys.com/r-988514/rovuk_invoice/invoice/27_Feb_2023_10_01_47_892_AM.pdf',
                    },//PO  
                     {
                        document_id: '63fc32a38860b01ecc2d8215',
                        document_url: 'https://s3.wasabisys.com/r-988514/rovuk_invoice/invoice/27_Feb_2023_10_03_38_793_AM.pdf',
                    },//Invoice  
                ];
                let data = await common.sendInvoiceForProcess(apiObj);
                let json = JSON.parse(data.body);
                console.log("json: ", json);
                for (const key in json) {
                    if (json[key] == 'ALREADY_EXISTS') {
                        await invoiceProcessCollection.updateOne({ _id: ObjectID(key) }, { status: 'Already Exists' });
                    }
                }
                res.send({ message: 'Invoice for process added successfully.', data: apiObj, status: true }); */
                let saveObj = [];
                for (let i = 0; i < requestObject.pdf_urls.length; i++) {
                    saveObj.push({
                        pdf_url: requestObject.pdf_urls[i],
                        created_by: decodedToken.UserData._id,
                        created_at: Math.round(new Date().getTime() / 1000),
                        updated_by: decodedToken.UserData._id,
                        updated_at: Math.round(new Date().getTime() / 1000),
                    });
                }
                let insert_data = await invoiceProcessCollection.insertMany(saveObj);
                if (insert_data) {
                    let apiObj = [];
                    for (let i = 0; i < insert_data.length; i++) {
                        apiObj.push({
                            document_id: insert_data[i]._id,
                            document_url: insert_data[i].pdf_url,
                        });
                    }
                    let data = await common.sendInvoiceForProcess(apiObj);
                    let json = JSON.parse(data.body);
                    invoiceProgressController.saveInvoiceProgress({ process_id: json.process_id }, decodedToken);
                    /* 
                    for (const key in json) {
                        if (json[key] == 'ALREADY_EXISTS') {
                            await invoiceProcessCollection.updateOne({ _id: ObjectID(key) }, { status: 'Already Exists' });
                        }
                    } */
                    res.send({ message: 'Invoice for process added successfully.', data: apiObj, status: true });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
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

module.exports.mailBoxSaveInvoiceProcess = async function (connection_db_api, pdf_urls, email) {
    try {
        let invoiceProcessCollection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);

        let saveObj = [];
        for (let i = 0; i < pdf_urls.length; i++) {
            saveObj.push({
                pdf_url: pdf_urls[i],
                created_by_mail: `Email - ${email}`,
                created_at: Math.round(new Date().getTime() / 1000),
                updated_by_mail: `Email - ${email}`,
                updated_at: Math.round(new Date().getTime() / 1000),
            });
        }
        let insert_data = await invoiceProcessCollection.insertMany(saveObj);
        if (insert_data) {
            let apiObj = [];
            for (let i = 0; i < insert_data.length; i++) {
                apiObj.push({
                    document_id: insert_data[i]._id,
                    document_url: insert_data[i].pdf_url,
                });
            }
            let data = await common.sendInvoiceForProcess(apiObj);
            let json = JSON.parse(data.body);
            for (const key in json) {
                if (json[key] == 'ALREADY_EXISTS') {
                    await invoiceProcessCollection.updateOne({ _id: ObjectID(key) }, { status: 'Already Exists' });
                }
            }
        }
    } catch (e) {
        console.log(e);
    } finally {
    }
};

module.exports.importManagementInvoice = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let invoiceProcessCollection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);
            let managementInvoiceCollection = connection_db_api.model(collectionConstant.MANAGEMENT_INVOICE, managementInvoiceSchema);
            let temp_invoices = await invoiceProcessCollection.find({ is_delete: 0 });
            let tempIds = [];
            temp_invoices.forEach((data) => {
                if (data.management_invoice_id != null && data.management_invoice_id != undefined && data.management_invoice_id != '') {
                    tempIds.push(ObjectID(data.management_invoice_id));
                }
            });
            let query;
            if (tempIds.length == 0) {
                query = { is_delete: 0 };
            } else {
                query = { is_delete: 0, _id: { $nin: tempIds } };
            }
            let invoices = await managementInvoiceCollection.find(query);
            let saveObj = [];
            for (let i = 0; i < invoices.length; i++) {
                saveObj.push({
                    management_invoice_id: invoices[i]._id,
                    pdf_url: invoices[i].pdf_url,
                    created_by: decodedToken.UserData._id,
                    created_at: Math.round(new Date().getTime() / 1000),
                    updated_by: decodedToken.UserData._id,
                    updated_at: Math.round(new Date().getTime() / 1000),
                });
            }
            let insert_data = await invoiceProcessCollection.insertMany(saveObj);
            if (insert_data) {
                let apiObj = [];
                for (let i = 0; i < insert_data.length; i++) {
                    apiObj.push({
                        document_id: insert_data[i]._id,
                        document_url: insert_data[i].pdf_url,
                    });
                }
                let data = await common.sendInvoiceForProcess(apiObj);
                let json = JSON.parse(data.body);
                for (const key in json) {
                    if (json[key] == 'ALREADY_EXISTS') {
                        await invoiceProcessCollection.updateOne({ _id: ObjectID(key) }, { status: 'Already Exists' });
                    }
                }
                res.send({ message: 'Management Invoice imported successfully.', data: apiObj, status: true });
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

module.exports.importManagementPO = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let invoiceProcessCollection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);
            let managementPOCollection = connection_db_api.model(collectionConstant.MANAGEMENT_PO, managementPOSchema);
            let temp_pos = await invoiceProcessCollection.find({ is_delete: 0 });
            let tempIds = [];
            temp_pos.forEach((data) => {
                if (data.management_po_id != null && data.management_po_id != undefined && data.management_po_id != '') {
                    tempIds.push(ObjectID(data.management_po_id));
                }
            });
            let query;
            if (tempIds.length == 0) {
                query = { is_delete: 0 };
            } else {
                query = { is_delete: 0, _id: { $nin: tempIds } };
            }
            let pos = await managementPOCollection.find(query);
            let saveObj = [];
            for (let i = 0; i < pos.length; i++) {
                saveObj.push({
                    management_po_id: pos[i]._id,
                    pdf_url: pos[i].po_url,
                    created_by: decodedToken.UserData._id,
                    created_at: Math.round(new Date().getTime() / 1000),
                    updated_by: decodedToken.UserData._id,
                    updated_at: Math.round(new Date().getTime() / 1000),
                });
            }
            let insert_data = await invoiceProcessCollection.insertMany(saveObj);
            if (insert_data) {
                let apiObj = [];
                for (let i = 0; i < insert_data.length; i++) {
                    apiObj.push({
                        document_id: insert_data[i]._id,
                        document_url: insert_data[i].pdf_url,
                    });
                }
                let data = await common.sendInvoiceForProcess(apiObj);
                let json = JSON.parse(data.body);
                for (const key in json) {
                    if (json[key] == 'ALREADY_EXISTS') {
                        await invoiceProcessCollection.updateOne({ _id: ObjectID(key) }, { status: 'Already Exists' });
                    }
                }
                res.send({ message: 'Management PO imported successfully.', data: apiObj, status: true });
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

module.exports.checkProcessProgress = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let invoiceProgressCollection = connection_db_api.model(collectionConstant.INVOICE_PROGRESS, invoiceProgressSchema);
            let invoiceProcessCollection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);
            let query = {
                created_by: ObjectID(decodedToken.UserData._id),
                is_delete: 0,
                status: { $ne: 'Complete' }
            };
            let get_data = await invoiceProgressCollection.find(query);
            console.log("get_data", get_data.length);
            if (get_data.length > 0) {
                for (let i = 0; i < get_data.length; i++) {
                    var processCompleted = true;
                    var queryString = `?customer_id=${decodedToken.companycode.toLowerCase()}&process_id=${get_data[i].process_id}`;
                    let data = await common.getInvoiceProcessStatus(queryString);
                    if (data.status) {
                        var statusData = [];
                        var updateProcessIds = [];
                        var updateAlreadyProcessIds = [];
                        for (const key in data.data.process_status) {
                            statusData.push({
                                document_id: key,
                                document_status: data.data.process_status[key],
                            });
                            if (data.data.process_status[key] == 'PROCESS_STATUS_EXTRACTED') {
                                updateProcessIds.push(ObjectID(key));
                            } else if (data.data.process_status[key] == 'PROCESS_STATUS_ERROR_DUPLICATE_HASH') {
                                updateAlreadyProcessIds.push(ObjectID(key));
                            }
                        }

                        get_data[i].process_status = statusData;
                        get_data[i].ratio = data.data.process_progress_ratio;
                        get_data[i].final = data.data.process_progress_final;
                        get_data[i].total = data.data.process_progress_total;

                        let reqObj = {
                            process_status: statusData,
                            ratio: data.data.process_progress_ratio,
                            final: data.data.process_progress_final,
                            total: data.data.process_progress_total,
                        };
                        await invoiceProgressCollection.updateOne({ _id: ObjectID(get_data[i]._id) }, reqObj);
                        if (data.data.process_progress_ratio == 1) {
                            await invoiceProcessCollection.updateMany({ _id: { $in: updateProcessIds } }, { status: 'PROCESS_STATUS_EXTRACTED' });
                            await invoiceProcessCollection.updateMany({ _id: { $in: updateAlreadyProcessIds } }, { status: 'Already Exists' });
                        } else {
                            processCompleted = false;
                        }
                    }
                    if (i == get_data.length - 1) {
                        if (processCompleted) {
                            await invoiceProgressCollection.updateOne({ _id: ObjectID(get_data[i]._id) }, { status: 'Complete' });
                            res.send({ status: true, message: 'Process is completed.' });
                        } else {
                            res.send({ status: false, message: 'Process is incompleted.' });
                        }
                    }
                }
            } else {
                res.send({ status: true, message: 'Process is completed.' });
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

module.exports.importProcessData = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let invoiceProcessCollection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);
            let invoiceCollection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            let get_invoice = await invoiceProcessCollection.find({ is_delete: 0, status: 'PROCESS_STATUS_EXTRACTED' });
            // var queryString = `?customer_id=tempinvoice`;
            var queryString = `?customer_id=${decodedToken.companycode.toLowerCase()}`;
            let temp = [];
            for (let i = 0; i < get_invoice.length; i++) {
                queryString += `&document_id=${get_invoice[i]._id}`;
                temp.push({
                    'document_id': get_invoice[i]._id,
                    'document_url': get_invoice[i].pdf_url,
                });
            }
            // console.log("temp", temp);
            // queryString = '?customer_id=r-988514&document_id=63ef5856916b4b2d74acb59a';
            console.log("queryString: ", queryString);
            // if (true) { } else {
            let get_data = await common.getProcessedDocuments(queryString);
            if (get_data.status) {
                for (const key in get_data.data) {
                    if (get_data.data[key] != null) {
                        for (let j = 0; j < get_data.data[key].length; j++) {
                            let documentType = get_data.data[key][j].document_type;
                            console.log("DOCUMENT TYPE :************", documentType);
                            if (documentType == 'INVOICE') {
                                var pages = get_data.data[key][j].document_pages;
                                var relatedDocuments = get_data.data[key][j].related_documents;

                                // Make invoice object
                                let invoiceObject = {
                                    assign_to: '',
                                    vendor: '',
                                    vendor_id: '',
                                    customer_id: '',
                                    invoice: '',
                                    p_o: '',
                                    invoice_date: '',
                                    invoice_date_epoch: 0,
                                    due_date: '',
                                    due_date_epoch: 0,
                                    order_date: '',
                                    order_date_epoch: 0,
                                    ship_date: '',
                                    ship_date_epoch: 0,
                                    terms: '',
                                    total_to_be_paid: '',
                                    tax_rate: '',
                                    tax_amount: '',
                                    tax_id: '',
                                    sub_total: '',
                                    amount_due: '',
                                    cost_code: '',
                                    gl_account: '',
                                    receiving_date: '',
                                    notes: '',
                                    pdf_url: get_data.data[key][j].document_url,
                                    items: [],
                                    created_by: decodedToken.UserData._id,
                                    created_by_mail: '',
                                    created_at: Math.round(new Date().getTime() / 1000),
                                    updated_by: decodedToken.UserData._id,
                                    updated_by_mail: '',
                                    updated_at: Math.round(new Date().getTime() / 1000),
                                    badge: {},
                                };
                                let items = [];
                                let invoiceIsDuplicate = false;
                                // Find invoice data
                                for (let i = 0; i < pages.length; i++) {
                                    let invoice_no = '';
                                    if (pages[i].fields.INVOICE_NUMBER != null) {
                                        invoice_no = pages[i].fields.INVOICE_NUMBER;
                                        invoiceObject.badge.invoice = true;
                                    }
                                    if (pages[i].fields.VENDOR_NAME != null) {
                                        let tmpVendor = await getAndCheckVendor(pages[i].fields.VENDOR_NAME.replace(/\n/g, " "), invoice_no, connection_db_api);
                                        if (tmpVendor.status) {
                                            if (tmpVendor.duplicate) {
                                                invoiceIsDuplicate = true;
                                            } else {
                                                invoiceObject.vendor = tmpVendor.data._id;
                                                invoiceObject.badge.vendor = true;
                                            }
                                        }
                                    }
                                    invoiceObject.invoice = invoice_no;
                                    if (pages[i].fields.INVOICE_DATE != null) {
                                        if (pages[i].fields.INVOICE_DATE.orig != null) {
                                            invoiceObject.invoice_date = pages[i].fields.INVOICE_DATE.orig;
                                            invoiceObject.badge.invoice_date = true;
                                        }
                                        if (pages[i].fields.INVOICE_DATE.epoch != null) {
                                            invoiceObject.invoice_date_epoch = pages[i].fields.INVOICE_DATE.epoch;
                                            invoiceObject.badge.invoice_date_epoch = true;
                                        }
                                    }
                                    if (pages[i].fields.ORDER_DATE != null) {
                                        if (pages[i].fields.ORDER_DATE.orig != null) {
                                            invoiceObject.order_date = pages[i].fields.ORDER_DATE.orig;
                                            invoiceObject.badge.order_date = true;
                                        }
                                        if (pages[i].fields.ORDER_DATE.epoch != null) {
                                            invoiceObject.order_date_epoch = pages[i].fields.ORDER_DATE.epoch;
                                            invoiceObject.badge.order_date_epoch = true;
                                        }
                                    }
                                    if (pages[i].fields.PO_NUMBER != null) {
                                        invoiceObject.p_o = pages[i].fields.PO_NUMBER;
                                        invoiceObject.badge.p_o = true;
                                    }
                                    /* if (pages[i].fields.INVOICE_TO != null) {
                                        invoiceObject.invoice = pages[i].fields.INVOICE_TO;
                                        invoiceObject.   badge.vendor=true
                                    }
                                    if (pages[i].fields.ADDRESS != null) {
                                        invoiceObject.invoice = pages[i].fields.ADDRESS;
                                        invoiceObject.   badge.vendor=true
                                    } */
                                    if (pages[i].fields.SUBTOTAL != null) {
                                        invoiceObject.sub_total = pages[i].fields.SUBTOTAL;
                                        invoiceObject.badge.sub_total = true;
                                    }
                                    if (pages[i].fields.TOTAL != null) {
                                        invoiceObject.total = pages[i].fields.TOTAL;
                                        invoiceObject.badge.total = true;
                                    }
                                    if (pages[i].fields.TAX != null) {
                                        invoiceObject.tax_amount = pages[i].fields.TAX;
                                        invoiceObject.badge.tax_amount = true;
                                    }
                                    if (pages[i].fields.INVOICE_TOTAL != null) {
                                        invoiceObject.invoice_total = pages[i].fields.INVOICE_TOTAL;
                                        invoiceObject.badge.invoice_total = true;
                                    }

                                    /* if (pages[i].fields.VENDOR_ADDRESS != null) {
                                        invoiceObject.invoice = pages[i].fields.VENDOR_ADDRESS;
                                    }
                                    if (pages[i].fields.VENDOR_PHONE != null) {
                                        invoiceObject.invoice = pages[i].fields.VENDOR_PHONE;
                                    } */
                                    if (pages[i].fields.JOB_NUMBER != null) {
                                        invoiceObject.job_number = pages[i].fields.JOB_NUMBER;
                                        invoiceObject.badge.job_number = true;
                                    }
                                    if (pages[i].fields.DELIVERY_ADDRESS != null) {
                                        invoiceObject.delivery_address = pages[i].fields.DELIVERY_ADDRESS;
                                        invoiceObject.badge.delivery_address = true;
                                    }
                                    if (pages[i].fields.TERMS != null) {
                                        invoiceObject.terms = pages[i].fields.TERMS;
                                        invoiceObject.badge.terms = true;
                                    }
                                    if (pages[i].fields.DUE_DATE != null) {
                                        if (pages[i].fields.DUE_DATE.orig != null) {
                                            invoiceObject.due_date = pages[i].fields.DUE_DATE.orig;
                                            invoiceObject.badge.due_date = true;
                                        }
                                        if (pages[i].fields.DUE_DATE.epoch != null) {
                                            invoiceObject.due_date_epoch = pages[i].fields.DUE_DATE.epoch;
                                            invoiceObject.badge.due_date_epoch = true;
                                        }
                                    }
                                    if (pages[i].fields.SHIP_DATE != null) {
                                        if (pages[i].fields.SHIP_DATE.orig != null) {
                                            invoiceObject.ship_date = pages[i].fields.SHIP_DATE.orig;
                                            invoiceObject.badge.ship_date = true;
                                        }
                                        if (pages[i].fields.SHIP_DATE.epoch != null) {
                                            invoiceObject.ship_date_epoch = pages[i].fields.SHIP_DATE.epoch;
                                            invoiceObject.badge.ship_date_epoch = true;
                                        }
                                    }
                                    if (pages[i].fields.CONTRACT_NUMBER != null) {
                                        invoiceObject.contract_number = pages[i].fields.CONTRACT_NUMBER;
                                        invoiceObject.badge.contract_number = true;
                                    }
                                    if (pages[i].fields.DISCOUNT != null) {
                                        invoiceObject.discount = pages[i].fields.DISCOUNT;
                                        invoiceObject.badge.discount = true;
                                    }
                                    if (pages[i].fields.ACCOUNT_NUMBER != null) {
                                        invoiceObject.account_number = pages[i].fields.ACCOUNT_NUMBER;
                                        invoiceObject.badge.account_number = true;
                                    }
                                    if (pages[i].expense_groups.length > 0) {
                                        if (pages[i].expense_groups[0].length > 0) {
                                            for (let k = 0; k < pages[i].expense_groups[0].length; k++) {
                                                let item = pages[i].expense_groups[0][k];
                                                items.push({
                                                    item: item.ITEM == null ? '' : item.ITEM,
                                                    product_code: item.PRODUCT_CODE == null ? '' : item.PRODUCT_CODE,
                                                    unit_price: item.UNIT_PRICE == null ? '' : item.UNIT_PRICE,
                                                    quantity: item.QUANTITY == null ? '' : item.QUANTITY,
                                                    price: item.PRICE == null ? '' : item.PRICE,
                                                });
                                            }
                                        }
                                    }
                                }
                                // Check if invoice is duplicate and invoice vendor is available or not
                                if (!invoiceIsDuplicate && invoiceObject.vendor != '') {
                                    invoiceObject.items = items;
                                    let add_invoice = new invoiceCollection(invoiceObject);
                                    let save_invoice = await add_invoice.save();
                                    await sendInvoiceInsertAlerts(decodedToken, save_invoice._id, translator);

                                    // Set process data and invoice process data to complete
                                    let updateInvoiceProcessObject = {
                                        invoice_id: save_invoice._id,
                                        status: 'Complete',
                                        document_type: get_data.data[key][j].document_type,
                                        process_data: get_data.data[key][j],
                                        data: invoiceObject,
                                    };
                                    await invoiceProcessCollection.updateOne({ _id: ObjectID(key) }, updateInvoiceProcessObject);

                                    // Related documents
                                    for (let i = 0; i < relatedDocuments.length; i++) {
                                        // Check document id is available or not
                                        let get_related_doc = await invoiceProcessCollection.findOne({ _id: ObjectID(relatedDocuments[i].document_id) });
                                        if (get_related_doc) {
                                            let related_document_type = relatedDocuments[i].document_type;
                                            let related_doc_pages = relatedDocuments[i].document_pages;
                                            if (related_document_type == 'PACKING_SLIP') {
                                                // Make packing slip Object
                                                let packing_slip_obj = {
                                                    pdf_url: relatedDocuments[i].document_url,
                                                    document_id: relatedDocuments[i].document_id,
                                                    document_type: relatedDocuments[i].document_type,
                                                    date: "",
                                                    date_epoch: 0,
                                                    invoice_number: invoiceObject.invoice,
                                                    po_number: "",
                                                    ship_to_address: "",
                                                    vendor: ObjectID(invoiceObject.vendor),
                                                    received_by: "",
                                                    badge: {
                                                        invoice_number: true,
                                                        vendor: true
                                                    }
                                                };
                                                if (related_doc_pages[0].fields.DATE != null) {
                                                    if (related_doc_pages[0].fields.DATE.orig != null) {
                                                        packing_slip_obj.date = related_doc_pages[0].fields.DATE.orig;
                                                        packing_slip_obj.badge.date = true;
                                                    }
                                                    if (related_doc_pages[0].fields.DATE.epoch != null) {
                                                        packing_slip_obj.date_epoch = related_doc_pages[0].fields.DATE.epoch;
                                                        packing_slip_obj.badge.date_epoch = true;
                                                    }
                                                }
                                                if (related_doc_pages[0].fields.PO_NUMBER != null) {
                                                    packing_slip_obj.po_number = related_doc_pages[0].fields.PO_NUMBER;
                                                    packing_slip_obj.badge.po_number = true;
                                                }
                                                if (related_doc_pages[0].fields.SHIP_TO_ADDRESS != null) {
                                                    packing_slip_obj.ship_to_address = related_doc_pages[0].fields.SHIP_TO_ADDRESS;
                                                    packing_slip_obj.badge.ship_to_address = true;
                                                }
                                                if (related_doc_pages[0].fields.RECEIVED_BY != null) {
                                                    packing_slip_obj.received_by = related_doc_pages[0].fields.RECEIVED_BY;
                                                    packing_slip_obj.badge.received_by = true;
                                                }
                                                // Update packing slip to invoice
                                                let update_related_doc = await invoiceCollection.updateOne({ _id: ObjectID(save_invoice._id) }, { has_packing_slip: true, packing_slip_data: packing_slip_obj });
                                                // Set process data and related document process data to complete
                                                let updateRelatedDocObj = {
                                                    status: 'Complete',
                                                    document_type: related_document_type,
                                                    process_data: relatedDocuments[i],
                                                    data: packing_slip_obj,
                                                };
                                                await invoiceProcessCollection.updateOne({ _id: ObjectID(relatedDocuments[i].document_id) }, updateRelatedDocObj);
                                            } else if (related_document_type == 'RECEIVING_SLIP') {
                                                // Make packing slip Object
                                                let receiving_slip_obj = {
                                                    pdf_url: relatedDocuments[i].document_url,
                                                    document_id: relatedDocuments[i].document_id,
                                                    document_type: relatedDocuments[i].document_type,
                                                    date: "",
                                                    date_epoch: 0,
                                                    invoice_number: invoiceObject.invoice,
                                                    po_number: "",
                                                    ship_to_address: "",
                                                    vendor: ObjectID(invoiceObject.vendor),
                                                    received_by: "",
                                                    badge: {
                                                        invoice_number: true,
                                                        vendor: true
                                                    }
                                                };
                                                if (related_doc_pages[0].fields.DATE != null) {
                                                    if (related_doc_pages[0].fields.DATE.orig != null) {
                                                        receiving_slip_obj.date = related_doc_pages[0].fields.DATE.orig;
                                                        receiving_slip_obj.badge.date = true;
                                                    }
                                                    if (related_doc_pages[0].fields.DATE.epoch != null) {
                                                        receiving_slip_obj.date_epoch = related_doc_pages[0].fields.DATE.epoch;
                                                        receiving_slip_obj.badge.date_epoch = true;
                                                    }
                                                }
                                                if (related_doc_pages[0].fields.PO_NUMBER != null) {
                                                    receiving_slip_obj.po_number = related_doc_pages[0].fields.PO_NUMBER;
                                                    receiving_slip_obj.badge.po_number = true;
                                                }
                                                if (related_doc_pages[0].fields.SHIP_TO_ADDRESS != null) {
                                                    receiving_slip_obj.ship_to_address = related_doc_pages[0].fields.SHIP_TO_ADDRESS;
                                                    receiving_slip_obj.badge.ship_to_address = true;
                                                }
                                                if (related_doc_pages[0].fields.RECEIVED_BY != null) {
                                                    receiving_slip_obj.received_by = related_doc_pages[0].fields.RECEIVED_BY;
                                                    receiving_slip_obj.badge.received_by = true;
                                                }
                                                // Update packing slip to invoice
                                                let update_related_doc = await invoiceCollection.updateOne({ _id: ObjectID(save_invoice._id) }, { has_receiving_slip: true, receiving_slip_data: receiving_slip_obj });
                                                // Set process data and related document process data to complete
                                                let updateRelatedDocObj = {
                                                    status: 'Complete',
                                                    document_type: related_document_type,
                                                    process_data: relatedDocuments[i],
                                                    data: receiving_slip_obj,
                                                };
                                                await invoiceProcessCollection.updateOne({ _id: ObjectID(relatedDocuments[i].document_id) }, updateRelatedDocObj);
                                            } else if (related_document_type == 'PURCHASE_ORDER') {
                                                // Make packing slip Object
                                                let po_obj = {
                                                    pdf_url: relatedDocuments[i].document_url,
                                                    document_id: relatedDocuments[i].document_id,
                                                    document_type: relatedDocuments[i].document_type,
                                                    date: "",
                                                    date_epoch: 0,
                                                    po_number: "",
                                                    customer_id: "",
                                                    terms: "",
                                                    delivery_date: "",
                                                    delivery_date_epoch: 0,
                                                    delivery_address: "",
                                                    due_date: "",
                                                    due_date_epoch: 0,
                                                    quote_number: "",
                                                    contract_number: "",
                                                    vendor_id: "",
                                                    vendor: "",
                                                    sub_total: "",
                                                    tax: "",
                                                    po_total: "",
                                                    items: [],
                                                    badge: {}
                                                };
                                                let tmpVendor = await getAndCheckVendorPO(related_doc_pages[0].fields.VENDOR_NAME.replace(/\n/g, " "), connection_db_api);
                                                if (tmpVendor.status) {
                                                    po_obj.vendor = ObjectID(tmpVendor.data._id);
                                                    po_obj.badge.vendor = true;
                                                }
                                                if (po_obj.vendor != '') {
                                                    if (related_doc_pages[0].fields.PO_CREATE_DATE != null) {
                                                        if (related_doc_pages[0].fields.PO_CREATE_DATE.orig != null) {
                                                            po_obj.date = related_doc_pages[0].fields.PO_CREATE_DATE.orig;
                                                            po_obj.badge.date = true;
                                                        }
                                                        if (related_doc_pages[0].fields.PO_CREATE_DATE.epoch != null) {
                                                            po_obj.date_epoch = related_doc_pages[0].fields.PO_CREATE_DATE.epoch;
                                                            po_obj.badge.date_epoch = true;
                                                        }
                                                    }
                                                    if (related_doc_pages[0].fields.PO_NUMBER != null) {
                                                        po_obj.po_number = related_doc_pages[0].fields.PO_NUMBER;
                                                        po_obj.badge.po_number = true;
                                                    }
                                                    if (related_doc_pages[0].fields.CUSTOMER_ID != null) {
                                                        po_obj.customer_id = related_doc_pages[0].fields.CUSTOMER_ID;
                                                        po_obj.badge.customer_id = true;
                                                    }
                                                    if (related_doc_pages[0].fields.TERMS != null) {
                                                        po_obj.terms = related_doc_pages[0].fields.TERMS;
                                                        po_obj.badge.terms = true;
                                                    }
                                                    if (related_doc_pages[0].fields.DELIVERY_DATE != null) {
                                                        if (related_doc_pages[0].fields.DELIVERY_DATE.orig != null) {
                                                            po_obj.delivery_date = related_doc_pages[0].fields.DELIVERY_DATE.orig;
                                                            po_obj.badge.delivery_date = true;
                                                        }
                                                        if (related_doc_pages[0].fields.DELIVERY_DATE.epoch != null) {
                                                            po_obj.delivery_date_epoch = related_doc_pages[0].fields.DELIVERY_DATE.epoch;
                                                            po_obj.badge.delivery_date_epoch = true;
                                                        }
                                                    }
                                                    if (related_doc_pages[0].fields.DELIVERY_ADDRESS != null) {
                                                        po_obj.delivery_address = related_doc_pages[0].fields.DELIVERY_ADDRESS;
                                                        po_obj.badge.delivery_address = true;
                                                    }
                                                    if (related_doc_pages[0].fields.DUE_DATE != null) {
                                                        if (related_doc_pages[0].fields.DUE_DATE.orig != null) {
                                                            po_obj.due_date = related_doc_pages[0].fields.DUE_DATE.orig;
                                                            po_obj.badge.due_date = true;
                                                        }
                                                        if (related_doc_pages[0].fields.DUE_DATE.epoch != null) {
                                                            po_obj.due_date_epoch = related_doc_pages[0].fields.DUE_DATE.epoch;
                                                            po_obj.badge.due_date_epoch = true;
                                                        }
                                                    }
                                                    if (related_doc_pages[0].fields.QUOTE_NUMBER != null) {
                                                        po_obj.quote_number = related_doc_pages[0].fields.QUOTE_NUMBER;
                                                        po_obj.badge.quote_number = true;
                                                    }
                                                    if (related_doc_pages[0].fields.CONTRACT_NUMBER != null) {
                                                        po_obj.contract_number = related_doc_pages[0].fields.CONTRACT_NUMBER;
                                                        po_obj.badge.contract_number = true;
                                                    }
                                                    if (related_doc_pages[0].fields.VENDOR_ID != null) {
                                                        po_obj.vendor_id = related_doc_pages[0].fields.VENDOR_ID;
                                                        po_obj.badge.vendor_id = true;
                                                    }
                                                    if (related_doc_pages[0].fields.SUBTOTAL != null) {
                                                        po_obj.sub_total = related_doc_pages[0].fields.SUBTOTAL;
                                                        po_obj.badge.sub_total = true;
                                                    }
                                                    if (related_doc_pages[0].fields.TAX != null) {
                                                        po_obj.tax = related_doc_pages[0].fields.TAX;
                                                        po_obj.badge.tax = true;
                                                    }
                                                    if (related_doc_pages[0].fields.PURCHASE_ORDER_TOTAL != null) {
                                                        po_obj.po_total = related_doc_pages[0].fields.PURCHASE_ORDER_TOTAL;
                                                        po_obj.badge.po_total = true;
                                                    }

                                                    let items = [];
                                                    if (related_doc_pages[0].expense_groups.length > 0) {
                                                        if (related_doc_pages[0].expense_groups[0].length > 0) {
                                                            for (let k = 0; k < related_doc_pages[0].expense_groups[0].length; k++) {
                                                                let item = related_doc_pages[0].expense_groups[0][k];
                                                                items.push({
                                                                    item: item.ITEM == null ? '' : item.ITEM,
                                                                    product_code: item.PRODUCT_CODE == null ? '' : item.PRODUCT_CODE,
                                                                    unit_price: item.UNIT_PRICE == null ? '' : item.UNIT_PRICE,
                                                                    quantity: item.QUANTITY == null ? '' : item.QUANTITY,
                                                                    price: item.PRICE == null ? '' : item.PRICE,
                                                                });
                                                            }
                                                        }
                                                    }
                                                    po_obj.items = items;
                                                    // Update po to invoice
                                                    let update_related_doc = await invoiceCollection.updateOne({ _id: ObjectID(save_invoice._id) }, { has_po: true, po_data: po_obj });
                                                    // Set process data and related document process data to complete
                                                    let updateRelatedDocObj = {
                                                        status: 'Complete',
                                                        document_type: related_document_type,
                                                        process_data: relatedDocuments[i],
                                                        data: po_obj,
                                                    };
                                                    await invoiceProcessCollection.updateOne({ _id: ObjectID(relatedDocuments[i].document_id) }, updateRelatedDocObj);
                                                }
                                            } else if (related_document_type == 'QUOTE') {
                                                // Make packing slip Object
                                                let quote_obj = {
                                                    pdf_url: relatedDocuments[i].document_url,
                                                    document_id: relatedDocuments[i].document_id,
                                                    document_type: relatedDocuments[i].document_type,
                                                    date: "",
                                                    date_epoch: 0,
                                                    quote_number: "",
                                                    customer_id: "",
                                                    terms: "",
                                                    address: "",
                                                    vendor: "",
                                                    shipping_method: "",
                                                    sub_total: "",
                                                    tax: "",
                                                    quote_total: "",
                                                    receiver_phone: "",
                                                    items: [],
                                                    badge: {}
                                                };
                                                let tmpVendor = await getAndCheckVendorPO(related_doc_pages[0].fields.VENDOR_NAME.replace(/\n/g, " "), connection_db_api);
                                                if (tmpVendor.status) {
                                                    quote_obj.vendor = ObjectID(tmpVendor.data._id);
                                                    quote_obj.badge.vendor = true;
                                                }
                                                if (quote_obj.vendor != '') {
                                                    if (related_doc_pages[0].fields.QUOTE_DATE != null) {
                                                        if (related_doc_pages[0].fields.QUOTE_DATE.orig != null) {
                                                            quote_obj.date = related_doc_pages[0].fields.QUOTE_DATE.orig;
                                                            quote_obj.badge.date = true;
                                                        }
                                                        if (related_doc_pages[0].fields.QUOTE_DATE.epoch != null) {
                                                            quote_obj.date_epoch = related_doc_pages[0].fields.QUOTE_DATE.epoch;
                                                            quote_obj.badge.date_epoch = true;
                                                        }
                                                    }
                                                    if (related_doc_pages[0].fields.QUOTE_NUMBER != null) {
                                                        quote_obj.quote_number = related_doc_pages[0].fields.QUOTE_NUMBER;
                                                        quote_obj.badge.quote_number = true;
                                                    }
                                                    if (related_doc_pages[0].fields.TERMS != null) {
                                                        quote_obj.terms = related_doc_pages[0].fields.TERMS;
                                                        quote_obj.badge.terms = true;
                                                    }
                                                    if (related_doc_pages[0].fields.ADDRESS != null) {
                                                        quote_obj.address = related_doc_pages[0].fields.ADDRESS;
                                                        quote_obj.badge.address = true;
                                                    }
                                                    if (related_doc_pages[0].fields.SHIPPING_METHOD != null) {
                                                        quote_obj.shipping_method = related_doc_pages[0].fields.SHIPPING_METHOD;
                                                        quote_obj.badge.shipping_method = true;
                                                    }
                                                    if (related_doc_pages[0].fields.SUB_TOTAL != null) {
                                                        quote_obj.sub_total = related_doc_pages[0].fields.SUB_TOTAL;
                                                        quote_obj.badge.sub_total = true;
                                                    }
                                                    if (related_doc_pages[0].fields.TAX != null) {
                                                        quote_obj.tax = related_doc_pages[0].fields.TAX;
                                                        quote_obj.badge.tax = true;
                                                    }
                                                    if (related_doc_pages[0].fields.QUOTE_ORDER_TOTAL != null) {
                                                        quote_obj.quote_total = related_doc_pages[0].fields.QUOTE_ORDER_TOTAL;
                                                        quote_obj.badge.quote_total = true;
                                                    }
                                                    if (related_doc_pages[0].fields.RECEIVER_PHONE != null) {
                                                        quote_obj.receiver_phone = related_doc_pages[0].fields.RECEIVER_PHONE;
                                                        quote_obj.badge.receiver_phone = true;
                                                    }

                                                    let items = [];
                                                    if (related_doc_pages[0].expense_groups.length > 0) {
                                                        if (related_doc_pages[0].expense_groups[0].length > 0) {
                                                            for (let k = 0; k < related_doc_pages[0].expense_groups[0].length; k++) {
                                                                let item = related_doc_pages[0].expense_groups[0][k];
                                                                items.push({
                                                                    item: item.ITEM == null ? '' : item.ITEM,
                                                                    product_code: item.PRODUCT_CODE == null ? '' : item.PRODUCT_CODE,
                                                                    unit_price: item.UNIT_PRICE == null ? '' : item.UNIT_PRICE,
                                                                    quantity: item.QUANTITY == null ? '' : item.QUANTITY,
                                                                    price: item.PRICE == null ? '' : item.PRICE,
                                                                });
                                                            }
                                                        }
                                                    }
                                                    quote_obj.items = items;
                                                    // Update po to invoice
                                                    let update_related_doc = await invoiceCollection.updateOne({ _id: ObjectID(save_invoice._id) }, { has_quote: true, quote_data: quote_obj });
                                                    // Set process data and related document process data to complete
                                                    let updateRelatedDocObj = {
                                                        status: 'Complete',
                                                        document_type: related_document_type,
                                                        process_data: relatedDocuments[i],
                                                        data: quote_obj,
                                                    };
                                                    await invoiceProcessCollection.updateOne({ _id: ObjectID(relatedDocuments[i].document_id) }, updateRelatedDocObj);
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    // Set process data and invoice process data to complete
                                    let updateInvoiceProcessObject = {
                                        status: 'Process',
                                        document_type: get_data.data[key][j].document_type,
                                        process_data: get_data.data[key][j],
                                        data: invoiceObject,
                                    };
                                    await invoiceProcessCollection.updateOne({ _id: ObjectID(key) }, updateInvoiceProcessObject);
                                }
                            } else if (documentType == 'PACKING_SLIP') {
                                var pages = get_data.data[key][j].document_pages;
                                var relatedDocuments = get_data.data[key][j].related_documents;

                                // Check document id is available or not
                                let get_related_doc = await invoiceProcessCollection.findOne({ _id: ObjectID(get_data.data[key][j].document_id) });
                                // If document is there then process data
                                if (get_related_doc) {
                                    // Make packing slip Object
                                    let packing_slip_obj = {
                                        pdf_url: get_data.data[key][j].document_url,
                                        document_id: get_data.data[key][j].document_id,
                                        document_type: get_data.data[key][j].document_type,
                                        date: "",
                                        date_epoch: 0,
                                        invoice_number: "",
                                        po_number: "",
                                        ship_to_address: "",
                                        vendor: "",
                                        received_by: "",
                                        badge: {}
                                    };
                                    // Set process data and related document process data to complete
                                    let updatePackingSlipObj = {
                                        invoice_id: '',
                                        status: 'Process',
                                        document_type: documentType,
                                        process_data: get_data.data[key][j],
                                        data: packing_slip_obj,
                                    };

                                    let invoice_no = '';
                                    if (pages[0].fields.INVOICE_NUMBER != null) {
                                        invoice_no = pages[0].fields.INVOICE_NUMBER;
                                        packing_slip_obj.badge.invoice_number = true;
                                    }
                                    if (pages[0].fields.VENDOR_NAME != null) {
                                        let tmpVendor = await getAndCheckVendor(pages[0].fields.VENDOR_NAME.replace(/\n/g, " "), invoice_no, connection_db_api);
                                        if (tmpVendor.status) {
                                            packing_slip_obj.vendor = ObjectID(tmpVendor.data._id);
                                            packing_slip_obj.badge.vendor = true;
                                        }
                                    }
                                    if (pages[0].fields.DATE != null) {
                                        if (pages[0].fields.DATE.orig != null) {
                                            packing_slip_obj.date = pages[0].fields.DATE.orig;
                                            packing_slip_obj.badge.date = true;
                                        }
                                        if (pages[0].fields.DATE.epoch != null) {
                                            packing_slip_obj.date_epoch = pages[0].fields.DATE.epoch;
                                            packing_slip_obj.badge.date_epoch = true;
                                        }
                                    }
                                    packing_slip_obj.invoice_number = invoice_no;
                                    if (pages[0].fields.PO_NUMBER != null) {
                                        packing_slip_obj.po_number = pages[0].fields.PO_NUMBER;
                                        packing_slip_obj.badge.po_number = true;
                                    }
                                    if (pages[0].fields.SHIP_TO_ADDRESS != null) {
                                        packing_slip_obj.ship_to_address = pages[0].fields.SHIP_TO_ADDRESS;
                                        packing_slip_obj.badge.ship_to_address = true;
                                    }
                                    if (pages[0].fields.RECEIVED_BY != null) {
                                        packing_slip_obj.received_by = pages[0].fields.RECEIVED_BY;
                                        packing_slip_obj.badge.received_by = true;
                                    }

                                    // Check document has related invoice or not
                                    let related_invoice = await getRelatedInvoiceOfDocument(relatedDocuments, connection_db_api);
                                    if (related_invoice.status) {
                                        // Set invoice id and status if invoice is found
                                        updatePackingSlipObj.invoice_id = related_invoice.data._id;
                                        updatePackingSlipObj.status = 'Complete';

                                        // Update packing slip to invoice
                                        let update_related_doc = await invoiceCollection.updateOne({ _id: ObjectID(updatePackingSlipObj.invoice_id) }, { has_packing_slip: true, packing_slip_data: packing_slip_obj });
                                    }
                                    updatePackingSlipObj.data = packing_slip_obj;
                                    // Update packing slip object
                                    await invoiceProcessCollection.updateOne({ _id: ObjectID(get_related_doc._id) }, updatePackingSlipObj);
                                }
                            } else if (documentType == 'RECEIVING_SLIP') {
                                var pages = get_data.data[key][j].document_pages;
                                var relatedDocuments = get_data.data[key][j].related_documents;

                                // Check document id is available or not
                                let get_related_doc = await invoiceProcessCollection.findOne({ _id: ObjectID(get_data.data[key][j].document_id) });
                                // If document is there then process data
                                if (get_related_doc) {
                                    // Make packing slip Object
                                    let receiving_slip_obj = {
                                        pdf_url: get_data.data[key][j].document_url,
                                        document_id: get_data.data[key][j].document_id,
                                        document_type: get_data.data[key][j].document_type,
                                        date: "",
                                        date_epoch: 0,
                                        invoice_number: "",
                                        po_number: "",
                                        ship_to_address: "",
                                        vendor: "",
                                        received_by: "",
                                        badge: {}
                                    };
                                    // Set process data and related document process data to complete
                                    let updateReceivingSlipObj = {
                                        invoice_id: '',
                                        status: 'Process',
                                        document_type: documentType,
                                        process_data: get_data.data[key][j],
                                        data: receiving_slip_obj,
                                    };

                                    let invoice_no = '';
                                    if (pages[0].fields.INVOICE_NUMBER != null) {
                                        invoice_no = pages[0].fields.INVOICE_NUMBER;
                                        receiving_slip_obj.badge.invoice_number = true;
                                    }
                                    if (pages[0].fields.VENDOR_NAME != null) {
                                        let tmpVendor = await getAndCheckVendor(pages[0].fields.VENDOR_NAME.replace(/\n/g, " "), invoice_no, connection_db_api);
                                        if (tmpVendor.status) {
                                            receiving_slip_obj.vendor = ObjectID(tmpVendor.data._id);
                                            receiving_slip_obj.badge.vendor = true;
                                        }
                                    }
                                    if (pages[0].fields.DATE != null) {
                                        if (pages[0].fields.DATE.orig != null) {
                                            receiving_slip_obj.date = pages[0].fields.DATE.orig;
                                            receiving_slip_obj.badge.date = true;
                                        }
                                        if (pages[0].fields.DATE.epoch != null) {
                                            receiving_slip_obj.date_epoch = pages[0].fields.DATE.epoch;
                                            receiving_slip_obj.badge.date_epoch = true;
                                        }
                                    }
                                    receiving_slip_obj.invoice_number = invoice_no;
                                    if (pages[0].fields.PO_NUMBER != null) {
                                        receiving_slip_obj.po_number = pages[0].fields.PO_NUMBER;
                                        receiving_slip_obj.badge.po_number = true;
                                    }
                                    if (pages[0].fields.SHIP_TO_ADDRESS != null) {
                                        receiving_slip_obj.ship_to_address = pages[0].fields.SHIP_TO_ADDRESS;
                                        receiving_slip_obj.badge.ship_to_address = true;
                                    }
                                    if (pages[0].fields.RECEIVED_BY != null) {
                                        receiving_slip_obj.received_by = pages[0].fields.RECEIVED_BY;
                                        receiving_slip_obj.badge.received_by = true;
                                    }

                                    // Check document has related invoice or not
                                    let related_invoice = await getRelatedInvoiceOfDocument(relatedDocuments, connection_db_api);
                                    if (related_invoice.status) {
                                        updateReceivingSlipObj.invoice_id = related_invoice.data._id;
                                        updateReceivingSlipObj.status = 'Complete';

                                        // Update packing slip to invoice
                                        let update_related_doc = await invoiceCollection.updateOne({ _id: ObjectID(updateReceivingSlipObj.invoice_id) }, { has_receiving_slip: true, receiving_slip_data: receiving_slip_obj });
                                    }
                                    updateReceivingSlipObj.data = receiving_slip_obj;
                                    // Update packing slip object
                                    await invoiceProcessCollection.updateOne({ _id: ObjectID(get_related_doc._id) }, updateReceivingSlipObj);
                                }
                            } else if (documentType == 'PURCHASE_ORDER') {
                                var pages = get_data.data[key][j].document_pages;
                                var relatedDocuments = get_data.data[key][j].related_documents;

                                // Check document id is available or not
                                let get_related_doc = await invoiceProcessCollection.findOne({ _id: ObjectID(get_data.data[key][j].document_id) });
                                // If document is there then process data
                                if (get_related_doc) {
                                    // Make packing slip Object
                                    let po_obj = {
                                        pdf_url: get_data.data[key][j].document_url,
                                        document_id: get_data.data[key][j].document_id,
                                        document_type: get_data.data[key][j].document_type,
                                        date: "",
                                        date_epoch: 0,
                                        po_number: "",
                                        customer_id: "",
                                        terms: "",
                                        delivery_date: "",
                                        delivery_date_epoch: 0,
                                        delivery_address: "",
                                        due_date: "",
                                        due_date_epoch: 0,
                                        quote_number: "",
                                        contract_number: "",
                                        vendor_id: "",
                                        vendor: "",
                                        sub_total: "",
                                        tax: "",
                                        po_total: "",
                                        items: [],
                                        badge: {}
                                    };
                                    // Set process data and related document process data to complete
                                    let updatePOObj = {
                                        invoice_id: '',
                                        status: 'Process',
                                        document_type: documentType,
                                        process_data: get_data.data[key][j],
                                        data: po_obj,
                                    };

                                    if (pages[0].fields.VENDOR_NAME != null) {
                                        let tmpVendor = await getAndCheckVendorPO(pages[0].fields.VENDOR_NAME.replace(/\n/g, " "), connection_db_api);
                                        if (tmpVendor.status) {
                                            po_obj.vendor = ObjectID(tmpVendor.data._id);
                                            po_obj.badge.vendor = true;
                                        }
                                    }
                                    if (pages[0].fields.PO_CREATE_DATE != null) {
                                        if (pages[0].fields.PO_CREATE_DATE.orig != null) {
                                            po_obj.date = pages[0].fields.PO_CREATE_DATE.orig;
                                            po_obj.badge.date = true;
                                        }
                                        if (pages[0].fields.PO_CREATE_DATE.epoch != null) {
                                            po_obj.date_epoch = pages[0].fields.PO_CREATE_DATE.epoch;
                                            po_obj.badge.date_epoch = true;
                                        }
                                    }
                                    if (pages[0].fields.PO_NUMBER != null) {
                                        po_obj.po_number = pages[0].fields.PO_NUMBER;
                                        po_obj.badge.po_number = true;
                                    }
                                    if (pages[0].fields.CUSTOMER_ID != null) {
                                        po_obj.customer_id = pages[0].fields.CUSTOMER_ID;
                                        po_obj.badge.customer_id = true;
                                    }
                                    if (pages[0].fields.TERMS != null) {
                                        po_obj.terms = pages[0].fields.TERMS;
                                        po_obj.badge.terms = true;
                                    }
                                    if (pages[0].fields.DELIVERY_DATE != null) {
                                        if (pages[0].fields.DELIVERY_DATE.orig != null) {
                                            po_obj.delivery_date = pages[0].fields.DELIVERY_DATE.orig;
                                            po_obj.badge.delivery_date = true;
                                        }
                                        if (pages[0].fields.DELIVERY_DATE.epoch != null) {
                                            po_obj.delivery_date_epoch = pages[0].fields.DELIVERY_DATE.epoch;
                                            po_obj.badge.delivery_date_epoch = true;
                                        }
                                    }
                                    if (pages[0].fields.DELIVERY_ADDRESS != null) {
                                        po_obj.delivery_address = pages[0].fields.DELIVERY_ADDRESS;
                                        po_obj.badge.delivery_address = true;
                                    }
                                    if (pages[0].fields.DUE_DATE != null) {
                                        if (pages[0].fields.DUE_DATE.orig != null) {
                                            po_obj.due_date = pages[0].fields.DUE_DATE.orig;
                                            po_obj.badge.due_date = true;
                                        }
                                        if (pages[0].fields.DUE_DATE.epoch != null) {
                                            po_obj.due_date_epoch = pages[0].fields.DUE_DATE.epoch;
                                            po_obj.badge.due_date_epoch = true;
                                        }
                                    }
                                    if (pages[0].fields.QUOTE_NUMBER != null) {
                                        po_obj.quote_number = pages[0].fields.QUOTE_NUMBER;
                                        po_obj.badge.quote_number = true;
                                    }
                                    if (pages[0].fields.CONTRACT_NUMBER != null) {
                                        po_obj.contract_number = pages[0].fields.CONTRACT_NUMBER;
                                        po_obj.badge.contract_number = true;
                                    }
                                    if (pages[0].fields.VENDOR_ID != null) {
                                        po_obj.vendor_id = pages[0].fields.VENDOR_ID;
                                        po_obj.badge.vendor_id = true;
                                    }
                                    if (pages[0].fields.SUBTOTAL != null) {
                                        po_obj.sub_total = pages[0].fields.SUBTOTAL;
                                        po_obj.badge.sub_total = true;
                                    }
                                    if (pages[0].fields.TAX != null) {
                                        po_obj.tax = pages[0].fields.TAX;
                                        po_obj.badge.tax = true;
                                    }
                                    if (pages[0].fields.PURCHASE_ORDER_TOTAL != null) {
                                        po_obj.po_total = pages[0].fields.PURCHASE_ORDER_TOTAL;
                                        po_obj.badge.po_total = true;
                                    }

                                    let items = [];
                                    if (pages[0].expense_groups.length > 0) {
                                        if (pages[0].expense_groups[0].length > 0) {
                                            for (let k = 0; k < pages[0].expense_groups[0].length; k++) {
                                                let item = pages[0].expense_groups[0][k];
                                                items.push({
                                                    item: item.ITEM == null ? '' : item.ITEM,
                                                    product_code: item.PRODUCT_CODE == null ? '' : item.PRODUCT_CODE,
                                                    unit_price: item.UNIT_PRICE == null ? '' : item.UNIT_PRICE,
                                                    quantity: item.QUANTITY == null ? '' : item.QUANTITY,
                                                    price: item.PRICE == null ? '' : item.PRICE,
                                                });
                                            }
                                        }
                                    }
                                    po_obj.items = items;

                                    // Check document has related invoice or not
                                    let related_invoice = await getRelatedInvoiceOfDocument(relatedDocuments, connection_db_api);
                                    if (related_invoice.status) {
                                        // PO has related Quote but not assigned to any invoice
                                        let check_quote = await getProcessedQuoteFromPO(relatedDocuments, connection_db_api);
                                        if (check_quote.status) {
                                            // quote Object
                                            let quote_obj = check_quote.data.data;
                                            // Set process data and related document process data to complete
                                            let updateQuoteObj = {
                                                invoice_id: related_invoice.data._id,
                                                status: 'Complete',
                                            };
                                            // Update quote to invoice
                                            let update_related_doc = await invoiceCollection.updateOne({ _id: ObjectID(updateQuoteObj.invoice_id) }, { has_quote: true, quote_data: quote_obj });
                                            // Update quote object
                                            await invoiceProcessCollection.updateOne({ _id: ObjectID(check_quote.data._id) }, updateQuoteObj);
                                        }
                                        updatePOObj.invoice_id = related_invoice.data._id;
                                        updatePOObj.status = 'Complete';

                                        // Update PO to invoice
                                        let update_related_doc = await invoiceCollection.updateOne({ _id: ObjectID(updatePOObj.invoice_id) }, { has_po: true, po_data: po_obj });
                                    }
                                    updatePOObj.data = po_obj;
                                    // Update PO object
                                    await invoiceProcessCollection.updateOne({ _id: ObjectID(get_related_doc._id) }, updatePOObj);
                                }
                            } else if (documentType == 'QUOTE') {
                                var pages = get_data.data[key][j].document_pages;
                                var relatedDocuments = get_data.data[key][j].related_documents;

                                // Check document id is available or not
                                let get_related_doc = await invoiceProcessCollection.findOne({ _id: ObjectID(get_data.data[key][j].document_id) });
                                // If document is there then process data
                                if (get_related_doc) {
                                    // Make quote Object
                                    let quote_obj = {
                                        pdf_url: get_data.data[key][j].document_url,
                                        document_id: get_data.data[key][j].document_id,
                                        document_type: get_data.data[key][j].document_type,
                                        date: "",
                                        date_epoch: 0,
                                        quote_number: "",
                                        customer_id: "",
                                        terms: "",
                                        address: "",
                                        vendor: "",
                                        shipping_method: "",
                                        sub_total: "",
                                        tax: "",
                                        quote_total: "",
                                        receiver_phone: "",
                                        items: [],
                                        badge: {},
                                    };
                                    // Set process data and related document process data to complete
                                    let updateQuoteObj = {
                                        invoice_id: '',
                                        status: 'Process',
                                        document_type: documentType,
                                        process_data: get_data.data[key][j],
                                        data: quote_obj,
                                    };

                                    if (pages[0].fields.VENDOR_NAME != null) {
                                        let tmpVendor = await getAndCheckVendorPO(pages[0].fields.VENDOR_NAME.replace(/\n/g, " "), connection_db_api);
                                        if (tmpVendor.status) {
                                            quote_obj.vendor = ObjectID(tmpVendor.data._id);
                                            quote_obj.badge.vendor = true;
                                        }
                                    }

                                    if (pages[0].fields.QUOTE_DATE != null) {
                                        if (pages[0].fields.QUOTE_DATE.orig != null) {
                                            quote_obj.date = pages[0].fields.QUOTE_DATE.orig;
                                            quote_obj.badge.date = true;
                                        }
                                        if (pages[0].fields.QUOTE_DATE.epoch != null) {
                                            quote_obj.date_epoch = pages[0].fields.QUOTE_DATE.epoch;
                                            quote_obj.badge.date_epoch = true;
                                        }
                                    }
                                    if (pages[0].fields.QUOTE_NUMBER != null) {
                                        quote_obj.quote_number = pages[0].fields.QUOTE_NUMBER;
                                        quote_obj.badge.quote_number = true;
                                    }
                                    if (pages[0].fields.TERMS != null) {
                                        quote_obj.terms = pages[0].fields.TERMS;
                                        quote_obj.badge.terms = true;
                                    }
                                    if (pages[0].fields.ADDRESS != null) {
                                        quote_obj.address = pages[0].fields.ADDRESS;
                                        quote_obj.badge.address = true;
                                    }
                                    if (pages[0].fields.SHIPPING_METHOD != null) {
                                        quote_obj.shipping_method = pages[0].fields.SHIPPING_METHOD;
                                        quote_obj.badge.shipping_method = true;
                                    }
                                    if (pages[0].fields.SUB_TOTAL != null) {
                                        quote_obj.sub_total = pages[0].fields.SUB_TOTAL;
                                        quote_obj.badge.sub_total = true;
                                    }
                                    if (pages[0].fields.TAX != null) {
                                        quote_obj.tax = pages[0].fields.TAX;
                                        quote_obj.badge.tax = true;
                                    }
                                    if (pages[0].fields.QUOTE_ORDER_TOTAL != null) {
                                        quote_obj.quote_total = pages[0].fields.QUOTE_ORDER_TOTAL;
                                        quote_obj.badge.quote_total = true;
                                    }
                                    if (pages[0].fields.RECEIVER_PHONE != null) {
                                        quote_obj.receiver_phone = pages[0].fields.RECEIVER_PHONE;
                                        quote_obj.badge.receiver_phone = true;
                                    }

                                    let items = [];
                                    if (pages[0].expense_groups.length > 0) {
                                        if (pages[0].expense_groups[0].length > 0) {
                                            for (let k = 0; k < pages[0].expense_groups[0].length; k++) {
                                                let item = pages[0].expense_groups[0][k];
                                                items.push({
                                                    item: item.ITEM == null ? '' : item.ITEM,
                                                    product_code: item.PRODUCT_CODE == null ? '' : item.PRODUCT_CODE,
                                                    unit_price: item.UNIT_PRICE == null ? '' : item.UNIT_PRICE,
                                                    quantity: item.QUANTITY == null ? '' : item.QUANTITY,
                                                    price: item.PRICE == null ? '' : item.PRICE,
                                                });
                                            }
                                        }
                                    }
                                    quote_obj.items = items;

                                    // Check document has related invoice or not
                                    let related_invoice = await getRelatedInvoiceOfDocument(relatedDocuments, connection_db_api);
                                    if (related_invoice.status) {
                                        updateQuoteObj.invoice_id = related_invoice.data._id;
                                        updateQuoteObj.status = 'Complete';

                                        // Update packing slip to invoice
                                        let update_related_doc = await invoiceCollection.updateOne({ _id: ObjectID(updateQuoteObj.invoice_id) }, { has_quote: true, quote_data: quote_obj });
                                    }
                                    updateQuoteObj.data = quote_obj;
                                    // Update packing slip object
                                    await invoiceProcessCollection.updateOne({ _id: ObjectID(get_related_doc._id) }, updateQuoteObj);
                                }
                            } else {
                                var pages = get_data.data[key][j].document_pages;

                                let updateObj = {
                                    invoice_id: '',
                                    status: 'Process',
                                    document_type: documentType,
                                    process_data: get_data.data[key][j],
                                    data: {
                                        pdf_url: get_data.data[key][j].document_url,
                                        document_id: get_data.data[key][j].document_id,
                                        document_type: get_data.data[key][j].document_type,
                                        po_number: "",
                                        invoice_no: '',
                                        vendor: "",
                                    }
                                };
                                if (pages[0].fields.VENDOR_NAME != null) {
                                    let tmpVendor = await getAndCheckVendorPO(pages[0].fields.VENDOR_NAME.replace(/\n/g, " "), connection_db_api);
                                    if (tmpVendor.status) {
                                        updateObj.data.vendor = ObjectID(tmpVendor.data._id);
                                    }
                                }
                                if (pages[0].fields.PO_NUMBER != null) {
                                    updateObj.data.po_number = pages[0].fields.PO_NUMBER;
                                }
                                if (pages[0].fields.INVOICE_NUMBER != null) {
                                    updateObj.data.invoice_no = pages[0].fields.INVOICE_NUMBER;
                                }
                                // Check document id is available or not
                                let get_related_doc = await invoiceProcessCollection.findOne({ _id: ObjectID(get_data.data[key][j].document_id) });
                                if (get_related_doc) {
                                    // Update packing slip object
                                    await invoiceProcessCollection.updateOne({ _id: ObjectID(get_related_doc._id) }, updateObj);
                                }
                            }
                        }
                    }
                }
            }
            // }
            res.send({ message: 'Processed invoice imported sucessfully.', data: get_data.data, status: true });
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

function getAndCheckVendor(vendorName, invoice_no, connection_db_api) {
    return new Promise(async function (resolve, reject) {
        let invoiceCollection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
        let vendorCollection = connection_db_api.model(collectionConstant.INVOICE_VENDOR, vendorSchema);
        let get_vendor = await vendorCollection.findOne({ vendor_name: vendorName });
        if (get_vendor) {
            let one_invoice = await invoiceCollection.findOne({ vendor: ObjectID(get_vendor._id), invoice: invoice_no });
            if (one_invoice) {
                resolve({ status: true, duplicate: true, data: get_vendor });
            } else {
                resolve({ status: true, duplicate: false, data: get_vendor });
            }
        } else {
            resolve({ status: false });
        }
    });
};

function getAndCheckVendorPO(vendorName, connection_db_api) {
    return new Promise(async function (resolve, reject) {
        let vendorCollection = connection_db_api.model(collectionConstant.INVOICE_VENDOR, vendorSchema);
        let get_vendor = await vendorCollection.findOne({ vendor_name: vendorName });
        if (get_vendor) {
            resolve({ status: true, data: get_vendor });
        } else {
            resolve({ status: false });
        }
    });
};

function getRelatedInvoiceOfDocument(documents, connection_db_api) {
    return new Promise(async function (resolve, reject) {
        let invoiceCollection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
        let invoiceProcessCollection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);
        if (documents.length == 0) {
            resolve({ status: false });
        } else {
            let hasInvoiceData = false;
            let invoiceData;
            for (let i = 0; i < documents.length; i++) {
                if (documents[i].document_type == 'INVOICE') {
                    let one_process = await invoiceProcessCollection.findOne({ _id: ObjectID(documents[i].document_id) });
                    if (one_process) {
                        let one_invoice = await invoiceCollection.findOne({ _id: one_process.invoice_id });
                        if (one_invoice) {
                            hasInvoiceData = true;
                            invoiceData = one_invoice;
                            if (i == documents.length - 1) {
                                if (hasInvoiceData) {
                                    resolve({ status: true, data: invoiceData });
                                } else {
                                    resolve({ status: false });
                                }
                            }
                        } else {
                            if (i == documents.length - 1) {
                                if (hasInvoiceData) {
                                    resolve({ status: true, data: invoiceData });
                                } else {
                                    resolve({ status: false });
                                }
                            }
                        }
                    } else {
                        if (i == documents.length - 1) {
                            if (hasInvoiceData) {
                                resolve({ status: true, data: invoiceData });
                            } else {
                                resolve({ status: false });
                            }
                        }
                    }
                } else {
                    if (i == documents.length - 1) {
                        if (hasInvoiceData) {
                            resolve({ status: true, data: invoiceData });
                        } else {
                            resolve({ status: false });
                        }
                    }
                }
            }
        }
        /* let vendorCollection = connection_db_api.model(collectionConstant.INVOICE_VENDOR, vendorSchema);
        let get_vendor = await vendorCollection.findOne({ vendor_name: vendorName });
        if (get_vendor) {
            let one_invoice = await invoiceCollection.findOne({ vendor: ObjectID(get_vendor._id), invoice: invoice_no });
            if (one_invoice) {
                resolve({ status: true, duplicate: true });
            } else {
                resolve({ status: true, duplicate: false, data: get_vendor });
            }
        } else {
            resolve({ status: false });
        } */
    });
};

function getProcessedQuoteFromPO(documents, connection_db_api) {
    return new Promise(async function (resolve, reject) {
        let invoiceProcessCollection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);
        if (documents.length == 0) {
            resolve({ status: false });
        } else {
            let hasQuoteData = false;
            let quoteData;
            for (let i = 0; i < documents.length; i++) {
                if (documents[i].document_type == 'QUOTE') {
                    let one_process = await invoiceProcessCollection.findOne({ _id: ObjectID(documents[i].document_id), status: 'Process' });
                    if (one_process) {
                        hasQuoteData = true;
                        quoteData = one_process;
                        if (i == documents.length - 1) {
                            if (hasQuoteData) {
                                resolve({ status: true, data: quoteData });
                            } else {
                                resolve({ status: false });
                            }
                        }
                    } else {
                        if (i == documents.length - 1) {
                            if (hasQuoteData) {
                                resolve({ status: true, data: quoteData });
                            } else {
                                resolve({ status: false });
                            }
                        }
                    }
                } else {
                    if (i == documents.length - 1) {
                        if (hasQuoteData) {
                            resolve({ status: true, data: quoteData });
                        } else {
                            resolve({ status: false });
                        }
                    }
                }
            }
        }
    });
};

function sendInvoiceInsertAlerts(decodedToken, id, translator) {
    return new Promise(async function (resolve, reject) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        let invoiceCollection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
        let settingsCollection = connection_db_api.model(collectionConstant.INVOICE_SETTING, settingsSchema);
        let userCollection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
        let one_invoice = await invoiceCollection.findOne({ _id: ObjectID(id) });
        if (one_invoice) {
            let get_settings = await settingsCollection.findOne({});
            if (get_settings) {
                if (get_settings.settings.Invoice_arrive.setting_status == 'Active' && get_settings.settings.User_Notify_By.setting_status == 'Active') {
                    var notifyOptions = get_settings.settings.User_Notify_By.setting_value;
                    var allowEmail = (notifyOptions.indexOf('Email') !== -1) ? true : false;
                    var allowAlert = (notifyOptions.indexOf('Alert') !== -1) ? true : false;
                    var allowNotification = (notifyOptions.indexOf('Notification') !== -1) ? true : false;

                    let roles = [];
                    get_settings.settings.Invoice_arrive.setting_value.forEach((id) => {
                        roles.push(ObjectID(id));
                    });
                    let get_users = await userCollection.find({ userroleId: { $in: roles } });
                    let title = `Invoice #${one_invoice.invoice} Arrive Alert`;
                    let description = `Invoice #${one_invoice.invoice} has been arrived.`;
                    let emailList = [];
                    for (let i = 0; i < get_users.length; i++) {
                        // Notification
                        if (allowNotification) {
                            let notification_data = {
                                title: title,
                                body: description,
                            };
                            let temp_data = {
                                "module": "Invoice",
                                "_id": one_invoice._id,
                                "status": one_invoice.status,
                            };
                            await common.sendNotificationWithData([get_users[i].invoice_firebase_token], notification_data, temp_data);
                        }

                        // Alert
                        if (allowAlert) {
                            let alertObject = {
                                user_id: get_users[i]._id,
                                module_name: 'Invoice',
                                module_route: { _id: id },
                                notification_title: title,
                                notification_description: description,
                            };
                            alertController.saveAlert(alertObject, connection_db_api);
                        }

                        emailList.push(get_users[i].useremail);
                        if (i == get_users.length - 1) {
                            // Email
                            if (allowEmail) {
                                var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
                                let talnate_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_TENANTS, { companycode: decodedToken.companycode });
                                let company_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: decodedToken.companycode });
                                const file_data = fs.readFileSync(config.EMAIL_TEMPLATE_PATH + '/controller/emailtemplates/commonEmailTemplate.html', 'utf8');
                                let emailTmp = {
                                    HELP: `${translator.getStr('EmailTemplateHelpEmailAt')} ${config.HELPEMAIL} ${translator.getStr('EmailTemplateCallSupportAt')} ${config.NUMBERPHONE}`,
                                    SUPPORT: `${translator.getStr('EmailTemplateEmail')} ${config.SUPPORTEMAIL} l ${translator.getStr('EmailTemplatePhone')} ${config.NUMBERPHONE2}`,
                                    ALL_RIGHTS_RESERVED: `${translator.getStr('EmailTemplateAllRightsReserved')}`,
                                    THANKS: translator.getStr('EmailTemplateThanks'),
                                    ROVUK_TEAM: translator.getStr('EmailTemplateRovukTeam'),
                                    ROVUK_TEAM_SEC: translator.getStr('EmailTemplateRovukTeamSec'),
                                    VIEW_EXCEL: translator.getStr('EmailTemplateViewExcelReport'),
                                    COPYRIGHTNAME: `${config.COPYRIGHTNAME}`,

                                    TITLE: `${title}`,
                                    TEXT: new handlebars.SafeString(`<h4>Hello,</h4><h4>${description}</h4>
                                <div style="text-align: center;">
                                    <a style="background-color: #023E8A;border: #0077bc solid;color: white;padding: 15px 32px;
                                                text-align: center;text-decoration: none;display: inline-block;font-size: 16px; width: 20%;" 
                                                target="_blank" href="${config.SITE_URL}/invoice-form?_id=${id}">View Invoice</a>
                                </div>`),

                                    COMPANYNAME: `${translator.getStr('EmailCompanyName')} ${company_data.companyname}`,
                                    COMPANYCODE: `${translator.getStr('EmailCompanyCode')} ${company_data.companycode}`,
                                };
                                var template = handlebars.compile(file_data);
                                var HtmlData = await template(emailTmp);
                                sendEmail.sendEmail_client(talnate_data.smartaccupay_tenants.tenant_smtp_username, emailList, title, HtmlData,
                                    talnate_data.smartaccupay_tenants.tenant_smtp_server, talnate_data.smartaccupay_tenants.tenant_smtp_port, talnate_data.smartaccupay_tenants.tenant_smtp_reply_to_mail,
                                    talnate_data.smartaccupay_tenants.tenant_smtp_password, talnate_data.smartaccupay_tenants.tenant_smtp_timeout, talnate_data.smartaccupay_tenants.tenant_smtp_security);
                            }
                            resolve();
                        }
                    }
                } else {
                    resolve();
                }
            } else {
                resolve();
            }
        } else {
            resolve();
        }
    });
};

function sendProcessDocumentUpdateAlert(decodedToken, id, module, translator) {
    return new Promise(async function (resolve, reject) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        let invoiceProcessCollection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);
        let settingsCollection = connection_db_api.model(collectionConstant.INVOICE_SETTING, settingsSchema);
        let userCollection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
        let one_invoice = await invoiceProcessCollection.findOne({ _id: ObjectID(id) });
        if (one_invoice) {
            if (one_invoice.data) {
                if (one_invoice.data.assign_to) {
                    let get_settings = await settingsCollection.findOne({});
                    if (get_settings) {
                        if (get_settings.settings.User_Notify_By.setting_status == 'Active') {
                            var notifyOptions = get_settings.settings.User_Notify_By.setting_value;
                            var allowEmail = (notifyOptions.indexOf('Email') !== -1) ? true : false;
                            var allowAlert = (notifyOptions.indexOf('Alert') !== -1) ? true : false;
                            var allowNotification = (notifyOptions.indexOf('Notification') !== -1) ? true : false;

                            let get_user = await userCollection.findOne({ _id: ObjectID(one_invoice.data.assign_to) });
                            if (get_user) {
                                let title = `Invoice Assigned Alert`;
                                let description = `Invoice is assigned to you.`;

                                // Notification
                                if (allowNotification) {
                                    let notification_data = {
                                        title: title,
                                        body: description,
                                    };
                                    await common.sendNotificationWithData([get_user.invoice_firebase_token], notification_data, {});
                                }

                                // Alert
                                if (allowAlert) {
                                    let alertObject = {
                                        user_id: get_user._id,
                                        module_name: module,
                                        module_route: { document_id: id, document_type: module, from: 'select' },
                                        notification_title: title,
                                        notification_description: description,
                                    };
                                    alertController.saveAlert(alertObject, connection_db_api);
                                }

                                // Email
                                if (allowEmail) {
                                    var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
                                    let talnate_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_TENANTS, { companycode: decodedToken.companycode });
                                    let company_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: decodedToken.companycode });
                                    const file_data = fs.readFileSync(config.EMAIL_TEMPLATE_PATH + '/controller/emailtemplates/commonEmailTemplate.html', 'utf8');
                                    let emailTmp = {
                                        HELP: `${translator.getStr('EmailTemplateHelpEmailAt')} ${config.HELPEMAIL} ${translator.getStr('EmailTemplateCallSupportAt')} ${config.NUMBERPHONE}`,
                                        SUPPORT: `${translator.getStr('EmailTemplateEmail')} ${config.SUPPORTEMAIL} l ${translator.getStr('EmailTemplatePhone')} ${config.NUMBERPHONE2}`,
                                        ALL_RIGHTS_RESERVED: `${translator.getStr('EmailTemplateAllRightsReserved')}`,
                                        THANKS: translator.getStr('EmailTemplateThanks'),
                                        ROVUK_TEAM: translator.getStr('EmailTemplateRovukTeam'),
                                        ROVUK_TEAM_SEC: translator.getStr('EmailTemplateRovukTeamSec'),
                                        VIEW_EXCEL: translator.getStr('EmailTemplateViewExcelReport'),
                                        COPYRIGHTNAME: `${config.COPYRIGHTNAME}`,

                                        TITLE: `${title}`,
                                        TEXT: new handlebars.SafeString(`<h4>Hello,</h4><h4>${description}</h4>
                                    <div style="text-align: center;">
                                        <a style="background-color: #023E8A;border: #0077bc solid;color: white;padding: 15px 32px;
                                                    text-align: center;text-decoration: none;display: inline-block;font-size: 16px; width: 20%;" 
                                                    target="_blank" href="${config.SITE_URL}/invoice-form?document_id=${id}&document_type=${module}&from=select">View Invoice</a>
                                    </div>`),

                                        COMPANYNAME: `${translator.getStr('EmailCompanyName')} ${company_data.companyname}`,
                                        COMPANYCODE: `${translator.getStr('EmailCompanyCode')} ${company_data.companycode}`,
                                    };
                                    var template = handlebars.compile(file_data);
                                    var HtmlData = await template(emailTmp);
                                    sendEmail.sendEmail_client(talnate_data.smartaccupay_tenants.tenant_smtp_username, [get_user.useremail], title, HtmlData,
                                        talnate_data.smartaccupay_tenants.tenant_smtp_server, talnate_data.smartaccupay_tenants.tenant_smtp_port, talnate_data.smartaccupay_tenants.tenant_smtp_reply_to_mail,
                                        talnate_data.smartaccupay_tenants.tenant_smtp_password, talnate_data.smartaccupay_tenants.tenant_smtp_timeout, smartaccupay_tenants._smtp_security);
                                }
                                resolve();
                            } else {
                                resolve();
                            }
                        } else {
                            resolve();
                        }
                    } else {
                        resolve();
                    }
                } else {
                    resolve();
                }
            } else {
                resolve();
            }
        } else {
            resolve();
        }
    });
};

module.exports.deleteInvoiceProcess = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let ids = [];
            requestObject.ids.forEach((id) => {
                ids.push(ObjectID(id));
            });
            let invoiceProcessCollection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);
            let invoiceProcessObject = await invoiceProcessCollection.remove({ _id: { $in: ids } });
            if (invoiceProcessObject) {
                res.send({ message: 'Invoice process deleted.', status: true });
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