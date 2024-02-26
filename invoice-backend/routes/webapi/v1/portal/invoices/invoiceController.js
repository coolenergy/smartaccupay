var invoiceSchema = require('../../../../../model/invoice');
var vendorSchema = require('../../../../../model/vendor');
var processInvoiceSchema = require('../../../../../model/process_invoice');
var invoice_history_Schema = require('../../../../../model/history/invoice_history');
var recentActivitySchema = require('../../../../../model/recent_activities');
var settingsSchema = require('../../../../../model/settings');
var rolesSchema = require('../../../../../model/invoice_roles');
var userSchema = require('../../../../../model/user');
let db_connection = require('../../../../../controller/common/connectiondb');
let collectionConstant = require('../../../../../config/collectionConstant');
let config = require('../../../../../config/config');
let common = require('../../../../../controller/common/common');
const historyCollectionConstant = require('../../../../../config/historyCollectionConstant');
var ObjectID = require('mongodb').ObjectID;
let rest_Api = require('./../../../../../config/db_rest_api');
var _ = require('lodash');
var recentActivity = require('./../recent_activity/recentActivityController');
const excel = require("exceljs");
var handlebars = require('handlebars');
let sendEmail = require('./../../../../../controller/common/sendEmail');
var fs = require('fs');
var bucketOpration = require('../../../../../controller/common/s3-wasabi');
var moment = require('moment');
var alertController = require('./../alert/alertController');
let intuitOauth = require('../quickbook/quickbookController');
var QuickBooks = require('node-quickbooks');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

QuickBooks.setOauthVersion('2.0');//set the Oauth version

var qbo; //QuickBooks Info

