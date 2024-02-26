// var CronJob = require('cron').CronJob;
var fs = require('fs');
var handlebars = require('handlebars');
let sendEmail = require('./../../../../../controller/common/sendEmail');
var config = require('./../../../../../config/config');
let common = require('./../../../../../controller/common/common');
let db_connection = require('./../../../../../controller/common/connectiondb');
let collectionConstant = require('./../../../../../config/collectionConstant');
let rest_Api = require("../../../../../config/db_rest_api");
let companyCollection = "company";
let tenantsCollection = "tenants";
var moment = require('moment');
var ObjectID = require('mongodb').ObjectID;
// var projectSchema = require('./../../../../../model/supplier_project');
var employeeSchema = require('./../../../../../model/user');
var userSchema = require('./../../../../../model/user');
var diversityRoleSchema = require('./../../../../../model/diversity_roles');
// let supplierAlertController = require('./../supplier_alert/supplierAlertController');

module.exports.userDocumentExpiryAlert = async function (req, res) {
    userDocumentExpiryAlertCronFunction();
};

async function userDocumentExpiryAlertCronFunction() {
    try {
        let connection_MDM_main = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
        let All_Compnay = await rest_Api.find(connection_MDM_main, companyCollection, { companystatus: 1, companycode: { $ne: '' } });
        let final_object = [];
        for (const item_new of All_Compnay) {
            //employee 
            var translator = new common.Language(item_new.companylanguage);
            const file_data = fs.readFileSync(config.EMAIL_TEMPLATE_PATH + '/controller/emailtemplates/userDocumentExpiryAlert.html', 'utf8');
            const file_dataAdmin = fs.readFileSync(config.EMAIL_TEMPLATE_PATH + '/controller/emailtemplates/userAdminDocumentExpiryAlert.html', 'utf8');
            var template = handlebars.compile(file_data);
            var templateAdmin = handlebars.compile(file_dataAdmin);

            let item = await rest_Api.findOne(connection_MDM_main, tenantsCollection, { companycode: item_new.companycode });
            let company_data = await rest_Api.findOne(connection_MDM_main, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: item_new.companycode });

            let connection_db_api = await db_connection.connection_db_api(item);
            // let projectCollection = connection_db_api.model(collectionConstant.PROJECT, projectSchema);
            let employeeCollection = connection_db_api.model(collectionConstant.INVOICE_USER, employeeSchema);
            let roleConnection = connection_db_api.model(collectionConstant.INVOICE_ROLES, diversityRoleSchema);
            let admin_role = await roleConnection.findOne({ role_name: config.ADMIN_ROLE }, { role_id: 1 });
            let employee_list = await employeeCollection.find({ is_delete: 0, userroleId: ObjectID(admin_role.role_id) }, { useremail: 1 }).distinct("useremail");
            let employee_ids = await employeeCollection.find({ is_delete: 0, userroleId: ObjectID(admin_role.role_id) }, { _id: 1 }).distinct("_id");
            let date = new Date();
            start_date = Math.round(date.setHours(0, 0, 0, 0) / 1000);
            end_date = Math.round(date.setHours(23, 59, 59, 999) / 1000);

            let get_employee_document = await employeeCollection.aggregate([
                { $match: { "is_delete": 0, userstatus: 1 } },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER_DOCUMENT,
                        let: { id: "$_id" },
                        pipeline: [
                            {
                                "$lookup": {
                                    from: collectionConstant.DOCUMENTTYPE,
                                    localField: "userdocument_type_id",
                                    foreignField: "_id",
                                    as: "userdocument_type"
                                }
                            }, {
                                $unwind: "$userdocument_type"
                            },
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$userdocument_user_id", "$$id"] },
                                            { $eq: ["$is_delete", 0] }
                                        ]
                                    }
                                },
                            }, {
                                $project: {
                                    userdocument_url: 1,
                                    userdocument_type: "$userdocument_type",
                                    total_remain: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $ne: ["$userdocument_expire_date", 0] },
                                                    { $gte: ["$userdocument_expire_date", start_date] },
                                                    { $eq: ["$userdocument_type.is_expiration", true] }
                                                ]
                                            },
                                            {
                                                $floor: {
                                                    $divide: [{
                                                        $subtract:
                                                            ["$userdocument_expire_date", start_date]
                                                    }, 86400]
                                                }
                                            },
                                            0
                                        ],
                                    }
                                }
                            }
                        ],
                        as: "document_attachment"
                    }
                }
            ]);

            for (let aa = 0; aa < get_employee_document.length; aa++) {
                for (let a = 0; a < get_employee_document[aa].document_attachment.length; a++) {
                    if (get_employee_document[aa].document_attachment[a].total_remain == 30 ||
                        get_employee_document[aa].document_attachment[a].total_remain == 60 ||
                        get_employee_document[aa].document_attachment[a].total_remain == 90 ||
                        (get_employee_document[aa].document_attachment[a].total_remain >= 1 &&
                            get_employee_document[aa].document_attachment[a].total_remain <= 10)) {
                        list_html = "";
                        let file_name = get_employee_document[aa].document_attachment[a].userdocument_url.split('/').pop();
                        let user_page_url = config.SITE_URL + "/employee-view/" + get_employee_document[aa]._id + "?tab_index=4";
                        let ptoject_url = config.SITE_URL + "/project?_id=" + get_employee_document[aa]._id;
                        list_html += `<a href='` + user_page_url + `' style="background-color: #023E8A; /* Green */
                        border: #0077bc solid;
                        color: white;
                        padding: 15px 32px;
                        text-align: center;
                        text-decoration: none;
                        display: inline-block;
                        font-size: 16px; width: 20%;" target="_blank" >`+ get_employee_document[aa].document_attachment[a].userdocument_type.document_type_name + `</a>`;
                        let emailTmp_user = {
                            HELP: `${translator.getStr('EmailTemplateHelpEmailAt')} ${config.HELPEMAIL} ${translator.getStr('EmailTemplateCallSupportAt')} ${config.NUMBERPHONE}`,
                            SUPPORT: `${translator.getStr('EmailTemplateEmail')} ${config.SUPPORTEMAIL} l ${config.NUMBERPHONE2}`,
                            ALL_RIGHTS_RESERVED: `${translator.getStr('EmailTemplateAllRightsReserved')}`,
                            THANKS: translator.getStr('EmailTemplateThanks'),
                            ROVUK_TEAM: translator.getStr('EmailTemplateRovukTeam'),
                            COPYRIGHTNAME: `${config.COPYRIGHTNAME}`,
                            TITLE: translator.getStr('EmailSingleDocExpireTitle'),
                            TEXT1: `${translator.getStr('EmailAdminDocExpireWillExpireInNext_Your')} ${get_employee_document[aa].document_attachment[a].total_remain} ${translator.getStr('EmailAdminDocExpireMoreInfo')}`,
                            TEXT2: translator.getStr('EmailAdminDocExpireDocumentNeedToUpdate'),
                            LIST_HTML: new handlebars.SafeString(list_html),

                            COMPANYNAME: `${translator.getStr('EmailAppInvitationCompanyName')} ${company_data.companyname}`,
                            COMPANYCODE: `${translator.getStr('EmailAppInvitationCompanyCode')} ${company_data.companycode}`,
                        };

                        let list_html_admin = `<a href='` + user_page_url + `' style="background-color: #023E8A; /* Green */
                        border: #0077bc solid;
                        color: white;
                        padding: 15px 32px;
                        text-align: center;
                        text-decoration: none;
                        display: inline-block;
                        font-size: 16px; width: 20%;" target="_blank" >`+ get_employee_document[aa].document_attachment[a].userdocument_type.document_type_name + `</a>`;
                        let emailTmp_Admin = {
                            HELP: `${translator.getStr('EmailTemplateHelpEmailAt')} ${config.HELPEMAIL} ${translator.getStr('EmailTemplateCallSupportAt')} ${config.NUMBERPHONE}`,
                            SUPPORT: `${translator.getStr('EmailTemplateEmail')} ${config.SUPPORTEMAIL} l ${config.NUMBERPHONE2}`,
                            ALL_RIGHTS_RESERVED: `${translator.getStr('EmailTemplateAllRightsReserved')}`,
                            THANKS: translator.getStr('EmailTemplateThanks'),
                            ROVUK_TEAM: translator.getStr('EmailTemplateRovukTeam'),
                            COPYRIGHTNAME: `${config.COPYRIGHTNAME}`,

                            TITLE: translator.getStr('EmailSingleDocExpireTitle'),
                            TEXT1: `${translator.getStr('EmailAdminDocExpireWillExpireInNext')} ${get_employee_document[aa].document_attachment[a].total_remain} ${translator.getStr('EmailAdminDocExpireMoreInfo')}`,
                            TEXT2: translator.getStr('EmailAdminDocExpireDocumentNeedToUpdate'),
                            LIST_HTML: new handlebars.SafeString(list_html_admin),

                            COMPANYNAME: `${translator.getStr('EmailCompanyName')} ${company_data.companyname}`,
                            COMPANYCODE: `${translator.getStr('EmailCompanyCode')} ${company_data.companycode}`,
                        };

                        var HtmlData_user = await template(emailTmp_user);
                        var HTML_ADMIN = await templateAdmin(emailTmp_Admin);

                        sendEmail.sendEmail_client(item.smartaccupay_tenants.tenant_smtp_username, [get_employee_document[aa].useremail], "Contact admin: Documents about to expire ", HtmlData_user,
                            item.smartaccupay_tenants.tenant_smtp_server, item.smartaccupay_tenants.tenant_smtp_port, item.smartaccupay_tenants.tenant_smtp_reply_to_mail,
                            item.smartaccupay_tenants.tenant_smtp_password, item.smartaccupay_tenants.tenant_smtp_timeout, item.smartaccupay_tenants.tenant_smtp_security);
                        sendEmail.sendEmail_client(item.smartaccupay_tenants.tenant_smtp_username, employee_list, "Documents are about to expire for one of your employee", HTML_ADMIN,
                            item.smartaccupay_tenants.tenant_smtp_server, item.smartaccupay_tenants.tenant_smtp_port, item.smartaccupay_tenants.tenant_smtp_reply_to_mail,
                            item.smartaccupay_tenants.tenant_smtp_password, item.smartaccupay_tenants.tenant_smtp_timeout, item.smartaccupay_tenants.tenant_smtp_security);

                        let alertObject = {
                            user_id: get_employee_document[aa]._id,
                            module_name: 'User Document',
                            module_route: { _id: get_employee_document[aa]._id },
                            tab_index: 4,
                            notification_title: 'Take action soon!',
                            notification_description: `Some of your  documents will be expired in ${get_employee_document[aa].document_attachment[a].total_remain} days. Please take necessary action and update your document.`,
                        };
                        // supplierAlertController.saveSupplierAlert(alertObject, connection_db_api);
                    }
                }
            }
        }
    } catch (e) {
        console.log("error:=========", e);
    }
}

