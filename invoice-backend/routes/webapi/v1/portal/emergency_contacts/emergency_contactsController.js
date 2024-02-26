var emergency_contactsSchema = require('./../../../../../model/emergency_contacts');
var userSchema = require('./../../../../../model/user');
var ObjectID = require('mongodb').ObjectID;
let db_connection = require('./../../../../../controller/common/connectiondb');
let common = require('./../../../../../controller/common/common');
let collectionConstant = require('./../../../../../config/collectionConstant');
let sendEmail = require('./../../../../../controller/common/sendEmail');
var handlebars = require('handlebars');
let rest_Api = require('./../../../../../config/db_rest_api');
var config = require('./../../../../../config/config');
var fs = require('fs');

module.exports.saveemergencycontact = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let emergencycontactsCollection = connection_db_api.model(collectionConstant.EMERGENCY_CONTACT, emergency_contactsSchema);
            if (requestObject._id) {
                let emergencycontacts = await emergencycontactsCollection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
                if (emergencycontacts) {
                    requestObject.updated_id = requestObject._id;
                    delete requestObject["_id"];
                    addUserEmergencyContactsHistory("Update", requestObject, decodedToken);
                    res.send({ message: translator.getStr('EmergencyContactUpdated'), data: emergencycontacts, status: true });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                let add_emergencycontacts = new emergencycontactsCollection(requestObject);
                let save_emergencycontacts = await add_emergencycontacts.save();
                if (save_emergencycontacts) {
                    requestObject.inserted_id = save_emergencycontacts._id;
                    addUserEmergencyContactsHistory("Insert", requestObject, decodedToken);
                    res.send({ message: translator.getStr('EmergencyContactAdded'), data: save_emergencycontacts, status: true });
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

module.exports.deleteemergencycontact = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = { is_delete: 1 };

            let emergencycontactsCollection = connection_db_api.model(collectionConstant.EMERGENCY_CONTACT, emergency_contactsSchema);
            let emergencycontacts = await emergencycontactsCollection.updateOne({ _id: ObjectID(req.body._id) }, requestObject);
            if (emergencycontacts) {
                addUserEmergencyContactsHistory("Delete", { deleted_id: ObjectID(req.body._id) }, decodedToken);
                res.send({ message: translator.getStr('EmergencyContactDeleted'), data: emergencycontacts, status: true });
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

module.exports.getemergencycontact = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let emergencycontactsCollection = connection_db_api.model(collectionConstant.EMERGENCY_CONTACT, emergency_contactsSchema);
            let emergencycontacts_tmp = await emergencycontactsCollection.aggregate([
                {
                    $match: { is_delete: 0, emergency_contact_userid: ObjectID(req.body._id) },
                },
                {
                    $lookup: {
                        from: collectionConstant.RELATIONSHIP,
                        localField: "emergency_contact_relation",
                        foreignField: "_id",
                        as: "RELATIONSHIP"
                    }
                },
                {
                    $unwind: "$RELATIONSHIP"
                },
                {
                    $project: {
                        relationship_name: "$RELATIONSHIP.relationship_name",
                        emergency_contact_name: 1,
                        emergency_contact_userid: 1,
                        emergency_contact_relation: 1,
                        emergency_contact_phone: 1,
                        emergency_contact_email: 1,
                        emergency_contact_fulladdress: 1,
                        emergency_contact_street1: 1,
                        emergency_contact_street2: 1,
                        emergency_contact_city: 1,
                        emergency_contact_state: 1,
                        emergency_contact_zipcode: 1,
                        emergency_contact_country: 1,
                        updatedAt: 1,
                        is_validated: 1,
                        validated_at: 1,
                    }
                },
                { $sort: { createdAt: 1 } }
            ]);
            if (emergencycontacts_tmp) {
                res.send(emergencycontacts_tmp);
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
        res.send([]);
    }
};

module.exports.getoneemergencycontact = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let emergencycontactsCollection = connection_db_api.model(collectionConstant.EMERGENCY_CONTACT, emergency_contactsSchema);
            let get_data = await emergencycontactsCollection.findOne({ _id: ObjectID(requestObject._id) });
            if (get_data) {
                res.send({ message: translator.getStr('EmergencyContactListing'), data: get_data, status: false });
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

module.exports.sendEmergencyContactReminder = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        try {
            var requestObject = req.body;
            let connection_db_api = await db_connection.connection_db_api(decodedToken);
            let userCollection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            let tmp_user = await userCollection.findOne({ _id: ObjectID(requestObject._id) }, { _id: 1, useremail: 1, userfirebase_token: 1 });
            var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
            let talnate_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_TENANTS, { companycode: decodedToken.companycode });
            let company_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: decodedToken.companycode });
            let emailTmp = {
                HELP: `${translator.getStr('EmailTemplateHelpEmailAt')} ${config.HELPEMAIL} ${translator.getStr('EmailTemplateCallSupportAt')} ${config.NUMBERPHONE}`,
                SUPPORT: `${translator.getStr('EmailTemplateEmail')} ${config.SUPPORTEMAIL} l ${translator.getStr('EmailTemplatePhone')} ${config.NUMBERPHONE2}`,
                ALL_RIGHTS_RESERVED: `${translator.getStr('EmailTemplateAllRightsReserved')}`,
                THANKS: translator.getStr('EmailTemplateThanks'),
                ROVUK_TEAM: translator.getStr('EmailTemplateRovukTeam'),
                TITLE: translator.getStr("Message_About_ContactInfo"),
                LINE1: translator.getStr("Emergency_Contact_Info_Update"),
                LINE2: translator.getStr("Provide_Recent_Information"),
                LINE3: translator.getStr("Company_Maintains_Information"),
                LINE4: translator.getStr("Following_Data_Text"),
                View_Report: translator.getStr("View_Report"),
                COPYRIGHTNAME: `${config.COPYRIGHTNAME}`,

                COMPANYNAME: `${translator.getStr('EmailCompanyName')} ${company_data.companyname}`,
                COMPANYCODE: `${translator.getStr('EmailCompanyCode')} ${company_data.companycode}`,
            };
            const file_data = fs.readFileSync(config.EMAIL_TEMPLATE_PATH + '/controller/emailtemplates/emergencyContactReminder.html', 'utf8');
            var template = handlebars.compile(file_data);
            var HtmlData = await template(emailTmp);

            //Mobile Notification
            let notification_data = {
                body: translator.getStr("Emergency_Contact_Info_Update"),
                title: translator.getStr('Emergency_Contact_Update')
            };
            let temp_data = {
                "module": "Emergency Contact",
            };
            await common.sendNotificationWithData([tmp_user['invoice_firebase_token']], notification_data, temp_data);

            sendEmail.sendEmail_client(talnate_data.smartaccupay_tenants.tenant_smtp_username, tmp_user['useremail'], translator.getStr("Emergency_Contact_Email_Subject"), HtmlData,
                talnate_data.smartaccupay_tenants.tenant_smtp_server, talnate_data.smartaccupay_tenants.tenant_smtp_port, talnate_data.smartaccupay_tenants.tenant_smtp_reply_to_mail,
                talnate_data.smartaccupay_tenants.tenant_smtp_password, talnate_data.smartaccupay_tenants.tenant_smtp_timeout, talnate_data.smartaccupay_tenants.tenant_smtp_security);
            res.send({ message: translator.getStr('EmergencyContactReminderSent'), status: true });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

var emergency_contacts_historySchema = require('./../../../../../model/history/emergency_contacts_history');
let historyCollectionConstant = require('./../../../../../config/historyCollectionConstant');

async function addUserEmergencyContactsHistory(action, data, decodedToken) {
    try {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        let emergency_contacts_historyCollection = connection_db_api.model(historyCollectionConstant.EMERGENCY_CONTACT_HISTORY, emergency_contacts_historySchema);
        data.action = action;
        data.created_at = Math.round(new Date().getTime() / 1000);
        let save_usersdocument_histories = new emergency_contacts_historyCollection(data);
        save_usersdocument_histories.save();
    } catch (e) {
        console.log("=====Emergency Contacts History ERROR=========", e);
    }
}