// save invoice
module.exports.saveInvoice = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var id = requestObject._id;
            delete requestObject._id;
            if (id) {
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(id) });

                let findKeys = {};
                let updateBadgeObject = {};
                for (const property in requestObject) {
                    findKeys[property] = 1;
                }
                var get_data = await invoicesConnection.findOne({ _id: ObjectID(id) }, findKeys);
                let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(id) }, requestObject);
                if (update_invoice) {
                    delete requestObject.updated_at;
                    delete requestObject.invoice_name;
                    if (requestObject.cost_code) {
                        requestObject.cost_code = ObjectID(requestObject.cost_code);
                    }
                    if (requestObject.invoice_id) {
                        requestObject.invoice_id = ObjectID(requestObject.invoice_id);
                    }
                    if (requestObject.updated_by) {
                        requestObject.updated_by = ObjectID(requestObject.updated_by);
                    }
                    if (requestObject.vendor) {
                        requestObject.vendor = ObjectID(requestObject.vendor);
                    }
                    let updatedData = await common.findUpdatedFieldHistory(requestObject, get_data._doc);
                    for (let i = 0; i < updatedData.length; i++) {

                        let key = `badge.${updatedData[i]['key']}`;
                        updateBadgeObject[key] = false;
                    }

                    await invoicesConnection.updateOne({ _id: ObjectID(id) }, updateBadgeObject);

                    requestObject.invoice_id = id;
                    // Send Update to as per settings
                    await sendInvoiceUpdateAlerts(decodedToken, id, 'Invoice', translator);

                    // Send update Assigned alert
                    if (requestObject.assign_to != get_invoice.assign_to) {
                        await sendInvoiceAssignUpdateAlerts(decodedToken, id, 'Invoice', translator);
                    }
                    addchangeInvoice_History("Update", requestObject, decodedToken, requestObject.updated_at);

                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: id,
                        title: `Invoice #${get_invoice.invoice}`,
                        module: 'Invoice',
                        action: 'Update',
                        action_from: 'Web',
                    }, decodedToken);
                    res.send({ status: true, message: "Invoice updated successfully..", data: update_invoice });
                } else {

                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {

                //ivoice save
                requestObject.created_by = decodedToken.UserData._id;
                requestObject.created_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let add_invoice = new invoicesConnection(requestObject);
                let save_invoice = await add_invoice.save();
                if (save_invoice) {

                    requestObject.invoice_id = save_invoice._id;
                    addchangeInvoice_History("Insert", requestObject, decodedToken, requestObject.updated_at);
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: save_invoice._id,
                        title: `Invoice #${save_invoice.invoice}`,
                        module: 'Invoice',
                        action: 'Insert',
                        action_from: 'Web',
                    }, decodedToken);
                    res.send({ status: true, message: "Invoice saved successfully.." });
                } else {

                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
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

function sendInvoiceUpdateAlerts(decodedToken, id, module, translator) {
    return new Promise(async function (resolve, reject) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        let invoiceCollection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
        let settingsCollection = connection_db_api.model(collectionConstant.INVOICE_SETTING, settingsSchema);
        let userCollection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
        let one_invoice = await invoiceCollection.findOne({ _id: ObjectID(id) });
        if (one_invoice) {
            let get_settings = await settingsCollection.findOne({});
            if (get_settings) {
                if (get_settings.settings.Invoice_modified.setting_status == 'Active' && get_settings.settings.User_Notify_By.setting_status == 'Active') {
                    var notifyOptions = get_settings.settings.User_Notify_By.setting_value;
                    var allowEmail = (notifyOptions.indexOf('Email') !== -1) ? true : false;
                    var allowAlert = (notifyOptions.indexOf('Alert') !== -1) ? true : false;
                    var allowNotification = (notifyOptions.indexOf('Notification') !== -1) ? true : false;

                    let roles = [];
                    get_settings.settings.Invoice_modified.setting_value.forEach((id) => {
                        roles.push(ObjectID(id));
                    });
                    let get_users = await userCollection.find({ userroleId: { $in: roles } });
                    let title = `${module} #${one_invoice.invoice} Update Alert`;
                    let description = `${module} #${one_invoice.invoice} has been updated.`;
                    let emailList = [];
                    let viewRoute = `${config.SITE_URL}/invoice-form?_id=${id}`;
                    if (module == 'Invoice') {
                        viewRoute = `${config.SITE_URL}/invoice-form?_id=${id}`;
                    } else if (module == 'PO') {
                        viewRoute = `${config.SITE_URL}/po-detail-form?_id=${id}`;
                    } else if (module == 'Packing Slip') {
                        viewRoute = `${config.SITE_URL}/packing-slip-form?_id=${id}`;
                    } else if (module == 'Receiving Slip') {
                        viewRoute = `${config.SITE_URL}/receiving-slip-form?_id=${id}`;
                    } else if (module == 'Quote') {
                        viewRoute = `${config.SITE_URL}/quote-detail-form?_id=${id}`;
                    }
                    if (get_users.length > 0) {
                        for (let i = 0; i < get_users.length; i++) {
                            // Notification
                            if (allowNotification) {
                                let notification_data = {
                                    title: title,
                                    body: description,
                                };
                                let temp_data = {
                                    "module": module,
                                    "_id": one_invoice._id,
                                    "status": one_invoice.status,
                                };
                                await common.sendNotificationWithData([get_users[i].invoice_firebase_token], notification_data, temp_data);
                            }

                            // Alert
                            if (allowAlert) {
                                let alertObject = {
                                    user_id: get_users[i]._id,
                                    module_name: module,
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
                                                target="_blank" href="${viewRoute}">View ${module}</a>
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
        } else {
            resolve();
        }
    });
};

function sendInvoiceAssignUpdateAlerts(decodedToken, id, module, translator) {
    return new Promise(async function (resolve, reject) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        let invoiceCollection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
        let settingsCollection = connection_db_api.model(collectionConstant.INVOICE_SETTING, settingsSchema);
        let userCollection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
        let one_invoice = await invoiceCollection.findOne({ _id: ObjectID(id) });
        if (one_invoice) {
            if (one_invoice.assign_to) {
                let get_settings = await settingsCollection.findOne({});
                if (get_settings) {
                    if (get_settings.settings.User_Notify_By.setting_status == 'Active') {
                        var notifyOptions = get_settings.settings.User_Notify_By.setting_value;
                        var allowEmail = (notifyOptions.indexOf('Email') !== -1) ? true : false;
                        var allowAlert = (notifyOptions.indexOf('Alert') !== -1) ? true : false;
                        var allowNotification = (notifyOptions.indexOf('Notification') !== -1) ? true : false;

                        let get_users = await userCollection.findOne({ _id: ObjectID(one_invoice.assign_to) });
                        let title = `${module} #${one_invoice.invoice} Assigned Alert`;
                        let description = `${module} #${one_invoice.invoice} has been assigned to you.`;

                        let viewRoute = `${config.SITE_URL}/invoice-form?_id=${id}`;
                        if (module == 'Invoice') {
                            viewRoute = `${config.SITE_URL}/invoice-form?_id=${id}`;
                        } else if (module == 'PO') {
                            viewRoute = `${config.SITE_URL}/po-detail-form?_id=${id}`;
                        } else if (module == 'Packing Slip') {
                            viewRoute = `${config.SITE_URL}/packing-slip-form?_id=${id}`;
                        } else if (module == 'Receiving Slip') {
                            viewRoute = `${config.SITE_URL}/receiving-slip-form?_id=${id}`;
                        } else if (module == 'Quote') {
                            viewRoute = `${config.SITE_URL}/quote-detail-form?_id=${id}`;
                        }
                        // Notification
                        if (allowNotification) {
                            let notification_data = {
                                title: title,
                                body: description,
                            };
                            let temp_data = {
                                "module": module,
                                "_id": one_invoice._id,
                                "status": one_invoice.status,
                            };
                            await common.sendNotificationWithData([get_users.invoice_firebase_token], notification_data, temp_data);
                        }

                        // Alert
                        if (allowAlert) {
                            let alertObject = {
                                user_id: get_users._id,
                                module_name: module,
                                module_route: { _id: id },
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
                                                target="_blank" href="${viewRoute}">View ${module}</a>
                                </div>`),

                                COMPANYNAME: `${translator.getStr('EmailCompanyName')} ${company_data.companyname}`,
                                COMPANYCODE: `${translator.getStr('EmailCompanyCode')} ${company_data.companycode}`,
                            };
                            var template = handlebars.compile(file_data);
                            var HtmlData = await template(emailTmp);
                            sendEmail.sendEmail_client(talnate_data.smartaccupay_tenants.tenant_smtp_username, [get_users.useremail], title, HtmlData,
                                talnate_data.smartaccupay_tenants.tenant_smtp_server, talnate_data.smartaccupay_tenants.tenant_smtp_port, talnate_data.smartaccupay_tenants.tenant_smtp_reply_to_mail,
                                talnate_data.smartaccupay_tenants.tenant_smtp_password, talnate_data.smartaccupay_tenants.tenant_smtp_timeout, talnate_data.smartaccupay_tenants.tenant_smtp_security);
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
        // let get_settings = await settingsCollection.findOne({});
        // if (get_settings) {
        //     if (get_settings.settings.Invoice_modified.setting_status == 'Active') {  

        //     } else {
        //         resolve();
        //     }
        // } else {
        //     resolve();
        // } 
    });
};

//get invoice
module.exports.getInvoice = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var processInvoiceConnection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);
            var get_data = await invoicesConnection.aggregate([
                { $match: { is_delete: 0 } },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_VENDOR,
                        localField: "vendor",
                        foreignField: "_id",
                        as: "vendor"
                    }
                },
                { $unwind: "$vendor" },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "created_by",
                        foreignField: "_id",
                        as: "created_by"
                    }
                },
                {
                    $unwind: {
                        path: "$created_by",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $project: {
                        assign_to: 1,
                        vendor: "$vendor",
                        vendor_name: "$vendor.vendor_name",
                        vendor_id: 1,
                        customer_id: 1,
                        invoice: 1,
                        p_o: 1,
                        invoice_date: 1,
                        invoice_date_epoch: 1,
                        due_date: 1,
                        due_date_epoch: 1,
                        order_date: 1,
                        order_date_epoch: 1,
                        ship_date: 1,
                        ship_date_epoch: 1,
                        terms: 1,
                        total: 1,
                        invoice_total: 1,
                        tax_amount: 1,
                        tax_id: 1,
                        sub_total: 1,
                        amount_due: 1,
                        cost_code: 1,
                        receiving_date: 1,
                        notes: 1,
                        status: 1,
                        job_number: 1,
                        delivery_address: 1,
                        contract_number: 1,
                        account_number: 1,
                        discount: 1,
                        pdf_url: 1,
                        items: 1,
                        packing_slip: 1,
                        receiving_slip: 1,
                        badge: 1,
                        gl_account: 1,
                        created_by: { $ifNull: ["$created_by.userfullname", "$created_by_mail"] },
                        created_at: 1,
                        // invoice_notes: { $elemMatch: { is_delete: 0 } },
                        invoice_notes: {
                            $filter: {
                                input: '$invoice_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },
                        invoice_attachments: 1,
                        has_packing_slip: 1,
                        packing_slip_data: 1,
                        packing_slip_notes: {
                            $filter: {
                                input: '$packing_slip_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },
                        packing_slip_attachments: 1,
                        has_receiving_slip: 1,
                        receiving_slip_data: 1,
                        receiving_slip_notes: {
                            $filter: {
                                input: '$receiving_slip_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },
                        receiving_slip_attachments: 1,
                        has_po: 1,
                        po_data: 1,
                        po_notes: {
                            $filter: {
                                input: '$po_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },
                        po_attachments: 1,
                        has_quote: 1,
                        quote_data: 1,
                        quote_notes: {
                            $filter: {
                                input: '$quote_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },
                        quote_attachments: 1,
                        document_type: { $ifNull: ["$document_type", "INVOICE"] },
                        attach_files: {
                            $sum: [
                                1, {
                                    $cond: [
                                        { $eq: ["$has_packing_slip", true] },
                                        1, 0
                                    ]
                                }, {
                                    $cond: [
                                        { $eq: ["$has_receiving_slip", true] },
                                        1, 0
                                    ]
                                }, {
                                    $cond: [
                                        { $eq: ["$has_po", true] },
                                        1, 0
                                    ]
                                }, {
                                    $cond: [
                                        { $eq: ["$has_quote", true] },
                                        1, 0
                                    ]
                                }
                            ]
                        },
                        reject_reason: 1,
                    }
                },
            ]);
            var get_count = await processInvoiceConnection.aggregate([
                { $match: { is_delete: 0 } },
                {
                    $project: {
                        pending: { $cond: [{ $eq: ["$status", 'Pending'] }, 1, 0] },
                        complete: { $cond: [{ $eq: ["$status", 'Complete'] }, 1, 0] },
                    }
                },
                {
                    $group: {
                        _id: null,
                        pending: { $sum: "$pending" },
                        complete: { $sum: "$complete" },
                    }
                }
            ]);
            var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
            let company_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: decodedToken.companycode });
            let checkManagement = _.find(company_data.otherstool, function (n) { return n.key == config.MANAGEMENT_KEY; });
            let isManagement = false;
            if (checkManagement) {
                isManagement = true;
            }
            if (get_data) {
                var count = {
                    pending: 0,
                    complete: 0,
                };
                if (get_count) {
                    if (get_count.length == 0) {
                        get_count = {
                            pending: 0,
                            complete: 0,
                        };
                    } else {
                        get_count = get_count[0];
                    }
                    count = {
                        pending: get_count.pending,
                        complete: get_count.complete,
                    };
                }
                await intuitOauth.refreshToken(decodedToken.companycode);
                var client_id, client_secret, access_token, realmId, refresh_token;
                const client = await MongoClient.connect(url);
                var dbo = client.db("rovuk_admin");
                const result = await dbo.collection("tenants").findOne({ companycode: decodedToken.companycode });
                client_id = result.client_id ? result.client_id : '';
                client_secret = result.client_secret ? result.client_secret : '';
                access_token = result.access_token ? result.access_token : '';
                realmId = result.realmId ? result.realmId : '';
                refresh_token = result.refresh_token ? result.refresh_token : '';
                client.close();
                // all_invoices = await getInvoiceDataFromQB(client_id, client_secret, access_token, realmId, refresh_token, decodedToken.companycode);
                res.send({ status: true, message: "Invoice data", data: get_data, is_management: isManagement, count });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
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
//save gl_accounts from QBO to database
module.exports.saveglaccountstoDB = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);

    if (decodedToken) {
        const companycode = req.body.companycode;
        const client = await MongoClient.connect(url);
        var dbo = client.db("rovuk_admin");
        const result = await dbo.collection("tenants").findOne({ companycode: req.body.companycode });
        client_id = result.client_id ? result.client_id : '';
        client_secret = result.client_secret ? result.client_secret : '';
        access_token = result.access_token ? result.access_token : '';
        realmId = result.realmId ? result.realmId : '';
        refresh_token = result.refresh_token ? result.refresh_token : '';
        qbo = new QuickBooks(client_id,
            client_secret,
            access_token,
            false, // no token secret for oAuth 2.0
            realmId,
            true, // use the sandbox?
            false, // enable debugging?
            null, // set minorversion, or null for the latest version
            '2.0', //oAuth version
            refresh_token);
        var dbo = client.db(`rovuk_${companycode.slice(2)}`);
        await dbo.collection("all_glaccounts").deleteMany({});
        qbo.reportGeneralLedgerDetail({}, async (err, accounts) => {
            // await dbo.collection("all_glaccounts").insertOne(accounts)
            var result = [];
            for (var i = 0; i < accounts.Rows.Row.length; i++) {
                var insertData = {};
                // insertData.Columns = accounts.Columns;
                // insertData.Row = accounts.Rows.Row[i];
                for (var j = 0; j < Object.keys(accounts.Rows.Row[i]).length - 1; j++) {
                    var key = Object.keys(accounts.Rows.Row[i])[j];
                    insertData[key] = {};
                    insertData.type = accounts.Rows.Row[i].type;
                    for (var k = 0; k < accounts.Columns.Column.length; k++) {
                        var firstkey = accounts.Rows.Row[i][key][Object.keys(accounts.Rows.Row[i][key])[0]];
                        insertData[key][accounts.Columns.Column[k].ColTitle] = firstkey[k];
                    }
                }
                result.push(insertData);
            }
            await dbo.collection("all_glaccounts").insertMany(result);
            client.close();
        });
        res.send({ status: true, message: 'success' });
    }
    else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

var isQuickBooksInvoice = false;
var invoices_pdf = [];
//get invoice datas from database
function getInvoiceDataFromQB(client_id, client_secret, access_token, realmId, refresh_token, companycode) {
    return new Promise(async (resolve, reject) => {
        var returndata = [];
        const client = await MongoClient.connect(url);
        var dbo = client.db(`rovuk_${companycode.slice(2)}`);
        invoices_pdf = [];
        qbo = new QuickBooks(client_id,
            client_secret,
            access_token,
            false, // no token secret for oAuth 2.0
            realmId,
            true, // use the sandbox?
            false, // enable debugging?
            null, // set minorversion, or null for the latest version
            '2.0', //oAuth version
            refresh_token);
        qbo.findAttachables({
            desc: 'MetaData.LastUpdatedTime'
        }, async (e, attachables) => {
            if (attachables.hasOwnProperty("QueryResponse") && attachables.QueryResponse.hasOwnProperty("Attachable")) {
                for (var k = 0; k < attachables.QueryResponse.Attachable.length; k++) {
                    var data = attachables.QueryResponse.Attachable[k];
                    if (data.ContentType === "application/pdf" && data.AttachableRef[0].EntityRef.type === "Bill") {
                        var pdfdata = {};
                        pdfdata._id = data.AttachableRef[0].EntityRef.value;
                        pdfdata.url = data.TempDownloadUri;
                        invoices_pdf.push(pdfdata);
                    }
                }
            }
            isQuickBooksInvoice = true;
            var all_invoices = await dbo.collection("invoice_invoices").find({ is_delete: 0 }).toArray();
            resolve(all_invoices);
        });
    });
}


//save invoice from QBO to database
module.exports.saveinvoicetoDB = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        const companycode = decodedToken.companycode;
        const client = await MongoClient.connect(url);
        var dbo = client.db("rovuk_admin");
        var invoiceConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
        const result = await dbo.collection("tenants").findOne({ companycode: companycode });
        client_id = result.client_id ? result.client_id : '';
        client_secret = result.client_secret ? result.client_secret : '';
        access_token = result.access_token ? result.access_token : '';
        realmId = result.realmId ? result.realmId : '';
        refresh_token = result.refresh_token ? result.refresh_token : '';
        qbo = new QuickBooks(client_id,
            client_secret,
            access_token,
            false, // no token secret for oAuth 2.0
            realmId,
            true, // use the sandbox?
            false, // enable debugging?
            null, // set minorversion, or null for the latest version
            '2.0', //oAuth version
            refresh_token);
        var dbo = client.db(`rovuk_${companycode.slice(2)}`);
        var returndata = [];
        qbo.findBills({ desc: 'MetaData.LastUpdatedTime' }, async (err, invoices) => {
            if (err) {
                return;
            }
            await dbo.collection("invoice_invoices").deleteMany({ isInvoicefromQBO: true });
            if (invoices.queryResponse !== null)
                invoices.QueryResponse.Bill.forEach(async function (invoicefromQB) {
                    var invoicedata = {};
                    // invoicedata._id = invoicefromQB.hasOwnProperty('Id') ? new ObjectID(invoicefromQB.Id) : '';
                    invoicedata.badge = {};
                    invoicedata.assign_to = '';
                    invoicedata.customer_id = invoicefromQB.hasOwnProperty('VendorRef') ? invoicefromQB.VendorRef.value : '';
                    if (invoicedata.customer_id.length > 0) invoicedata.badge.customer_id = true;
                    invoicedata.invoice = invoicefromQB.hasOwnProperty('DocNumber') ? invoicefromQB.DocNumber : '';
                    invoicedata.p_o = '';
                    invoicedata.invoice_date = invoicefromQB.hasOwnProperty('TxnDate') ? invoicefromQB.TxnDate : '';
                    if (invoicedata.invoice_date !== '') invoicedata.badge.invoice_date = true;
                    invoicedata.due_date = invoicefromQB.hasOwnProperty('DueDate') ? invoicefromQB.DueDate : '';
                    if (invoicedata.due_date !== '') invoicedata.badge.due_date = true;
                    invoicedata.order_date = '';
                    invoicedata.ship_date = '';
                    invoicedata.vendor_name = invoicefromQB.hasOwnProperty('VendorRef') ? invoicefromQB.VendorRef.name : '';
                    invoicedata.vendor_id = invoicefromQB.hasOwnProperty('VendorRef') ? invoicefromQB.VendorRef.value : '';
                    invoicedata.badge.vendor = true;
                    invoicedata.badge.invoice = true;
                    invoicedata.badge.document_type = true;
                    invoicedata.terms = invoicefromQB.hasOwnProperty('SalesTermRef') ? invoicefromQB.SalesTermRef.value : '';
                    if (invoicedata.terms !== '') invoicedata.badge.terms = true;
                    invoicedata.total = invoicefromQB.hasOwnProperty('TotalAmt') ? invoicefromQB.TotalAmt + invoicefromQB.CurrencyRef.value : 0;
                    invoicedata.badge.total = true;
                    invoicedata.invoice_total = invoicefromQB.hasOwnProperty('TotalAmt') ? invoicefromQB.TotalAmt + invoicefromQB.CurrencyRef.value : 0;
                    invoicedata.badge.invoice_total = true;
                    invoicedata.tax_amount = invoicefromQB.hasOwnProperty('TxnTaxDetail') ? invoicefromQB.TxnTaxDetail.TotalTax : 0;
                    invoicedata.badge.tax_amount = true;
                    invoicedata.tax_id = '';
                    invoicedata.sub_total = invoicefromQB.hasOwnProperty('TotalAmt') ? invoicefromQB.TotalAmt + invoicefromQB.CurrencyRef.value : 0;
                    invoicedata.badge.sub_total = true;
                    invoicedata.amount_due = invoicefromQB.hasOwnProperty('DueDate') ? invoicefromQB.DueDate : '';
                    if (invoicedata.amount_due !== '') invoicedata.badge.amount_due = true;
                    invoicedata.cost_code = invoicefromQB.hasOwnProperty('VendorAddr') ? ObjectID(parseInt(invoicefromQB.VendorAddr.PostalCode)) : '';
                    if (invoicedata.cost_code !== '') invoicedata.badge.cost_code = true;
                    invoicedata.receiving_date = '';
                    invoicedata.notes = '';
                    var invoice_status = "Pending";
                    if (invoicefromQB.hasOwnProperty('SyncToken'))
                        switch (invoicefromQB.SyncToken) {
                            case "1":
                                invoice_status = "Overdue";
                                break;
                            case "2":
                                invoice_status = "Paid";
                                break;
                            case "4":
                                invoice_status = "Rejected";
                                break;
                            default:
                                invoice_status = "Paid";
                                break;
                        }
                    invoicedata.status = invoice_status;
                    invoicedata.job_number = invoicefromQB.hasOwnProperty('Id') ? invoicefromQB.Id : '';
                    if (invoicedata.job_number !== '') invoicedata.badge.job_number = true;
                    invoicedata.delivery_address = invoicefromQB.hasOwnProperty('VendorAddr') ? invoicefromQB.VendorAddr.Line1 : '';
                    if (invoicedata.delivery_address !== '') invoicedata.badge.delivery_address = true;
                    invoicedata.contract_number = '';
                    invoicedata.account_number = invoicefromQB.hasOwnProperty('DocNumber') ? invoicefromQB.DocNumber : '';
                    invoicedata.discount = '';
                    invoicedata.pdf_url = '';
                    invoicedata.items = invoicefromQB.hasOwnProperty('Line') ? invoicefromQB.Line : [];
                    invoicedata.packing_slip = '';
                    invoicedata.receiving_slip = '';
                    invoicedata.invoice_attachments = [];
                    invoicedata.has_packing_slip = true;
                    invoicedata.isInvoicefromQBO = true;
                    invoicedata.packing_slip_data = {};
                    invoicedata.gl_account = invoicefromQB.hasOwnProperty('APAccountRef') ? invoicefromQB.APAccountRef.name : '';
                    if (invoicedata.gl_account !== '') invoicedata.badge.gl_account = true;
                    invoicedata.packing_slip_attachments = [];
                    invoicedata.po_attachments = [];
                    invoicedata.quote_attachments = [];
                    invoicedata.vendor = invoicefromQB.hasOwnProperty('VendorRef') ? ObjectID(parseInt(invoicefromQB.VendorRef.value)) : '';
                    invoicedata.invoice_notes = [];
                    invoicedata.packing_slip_notes = [];
                    invoicedata.po_notes = [];
                    invoicedata.quote_notes = [];
                    var add_invoice = new invoiceConnection(invoicedata);
                    await add_invoice.save();
                });
            if (returndata.length > 0) {
                client.close();
            }
        });

        res.send({ status: true, message: 'success' });
    }
    else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

//get invoice
module.exports.getInvoiceList = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var match_query = { is_delete: 0 };
            if (requestObject.status) {
                match_query = {
                    is_delete: 0,
                    status: requestObject.status
                };
            }
            var get_data = await invoicesConnection.aggregate([
                { $match: match_query },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_VENDOR,
                        localField: "vendor",
                        foreignField: "_id",
                        as: "vendor"
                    }
                },
                { $unwind: "$vendor" },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "created_by",
                        foreignField: "_id",
                        as: "created_by"
                    }
                },
                {
                    $unwind: {
                        path: "$created_by",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $project: {
                        assign_to: 1,
                        vendor: "$vendor",
                        vendor_id: 1,
                        customer_id: 1,
                        invoice: 1,
                        p_o: 1,
                        invoice_date: 1,
                        invoice_date_epoch: 1,
                        due_date: 1,
                        due_date_epoch: 1,
                        order_date: 1,
                        order_date_epoch: 1,
                        ship_date: 1,
                        ship_date_epoch: 1,
                        terms: 1,
                        total: 1,
                        invoice_total: 1,
                        tax_amount: 1,
                        tax_id: 1,
                        sub_total: 1,
                        amount_due: 1,
                        cost_code: 1,
                        receiving_date: 1,
                        notes: 1,
                        status: 1,
                        job_number: 1,
                        delivery_address: 1,
                        contract_number: 1,
                        account_number: 1,
                        discount: 1,
                        pdf_url: 1,
                        items: 1,
                        packing_slip: 1,
                        receiving_slip: 1,
                        badge: 1,
                        gl_account: 1,
                        created_by: { $ifNull: ["$created_by.userfullname", "$created_by_mail"] },
                        created_at: 1,
                        // invoice_notes: { $elemMatch: { is_delete: 0 } },
                        invoice_notes: {
                            $filter: {
                                input: '$invoice_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },
                        invoice_attachments: 1,
                        has_packing_slip: 1,
                        packing_slip_data: 1,
                        packing_slip_notes: {
                            $filter: {
                                input: '$packing_slip_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },
                        packing_slip_attachments: 1,
                        has_receiving_slip: 1,
                        receiving_slip_data: 1,
                        receiving_slip_notes: {
                            $filter: {
                                input: '$receiving_slip_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },
                        receiving_slip_attachments: 1,
                        has_po: 1,
                        po_data: 1,
                        po_notes: {
                            $filter: {
                                input: '$po_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },
                        po_attachments: 1,
                        has_quote: 1,
                        quote_data: 1,
                        quote_notes: {
                            $filter: {
                                input: '$quote_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },
                        quote_attachments: 1,
                        document_type: { $ifNull: ["$document_type", "INVOICE"] },
                        attach_files: {
                            $sum: [
                                1, {
                                    $cond: [
                                        { $eq: ["$has_packing_slip", true] },
                                        1, 0
                                    ]
                                }, {
                                    $cond: [
                                        { $eq: ["$has_receiving_slip", true] },
                                        1, 0
                                    ]
                                }, {
                                    $cond: [
                                        { $eq: ["$has_po", true] },
                                        1, 0
                                    ]
                                }, {
                                    $cond: [
                                        { $eq: ["$has_quote", true] },
                                        1, 0
                                    ]
                                }
                            ]
                        },
                        reject_reason: 1,
                    }
                },
            ]);
            var count = get_data.length;
            if (get_data) {
                res.send({ status: true, message: "Invoice data", data: get_data, count });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
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

//get invoice
module.exports.getOneInvoice = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            var get_data = await invoicesConnection.aggregate([
                { $match: { _id: ObjectID(requestObject._id) } },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_VENDOR,
                        localField: "vendor",
                        foreignField: "_id",
                        as: "vendor"
                    }
                },
                { $unwind: "$vendor" },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "created_by",
                        foreignField: "_id",
                        as: "created_by"
                    }
                },
                {
                    $unwind: {
                        path: "$created_by",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $project: {
                        assign_to: 1,
                        vendor: "$vendor",
                        vendor_id: 1,
                        vendor_name: 1,
                        customer_id: 1,
                        invoice: 1,
                        p_o: 1,
                        invoice_date: 1,
                        invoice_date_epoch: 1,
                        due_date: 1,
                        due_date_epoch: 1,
                        order_date_epoch: 1,
                        order_date_epoch: 1,
                        ship_date: 1,
                        ship_date_epoch: 1,
                        terms: 1,
                        total: 1,
                        invoice_total: 1,
                        tax_amount: 1,
                        tax_id: 1,
                        sub_total: 1,
                        amount_due: 1,
                        cost_code: 1,
                        receiving_date: 1,
                        notes: 1,
                        status: 1,
                        job_number: 1,
                        delivery_address: 1,
                        contract_number: 1,
                        account_number: 1,
                        discount: 1,
                        pdf_url: 1,
                        items: 1,
                        packing_slip: 1,
                        receiving_slip: 1,
                        badge: 1,
                        gl_account: 1,
                        created_by: { $ifNull: ["$created_by.userfullname", "$created_by_mail"] },
                        created_at: 1,
                        // invoice_notes: { $elemMatch: { is_delete: 0 } },
                        invoice_notes: {
                            $filter: {
                                input: '$invoice_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },
                        invoice_attachments: 1,
                        has_packing_slip: 1,
                        packing_slip_data: 1,
                        packing_slip_notes: {
                            $filter: {
                                input: '$packing_slip_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },
                        packing_slip_attachments: 1,
                        has_receiving_slip: 1,
                        receiving_slip_data: 1,
                        receiving_slip_notes: {
                            $filter: {
                                input: '$receiving_slip_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },
                        receiving_slip_attachments: 1,
                        has_po: 1,
                        po_data: 1,
                        po_notes: {
                            $filter: {
                                input: '$po_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },
                        po_attachments: 1,
                        has_quote: 1,
                        quote_data: 1,
                        quote_notes: {
                            $filter: {
                                input: '$quote_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },
                        quote_attachments: 1,
                        document_type: { $ifNull: ["$document_type", "INVOICE"] },
                        attach_files: {
                            $sum: [
                                1, {
                                    $cond: [
                                        { $eq: ["$has_packing_slip", true] },
                                        1, 0
                                    ]
                                }, {
                                    $cond: [
                                        { $eq: ["$has_receiving_slip", true] },
                                        1, 0
                                    ]
                                }, {
                                    $cond: [
                                        { $eq: ["$has_po", true] },
                                        1, 0
                                    ]
                                }, {
                                    $cond: [
                                        { $eq: ["$has_quote", true] },
                                        1, 0
                                    ]
                                }
                            ]
                        },
                        reject_reason: 1,
                    }
                },
            ]);
            if (get_data.length > 0) {
                get_data = get_data[0];
            }
            get_data.invoice_notes = await getNotesUserDetails(get_data.invoice_notes, userConnection);
            get_data.packing_slip_notes = await getNotesUserDetails(get_data.packing_slip_notes, userConnection);
            get_data.receiving_slip_notes = await getNotesUserDetails(get_data.receiving_slip_notes, userConnection);
            get_data.po_notes = await getNotesUserDetails(get_data.po_notes, userConnection);
            get_data.quote_notes = await getNotesUserDetails(get_data.quote_notes, userConnection);
            res.send({ status: true, message: "Invoice data", data: get_data });
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

function getNotesUserDetails(notes, userConnection) {
    return new Promise(async function (resolve, reject) {
        if (notes) {
            if (notes.length == 0) {
                resolve([]);
            } else {
                let tempData = [];
                for (let i = 0; i < notes.length; i++) {
                    var one_user = await userConnection.findOne({ _id: ObjectID(notes[i].created_by) });
                    tempData.push({
                        ...notes[i],
                        userfullname: one_user.userfullname,
                        usermobile_picture: one_user.usermobile_picture,
                        userpicture: one_user.userpicture,
                    });
                    if (i == notes.length - 1) {
                        resolve(tempData);
                    }
                }
            }
        } else {
            resolve([]);
        }
    });
}

//get invoice
module.exports.getInvoiceForReport = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            let date_query = {};
            if (requestObject.start_date != 0 && requestObject.end_date != 0) {
                date_query = { created_at: { $gte: requestObject.start_date, $lt: requestObject.end_date } };
            }
            var get_data = await invoicesConnection.aggregate([
                { $match: { is_delete: 0 } },
                { $match: date_query },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_VENDOR,
                        localField: "vendor",
                        foreignField: "_id",
                        as: "vendor"
                    }
                },
                { $unwind: "$vendor" },
            ]);
            if (get_data) {
                res.send({ status: true, message: "Invoice data", data: get_data, });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
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

// delete invoice
module.exports.deleteInvoice = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var id = requestObject._id;
            delete requestObject._id;

            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            requestObject.is_delete = 1;
            var update_data = await invoicesConnection.updateOne({ _id: ObjectID(id) }, requestObject);
            let isDelete = update_data.nModified;
            if (isDelete == 0) {
                res.send({ status: false, message: "There is no data with this id." });
            } else {
                var get_one = await invoicesConnection.findOne({ _id: ObjectID(id) }, { _id: 0, __v: 0 });
                let reqObj = { invoice_id: id, ...get_one._doc };
                addchangeInvoice_History("Delete", reqObj, decodedToken, get_one.updated_at);
                res.send({ message: "Invoice deleted successfully", status: true, data: update_data });
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

// invoice status update
module.exports.updateInvoiceStatus = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var id = requestObject._id;
            delete requestObject._id;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            var get_invoice = await invoicesConnection.findOne({ _id: ObjectID(id) });
            var update_data = await invoicesConnection.updateOne({ _id: ObjectID(id) }, requestObject);
            let isDelete = update_data.nModified;
            if (isDelete == 0) {
                res.send({ status: false, message: "There is no data with this id." });
            } else {
                var get_one = await invoicesConnection.findOne({ _id: ObjectID(id) }, { _id: 0, __v: 0 });
                let reqObj = { invoice_id: id, ...get_one._doc };
                addchangeInvoice_History("Update", reqObj, decodedToken, get_one.updated_at);
                recentActivity.saveRecentActivity({
                    user_id: decodedToken.UserData._id,
                    username: decodedToken.UserData.userfullname,
                    userpicture: decodedToken.UserData.userpicture,
                    data_id: id,
                    title: `Invoice #${get_invoice.invoice}`,
                    module: 'Invoice',
                    action: requestObject.status,
                    action_from: 'Web',
                }, decodedToken);
                res.send({ message: `Invoice ${requestObject.status.toLowerCase()} successfully`, status: true, data: update_data });
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

//invoice datatable
module.exports.getInvoiceDatatable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var col = [];
            col.push("invoice", "p_o", "vendor.vendor_name", "packing_slip", "receiving_slip", "attach_files", "created_by", "created_at", "status");

            var start = parseInt(requestObject.start) || 0;
            var perpage = parseInt(requestObject.length);

            var columnData = (requestObject.order != undefined && requestObject.order != '') ? requestObject.order[0].column : '';
            var columntype = (requestObject.order != undefined && requestObject.order != '') ? requestObject.order[0].dir : '';

            var sort = {};
            if (requestObject.draw == 1) {
                sort = { "created_at": -1 };
            } else {
                sort[col[columnData]] = (columntype == 'asc') ? 1 : -1;
            }
            let query = {};
            if (requestObject.search.value) {
                query = {
                    $or: [
                        { "invoice": new RegExp(requestObject.search.value, 'i') },
                        { "p_o": new RegExp(requestObject.search.value, 'i') },
                        { "vendor.vendor_name": new RegExp(requestObject.search.value, 'i') },
                        { "packing_slip": new RegExp(requestObject.search.value, 'i') },
                        { "receiving_slip": new RegExp(requestObject.search.value, 'i') },
                        { "attach_files": new RegExp(requestObject.search.value, 'i') },
                        { "created_by": new RegExp(requestObject.search.value, 'i') },
                        { "status": new RegExp(requestObject.search.value, 'i') },
                    ]
                };
            }
            var match_query = { is_delete: 0 };
            if (requestObject.status) {
                match_query = {
                    is_delete: 0,
                    status: requestObject.status
                };
            }
            var aggregateQuery = [
                { $match: match_query },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_VENDOR,
                        localField: "vendor",
                        foreignField: "_id",
                        as: "vendor"
                    }
                },
                { $unwind: "$vendor" },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "created_by",
                        foreignField: "_id",
                        as: "created_by"
                    }
                },
                {
                    $unwind: {
                        path: "$created_by",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "updated_by",
                        foreignField: "_id",
                        as: "updated_by"
                    }
                },
                {
                    $unwind: {
                        path: "$updated_by",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $project: {
                        assign_to: 1,
                        vendor: 1,
                        vendor_id: 1,
                        customer_id: 1,
                        invoice: 1,
                        p_o: 1,
                        invoice_date: 1,
                        invoice_date_epoch: 1,
                        due_date: 1,
                        due_date_epoch: 1,
                        order_date: 1,
                        order_date_epoch: 1,
                        ship_date: 1,
                        ship_date_epoch: 1,
                        terms: 1,
                        total: 1,
                        invoice_total: 1,
                        tax_amount: 1,
                        tax_id: 1,
                        sub_total: 1,
                        amount_due: 1,
                        cost_code: 1,
                        gl_account: 1,
                        receiving_date: 1,
                        notes: 1,
                        status: 1,
                        job_number: 1,
                        delivery_address: 1,
                        contract_number: 1,
                        account_number: 1,
                        discount: 1,
                        pdf_url: 1,
                        items: 1,
                        packing_slip: 1,
                        receiving_slip: 1,

                        badge: 1,
                        invoice_notes: 1,
                        invoice_attachments: 1,

                        has_packing_slip: 1,
                        packing_slip_data: 1,
                        packing_slip_notes: 1,
                        packing_slip_attachments: 1,

                        has_receiving_slip: 1,
                        receiving_slip_data: 1,
                        receiving_slip_notes: 1,
                        receiving_slip_attachments: 1,

                        has_po: 1,
                        po_data: 1,
                        po_notes: 1,
                        po_attachments: 1,

                        has_quote: 1,
                        quote_data: 1,
                        quote_notes: 1,
                        quote_attachments: 1,

                        document_type: 1,
                        created_by: { $ifNull: ["$created_by.userfullname", "$created_by_mail"] },
                        created_at: 1,
                        updated_by: { $ifNull: ["$updated_by.userfullname", "$updated_by_mail"] },
                        updated_at: 1,
                        is_delete: 1,

                        attach_files: {
                            $sum: [
                                1, {
                                    $cond: [
                                        { $eq: ["$has_packing_slip", true] },
                                        1, 0
                                    ]
                                }, {
                                    $cond: [
                                        { $eq: ["$has_receiving_slip", true] },
                                        1, 0
                                    ]
                                }, {
                                    $cond: [
                                        { $eq: ["$has_po", true] },
                                        1, 0
                                    ]
                                }, {
                                    $cond: [
                                        { $eq: ["$has_quote", true] },
                                        1, 0
                                    ]
                                }
                            ]
                        },
                        reject_reason: 1,
                    },
                },
                { $match: query },
                { $sort: sort },
                { $limit: start + perpage },
                { $skip: start },
            ];
            let count = 0;
            count = await invoicesConnection.countDocuments(match_query);
            let all_vendors = await invoicesConnection.aggregate(aggregateQuery).collation({ locale: "en_US" });

            var dataResponce = {};
            dataResponce.data = all_vendors;
            dataResponce.draw = requestObject.draw;
            dataResponce.recordsTotal = count;
            dataResponce.recordsFiltered = (requestObject.search.value) ? all_vendors.length : count;
            res.json(dataResponce);
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false, error: e });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

// history function
async function addchangeInvoice_History(action, data, decodedToken, updatedAt) {
    var connection_db_api = await db_connection.connection_db_api(decodedToken);
    try {
        let invoice_Histroy_Connection = connection_db_api.model(historyCollectionConstant.INVOICES_HISTORY, invoice_history_Schema);
        data.action = action;
        data.taken_device = config.WEB_ALL;
        data.history_created_at = updatedAt;
        data.history_created_by = decodedToken.UserData._id;
        var add_invoice_history = new invoice_Histroy_Connection(data);
        var save_invoice_history = await add_invoice_history.save();
    } catch (e) {
        console.log(e);
    } finally {
        connection_db_api.close();
    }
}

module.exports.getInvoiceExcelReport = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    var local_offset = Number(req.headers.local_offset);
    var timezone = req.headers.timezone;
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let email_list = requestObject.email_list;
            var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
            let talnate_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_TENANTS, { companycode: decodedToken.companycode });
            let company_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: decodedToken.companycode });

            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            let sort = { vendor_name: 1 };
            let vendorQuery = [];
            let query = [];
            if (requestObject.vendor_ids.length != 0) {
                let data_Query = [];
                for (let i = 0; i < requestObject.vendor_ids.length; i++) {
                    data_Query.push(ObjectID(requestObject.vendor_ids[i]));
                }
                vendorQuery.push({ "_id": { $in: data_Query } });
                query.push({ "vendor": { $in: data_Query } });
            }

            if (requestObject.status.length != 0) {
                query.push({ "status": { $in: requestObject.status } });
            }
            query = query.length == 0 ? {} : { $and: query };

            let date_query = {};
            if (requestObject.start_date != 0 && requestObject.end_date != 0) {
                date_query = { invoice_date_epoch: { $gte: requestObject.start_date, $lt: requestObject.end_date } };
            }
            let get_invoice = await invoicesConnection.aggregate([
                { $match: { is_delete: 0 }, },
                { $match: query },
                { $match: date_query },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "assign_to",
                        foreignField: "_id",
                        as: "assign_to"
                    }
                },
                {
                    $unwind: {
                        path: "$assign_to",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_VENDOR,
                        localField: "vendor",
                        foreignField: "_id",
                        as: "vendor"
                    }
                },
                { $unwind: "$vendor" },
                {
                    $lookup: {
                        from: collectionConstant.COSTCODES,
                        localField: "cost_code",
                        foreignField: "_id",
                        as: "costcode"
                    }
                },
                { $sort: sort }
            ]).collation({ locale: "en_US" });
            console.log("sagar.........get_invoice: ", get_invoice.length);
            let workbook = new excel.Workbook();
            let title_tmp = translator.getStr('Invoice_Report_Title');
            let worksheet = workbook.addWorksheet(title_tmp);
            let xlsx_data = [];
            let result = await common.urlToBase64(company_data.companylogo);
            let logo_rovuk = await common.urlToBase64(config.INVOICE_LOGO);
            for (let i = 0; i < get_invoice.length; i++) {
                let invoice = get_invoice[i];
                xlsx_data.push([invoice.vendor.vendor_name, invoice.vendor_id, invoice.customer_id, invoice.invoice, invoice.p_o, invoice.job_number,
                common.MMDDYYYY_local_offset(invoice.invoice_date_epoch, req.headers.language, local_offset),
                common.MMDDYYYY_local_offset(invoice.due_date_epoch, req.headers.language, local_offset),
                common.MMDDYYYY_local_offset(invoice.order_date_epoch, req.headers.language, local_offset),
                common.MMDDYYYY_local_offset(invoice.ship_date_epoch, req.headers.language, local_offset),
                invoice.packing_slip, invoice.receiving_slip, invoice.status, invoice.terms, invoice.invoice_total,
                invoice.tax_amount, invoice.tax_id, invoice.sub_total, invoice.amount_due, invoice.costcode.length > 0 ? invoice.costcode[0].value : '',
                invoice.gl_account, invoice.assign_to == undefined || invoice.assign_to == null ? '' : invoice.assign_to.userfullname, invoice.notes]);
            }
            let headers = [
                translator.getStr('Invoice_History.vendor'),
                translator.getStr('Invoice_History.vendor_id'),
                translator.getStr('Invoice_History.customer_id'),
                translator.getStr('Invoice_History.invoice_no'),
                translator.getStr('Invoice_History.p_o'),
                translator.getStr('Invoice_History.job_number'),
                translator.getStr('Invoice_History.invoice_date_epoch'),
                translator.getStr('Invoice_History.due_date_epoch'),
                translator.getStr('Invoice_History.order_date_epoch'),
                translator.getStr('Invoice_History.ship_date_epoch'),
                translator.getStr('Invoice_History.packing_slip'),
                translator.getStr('Invoice_History.receiving_slip'),
                translator.getStr('Invoice_History.status'),
                translator.getStr('Invoice_History.terms'),
                // translator.getStr('Invoice_History.total'),
                translator.getStr('Invoice_History.invoice_total'),
                translator.getStr('Invoice_History.tax_amount'),
                translator.getStr('Invoice_History.tax_id'),
                translator.getStr('Invoice_History.sub_total'),
                translator.getStr('Invoice_History.amount_due'),
                translator.getStr('Invoice_History.cost_code'),
                translator.getStr('Invoice_History.gl_account'),
                translator.getStr('Invoice_History.assign_to'),
                translator.getStr('Invoice_History.notes'),

                /* translator.getStr('Invoice_History.receiving_date'),
                translator.getStr('Invoice_History.account_number'),
                translator.getStr('Invoice_History.discount'), */
            ];

            let d = new Date();
            let excel_date = common.fullDate_format();

            //compnay logo
            let myLogoImage = workbook.addImage({
                base64: result,
                extension: 'png',
            });
            worksheet.addImage(myLogoImage, "A1:A6");
            worksheet.mergeCells('A1:A6');

            //supplier logo
            let rovukLogoImage = workbook.addImage({
                base64: logo_rovuk,
                extension: 'png',
            });
            worksheet.mergeCells('W1:W6');
            worksheet.addImage(rovukLogoImage, 'W1:W6');

            // Image between text 1
            let titleRowValue1 = worksheet.getCell('B1');
            titleRowValue1.value = `Invoice detailed report`;
            titleRowValue1.font = {
                name: 'Calibri',
                size: 15,
                bold: true,
            };
            titleRowValue1.alignment = { vertical: 'middle', horizontal: 'left' };
            worksheet.mergeCells(`B1:V3`);

            // Image between text 2
            let titleRowValue2 = worksheet.getCell('B4');
            titleRowValue2.value = `Generated by: ${decodedToken.UserData.userfullname}`;
            titleRowValue2.font = {
                name: 'Calibri',
                size: 15,
                bold: true,
            };
            titleRowValue2.alignment = { vertical: 'middle', horizontal: 'left' };
            worksheet.mergeCells(`B4:V6`);

            //header design
            let headerRow = worksheet.addRow(headers);
            headerRow.height = 40;
            headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
            headerRow.eachCell((cell, number) => {
                cell.font = {
                    bold: true,
                    size: 14,
                    color: { argb: "FFFFFFF" }
                };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: {
                        argb: 'FF023E8A'
                    }
                };
            });
            xlsx_data.forEach(d => {
                let row = worksheet.addRow(d);
            });
            worksheet.getColumn(3).width = 20;
            worksheet.addRow([]);
            worksheet.columns.forEach(function (column, i) {
                column.width = 20;
            });

            let footerRow = worksheet.addRow([translator.getStr('XlsxReportGeneratedAt') + excel_date]);
            footerRow.alignment = { vertical: 'middle', horizontal: 'center' };
            worksheet.mergeCells(`A${footerRow.number}:W${footerRow.number}`);
            const tmpResultExcel = await workbook.xlsx.writeBuffer();

            let vendor = '';
            let status = '';
            let date_range = '';
            if (requestObject.All_Vendors) {
                vendor = `${translator.getStr('EmailExcelVendors')} ${translator.getStr('EmailExcelAllVendors')}`;
            } else {
                vendorQuery = vendorQuery.length == 0 ? {} : { $or: vendorQuery };
                let vendorCollection = connection_db_api.model(collectionConstant.INVOICE_VENDOR, vendorSchema);
                let all_vendor = await vendorCollection.find(vendorQuery, { vendor_name: 1 });
                let temp_data = [];
                for (var i = 0; i < all_vendor.length; i++) {
                    temp_data.push(all_vendor[i]['vendor_name']);
                }
                vendor = `${translator.getStr('EmailExcelVendors')} ${temp_data.join(", ")}`;
            }

            if (requestObject.All_Status) {
                status = `${translator.getStr('EmailExcelStatus')} ${translator.getStr('EmailExcelAllStatus')}`;
            } else {
                status = `${translator.getStr('EmailExcelStatus')} ${requestObject.status.join(", ")}`;
            }

            if (requestObject.start_date != 0 && requestObject.end_date != 0) {
                date_range = `${translator.getStr('EmailExcelDateRange')} ${common.MMDDYYYY_local_offset(requestObject.start_date, req.headers.language, local_offset)} - ${common.MMDDYYYY_local_offset(requestObject.end_date, req.headers.language, local_offset)}`;
            }

            let companycode = decodedToken.companycode.toLowerCase();
            let key_url = config.INVOICE_WASABI_PATH + "/invoice/excel_report/invoice_" + new Date().getTime() + ".xlsx";
            // let key_url = config.INVOICE_WASABI_PATH + "/invoice/excel_report/invoice.xlsx";
            let PARAMS = {
                Bucket: companycode,
                Key: key_url,
                Body: tmpResultExcel,
                ACL: 'public-read-write'
            };
            const file_data = fs.readFileSync(config.EMAIL_TEMPLATE_PATH + '/controller/emailtemplates/excelReport.html', 'utf8');
            bucketOpration.uploadFile(PARAMS, async function (err, resultUpload) {
                if (err) {
                    res.send({ message: translator.getStr('SomethingWrong'), error: err, status: false });
                } else {
                    excelUrl = config.wasabisys_url + "/" + companycode + "/" + key_url;
                    console.log("invoice excelUrl", excelUrl);
                    let emailTmp = {
                        HELP: `${translator.getStr('EmailTemplateHelpEmailAt')} ${config.HELPEMAIL} ${translator.getStr('EmailTemplateCallSupportAt')} ${config.NUMBERPHONE}`,
                        SUPPORT: `${translator.getStr('EmailTemplateEmail')} ${config.SUPPORTEMAIL} l ${translator.getStr('EmailTemplatePhone')} ${config.NUMBERPHONE2}`,
                        ALL_RIGHTS_RESERVED: `${translator.getStr('EmailTemplateAllRightsReserved')}`,
                        THANKS: translator.getStr('EmailTemplateThanks'),
                        ROVUK_TEAM: translator.getStr('EmailTemplateRovukTeam'),
                        VIEW_EXCEL: translator.getStr('EmailTemplateViewExcelReport'),
                        COPYRIGHTNAME: `${config.COPYRIGHTNAME}`,

                        EMAILTITLE: `${translator.getStr('EmailInvoiceReportTitle')}`,
                        TEXT1: translator.getStr('EmailInvoiceReportText1'),
                        TEXT2: translator.getStr('EmailInvoiceReportText2'),

                        FILE_LINK: excelUrl,

                        SELECTION: new handlebars.SafeString(`<h4>${vendor}</h4><h4>${status}</h4><h4>${date_range}</h4>`),

                        COMPANYNAME: `${translator.getStr('EmailCompanyName')} ${company_data.companyname}`,
                        COMPANYCODE: `${translator.getStr('EmailCompanyCode')} ${company_data.companycode}`,
                    };
                    var template = handlebars.compile(file_data);
                    var HtmlData = await template(emailTmp);
                    sendEmail.sendEmail_client(talnate_data.smartaccupay_tenants.tenant_smtp_username, email_list, translator.getStr('Invoice_Report_Title'), HtmlData,
                        talnate_data.smartaccupay_tenants.tenant_smtp_server, talnate_data.smartaccupay_tenants.tenant_smtp_port, talnate_data.smartaccupay_tenants.tenant_smtp_reply_to_mail,
                        talnate_data.smartaccupay_tenants.tenant_smtp_password, talnate_data.smartaccupay_tenants.tenant_smtp_timeout, talnate_data.smartaccupay_tenants.tenant_smtp_security);

                    res.send({ message: translator.getStr('Report_Sent_Successfully'), status: true });
                }
            });
        } catch (e) {
            console.log("error:", e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.getOrphanDocuments = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoiceConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var processInvoiceConnection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);
            var one_invoice = await invoiceConnection.aggregate([
                { $match: { _id: ObjectID(requestObject._id) } },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_VENDOR,
                        localField: "vendor",
                        foreignField: "_id",
                        as: "vendor"
                    }
                },
                { $unwind: "$vendor" },
            ]);
            if (one_invoice) {
                if (one_invoice.length > 0) {
                    one_invoice = one_invoice[0];
                }
                let query = {
                    status: 'Process',
                    document_type: { $ne: 'INVOICE' },
                    "process_data.document_pages.fields.VENDOR_NAME": { $regex: one_invoice.vendor.vendor_name, $options: 'i' },
                    "process_data.document_pages.fields.INVOICE_NUMBER": { $regex: one_invoice.invoice, $options: 'i' },
                    // "process_data.document_pages.fields.VENDOR_NAME": /CN SOLUTIONS GROUP LLc/i
                };
                let get_process = await processInvoiceConnection.find(query);
                res.send({ status: true, message: "Invoice data", data: get_process });
            } else {
                res.send({ message: translator.getStr('NoDataWithId'), status: false });
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

// Orphan Document
module.exports.getOrphanDocumentsDatatable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var processInvoiceConnection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);
            var settingsConnection = connection_db_api.model(collectionConstant.INVOICE_SETTING, settingsSchema);
            let one_settings = await settingsConnection.findOne({});
            let settings = one_settings.settings.Document_View;
            var col = [];
            col.push("document_type", "po_no", "invoice_no", "vendor_name", "created_by_user", "created_at");
            var start = parseInt(requestObject.start) || 0;
            var perpage = parseInt(requestObject.length);
            var columnData = (requestObject.order != undefined && requestObject.order != '') ? requestObject.order[0].column : '';
            var columntype = (requestObject.order != undefined && requestObject.order != '') ? requestObject.order[0].dir : '';
            var sort = {};
            if (requestObject.draw == 1) {
                sort = { "document_type": 1 };
            } else {
                sort[col[columnData]] = (columntype == 'asc') ? 1 : -1;
            }
            let query = {};
            if (requestObject.search.value) {
                query = {
                    $or: [
                        { "document_type": new RegExp(requestObject.search.value, 'i') },
                        { "po_no": new RegExp(requestObject.search.value, 'i') },
                        { "invoice_no": new RegExp(requestObject.search.value, 'i') },
                        { "vendor_name": new RegExp(requestObject.search.value, 'i') },
                        { "created_by_user": new RegExp(requestObject.search.value, 'i') },
                    ]
                };
            }
            var match_query = {
                is_delete: 0,
                status: { $eq: 'Process' }
            };
            var pending_count_query = {
                is_delete: 0,
                status: { $eq: 'Process' }
            };
            let currentEpoch = Math.round(new Date().getTime() / 1000);
            let settingDays = Number(settings.setting_value);
            let settingDate = moment(currentEpoch * 1000);
            settingDate.hours(0);
            settingDate.minutes(0);
            settingDate.seconds(0);
            settingDate.milliseconds(0);
            settingDate.subtract(settingDays, 'days');
            settingEpoch = settingDate.unix();
            if (requestObject.view_option) {
                match_query.created_at = { $lte: settingEpoch };
            } else {
                match_query.created_at = { $gte: settingEpoch };
            }
            var aggregateQuery = [
                { $match: match_query },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "created_by",
                        foreignField: "_id",
                        as: "created_by_user"
                    }
                },
                {
                    $unwind: {
                        path: "$created_by_user",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $project: {
                        document_type: {
                            $cond: [
                                { $eq: ["$status", 'Already Exists'] },
                                'Already Exists', "$document_type"
                            ]
                        },
                        po_no: {
                            $cond: [
                                { $eq: ["$document_type", 'INVOICE'] },
                                '$data.p_o',
                                {
                                    $cond: [
                                        { $in: ['$document_type', ['PURCHASE_ORDER', 'PACKING_SLIP', 'RECEIVING_SLIP', 'UNKNOWN']] },
                                        '$data.po_number', ''
                                    ]
                                }
                            ]
                        },
                        invoice_no: {
                            $cond: [
                                { $eq: ["$document_type", 'INVOICE'] },
                                '$data.invoice',
                                {
                                    $cond: [
                                        { $in: ['$document_type', ['PACKING_SLIP', 'RECEIVING_SLIP']] },
                                        '$data.invoice_number',
                                        {
                                            $cond: [
                                                { $eq: ["$document_type", 'UNKNOWN'] },
                                                '$data.invoice_no', ''
                                            ]
                                        },
                                    ]
                                }
                            ]
                        },
                        data_vendor_id: '$data.vendor',
                        status: 1,
                        process_data: 1,
                        data: 1,
                        pdf_url: 1,
                        created_at: 1,
                        created_by_user: { $ifNull: ["$created_by_user.userfullname", "$created_by_mail"] },
                        is_delete: 1,
                    }
                },
                { $match: query },
                { $sort: sort },
                { $limit: start + perpage },
                { $skip: start },
            ];
            let count = 0;
            count = await processInvoiceConnection.countDocuments(match_query);
            let pendingCount = await processInvoiceConnection.countDocuments(pending_count_query);

            let all_vendors = await processInvoiceConnection.aggregate(aggregateQuery).collation({ locale: "en_US" });
            for (let i = 0; i < all_vendors.length; i++) {
                let vendorName = '';
                if (all_vendors[i]['data_vendor_id']) {
                    let vendor = await getOneVendor(connection_db_api, all_vendors[i]['data_vendor_id']);
                    if (vendor.status) {
                        vendorName = vendor.data.vendor_name;
                    }
                }
                all_vendors[i] = {
                    ...all_vendors[i],
                    vendor_name: vendorName,
                };
            }
            var dataResponce = {};
            dataResponce.data = all_vendors;
            dataResponce.draw = requestObject.draw;
            dataResponce.recordsTotal = count;
            dataResponce.pendingCount = pendingCount;
            dataResponce.recordsFiltered = (requestObject.search.value) ? all_vendors.length : count;
            res.json(dataResponce);
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false, error: e });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