// var userDocumentExpiryAlertCron = new CronJob(config.CRON_JOB.USER_DOCUMENT, async function () {
//     userDocumentExpiryAlertCronFunction();
// });
// userDocumentExpiryAlertCron.start();


module.exports.userEmergencyContactAlertCron = async function (req, res) {
    userEmergencyContactAlertCronFunction();
};

async function userEmergencyContactAlertCronFunction() {
    try {
        let connection_MDM_main = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
        let All_Compnay = await rest_Api.find(connection_MDM_main, companyCollection, { companystatus: 1, companycode: { $ne: '' } });
        let final_object = [];
        for (const item_new of All_Compnay) {
            var translator = new common.Language(item_new.companylanguage);
            let item = await rest_Api.findOne(connection_MDM_main, tenantsCollection, { companycode: item_new.companycode });
            let connection_db_api = await db_connection.connection_db_api(item);
            let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            let all_user = await userConnection.find({ is_delete: 0 });
            const file_data = fs.readFileSync(config.EMAIL_TEMPLATE_PATH + '/controller/emailtemplates/commonEmailTemplate.html', 'utf8');
            let emailTmp = {
                HELP: `${translator.getStr('EmailTemplateHelpEmailAt')} ${config.HELPEMAIL} ${translator.getStr('EmailTemplateCallSupportAt')} ${config.NUMBERPHONE}`,
                SUPPORT: `${translator.getStr('EmailTemplateEmail')} ${config.SUPPORTEMAIL} l ${translator.getStr('EmailTemplatePhone')} ${config.NUMBERPHONE2}`,
                ALL_RIGHTS_RESERVED: `${translator.getStr('EmailTemplateAllRightsReserved')}`,
                THANKS: translator.getStr('EmailTemplateThanks'),
                ROVUK_TEAM: translator.getStr('EmailTemplateRovukTeam'),
                COPYRIGHTNAME: `${config.COPYRIGHTNAME}`,

                TITLE: `Important message about contact information`,
                TEXT: new handlebars.SafeString(`<h4>Your emergency contact information needs to be updated or revised.</h4>`),

                COMPANYNAME: `${translator.getStr('EmailCompanyName')} ${item_new.companyname}`,
                COMPANYCODE: `${translator.getStr('EmailCompanyCode')} ${item_new.companycode}`,
            };
            var template = handlebars.compile(file_data);
            var HtmlData = await template(emailTmp);

            for (let i = 0; i < all_user.length; i++) {
                // Emergency Contact Alert for User
                let alertObject = {
                    user_id: all_user[i]._id,
                    module_name: `Emergency Contact`,
                    tab_index: 3,
                    module_route: { _id: all_user[i]._id },
                    notification_title: `Important message about contact information`,
                    notification_description: `Your emergency contact information needs to be updated or revised.`,
                };
                // supplierAlertController.saveSupplierAlert(alertObject, connection_db_api);

                sendEmail.sendEmail_client(item.smartaccupay_tenants.tenant_smtp_username, [all_user[i]['useremail']], `Important message about contact information`, HtmlData,
                    item.smartaccupay_tenants.tenant_smtp_server, item.smartaccupay_tenants.tenant_smtp_port, item.smartaccupay_tenants.tenant_smtp_reply_to_mail,
                    item.smartaccupay_tenants.tenant_smtp_password, item.smartaccupay_tenants.tenant_smtp_timeout, item.smartaccupay_tenants.tenant_smtp_security);

            }
        }
    } catch (e) {
        console.log("error:", e);
    }
}

// var userEmergencyContactAlertCron = new CronJob(config.CRON_JOB.USER_EMERGENCY_CONTACT, async function () {
//     userEmergencyContactAlertCronFunction();
// });
// userEmergencyContactAlertCron.start();