// Duplicate Documents
module.exports.getDuplicateDocumentsDatatable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var processInvoiceConnection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);
            var col = [];
            col.push("created_by_user", "created_at");
            var start = parseInt(requestObject.start) || 0;
            var perpage = parseInt(requestObject.length);
            var columnData = (requestObject.order != undefined && requestObject.order != '') ? requestObject.order[0].column : '';
            var columntype = (requestObject.order != undefined && requestObject.order != '') ? requestObject.order[0].dir : '';
            var sort = {};
            if (requestObject.draw == 1) {
                sort = { "created_at": -1 };
            } else {
                sort[col[columnData]] = (columntype == 'asc') ? 1 : -1;
            }
            let query = {};
            if (requestObject.search.value) {
                query = {
                    $or: [
                        { "created_by_user": new RegExp(requestObject.search.value, 'i') },
                    ]
                };
            }
            var match_query = {
                is_delete: 0,
                status: { $eq: 'Already Exists' }
            };
            var pending_count_query = {
                is_delete: 0,
                status: { $eq: 'Process' }
            };
            var aggregateQuery = [
                { $match: match_query },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "created_by",
                        foreignField: "_id",
                        as: "created_by_user"
                    }
                },
                {
                    $unwind: {
                        path: "$created_by_user",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $project: {
                        document_type: {
                            $cond: [
                                { $eq: ["$status", 'Already Exists'] },
                                'Already Exists', "$document_type"
                            ]
                        },
                        po_no: {
                            $cond: [
                                { $eq: ["$document_type", 'INVOICE'] },
                                '$data.p_o',
                                {
                                    $cond: [
                                        { $in: ['$document_type', ['PURCHASE_ORDER', 'PACKING_SLIP', 'RECEIVING_SLIP', 'UNKNOWN']] },
                                        '$data.po_number', ''
                                    ]
                                }
                            ]
                        },
                        invoice_no: {
                            $cond: [
                                { $eq: ["$document_type", 'INVOICE'] },
                                '$data.invoice',
                                {
                                    $cond: [
                                        { $in: ['$document_type', ['PACKING_SLIP', 'RECEIVING_SLIP']] },
                                        '$data.invoice_number',
                                        {
                                            $cond: [
                                                { $eq: ["$document_type", 'UNKNOWN'] },
                                                '$data.invoice_no', ''
                                            ]
                                        },
                                    ]
                                }
                            ]
                        },
                        data_vendor_id: '$data.vendor',
                        status: 1,
                        process_data: 1,
                        data: 1,
                        pdf_url: 1,
                        created_at: 1,
                        created_by_user: { $ifNull: ["$created_by_user.userfullname", "$created_by_mail"] },
                    }
                },
                { $match: query },
                { $sort: sort },
                { $limit: start + perpage },
                { $skip: start },
            ];
            let count = 0;
            count = await processInvoiceConnection.countDocuments(match_query);
            let pendingCount = await processInvoiceConnection.countDocuments(pending_count_query);

            let all_vendors = await processInvoiceConnection.aggregate(aggregateQuery).collation({ locale: "en_US" });
            for (let i = 0; i < all_vendors.length; i++) {
                let vendor = await getOneVendor(connection_db_api, all_vendors[i]['data_vendor_id']);
                let vendorName = '';
                if (vendor.status) {
                    vendorName = vendor.data.vendor_name;
                }
                all_vendors[i] = {
                    ...all_vendors[i],
                    vendor_name: vendorName,
                };
            }
            var dataResponce = {};
            dataResponce.data = all_vendors;
            dataResponce.draw = requestObject.draw;
            dataResponce.recordsTotal = count;
            dataResponce.pendingCount = pendingCount;
            dataResponce.recordsFiltered = (requestObject.search.value) ? all_vendors.length : count;
            res.json(dataResponce);
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false, error: e });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

// View Document
module.exports.getViewDocumentsDatatable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var processInvoiceConnection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);
            var col = [];
            col.push("document_type", "po_no", "invoice_no", "vendor_name", "updated_by", "updated_at");
            var start = parseInt(requestObject.start) || 0;
            var perpage = parseInt(requestObject.length);
            var columnData = (requestObject.order != undefined && requestObject.order != '') ? requestObject.order[0].column : '';
            var columntype = (requestObject.order != undefined && requestObject.order != '') ? requestObject.order[0].dir : '';
            var sort = {};
            if (requestObject.draw == 1) {
                sort = { "document_type": 1 };
            } else {
                sort[col[columnData]] = (columntype == 'asc') ? 1 : -1;
            }
            let query = {};
            if (requestObject.search.value) {
                query = {
                    $or: [
                        { "document_type": new RegExp(requestObject.search.value, 'i') },
                        { "po_no": new RegExp(requestObject.search.value, 'i') },
                        { "invoice_no": new RegExp(requestObject.search.value, 'i') },
                        { "vendor_name": new RegExp(requestObject.search.value, 'i') },
                        { "updated_by": new RegExp(requestObject.search.value, 'i') },
                    ]
                };
            }
            var match_query = {
                is_delete: requestObject.is_delete,
                status: { $ne: 'Complete' },
            };
            if (requestObject.document_type) {
                if (requestObject.document_type == 'Other') {
                    match_query = {
                        document_type: { $nin: ['INVOICE', 'PURCHASE_ORDER', 'PACKING_SLIP', 'RECEIVING_SLIP', 'QUOTE'] },
                        is_delete: requestObject.is_delete,
                        status: { $ne: 'Complete' },
                    };
                } else {
                    match_query = {
                        document_type: requestObject.document_type,
                        is_delete: requestObject.is_delete,
                        status: { $ne: 'Complete' },
                    };
                }
            }
            var aggregateQuery = [
                { $match: match_query },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "created_by",
                        foreignField: "_id",
                        as: "created_by"
                    }
                },
                {
                    $unwind: {
                        path: "$created_by",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "updated_by",
                        foreignField: "_id",
                        as: "updated_by"
                    }
                },
                {
                    $unwind: {
                        path: "$updated_by",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $project: {
                        document_type: {
                            $cond: [
                                { $eq: ["$status", 'Already Exists'] },
                                'Already Exists', "$document_type"
                            ]
                        },
                        po_no: {
                            $cond: [
                                { $eq: ["$document_type", 'INVOICE'] },
                                '$data.p_o',
                                {
                                    $cond: [
                                        { $in: ['$document_type', ['PURCHASE_ORDER', 'PACKING_SLIP', 'RECEIVING_SLIP', 'UNKNOWN']] },
                                        '$data.po_number', ''
                                    ]
                                }
                            ]
                        },
                        invoice_no: {
                            $cond: [
                                { $eq: ["$document_type", 'INVOICE'] },
                                '$data.invoice',
                                {
                                    $cond: [
                                        { $in: ['$document_type', ['PACKING_SLIP', 'RECEIVING_SLIP', 'UNKNOWN']] },
                                        '$data.invoice_number',
                                        {
                                            $cond: [
                                                { $eq: ["$document_type", 'UNKNOWN'] },
                                                '$data.invoice_no', ''
                                            ]
                                        },
                                    ]
                                }
                            ]
                        },
                        data_vendor_id: '$data.vendor',
                        status: 1,
                        process_data: 1,
                        data: 1,
                        pdf_url: 1,
                        is_delete: 1,
                        created_at: 1,
                        updated_at: 1,
                        updated_by: {
                            $cond: [
                                { $eq: [requestObject.is_delete, 0] },
                                { $ifNull: ["$created_by.userfullname", "$created_by_mail"] },
                                { $ifNull: ["$updated_by.userfullname", "$updated_by_mail"] },
                            ]
                        },
                        updated_at: {
                            $cond: [
                                { $eq: [requestObject.is_delete, 0] },
                                "$created_at",
                                "$updated_at"
                            ]
                        },
                    }
                },
                { $match: query },
                { $sort: sort },
                { $limit: start + perpage },
                { $skip: start },
            ];
            let count = 0;
            count = await processInvoiceConnection.countDocuments(match_query);
            let all_vendors = await processInvoiceConnection.aggregate(aggregateQuery).collation({ locale: "en_US" });
            for (let i = 0; i < all_vendors.length; i++) {
                let vendor = await getOneVendor(connection_db_api, all_vendors[i]['data_vendor_id']);
                let vendorName = '';
                if (vendor.status) {
                    vendorName = vendor.data.vendor_name;
                }
                all_vendors[i] = {
                    ...all_vendors[i],
                    vendor_name: vendorName,
                };
            }
            var dataResponce = {};
            dataResponce.data = all_vendors;
            dataResponce.draw = requestObject.draw;
            dataResponce.recordsTotal = count;
            dataResponce.recordsFiltered = (requestObject.search.value) ? all_vendors.length : count;
            res.json(dataResponce);
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false, error: e });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

// Delete view Document
module.exports.deleteViewDocument = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var id = requestObject._id;
            delete requestObject._id;
            var processInvoiceConnection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);
            let reqObj = {
                is_delete: requestObject.is_delete,
                updated_by: decodedToken.UserData._id,
                updated_at: Math.round(new Date().getTime() / 1000),
            };
            var update_data = await processInvoiceConnection.updateOne({ _id: ObjectID(id) }, reqObj);
            let isDelete = update_data.nModified;
            if (isDelete == 0) {
                res.send({ status: false, message: "There is no data with this id." });
            } else {
                let message = '';
                if (requestObject.is_delete == 0) {
                    message = 'Document restored successfully.';
                } else {
                    message = 'Document archived successfully.';
                }
                res.send({ message, status: true, data: update_data });
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

function getOneVendor(connection_db_api, id) {
    return new Promise(async function (resolve, reject) {
        if (id == '') {
            resolve({ status: false });
        } else {
            let vendorCollection = connection_db_api.model(collectionConstant.INVOICE_VENDOR, vendorSchema);
            let get_vendor = await vendorCollection.findOne({ _id: ObjectID(id) });
            if (get_vendor) {
                resolve({ status: true, data: get_vendor });
            } else {
                resolve({ status: false });
            }
        }
    });
};

module.exports.getInvoiceHistoryLog = async function (req, res) {
    var translator = new common.Language('en');
    var decodedToken = common.decodedJWT(req.headers.authorization);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let perpage = 10;
            if (requestObject.start) { } else {
                requestObject.start = 0;
            }
            let start = requestObject.start == 0 ? 0 : perpage * requestObject.start;
            var recentActivityConnection = connection_db_api.model(collectionConstant.INVOICE_RECENT_ACTIVITY, recentActivitySchema);
            let get_data = await recentActivityConnection.aggregate([
                { $match: { module: 'Invoice', data_id: ObjectID(requestObject._id) } },
                /*  {
                     $lookup: {
                         from: collectionConstant.INVOICE,
                         localField: "data_id",
                         foreignField: "_id",
                         as: "invoice"
                     }
                 },
                 { $unwind: "$invoice" }, */
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "user_id",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                { $unwind: "$user" },
                { $sort: { created_at: -1 } },
                { $limit: perpage + start },
                { $skip: start }
            ]);
            res.send({ data: get_data, status: true });
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

// Save Invoice Notes
module.exports.saveInvoiceNotes = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var invoice_id = requestObject.invoice_id;
            delete requestObject.invoice_id;
            var id = requestObject._id;
            delete requestObject._id;
            if (id) {
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id), "invoice_notes._id": id }, { $set: { "invoice_notes.$.updated_by": decodedToken.UserData._id, "invoice_notes.$.updated_at": Math.round(new Date().getTime() / 1000), "invoice_notes.$.notes": requestObject.notes } });
                let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
                if (update_invoice) {
                    requestObject.invoice_id = invoice_id;
                    addchangeInvoice_History("Update Note", requestObject, decodedToken, requestObject.updated_at);
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: invoice_id,
                        title: `Invoice #${get_invoice.invoice}`,
                        module: 'Invoice',
                        action: 'Update Note',
                        action_from: 'Web',
                    }, decodedToken);
                    res.send({ status: true, message: "Invoice note updated successfully.", data: update_invoice });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                //save invoice note
                requestObject.created_by = decodedToken.UserData._id;
                requestObject.created_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let save_invoice_note = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id) }, { $push: { invoice_notes: requestObject } });
                let one_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
                if (save_invoice_note) {
                    requestObject.invoice_id = invoice_id;
                    addchangeInvoice_History("Insert Note", requestObject, decodedToken, requestObject.updated_at);
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: invoice_id,
                        title: `Invoice #${one_invoice.invoice}`,
                        module: 'Invoice',
                        action: 'Insert Note in',
                        action_from: 'Web',
                    }, decodedToken);
                    res.send({ status: true, message: "Invoice note saved successfully." });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
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

// Delete Invoice Notes
module.exports.deleteInvoiceNote = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var invoice_id = requestObject.invoice_id;
            delete requestObject.invoice_id;
            var id = requestObject._id;
            delete requestObject._id;
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id), "invoice_notes._id": id }, { $set: { "invoice_notes.$.updated_by": decodedToken.UserData._id, "invoice_notes.$.updated_at": Math.round(new Date().getTime() / 1000), "invoice_notes.$.is_delete": 1 } });
            let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
            if (update_invoice) {
                requestObject.invoice_id = invoice_id;
                addchangeInvoice_History("Delete Note", requestObject, decodedToken, requestObject.updated_at);
                recentActivity.saveRecentActivity({
                    user_id: decodedToken.UserData._id,
                    username: decodedToken.UserData.userfullname,
                    userpicture: decodedToken.UserData.userpicture,
                    data_id: invoice_id,
                    title: `Invoice #${get_invoice.invoice}`,
                    module: 'Invoice',
                    action: 'Delete Note in',
                    action_from: 'Web',
                }, decodedToken);
                res.send({ status: true, message: "Invoice note deleted successfully.", data: update_invoice });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
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

// Update Invoice Attachment
module.exports.saveInvoiceAttachment = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(requestObject._id) });
            let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
            if (update_invoice) {
                requestObject.invoice_id = requestObject._id;
                addchangeInvoice_History("Update Attachment", requestObject, decodedToken, requestObject.updated_at);
                recentActivity.saveRecentActivity({
                    user_id: decodedToken.UserData._id,
                    username: decodedToken.UserData.userfullname,
                    userpicture: decodedToken.UserData.userpicture,
                    data_id: requestObject._id,
                    title: `Invoice #${get_invoice.invoice}`,
                    module: 'Invoice',
                    action: 'Update Attachment in',
                    action_from: 'Web',
                }, decodedToken);
                res.send({ status: true, message: "Invoice attachment updated successfully..", data: update_invoice });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
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

// Save Packing Slip Notes
module.exports.savePackingSlipNotes = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var invoice_id = requestObject.invoice_id;
            delete requestObject.invoice_id;
            var id = requestObject._id;
            delete requestObject._id;
            if (id) {
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id), "packing_slip_notes._id": id }, { $set: { "packing_slip_notes.$.updated_by": decodedToken.UserData._id, "packing_slip_notes.$.updated_at": Math.round(new Date().getTime() / 1000), "packing_slip_notes.$.notes": requestObject.notes } });
                let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
                if (update_invoice) {
                    requestObject.invoice_id = invoice_id;
                    addchangeInvoice_History("Update Packing Slip Note", requestObject, decodedToken, requestObject.updated_at);
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: invoice_id,
                        title: `Invoice #${get_invoice.invoice}`,
                        module: 'Packing Slip',
                        action: 'Update Note in',
                        action_from: 'Web',
                    }, decodedToken);
                    res.send({ status: true, message: "Packing slip note updated successfully.", data: update_invoice });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                //save invoice note
                requestObject.created_by = decodedToken.UserData._id;
                requestObject.created_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let save_invoice_note = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id) }, { $push: { packing_slip_notes: requestObject } });
                let one_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
                if (save_invoice_note) {
                    requestObject.invoice_id = invoice_id;
                    addchangeInvoice_History("Insert Packing Slip Note", requestObject, decodedToken, requestObject.updated_at);
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: invoice_id,
                        title: `Invoice #${one_invoice.invoice}`,
                        module: 'Packing Slip',
                        action: 'Insert Note in',
                        action_from: 'Web',
                    }, decodedToken);
                    res.send({ status: true, message: "Packing slip note saved successfully." });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
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

// Delete Packing Slip Notes
module.exports.deletePackingSlipNote = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var invoice_id = requestObject.invoice_id;
            delete requestObject.invoice_id;
            var id = requestObject._id;
            delete requestObject._id;
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id), "packing_slip_notes._id": id }, { $set: { "packing_slip_notes.$.updated_by": decodedToken.UserData._id, "packing_slip_notes.$.updated_at": Math.round(new Date().getTime() / 1000), "packing_slip_notes.$.is_delete": 1 } });
            let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
            if (update_invoice) {
                requestObject.invoice_id = invoice_id;
                addchangeInvoice_History("Delete Packing Slip Note", requestObject, decodedToken, requestObject.updated_at);
                recentActivity.saveRecentActivity({
                    user_id: decodedToken.UserData._id,
                    username: decodedToken.UserData.userfullname,
                    userpicture: decodedToken.UserData.userpicture,
                    data_id: invoice_id,
                    title: `Invoice #${get_invoice.invoice}`,
                    module: 'Packing Slip',
                    action: 'Delete Note in',
                    action_from: 'Web',
                }, decodedToken);
                res.send({ status: true, message: "Packing slip note deleted successfully.", data: update_invoice });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
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

// Update Packing Slip Attachment
module.exports.savePackingSlipAttachment = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(requestObject._id) });
            let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
            if (update_invoice) {
                requestObject.invoice_id = requestObject._id;
                addchangeInvoice_History("Update Packing Slip Attachment", requestObject, decodedToken, requestObject.updated_at);
                recentActivity.saveRecentActivity({
                    user_id: decodedToken.UserData._id,
                    username: decodedToken.UserData.userfullname,
                    userpicture: decodedToken.UserData.userpicture,
                    data_id: requestObject._id,
                    title: `Invoice #${get_invoice.invoice}`,
                    module: 'Packing Slip',
                    action: 'Update Attachment in',
                    action_from: 'Web',
                }, decodedToken);
                res.send({ status: true, message: "Packing slip attachment updated successfully..", data: update_invoice });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
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

// Save Receiving Slip Notes
module.exports.saveReceivingSlipNotes = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var invoice_id = requestObject.invoice_id;
            delete requestObject.invoice_id;
            var id = requestObject._id;
            delete requestObject._id;
            if (id) {
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id), "receiving_slip_notes._id": id }, { $set: { "receiving_slip_notes.$.updated_by": decodedToken.UserData._id, "receiving_slip_notes.$.updated_at": Math.round(new Date().getTime() / 1000), "receiving_slip_notes.$.notes": requestObject.notes } });
                let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
                if (update_invoice) {
                    requestObject.invoice_id = invoice_id;
                    addchangeInvoice_History("Update Receiving Slip Note", requestObject, decodedToken, requestObject.updated_at);
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: invoice_id,
                        title: `Invoice #${get_invoice.invoice}`,
                        module: 'Receiving Slip',
                        action: 'Update Note in',
                        action_from: 'Web',
                    }, decodedToken);
                    res.send({ status: true, message: "Receiving slip note updated successfully.", data: update_invoice });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                //save invoice note
                requestObject.created_by = decodedToken.UserData._id;
                requestObject.created_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let save_invoice_note = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id) }, { $push: { receiving_slip_notes: requestObject } });
                let one_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
                if (save_invoice_note) {
                    requestObject.invoice_id = invoice_id;
                    addchangeInvoice_History("Insert Receiving Slip Note", requestObject, decodedToken, requestObject.updated_at);
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: invoice_id,
                        title: `Invoice #${one_invoice.invoice}`,
                        module: 'Receiving Slip',
                        action: 'Insert Note in',
                        action_from: 'Web',
                    }, decodedToken);
                    res.send({ status: true, message: "Receiving slip note saved successfully." });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
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

// Delete Receiving Slip Notes
module.exports.deleteReceivingSlipNote = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var invoice_id = requestObject.invoice_id;
            delete requestObject.invoice_id;
            var id = requestObject._id;
            delete requestObject._id;
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id), "receiving_slip_notes._id": id }, { $set: { "receiving_slip_notes.$.updated_by": decodedToken.UserData._id, "receiving_slip_notes.$.updated_at": Math.round(new Date().getTime() / 1000), "receiving_slip_notes.$.is_delete": 1 } });
            let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
            if (update_invoice) {
                requestObject.invoice_id = invoice_id;
                addchangeInvoice_History("Delete Receiving Slip Note", requestObject, decodedToken, requestObject.updated_at);
                recentActivity.saveRecentActivity({
                    user_id: decodedToken.UserData._id,
                    username: decodedToken.UserData.userfullname,
                    userpicture: decodedToken.UserData.userpicture,
                    data_id: invoice_id,
                    title: `Invoice #${get_invoice.invoice}`,
                    module: 'Receiving Slip',
                    action: 'Delete Note in',
                    action_from: 'Web',
                }, decodedToken);
                res.send({ status: true, message: "Receiving slip note deleted successfully.", data: update_invoice });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
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

// Update Receiving Slip Attachment
module.exports.saveReceivingSlipAttachment = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(requestObject._id) });
            let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
            if (update_invoice) {
                requestObject.invoice_id = requestObject._id;
                addchangeInvoice_History("Update Receiving Slip Attachment", requestObject, decodedToken, requestObject.updated_at);
                recentActivity.saveRecentActivity({
                    user_id: decodedToken.UserData._id,
                    username: decodedToken.UserData.userfullname,
                    userpicture: decodedToken.UserData.userpicture,
                    data_id: requestObject._id,
                    title: `Invoice #${get_invoice.invoice}`,
                    module: 'Receiving Slip',
                    action: 'Update Attachment in',
                    action_from: 'Web',
                }, decodedToken);
                res.send({ status: true, message: "Receiving slip attachment updated successfully..", data: update_invoice });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
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

// Save PO Notes
module.exports.savePONotes = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var invoice_id = requestObject.invoice_id;
            delete requestObject.invoice_id;
            var id = requestObject._id;
            delete requestObject._id;
            if (id) {
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id), "quote_notes._id": id }, { $set: { "po_notes.$.updated_by": decodedToken.UserData._id, "po_notes.$.updated_at": Math.round(new Date().getTime() / 1000), "po_notes.$.notes": requestObject.notes } });
                let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
                if (update_invoice) {
                    requestObject.invoice_id = invoice_id;
                    addchangeInvoice_History("Update PO Note", requestObject, decodedToken, requestObject.updated_at);
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: invoice_id,
                        title: `Invoice #${get_invoice.invoice}`,
                        module: 'PO',
                        action: 'Update Note in',
                        action_from: 'Web',
                    }, decodedToken);
                    res.send({ status: true, message: "PO note updated successfully.", data: update_invoice });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                //save invoice note
                requestObject.created_by = decodedToken.UserData._id;
                requestObject.created_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let save_invoice_note = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id) }, { $push: { po_notes: requestObject } });
                let one_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
                if (save_invoice_note) {
                    requestObject.invoice_id = invoice_id;
                    addchangeInvoice_History("Insert PO Note", requestObject, decodedToken, requestObject.updated_at);
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: invoice_id,
                        title: `Invoice #${one_invoice.invoice}`,
                        module: 'PO',
                        action: 'Insert Note in',
                        action_from: 'Web',
                    }, decodedToken);
                    res.send({ status: true, message: "PO note saved successfully." });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
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

// Delete PO Notes
module.exports.deletePONote = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var invoice_id = requestObject.invoice_id;
            delete requestObject.invoice_id;
            var id = requestObject._id;
            delete requestObject._id;
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id), "po_notes._id": id }, { $set: { "po_notes.$.updated_by": decodedToken.UserData._id, "po_notes.$.updated_at": Math.round(new Date().getTime() / 1000), "po_notes.$.is_delete": 1 } });
            let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
            if (update_invoice) {
                requestObject.invoice_id = invoice_id;
                addchangeInvoice_History("Delete PO Note", requestObject, decodedToken, requestObject.updated_at);
                recentActivity.saveRecentActivity({
                    user_id: decodedToken.UserData._id,
                    username: decodedToken.UserData.userfullname,
                    userpicture: decodedToken.UserData.userpicture,
                    data_id: invoice_id,
                    title: `Invoice #${get_invoice.invoice}`,
                    module: 'PO',
                    action: 'Delete Note in',
                    action_from: 'Web',
                }, decodedToken);
                res.send({ status: true, message: "PO note deleted successfully.", data: update_invoice });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
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

// Update PO Attachment
module.exports.savePOAttachment = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(requestObject._id) });
            let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
            if (update_invoice) {
                requestObject.invoice_id = requestObject._id;
                addchangeInvoice_History("Update PO Attachment", requestObject, decodedToken, requestObject.updated_at);
                recentActivity.saveRecentActivity({
                    user_id: decodedToken.UserData._id,
                    username: decodedToken.UserData.userfullname,
                    userpicture: decodedToken.UserData.userpicture,
                    data_id: requestObject._id,
                    title: `Invoice #${get_invoice.invoice}`,
                    module: 'PO',
                    action: 'Update Attachment in',
                    action_from: 'Web',
                }, decodedToken);
                res.send({ status: true, message: "PO attachment updated successfully..", data: update_invoice });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
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

// Save Quote Notes
module.exports.saveQuoteNotes = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var invoice_id = requestObject.invoice_id;
            delete requestObject.invoice_id;
            var id = requestObject._id;
            delete requestObject._id;
            if (id) {
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id), "quote_notes._id": id }, { $set: { "quote_notes.$.updated_by": decodedToken.UserData._id, "quote_notes.$.updated_at": Math.round(new Date().getTime() / 1000), "quote_notes.$.notes": requestObject.notes } });
                let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
                if (update_invoice) {
                    requestObject.invoice_id = invoice_id;
                    addchangeInvoice_History("Update Quote Note", requestObject, decodedToken, requestObject.updated_at);
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: invoice_id,
                        title: `Invoice #${get_invoice.invoice}`,
                        module: 'Quote',
                        action: 'Update Note in',
                        action_from: 'Web',
                    }, decodedToken);
                    res.send({ status: true, message: "Quote note updated successfully.", data: update_invoice });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                //save invoice note
                requestObject.created_by = decodedToken.UserData._id;
                requestObject.created_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let save_invoice_note = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id) }, { $push: { quote_notes: requestObject } });
                let one_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
                if (save_invoice_note) {
                    requestObject.invoice_id = invoice_id;
                    addchangeInvoice_History("Insert Quote Note", requestObject, decodedToken, requestObject.updated_at);
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: invoice_id,
                        title: `Invoice #${one_invoice.invoice}`,
                        module: 'Quote',
                        action: 'Insert Note in',
                        action_from: 'Web',
                    }, decodedToken);
                    res.send({ status: true, message: "Quote note saved successfully." });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
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

// Delete Quote Notes
module.exports.deleteQuoteNote = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var invoice_id = requestObject.invoice_id;
            delete requestObject.invoice_id;
            var id = requestObject._id;
            delete requestObject._id;
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id), "quote_notes._id": id }, { $set: { "quote_notes.$.updated_by": decodedToken.UserData._id, "quote_notes.$.updated_at": Math.round(new Date().getTime() / 1000), "quote_notes.$.is_delete": 1 } });
            let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
            if (update_invoice) {
                requestObject.invoice_id = invoice_id;
                addchangeInvoice_History("Delete Quote Note", requestObject, decodedToken, requestObject.updated_at);
                recentActivity.saveRecentActivity({
                    user_id: decodedToken.UserData._id,
                    username: decodedToken.UserData.userfullname,
                    userpicture: decodedToken.UserData.userpicture,
                    data_id: invoice_id,
                    title: `Invoice #${get_invoice.invoice}`,
                    module: 'Quote',
                    action: 'Delete Note in',
                    action_from: 'Web',
                }, decodedToken);
                res.send({ status: true, message: "Quote note deleted successfully.", data: update_invoice });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
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

// Update Quote Attachment
module.exports.saveQuoteAttachment = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(requestObject._id) });
            let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
            if (update_invoice) {
                requestObject.invoice_id = requestObject._id;
                addchangeInvoice_History("Update Quote Attachment", requestObject, decodedToken, requestObject.updated_at);
                recentActivity.saveRecentActivity({
                    user_id: decodedToken.UserData._id,
                    username: decodedToken.UserData.userfullname,
                    userpicture: decodedToken.UserData.userpicture,
                    data_id: requestObject._id,
                    title: `Invoice #${get_invoice.invoice}`,
                    module: 'Quote',
                    action: 'Update Attachment in',
                    action_from: 'Web',
                }, decodedToken);
                res.send({ status: true, message: "Quote attachment updated successfully..", data: update_invoice });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
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

// Update Related document
module.exports.updateInvoiceRelatedDocument = async function (req, res) {
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
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var get_invoice = await invoicesConnection.findOne({ _id: ObjectID(id) });
            let updateBadgeObject = {};
            if (module == 'PO' || module == 'Quote' || module == 'Packing Slip' || module == 'Receiving Slip') {
                // Find changed data of module
                let findKeys = {};
                let newReqObj = {};

                for (const property in requestObject) {
                    let key = property.toString().split(".")[1];
                    newReqObj[key] = requestObject[property];
                    findKeys[property] = 1;
                }
                if (newReqObj.vendor) {
                    newReqObj.vendor = ObjectID(newReqObj.vendor);
                }
                var get_data = await invoicesConnection.findOne({ _id: ObjectID(id) }, findKeys);
                let updatedData = [];
                if (module == 'PO') {
                    updatedData = await findUpdatedFieldHistory(newReqObj, get_data.po_data);
                } else if (module == 'Quote') {
                    updatedData = await findUpdatedFieldHistory(newReqObj, get_data.quote_data);
                } else if (module == 'Packing Slip') {
                    updatedData = await findUpdatedFieldHistory(newReqObj, get_data.packing_slip_data);
                } else if (module == 'Receiving Slip') {
                    updatedData = await findUpdatedFieldHistory(newReqObj, get_data.receiving_slip_data);
                }
                for (let i = 0; i < updatedData.length; i++) {
                    let key;
                    if (module == 'PO') {
                        key = `po_data.badge.${updatedData[i]['key']}`;
                    } else if (module == 'Quote') {
                        key = `quote_data.badge.${updatedData[i]['key']}`;
                    } else if (module == 'Packing Slip') {
                        key = `packing_slip_data.badge.${updatedData[i]['key']}`;
                    } else if (module == 'Receiving Slip') {
                        key = `receiving_slip_data.badge.${updatedData[i]['key']}`;
                    }
                    updateBadgeObject[key] = false;
                }
            }
            var update_data = await invoicesConnection.updateOne({ _id: ObjectID(id) }, requestObject);
            if (update_data) {
                sendInvoiceUpdateAlerts(decodedToken, id, module, translator);
                await invoicesConnection.updateOne({ _id: ObjectID(id) }, updateBadgeObject);
                var get_one = await invoicesConnection.findOne({ _id: ObjectID(id) }, { _id: 0, __v: 0 });
                let reqObj = { invoice_id: id, ...get_one._doc };
                addchangeInvoice_History("Update", reqObj, decodedToken, get_one.updated_at);
                recentActivity.saveRecentActivity({
                    user_id: decodedToken.UserData._id,
                    username: decodedToken.UserData.userfullname,
                    userpicture: decodedToken.UserData.userpicture,
                    data_id: id,
                    title: `Invoice #${get_invoice.invoice} ${module} Update`,
                    module: module,
                    action: `Update`,
                    action_from: 'Web',
                }, decodedToken);
                res.send({ message: `${module} updated successfully.`, status: true });
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

function findUpdatedFieldHistory(requestObject, dbData) {
    return new Promise(function (resolve, reject) {
        let newObj = {};
        let newData = {};
        Object.keys(requestObject)
            .sort()
            .forEach(function (key, i) {
                newObj[key] = requestObject[key];
            });
        Object.keys(dbData)
            .sort()
            .forEach(function (key, i) {
                newData[key] = dbData[key];
            });
        const result = _.pickBy(newObj, (request, database) => !_.isEqual(newData._doc[database], request));
        const arr = Object.entries(result).map(([key, value]) => ({ key, value }));
        resolve(arr);
    });
};

// Request For invoice files
module.exports.requestForInvoiceFile = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    var local_offset = Number(req.headers.local_offset);
    var timezone = req.headers.timezone;
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let email_list = requestObject.email_list;
            var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
            let talnate_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_TENANTS, { companycode: decodedToken.companycode });
            let company_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: decodedToken.companycode });

            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(requestObject._id) });

            var vendorConnection = connection_db_api.model(collectionConstant.INVOICE_VENDOR, vendorSchema);
            let get_vendor = await vendorConnection.findOne({ _id: ObjectID(get_invoice.vendor) });

            const file_data = fs.readFileSync(config.EMAIL_TEMPLATE_PATH + '/controller/emailtemplates/commonEmailTemplate.html', 'utf8');
            let emailTmp = {
                HELP: `${translator.getStr('EmailTemplateHelpEmailAt')} ${config.HELPEMAIL} ${translator.getStr('EmailTemplateCallSupportAt')} ${config.NUMBERPHONE}`,
                SUPPORT: `${translator.getStr('EmailTemplateEmail')} ${config.SUPPORTEMAIL} l ${translator.getStr('EmailTemplatePhone')} ${config.NUMBERPHONE2}`,
                ALL_RIGHTS_RESERVED: `${translator.getStr('EmailTemplateAllRightsReserved')}`,
                THANKS: translator.getStr('EmailTemplateThanks'),
                ROVUK_TEAM: translator.getStr('EmailTemplateRovukTeam'),
                VIEW_EXCEL: translator.getStr('EmailTemplateViewExcelReport'),
                COPYRIGHTNAME: `${config.COPYRIGHTNAME}`,

                TITLE: `Missing Document request!`,
                TEXT: new handlebars.SafeString(`<p>Hi,</p>
                <p>The ${requestObject.module} is requested by ${company_data.companyname} for Invoice No #${get_invoice.invoice}.</p>
                <p>Please send missing document for further invoice processing.</p>
                <h4>Invoice No: #${get_invoice.invoice}</h4>
                <h4>Vendor Name: ${get_vendor.vendor_name}</h4>`),

                COMPANYNAME: `${translator.getStr('EmailCompanyName')} ${company_data.companyname}`,
                COMPANYCODE: `${translator.getStr('EmailCompanyCode')} ${company_data.companycode}`,
            };
            var template = handlebars.compile(file_data);
            var HtmlData = await template(emailTmp);
            sendEmail.sendEmail_client(talnate_data.smartaccupay_tenants.tenant_smtp_username, email_list, 'Missing Document request!', HtmlData,
                talnate_data.smartaccupay_tenants.tenant_smtp_server, talnate_data.smartaccupay_tenants.tenant_smtp_port, talnate_data.smartaccupay_tenants.tenant_smtp_reply_to_mail,
                talnate_data.smartaccupay_tenants.tenant_smtp_password, talnate_data.smartaccupay_tenants.tenant_smtp_timeout, talnate_data.smartaccupay_tenants.tenant_smtp_security);
            res.send({ message: `Request for ${requestObject.module} files sent successfully.`, status: true });
        } catch (e) {
            console.log("error:", e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

//changes for new theams
//get invoice 
module.exports.getInvoiceTableForReport = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            let date_query = {};
            if (requestObject.start_date != 0 && requestObject.end_date != 0) {
                date_query = { created_at: { $gte: requestObject.start_date, $lt: requestObject.end_date } };
            }
            var get_data = await invoicesConnection.aggregate([
                { $match: { is_delete: requestObject.is_delete } },
                { $match: date_query },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_VENDOR,
                        localField: "vendor",
                        foreignField: "_id",
                        as: "vendor"
                    }
                },
                { $unwind: "$vendor" },
            ]);
            if (get_data) {
                res.send(get_data);
            } else {
                res.send([]);
            }
        } catch (e) {
            console.log(e);
            res.send([]);
        } finally {
            connection_db_api.close();
        }
    }
    else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

// View Document
module.exports.getViewDocumentsDatatableForTable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var processInvoiceConnection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);
            var match_query = {
                is_delete: requestObject.is_delete,
                status: { $ne: 'Complete' },
            };
            if (requestObject.document_type) {
                console.log("in 88888");
                if (requestObject.document_type == 'Other') {
                    match_query = {
                        document_type: { $nin: ['INVOICE', 'PURCHASE_ORDER', 'PACKING_SLIP', 'RECEIVING_SLIP', 'QUOTE'] },
                        is_delete: requestObject.is_delete,
                        status: { $ne: 'Complete' },
                    };
                } else {
                    match_query = {
                        document_type: requestObject.document_type,
                        is_delete: requestObject.is_delete,
                        status: { $ne: 'Complete' },
                    };
                }
            }
            var aggregateQuery = [
                { $match: match_query },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "created_by",
                        foreignField: "_id",
                        as: "created_by"
                    }
                },
                {
                    $unwind: {
                        path: "$created_by",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "updated_by",
                        foreignField: "_id",
                        as: "updated_by"
                    }
                },
                {
                    $unwind: {
                        path: "$updated_by",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $project: {
                        document_type: {
                            $cond: [
                                { $eq: ["$status", 'Already Exists'] },
                                'Already Exists', "$document_type"
                            ]
                        },
                        po_no: {
                            $cond: [
                                { $eq: ["$document_type", 'INVOICE'] },
                                '$data.p_o',
                                {
                                    $cond: [
                                        { $in: ['$document_type', ['PURCHASE_ORDER', 'PACKING_SLIP', 'RECEIVING_SLIP', 'UNKNOWN']] },
                                        '$data.po_number', ''
                                    ]
                                }
                            ]
                        },
                        invoice_no: {
                            $cond: [
                                { $eq: ["$document_type", 'INVOICE'] },
                                '$data.invoice',
                                {
                                    $cond: [
                                        { $in: ['$document_type', ['PACKING_SLIP', 'RECEIVING_SLIP', 'UNKNOWN']] },
                                        '$data.invoice_number',
                                        {
                                            $cond: [
                                                { $eq: ["$document_type", 'UNKNOWN'] },
                                                '$data.invoice_no', ''
                                            ]
                                        },
                                    ]
                                }
                            ]
                        },
                        data_vendor_id: '$data.vendor',
                        status: 1,
                        process_data: 1,
                        data: 1,
                        pdf_url: 1,
                        is_delete: 1,
                        created_at: 1,
                        updated_at: 1,
                        updated_by: {
                            $cond: [
                                { $eq: [requestObject.is_delete, 0] },
                                { $ifNull: ["$created_by.userfullname", "$created_by_mail"] },
                                { $ifNull: ["$updated_by.userfullname", "$updated_by_mail"] },
                            ]
                        },
                        updated_at: {
                            $cond: [
                                { $eq: [requestObject.is_delete, 0] },
                                "$created_at",
                                "$updated_at"
                            ]
                        },
                    }
                },
            ];
            let all_vendors = await processInvoiceConnection.aggregate(aggregateQuery).collation({ locale: "en_US" });
            for (let i = 0; i < all_vendors.length; i++) {
                let vendor = await getOneVendor(connection_db_api, all_vendors[i]['data_vendor_id']);
                let vendorName = '';
                if (vendor.status) {
                    vendorName = vendor.data.vendor_name;
                }
                all_vendors[i] = {
                    ...all_vendors[i],
                    vendor_name: vendorName,
                };
            }
            res.send(all_vendors);
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


module.exports.getOrphanDocumentsForTable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoiceConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var processInvoiceConnection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);
            var one_invoice = await invoiceConnection.aggregate([
                { $match: { _id: ObjectID(requestObject._id) } },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_VENDOR,
                        localField: "vendor",
                        foreignField: "_id",
                        as: "vendor"
                    }
                },
                { $unwind: "$vendor" },
            ]);
            if (one_invoice) {
                if (one_invoice.length > 0) {
                    one_invoice = one_invoice[0];
                }
                let query = {
                    status: 'Process',
                    document_type: { $ne: 'INVOICE' },
                    // "process_data.document_pages.fields.VENDOR_NAME": { $regex: one_invoice.vendor.vendor_name, $options: 'i' },
                    // "process_data.document_pages.fields.INVOICE_NUMBER": { $regex: one_invoice.invoice, $options: 'i' },
                    // "process_data.document_pages.fields.VENDOR_NAME": /CN SOLUTIONS GROUP LLc/i
                };
                let get_process = await processInvoiceConnection.find(query);
                res.send(get_process);
            } else {
                res.send([]);
            }
        } catch (e) {
            console.log(e);
            res.send([]);
        } finally {
            connection_db_api.close();
        }
    }
    else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

// Orphan Document
module.exports.getOrphanDocumentsDatatableForTable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var processInvoiceConnection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);
            var settingsConnection = connection_db_api.model(collectionConstant.INVOICE_SETTING, settingsSchema);
            let one_settings = await settingsConnection.findOne({});
            let settings = one_settings.settings.Document_View;
            let query = {};
            var match_query = {
                is_delete: requestObject.is_delete,
                status: { $eq: 'Process' }
            };
            var pending_count_query = {
                is_delete: requestObject.is_delete,
                status: { $eq: 'Process' }
            };
            let currentEpoch = Math.round(new Date().getTime() / 1000);
            let settingDays = Number(settings.setting_value);
            let settingDate = moment(currentEpoch * 1000);
            settingDate.hours(0);
            settingDate.minutes(0);
            settingDate.seconds(0);
            settingDate.milliseconds(0);
            settingDate.subtract(settingDays, 'days');
            settingEpoch = settingDate.unix();
            // if (requestObject.view_option != null) {
            //     match_query.created_at = { $lte: settingEpoch };
            // } else {
            //     match_query.created_at = { $gte: settingEpoch };
            // }
            var aggregateQuery = [
                { $match: match_query },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "created_by",
                        foreignField: "_id",
                        as: "created_by_user"
                    }
                },
                {
                    $unwind: {
                        path: "$created_by_user",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $project: {
                        document_type: {
                            $cond: [
                                { $eq: ["$status", 'Already Exists'] },
                                'Already Exists', "$document_type"
                            ]
                        },
                        po_no: {
                            $cond: [
                                { $eq: ["$document_type", 'INVOICE'] },
                                '$data.p_o',
                                {
                                    $cond: [
                                        { $in: ['$document_type', ['PURCHASE_ORDER', 'PACKING_SLIP', 'RECEIVING_SLIP', 'UNKNOWN']] },
                                        '$data.po_number', ''
                                    ]
                                }
                            ]
                        },
                        invoice_no: {
                            $cond: [
                                { $eq: ["$document_type", 'INVOICE'] },
                                '$data.invoice',
                                {
                                    $cond: [
                                        { $in: ['$document_type', ['PACKING_SLIP', 'RECEIVING_SLIP']] },
                                        '$data.invoice_number',
                                        {
                                            $cond: [
                                                { $eq: ["$document_type", 'UNKNOWN'] },
                                                '$data.invoice_no', ''
                                            ]
                                        },
                                    ]
                                }
                            ]
                        },
                        data_vendor_id: '$data.vendor',
                        status: 1,
                        process_data: 1,
                        data: 1,
                        pdf_url: 1,
                        created_at: 1,
                        created_by_user: { $ifNull: ["$created_by_user.userfullname", "$created_by_mail"] },
                        is_delete: 1,
                    }
                },
                { $match: query },
            ];
            let all_vendors = await processInvoiceConnection.aggregate(aggregateQuery).collation({ locale: "en_US" });
            for (let i = 0; i < all_vendors.length; i++) {
                let vendorName = '';
                if (all_vendors[i]['data_vendor_id']) {
                    let vendor = await getOneVendor(connection_db_api, all_vendors[i]['data_vendor_id']);
                    if (vendor.status) {
                        vendorName = vendor.data.vendor_name;
                    }
                }
                all_vendors[i] = {
                    ...all_vendors[i],
                    vendor_name: vendorName,
                };
            }
            res.send(all_vendors);
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

// Duplicate Documents
module.exports.getDuplicateDocumentsDatatableForTable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var processInvoiceConnection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);
            var col = [];
            col.push("created_by_user", "created_at");
            var start = parseInt(requestObject.start) || 0;
            var perpage = parseInt(requestObject.length);
            var columnData = (requestObject.order != undefined && requestObject.order != '') ? requestObject.order[0].column : '';
            var columntype = (requestObject.order != undefined && requestObject.order != '') ? requestObject.order[0].dir : '';
            var sort = {};
            if (requestObject.draw == 1) {
                sort = { "created_at": -1 };
            } else {
                sort[col[columnData]] = (columntype == 'asc') ? 1 : -1;
            }
            let query = {};
            if (requestObject.search.value) {
                query = {
                    $or: [
                        { "created_by_user": new RegExp(requestObject.search.value, 'i') },
                    ]
                };
            }
            var match_query = {
                is_delete: 0,
                status: { $eq: 'Already Exists' }
            };
            var pending_count_query = {
                is_delete: 0,
                status: { $eq: 'Process' }
            };
            var aggregateQuery = [
                { $match: match_query },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "created_by",
                        foreignField: "_id",
                        as: "created_by_user"
                    }
                },
                {
                    $unwind: {
                        path: "$created_by_user",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $project: {
                        document_type: {
                            $cond: [
                                { $eq: ["$status", 'Already Exists'] },
                                'Already Exists', "$document_type"
                            ]
                        },
                        po_no: {
                            $cond: [
                                { $eq: ["$document_type", 'INVOICE'] },
                                '$data.p_o',
                                {
                                    $cond: [
                                        { $in: ['$document_type', ['PURCHASE_ORDER', 'PACKING_SLIP', 'RECEIVING_SLIP', 'UNKNOWN']] },
                                        '$data.po_number', ''
                                    ]
                                }
                            ]
                        },
                        invoice_no: {
                            $cond: [
                                { $eq: ["$document_type", 'INVOICE'] },
                                '$data.invoice',
                                {
                                    $cond: [
                                        { $in: ['$document_type', ['PACKING_SLIP', 'RECEIVING_SLIP']] },
                                        '$data.invoice_number',
                                        {
                                            $cond: [
                                                { $eq: ["$document_type", 'UNKNOWN'] },
                                                '$data.invoice_no', ''
                                            ]
                                        },
                                    ]
                                }
                            ]
                        },
                        data_vendor_id: '$data.vendor',
                        status: 1,
                        process_data: 1,
                        data: 1,
                        pdf_url: 1,
                        created_at: 1,
                        created_by_user: { $ifNull: ["$created_by_user.userfullname", "$created_by_mail"] },
                    }
                },
                { $match: query },
                { $sort: sort },
                { $limit: start + perpage },
                { $skip: start },
            ];
            let count = 0;
            count = await processInvoiceConnection.countDocuments(match_query);
            let pendingCount = await processInvoiceConnection.countDocuments(pending_count_query);

            let all_vendors = await processInvoiceConnection.aggregate(aggregateQuery).collation({ locale: "en_US" });
            for (let i = 0; i < all_vendors.length; i++) {
                let vendor = await getOneVendor(connection_db_api, all_vendors[i]['data_vendor_id']);
                let vendorName = '';
                if (vendor.status) {
                    vendorName = vendor.data.vendor_name;
                }
                all_vendors[i] = {
                    ...all_vendors[i],
                    vendor_name: vendorName,
                };
            }
            res.send(all_vendors);
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


//send invoice
module.exports.sendInvoiceEmail = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
            let talnate_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_TENANTS, { companycode: decodedToken.companycode });
            let company_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: decodedToken.companycode });
            let MAP_DIV = "<div></div>";
            requestObject.message = requestObject.message.replace(/\n/g, "<br />");
            let emailTmp = {
                HELP: `${translator.getStr('EmailTemplateHelpEmailAt')} ${config.HELPEMAIL} ${translator.getStr('EmailTemplateCallSupportAt')} ${config.NUMBERPHONE}`,
                SUPPORT: `${translator.getStr('EmailTemplateEmail')} ${config.SUPPORTEMAIL} l ${translator.getStr('EmailTemplatePhone')} ${config.NUMBERPHONE2}`,
                ALL_RIGHTS_RESERVED: `${translator.getStr('EmailTemplateAllRightsReserved')}`,
                THANKS: translator.getStr('EmailTemplateThanks'),
                ROVUK_TEAM: translator.getStr('EmailTemplateRovukTeam'),
                EMAILTITLE: translator.getStr('INVOICE_SEND_TITLE'),
                COPYRIGHTNAME: `${config.COPYRIGHTNAME}`,

                ANY_QUESTION: translator.getStr('EmailLoginAnyQuestion'),
                MESSAGE: new handlebars.SafeString(requestObject.message),

                // COMPANYNAME: `${translator.getStr('EmailCompanyName')} ${company_data.companyname}`,
                // COMPANYCODE: `${translator.getStr('EmailCompanyCode')} ${company_data.companycode}`,
                // VENDOR_NAME: `${translator.getStr('VENDOR_NAME')} ${requestObject.vendor_name}`,
                // INVOICE_NUMBER: `${translator.getStr('INVOICE_NUMBER')} ${requestObject.invoice_number}`,
                // TOTAL_AMOUNT: `${translator.getStr('TOTAL_AMOUNT')} ${requestObject.invoice_total}`,
                FILE_LINK: `${requestObject.pdf_url}`,
                VIEW_PDF: `${translator.getStr('VIEW_PDF')}`
            };

            const file_data = fs.readFileSync(config.EMAIL_TEMPLATE_PATH + '/controller/emailtemplates/invoicesend.html', 'utf8');
            var template = handlebars.compile(file_data);
            var HtmlData = await template(emailTmp);
            let mailsend = await sendEmail.sendEmail_client_invoice(talnate_data.smartaccupay_tenants.tenant_smtp_username, [requestObject.to], [requestObject.cc], `${requestObject.subject}`, HtmlData,
                talnate_data.smartaccupay_tenants.tenant_smtp_server, talnate_data.smartaccupay_tenants.tenant_smtp_port, talnate_data.smartaccupay_tenants.tenant_smtp_reply_to_mail,
                talnate_data.smartaccupay_tenants.tenant_smtp_password, talnate_data.smartaccupay_tenants.tenant_smtp_timeout, talnate_data.smartaccupay_tenants.tenant_smtp_security);
            if (mailsend) {
                res.send({ message: translator.getStr('INVOICE_SEND'), status: true });
            } else {
                res.send({ message: translator.getStr('invoice_not_send'), status: false });
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

