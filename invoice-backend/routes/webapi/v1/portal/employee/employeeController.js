var userSchema = require('./../../../../../model/user');
var invoiceRoleSchema = require('./../../../../../model/invoice_roles');
var userDocumentSchema = require('./../../../../../model/userdocument');
//var projectDocumentSchema = require('./../../../../../model/project_document');
var ObjectID = require('mongodb').ObjectID;
var common = require("./../../../../../controller/common/common");
let db_connection = require('./../../../../../controller/common/connectiondb');
let collectionConstant = require('./../../../../../config/collectionConstant');
var formidable = require('formidable');
var fs = require('fs');
var bucketOpration = require('../../../../../controller/common/s3-wasabi');
var config = require('./../../../../../config/config');
let sendEmail = require('./../../../../../controller/common/sendEmail');
let rest_Api = require('./../../../../../config/db_rest_api');
let db_rest_api = require('../../../../../config/db_rest_api');
var handlebars = require('handlebars');
var moment = require('moment');
var departmentSchema = require('./../../../../../model/departments');
var jobTitleSchema = require('./../../../../../model/job_title');
var jobTypeSchema = require('./../../../../../model/job_type');
var invoiceLocationSchema = require('./../../../../../model/locations');
var languageSchema = require('./../../../../../model/language');
var companySchema = require('./../../../../../model/company');
//let activityController = require("./../todaysActivity/todaysActivityController");
//var projectSchema = require('./../../../../../model/project');
//var projectSettingsSchema = require('./../../../../../model/project_settings');
// var projectEmailRecipientSchema = require('../../../../../model/supplier_project_email_recipients');
// var supplierProjectUsersSchema = require('./../../../../../model/supplier_project_users');
const excel = require("exceljs");
var StringMask = require('string-mask');
var jobtitleSchema = require('./../../../../../model/job_title');
var jobtypeSchema = require('./../../../../../model/job_type');
var payrollgroupSchema = require('../../../../../model/payroll_group');
var creditcardsettingsSchema = require('../../../../../model/creditcardsettings');
const reader = require('xlsx');
var _ = require('lodash');
let billingPlan = require('./../../../../../config/billing_plan');
let attachmentLocations = require('./../../../../../config/attachmentLocations');
var recentActivity = require('./../recent_activity/recentActivityController');
var view_capture_Schema = require('./../../../../../model/view_capture');

module.exports.getAllUserList = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {

            let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            let match = {
                is_delete: 0,
                userstatus: 1,
            };
            let get_user = await userConnection.find(match);
            res.send({ data: get_user, message: translator.getStr('UserListing'), status: true });
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

module.exports.getSpecificUsers = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        try {
            let connection_db_api = await db_connection.connection_db_api(decodedToken);
            let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            let all_user = await userConnection.aggregate([
                { $match: req.body },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_ROLES,
                        localField: "userroleId",
                        foreignField: "role_id",
                        as: "role"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.JOB_TITLE,
                        localField: "userjob_title_id",
                        foreignField: "_id",
                        as: "jobtitle"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.DEPARTMENTS,
                        localField: "userdepartment_id",
                        foreignField: "_id",
                        as: "department"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.PAYROLL_GROUP,
                        localField: "user_id_payroll_group",
                        foreignField: "_id",
                        as: "payrollgroup"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.JOB_TYPE,
                        localField: "userjob_type_id",
                        foreignField: "_id",
                        as: "jobtype"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "usersupervisor_id",
                        foreignField: "_id",
                        as: "supervisor"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.LOCATIONS,
                        localField: "userlocation_id",
                        foreignField: "_id",
                        as: "location"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "usermanager_id",
                        foreignField: "_id",
                        as: "manager"
                    }
                },
                {
                    $lookup: {
                        from: "costcodes",
                        localField: "usercostcode",
                        foreignField: "_id",
                        as: "costcode"
                    }
                },
                {
                    $project: {
                        role_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$role.role_name" },
                                        {
                                            $arrayElemAt: ["$role.role_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        supervisor_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$supervisor.userfullname" },
                                        {
                                            $arrayElemAt: ["$supervisor.userfullname", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        manager_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$manager.userfullname" },
                                        {
                                            $arrayElemAt: ["$manager.userfullname", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        location_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$location.location_name" },
                                        {
                                            $arrayElemAt: ["$location.location_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        userjob_type_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$jobtype.job_type_name" },
                                        {
                                            $arrayElemAt: ["$jobtype.job_type_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        userjob_title_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$jobtitle.job_title_name" },
                                        {
                                            $arrayElemAt: ["$jobtitle.job_title_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        department_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$department.department_name" },
                                        {
                                            $arrayElemAt: ["$department.department_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        user_payroll_group_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$payrollgroup.payroll_group_name" },
                                        {
                                            $arrayElemAt: ["$payrollgroup.payroll_group_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        userroleId: 1,
                        useremail: 1,
                        username: 1,
                        usermiddlename: 1,
                        userlastname: 1,
                        userfullname: 1,
                        userssn: 1,
                        userdevice_pin: 1,
                        userphone: 1,
                        usersecondary_email: 1,
                        usergender: 1,
                        userdob: 1,
                        userstatus: 1,
                        userpicture: 1,
                        usermobile_picture: 1,
                        userfulladdress: 1,
                        userstreet1: 1,
                        userstreet2: 1,
                        usercity: 1,
                        user_state: 1,
                        userzipcode: 1,
                        usercountry: 1,
                        userstartdate: 1,
                        usersalary: 1,
                        usermanager_id: 1,
                        usersupervisor_id: 1,
                        userlocation_id: 1,
                        userjob_title_id: 1,
                        userdepartment_id: 1,
                        userjob_type_id: 1,
                        usernon_exempt: 1,
                        usermedicalBenifits: 1,
                        useradditionalBenifits: 1,
                        useris_password_temp: 1,
                        userterm_conditions: 1,
                        userweb_security_code: 1,
                        user_payroll_rules: 1,
                        user_id_payroll_group: 1,
                        usercostcode: 1,
                        costcode: { $ifNull: [{ $arrayElemAt: ["$costcode.value", 0] }, ""] },
                        userqrcode: 1,
                        userfirebase_id: 1,
                        user_no: 1,
                        card_no: 1,
                        card_type: 1,
                        is_first: 1,
                        allow_for_projects: 1,
                        user_languages: 1,
                        compliance_officer: 1,
                    }
                },
            ]).collation({ locale: "en_US" });
            res.send({ message: translator.getStr('EmployeeListing'), data: all_user, status: true });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.saveEmployee = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    let history_object;
    if (decodedToken) {
        let admin_connection_db_api = await db_connection.connection_db_api(config.ADMIN_CONFIG);
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let companyConnection = admin_connection_db_api.model(collectionConstant.SUPER_ADMIN_COMPANY, companySchema);
            let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);

            var form = new formidable.IncomingForm();
            var fields = [];
            var notFonud = 0;
            var newOpenFile;
            var fileName;
            form.parse(req)
                .on('file', function (name, file) {
                    notFonud = 1;
                    fileName = file;
                })
                .on('field', function (name, field) {
                    fields[name] = field;
                })
                .on('error', function (err) {
                    throw err;
                }).on('end', async function () {
                    newOpenFile = this.openedFiles;
                    var body = await JSON.parse(fields.reqObject);
                    body.useremail = body.useremail.toLowerCase();
                    jobtitle = body.jobtitle_name;
                    department = body.department_name;
                    costcode = body.costcode_name;
                    body.allow_for_projects = body.allow_for_projects == "true" || body.allow_for_projects == true ? true : false;
                    delete body['jobtitle_name'];
                    delete body['department_name'];
                    delete body['costcode_name'];

                    let usercostcode = "";
                    if (body.usercostcode != "") {
                        usercostcode = ObjectID(body.usercostcode);
                    }
                    let tempLang = body.user_languages;

                    let temp_user_languages = [];
                    for (let i = 0; i < tempLang.length; i++) {
                        temp_user_languages.push(ObjectID(tempLang[i]));
                    }
                    body.user_languages = temp_user_languages;

                    password_tmp = body.password;
                    body.usercreated_by = decodedToken.UserData._id;
                    body.userupdated_by = decodedToken.UserData._id;
                    if (body.password) {
                        body.password = common.generateHash(body.password);
                    }
                    let checkEmailExist = await userConnection.findOne({ useremail: body.useremail, is_delete: 0 });
                    if (checkEmailExist) {
                        res.send({ message: translator.getStr('EmailAlreadyExists'), status: false });
                    } else {
                        let company_data = await companyConnection.findOne({ companycode: decodedToken.companycode });
                        // let compnay_collection = await db_rest_api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
                        // let company_data = await db_rest_api.findOne(compnay_collection, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: decodedToken.companycode });
                        // let selectedPlan = company_data.billingplan;

                        // let get_user_roles = connection_db_api.model(collectionConstant.INVOICE_ROLES, invoiceRoleSchema);
                        // let onerole = await get_user_roles.findOne({ role_id: ObjectID(body.userroleId) });
                        // let allowed_count = billingPlan.BILLING_PLAN[selectedPlan]['ADMIN_ALL'];
                        // let current_count = await userConnection.find({}).countDocuments();
                        // console.log("count: ", current_count, allowed_count, ">=", current_count >= allowed_count);
                        // if (current_count >= allowed_count) {
                        //     res.send({ message: translator.getStr('UserLimitExceed'), status: false });
                        // } else {
                        const file_data = fs.readFileSync(config.EMAIL_TEMPLATE_PATH + '/controller/emailtemplates/invitationuser.html', 'utf8');
                        let add_user = new userConnection(body);
                        history_object = body;

                        let add = await add_user.save();
                        if (add) {
                            var comanyUserObj = {
                                user_id: add._id,
                                useremail: add.useremail,
                                password: add.password,
                                userstatus: add.userstatus,
                                is_delete: add.is_delete,
                            };
                            let update_company = await companyConnection.updateOne({ _id: ObjectID(company_data._id) }, { $push: { invoice_user: comanyUserObj } });

                            if (body.allow_for_projects) {
                                //await addUserAsAllProjectsWorker(add._id, decodedToken);
                            }
                            history_object.inserted_id = add._id;
                            let emailTmp = {
                                HELP: `${translator.getStr('EmailTemplateHelpEmailAt')} ${config.HELPEMAIL} ${translator.getStr('EmailTemplateCallSupportAt')} ${config.NUMBERPHONE}`,
                                SUPPORT: `${translator.getStr('EmailTemplateEmail')} ${config.SUPPORTEMAIL} l ${translator.getStr('EmailTemplatePhone')} ${config.NUMBERPHONE2}`,
                                ALL_RIGHTS_RESERVED: `${translator.getStr('EmailTemplateAllRightsReserved')}`,
                                THANKS: translator.getStr('EmailTemplateThanks'),
                                ROVUK_TEAM: translator.getStr('EmailTemplateRovukTeam'),
                                EMAILTITLE: `${translator.getStr('EmailInvitationUserTitle')} ${company_data.companyname} ${translator.getStr('EmailInvitationPortal')}`,
                                USERNAME: `${translator.getStr('EmailLoginHello')} ${body.username}`,
                                TEXT1: `${translator.getStr('EmailInvitationUserText1')}, ${company_data.companyname}.`,
                                TEXT2: translator.getStr('EmailInvitationUserText2'),
                                USEREMAIL: `${translator.getStr('EmailInvitationUserLoginEmail')} ${body.useremail}`,
                                USERPASSWORD: `${translator.getStr('EmailInvitationUserTemporaryPassword')} ${password_tmp}`,
                                COMPANYCODE: `${translator.getStr('EmailInvitationUserCompanyCode')} ${decodedToken.companycode}`,
                                DOWNLOAD_APP: translator.getStr('EmailInvitationUserDownloadApp'),
                                LOG_IN: translator.getStr('EmailInvitationLogIn'),
                                LOGIN_LINK: config.SITE_URL + "/login",
                                COPYRIGHTNAME: `${config.COPYRIGHTNAME}`,

                                COMPANYNAME: `${translator.getStr('EmailCompanyName')} ${company_data.companyname}`,
                                COMPANYCODE: `${translator.getStr('EmailCompanyCode')} ${company_data.companycode}`,
                            };
                            //translator.getStr('SomethingWrong')
                            var template = handlebars.compile(file_data);
                            var HtmlData = await template(emailTmp);
                            body._id = add._id;

                            // let qrcode_Object = config.SITE_URL + '/#/user-publicpage?_id=' + add._id + '&company_code=' + decodedToken.companycode;
                            // let admin_qrCode = await QRCODE.generate_QR_Code(qrcode_Object);
                            // let key_url = "employee/" + add._id + "/" + "QRCode.png";
                            // let LowerCase_bucket = decodedToken.companycode.toLowerCase();
                            // let PARAMS = {
                            //     Bucket: LowerCase_bucket,
                            //     Key: key_url,
                            //     Body: admin_qrCode,
                            //     ACL: 'public-read-write'
                            // };
                            var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
                            let talnate_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_TENANTS, { companycode: decodedToken.companycode });
                            // bucketOpration.uploadFile(PARAMS, async function (err, resultUpload) {
                            //     if (err) {
                            //         res.send({ message: translator.getStr('SomethingWrong'), error: err, status: false });
                            //     } else {
                            //         userqrcode = config.wasabisys_url + "/" + LowerCase_bucket + "/" + key_url;
                            //         history_object.userqrcode = userqrcode;
                            history_object.usercostcode = usercostcode;
                            let updateuser = await userConnection.updateOne({ _id: ObjectID(add._id) }, { usercostcode: usercostcode });
                            if (updateuser) {
                                sendEmail.sendEmail_client(talnate_data.smartaccupay_tenants.tenant_smtp_username, body.useremail, "SmartAccuPay Registration", HtmlData,
                                    talnate_data.smartaccupay_tenants.tenant_smtp_server, talnate_data.smartaccupay_tenants.tenant_smtp_port, talnate_data.smartaccupay_tenants.tenant_smtp_reply_to_mail,
                                    talnate_data.smartaccupay_tenants.tenant_smtp_password, talnate_data.smartaccupay_tenants.tenant_smtp_timeout, talnate_data.smartaccupay_tenants.tenant_smtp_security);

                                recentActivity.saveRecentActivity({
                                    user_id: decodedToken.UserData._id,
                                    username: decodedToken.UserData.userfullname,
                                    userpicture: decodedToken.UserData.userpicture,
                                    data_id: add._id,
                                    title: add.userfullname,
                                    module: 'User',
                                    action: 'Insert',
                                    action_from: 'Web',
                                }, decodedToken);
                                let one_user = await userConnection.findOne({ _id: ObjectID(add._id) });
                                if (notFonud == 1) {
                                    var temp_path = newOpenFile[0].path;
                                    var file_name = newOpenFile[0].name;
                                    dirKeyName = config.INVOICE_WASABI_PATH + "/employee/profile_picture/" + file_name;
                                    var fileBody = fs.readFileSync(temp_path);
                                    params = { Bucket: LowerCase_bucket, Key: dirKeyName, Body: fileBody, ACL: 'public-read-write' };

                                    bucketOpration.uploadFile(params, async function (err, resultUpload) {
                                        if (err) {
                                            res.send({ message: translator.getStr('SomethingWrong'), error: err, status: false });
                                        } else {
                                            urlProfile = config.wasabisys_url + "/" + LowerCase_bucket + "/" + dirKeyName;
                                            let update_user = await userConnection.updateOne({ _id: add._id }, { userpicture: urlProfile });
                                            history_object.userpicture = urlProfile;
                                            if (body.usergender == "Male") {
                                                await userConnection.updateOne({ _id: ObjectID(add._id) }, { usermobile_picture: config.DEFAULT_MALE_PICTURE });
                                            } else if (body.usergender == "Female") {
                                                await userConnection.updateOne({ _id: ObjectID(add._id) }, { usermobile_picture: config.DEFAULT_FEMALE_PICTURE });
                                            }
                                            if (update_user) {
                                                addInsertHistory(add._id, body, decodedToken, translator, connection_db_api);
                                                //activityController.updateAllUser({ "api_setting.employee": true }, decodedToken);
                                                res.send({ message: translator.getStr('UserCreationEmail'), data: one_user, status: true });
                                            }
                                        }
                                    });
                                } else {
                                    if (body.usergender == "Male") {
                                        await userConnection.updateOne({ _id: ObjectID(add._id) }, { userpicture: config.DEFAULT_MALE_PICTURE, usermobile_picture: config.DEFAULT_MALE_PICTURE });
                                    } else if (body.usergender == "Female") {
                                        await userConnection.updateOne({ _id: ObjectID(add._id) }, { userpicture: config.DEFAULT_FEMALE_PICTURE, usermobile_picture: config.DEFAULT_FEMALE_PICTURE });
                                    }
                                    addInsertHistory(add._id, body, decodedToken, translator, connection_db_api);
                                    //activityController.updateAllUser({ "api_setting.employee": true }, decodedToken);
                                    res.send({ message: translator.getStr('UserAdded'), data: one_user, status: true });
                                }
                            }
                            //     }
                            // });
                        } else {
                            res.send({ message: translator.getStr('SomethingWrong'), status: false });
                        }
                        // }
                    }
                });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            //connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

async function addInsertHistory(id, requestObject, decodedToken, translator, connection_db_api) {
    delete requestObject.password;
    delete requestObject.userdevice_pin;
    delete requestObject.userpicture;
    delete requestObject.usermobile_picture;
    delete requestObject.usernon_exempt;
    delete requestObject.usermedicalBenifits;
    delete requestObject.useradditionalBenifits;
    delete requestObject.useris_password_temp;
    delete requestObject.userterm_conditions;
    delete requestObject.userweb_security_code;
    delete requestObject.userfirebase_token;
    delete requestObject.usersmalltool_firebase_token;
    delete requestObject.usercreated_at;
    delete requestObject.userupdated_at;
    delete requestObject.usercreated_by;
    delete requestObject.userupdated_by;
    delete requestObject.usercostcode;
    delete requestObject.userqrcode;
    delete requestObject.userfirebase_id;
    delete requestObject.card_no;
    delete requestObject.card_type;
    delete requestObject.is_delete;
    delete requestObject.api_setting;
    delete requestObject.show_id_card_on_qrcode_scan;
    delete requestObject.project_email_group;
    delete requestObject.compliance_officer;
    delete requestObject.vendors;
    delete requestObject.grid_firebase_token;
    delete requestObject.user_id_payroll_group;
    delete requestObject.user_payroll_rules;
    delete requestObject.userfulladdress;
    delete requestObject._id;
    delete requestObject.login_from;

    let roleCollection = connection_db_api.model(collectionConstant.INVOICE_ROLES, invoiceRoleSchema);
    let userCollection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
    let locationCollection = connection_db_api.model(collectionConstant.INVOICE_LOCATION, invoiceLocationSchema);
    let departmentCollection = connection_db_api.model(collectionConstant.DEPARTMENTS, departmentSchema);
    let jobTitleCollection = connection_db_api.model(collectionConstant.JOB_TITLE, jobTitleSchema);
    let jobTypeCollection = connection_db_api.model(collectionConstant.JOB_TYPE, jobTypeSchema);
    let languageCollection = connection_db_api.model(collectionConstant.LANGUAGE, languageSchema);

    // find difference of object 
    let insertedData = await common.setInsertedFieldHistory(requestObject);
    // Check for object id fields and if it changed then replace id with specific value
    let found_role = _.findIndex(insertedData, function (tmp_data) { return tmp_data.key == 'userroleId'; });
    if (found_role != -1) {
        let role = await roleCollection.findOne({ role_id: ObjectID(insertedData[found_role].value) });
        insertedData[found_role].value = role.role_name;
    }

    let found_manager = _.findIndex(insertedData, function (tmp_data) { return tmp_data.key == 'usermanager_id'; });
    if (found_manager != -1) {
        if (insertedData[found_manager].value != null && insertedData[found_manager].value != '' && insertedData[found_manager].value != undefined) {
            let user = await userCollection.findOne({ _id: ObjectID(insertedData[found_manager].value) });
            insertedData[found_manager].value = user.userfullname;
        } else {
            insertedData[found_manager].value = '';
        }
    }

    let found_supervisor = _.findIndex(insertedData, function (tmp_data) { return tmp_data.key == 'usersupervisor_id'; });
    if (found_supervisor != -1) {
        if (insertedData[found_supervisor].value != null && insertedData[found_supervisor].value != '' && insertedData[found_supervisor].value != undefined) {
            let user = await userCollection.findOne({ _id: ObjectID(insertedData[found_supervisor].value) });
            insertedData[found_supervisor].value = user.userfullname;
        } else {
            insertedData[found_supervisor].value = '';
        }
    }

    let found_location = _.findIndex(insertedData, function (tmp_data) { return tmp_data.key == 'userlocation_id'; });
    if (found_location != -1) {
        let location = await locationCollection.findOne({ _id: ObjectID(insertedData[found_location].value) });
        insertedData[found_location].value = location.location_name;
    }

    let found_job_title = _.findIndex(insertedData, function (tmp_data) { return tmp_data.key == 'userjob_title_id'; });
    if (found_job_title != -1) {
        let jobTitle = await jobTitleCollection.findOne({ _id: ObjectID(insertedData[found_job_title].value) });
        insertedData[found_job_title].value = jobTitle.job_title_name;
    }

    let found_department = _.findIndex(insertedData, function (tmp_data) { return tmp_data.key == 'userdepartment_id'; });
    if (found_department != -1) {
        let department = await departmentCollection.findOne({ _id: ObjectID(insertedData[found_department].value) });
        insertedData[found_department].value = department.department_name;
    }

    let found_job_type = _.findIndex(insertedData, function (tmp_data) { return tmp_data.key == 'userjob_type_id'; });
    if (found_job_type != -1) {
        let jobType = await jobTypeCollection.findOne({ _id: ObjectID(insertedData[found_job_type].value) });
        insertedData[found_job_type].value = jobType.job_type_name;
    }

    let found_language = _.findIndex(insertedData, function (tmp_data) { return tmp_data.key == 'user_languages'; });
    if (found_language != -1) {
        let tempId = [];
        if (insertedData[found_language].value) {
            insertedData[found_language].value.forEach((language) => {
                tempId.push(ObjectID(language));
            });
        }
        let tempLanaguges = [];
        let languages = await languageCollection.find({ _id: { $in: tempId } });
        if (languages) {
            languages.forEach((language) => {
                tempLanaguges.push(language.name);
            });
        }
        insertedData[found_language].value = tempLanaguges.join(", ");
    }

    let found_dob = _.findIndex(insertedData, function (tmp_data) { return tmp_data.key == 'userdob'; });
    if (found_dob != -1) {
        insertedData[found_dob].value = insertedData[found_dob].value.split("T")[0];
    }

    let found_start_date = _.findIndex(insertedData, function (tmp_data) { return tmp_data.key == 'userstartdate'; });
    if (found_start_date != -1) {
        insertedData[found_start_date].value = insertedData[found_start_date].value.split("T")[0];
    }

    let found_salary = _.findIndex(insertedData, function (tmp_data) { return tmp_data.key == 'usersalary'; });
    if (found_salary != -1) {
        insertedData[found_salary].value = common.amount_field(insertedData[found_salary].value);
    }

    let found_status = _.findIndex(insertedData, function (tmp_data) { return tmp_data.key == 'userstatus'; });
    if (found_status != -1) {
        insertedData[found_status].value = insertedData[found_status].value == 2 ? translator.getStr(`Inactive_Status`) : translator.getStr(`Active_Status`);
    }

    let found_allow_for_project = _.findIndex(insertedData, function (tmp_data) { return tmp_data.key == 'allow_for_projects'; });
    if (found_allow_for_project != -1) {
        insertedData[found_allow_for_project].value = insertedData[found_allow_for_project].value ? 'Yes' : 'No';
    }

    let found_id = _.findIndex(insertedData, function (tmp_data) { return tmp_data.key == '_id'; });
    if (found_id != -1) {
        insertedData.splice(found_id, 1);
    }

    for (let i = 0; i < insertedData.length; i++) {
        insertedData[i]['key'] = translator.getStr(`User_History.${insertedData[i]['key']}`);
    }
    let histioryObject = {
        data: insertedData,
        user_id: id,
    };
    addUSER_History("Insert", histioryObject, decodedToken);
}

async function addPersonalInfoHistory(id, requestObject, one_user, decodedToken, translator) {
    delete one_user._id;
    let connection_db_api = await db_connection.connection_db_api(decodedToken);
    let roleCollection = connection_db_api.model(collectionConstant.INVOICE_ROLES, invoiceRoleSchema);

    // find difference of object 
    let updatedData = await common.findUpdatedFieldHistory(requestObject, one_user);
    // console.log("requestObject", requestObject);
    // console.log("one_user", one_user);
    // console.log("updatedData", updatedData);
    // Check for object id fields and if it changed then replace id with specific value
    let found_role = _.findIndex(updatedData, function (tmp_data) { return tmp_data.key == 'userroleId'; });
    if (found_role != -1) {
        let role = await roleCollection.findOne({ role_id: ObjectID(updatedData[found_role].value) });
        updatedData[found_role].value = role.role_name;
    }

    let found_allow_for_project = _.findIndex(updatedData, function (tmp_data) { return tmp_data.key == 'allow_for_projects'; });
    if (found_allow_for_project != -1) {
        updatedData[found_allow_for_project].value = updatedData[found_allow_for_project].value ? 'Yes' : 'No';
    }

    let found_status = _.findIndex(updatedData, function (tmp_data) { return tmp_data.key == 'userstatus'; });
    if (found_status != -1) {
        updatedData[found_status].value = updatedData[found_status].value == 2 ? translator.getStr(`Inactive_Status`) : translator.getStr(`Active_Status`);
    }

    for (let i = 0; i < updatedData.length; i++) {
        updatedData[i]['key'] = translator.getStr(`User_History.${updatedData[i]['key']}`);
    }
    let histioryObject = {
        data: updatedData,
        user_id: id,
    };
    addUSER_History("Update", histioryObject, decodedToken);
}

module.exports.tempAddUserAsProjectProjectWorker = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        let projectCollection = connection_db_api.model(collectionConstant.PROJECT, projectSchema);
        let get_all_projects = await projectCollection.aggregate([
            {
                $match:
                {
                    is_delete: 0,
                    project_status: "Active",
                },
            },
            {
                $lookup: {
                    from: collectionConstant.PROJECT_SETTINGS,
                    localField: "_id",
                    foreignField: "project_id",
                    as: "project"
                }
            },
            {
                $project:
                {
                    _id: 1,
                    project_settings: { $arrayElemAt: ["$project.settings.workers", 0] }
                }
            },
        ]);
        let projectSettingCollection = connection_db_api.model(collectionConstant.PROJECT_SETTINGS, projectSettingsSchema);
        let userId = '6204959c21fd0bfd9521cbf4';
        for (let i = 0; i < get_all_projects.length; i++) {
            let temp_worker = get_all_projects[i]['project_settings'];
            temp_worker.push(ObjectID(userId));
            let project_worker = { 'settings.workers': temp_worker };
            let updateSettingObject = await projectSettingCollection.updateOne({ project_id: ObjectID(get_all_projects[i]['_id']) }, { $set: project_worker });
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.saveUserDocument = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {

            let userDocumentConnection = connection_db_api.model(collectionConstant.INVOICE_USER_DOCUMENT, userDocumentSchema);
            var form = new formidable.IncomingForm();
            var fields = [];
            var notFonud = 0;
            var newOpenFile;
            var fileName;
            form.parse(req)
                .on('file', function (name, file) {
                    notFonud = 1;
                    fileName = file;
                })
                .on('field', function (name, field) {

                    fields[name] = field;
                })
                .on('error', function (err) {
                    throw err;
                }).on('end', async function () {
                    newOpenFile = this.openedFiles;
                    if (notFonud == 1) {
                        var body = JSON.parse(fields.reqObject);

                        let LowerCase_bucket = decodedToken.companycode.toLowerCase();
                        body.userdocument_created_by = decodedToken.UserData._id;
                        body.userdocument_updated_by = decodedToken.UserData._id;
                        body.userdocument_created_at = Math.round(new Date().getTime() / 1000);
                        body.userdocument_updated_at = Math.round(new Date().getTime() / 1000);
                        body.userdocument_user_id = fields.user_id;
                        body.show_on_qrcode_scan = fields.show_on_qrcode_scan == "true" || fields.show_on_qrcode_scan == true ? true : false;
                        var temp_path = newOpenFile[0].path;
                        var file_name = newOpenFile[0].name;
                        let date = moment().format('D_MMM_YYYY_hh_mm_ss_SSS_A');
                        let array_name = newOpenFile[0].name.split(".");
                        var file_name_ext = array_name[array_name.length - 1];
                        //var file_name_ext = newOpenFile[0].name.split(".")[1];
                        var file_name = attachmentLocations.USER_DOCUMENT + "_" + date + "." + file_name_ext;
                        dirKeyName = config.INVOICE_WASABI_PATH + "/employee/" + fields.user_id + "/document/" + file_name;
                        var fileBody = fs.readFileSync(temp_path);
                        params = { Bucket: LowerCase_bucket, Key: dirKeyName, Body: fileBody, ACL: 'public-read-write' };
                        bucketOpration.uploadFile(params, async function (err, resultUpload) {
                            if (err) {
                                res.send({ message: translator.getStr('SomethingWrong'), error: err, status: false });
                            } else {
                                urlProfile = config.wasabisys_url + "/" + LowerCase_bucket + "/" + dirKeyName;
                                body.userdocument_url = urlProfile;
                                let add_user = new userDocumentConnection(body);
                                let user_add = await add_user.save();
                                if (user_add) {
                                    addUserDocumentHistory("Insert", body, decodedToken);
                                    //activityController.updateAllUser({ "api_setting.employee": true }, decodedToken);
                                    res.send({ message: translator.getStr('UserDocumentAdded'), status: true });
                                } else {
                                    res.send({ message: translator.getStr('NoDataWithId'), status: false });
                                }
                            }
                        });
                    } else {
                        res.send({ message: translator.getStr('UserDocumentNotFound'), status: false });
                    }
                });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            //connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.getAllUser = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {

            let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            let match = {};

            if (decodedToken.UserData.role_name == "Employee") {
                match = {
                    is_delete: 0,
                    _id: ObjectID(decodedToken.UserData._id),
                };
            } else {
                match = {
                    is_delete: 0
                };
            }
            let user_by_id = await userConnection.aggregate([
                {
                    $match: match,
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_ROLES,
                        localField: "userroleId",
                        foreignField: "role_id",
                        as: "role"
                    }
                },
                /*  {
                     $unwind: {
                         path: "$role",
                         preserveNullAndEmptyArrays: true
                     },
                 }, */
                {
                    $lookup: {
                        from: collectionConstant.JOB_TITLE,
                        localField: "userjob_title_id",
                        foreignField: "_id",
                        as: "jobtitle"
                    }
                },
                /*   {
                      $unwind: {
                          path: "$jobtitle",
                          preserveNullAndEmptyArrays: true
                      },
                  }, */
                {
                    $lookup: {
                        from: collectionConstant.DEPARTMENTS,
                        localField: "userdepartment_id",
                        foreignField: "_id",
                        as: "department"
                    }
                },
                /*  {
                     $unwind: {
                         path: "$department",
                         preserveNullAndEmptyArrays: true
                     },
                 }, */
                {
                    $lookup: {
                        from: collectionConstant.PAYROLL_GROUP,
                        localField: "user_id_payroll_group",
                        foreignField: "_id",
                        as: "payrollgroup"
                    }
                },
                /*  {
                     $unwind: {
                         path: "$payrollgroup",
                         preserveNullAndEmptyArrays: true
                     },
                 }, */
                {
                    $lookup: {
                        from: collectionConstant.JOB_TYPE,
                        localField: "userjob_type_id",
                        foreignField: "_id",
                        as: "jobtype"
                    }
                },
                // {
                //     $unwind: {
                //         path:"$jobtype",
                //         preserveNullAndEmptyArrays: true
                //     },
                // },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "usersupervisor_id",
                        foreignField: "_id",
                        as: "supervisor"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.LOCATIONS,
                        localField: "userlocation_id",
                        foreignField: "_id",
                        as: "location"
                    }
                },
                // {
                //     $unwind: {
                //         path:"$location",
                //         preserveNullAndEmptyArrays: true
                //     },
                // },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "usermanager_id",
                        foreignField: "_id",
                        as: "manager"
                    }
                },
                {
                    $lookup: {
                        from: "costcodes",
                        localField: "usercostcode",
                        foreignField: "_id",
                        as: "costcode"
                    }
                },
                {
                    $project: {
                        role_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$role.role_name" },
                                        {
                                            $arrayElemAt: ["$role.role_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        supervisor_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$supervisor.userfullname" },
                                        {
                                            $arrayElemAt: ["$supervisor.userfullname", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        manager_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$manager.userfullname" },
                                        {
                                            $arrayElemAt: ["$manager.userfullname", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        location_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$location.location_name" },
                                        {
                                            $arrayElemAt: ["$location.location_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        userjob_type_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$jobtype.job_type_name" },
                                        {
                                            $arrayElemAt: ["$jobtype.job_type_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        userjob_title_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$jobtitle.job_title_name" },
                                        {
                                            $arrayElemAt: ["$jobtitle.job_title_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        department_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$department.department_name" },
                                        {
                                            $arrayElemAt: ["$department.department_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        user_payroll_group_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$payrollgroup.payroll_group_name" },
                                        {
                                            $arrayElemAt: ["$payrollgroup.payroll_group_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },  /* role_name: "$role.role_name",
                        supervisor_name: { $ifNull: [{ $arrayElemAt: ["$supervisor.userfullname", 0] }, ""] },
                        manager_name: { $ifNull: [{ $arrayElemAt: ["$manager.userfullname", 0] }, ""] },
                        location_name: { $ifNull: [{ $arrayElemAt: ["$location.location_name", 0] }, ""] },
                        userjob_type_name: { $ifNull: [{ $arrayElemAt: ["$jobtype.job_type_name", 0] }, ""] },
                        userjob_title_name: { $ifNull: ["$jobtitle.job_title_name", ""] },
                        department_name: { $ifNull: ["$department.department_name", ""] },
                        user_payroll_group_name: { $ifNull: ["$payrollgroup.payroll_group_name", 0]  }, */
                        userroleId: 1,
                        useremail: 1,
                        username: 1,
                        usermiddlename: 1,
                        userlastname: 1,
                        userfullname: 1,
                        userssn: 1,
                        userdevice_pin: 1,
                        userphone: 1,
                        usersecondary_email: 1,
                        usergender: 1,
                        userdob: 1,
                        userstatus: 1,
                        userpicture: 1,
                        usermobile_picture: 1,
                        userfulladdress: 1,
                        userstreet1: 1,
                        userstreet2: 1,
                        usercity: 1,
                        user_state: 1,
                        userzipcode: 1,
                        usercountry: 1,
                        userstartdate: 1,
                        usersalary: 1,
                        usermanager_id: 1,
                        usersupervisor_id: 1,
                        userlocation_id: 1,
                        userjob_title_id: 1,
                        userdepartment_id: 1,
                        userjob_type_id: 1,
                        usernon_exempt: 1,
                        usermedicalBenifits: 1,
                        useradditionalBenifits: 1,
                        useris_password_temp: 1,
                        userterm_conditions: 1,
                        userweb_security_code: 1,
                        user_payroll_rules: 1,
                        user_id_payroll_group: 1,
                        usercostcode: 1,
                        costcode: { $ifNull: [{ $arrayElemAt: ["$costcode.value", 0] }, ""] },
                        userqrcode: 1,
                        userfirebase_id: 1,
                        user_no: 1,
                        card_no: 1,
                        card_type: 1,
                        is_first: 1,
                        allow_for_projects: 1,
                        user_languages: 1,
                        compliance_officer: 1,
                    }
                },
                {
                    $sort: { 'userstartdate': -1 }
                }
            ]);
            var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
            let company_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: decodedToken.companycode });
            let checkManagement = _.find(company_data.otherstool, function (n) { return n.key == config.MANAGEMENT_KEY; });
            let isManagement = false;
            if (checkManagement) {
                isManagement = true;
            }
            res.send({ data: user_by_id, is_management: isManagement, message: translator.getStr('UserListing'), status: true });
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

module.exports.getOneUser = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {

            let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            //let user_by_id = await userConnection.findOne({ _id: ObjectID(req.body._id) });
            let user_by_id = await userConnection.aggregate([
                {
                    $match:
                    {
                        _id: ObjectID(req.body._id)
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_ROLES,
                        localField: "userroleId",
                        foreignField: "role_id",
                        as: "role"
                    }
                },
                /*  {
                     $unwind: {
                         path: "$role",
                         preserveNullAndEmptyArrays: true
                     },
                 }, */
                {
                    $lookup: {
                        from: collectionConstant.JOB_TITLE,
                        localField: "userjob_title_id",
                        foreignField: "_id",
                        as: "jobtitle"
                    }
                },
                /*   {
                      $unwind: {
                          path: "$jobtitle",
                          preserveNullAndEmptyArrays: true
                      },
                  }, */
                {
                    $lookup: {
                        from: collectionConstant.DEPARTMENTS,
                        localField: "userdepartment_id",
                        foreignField: "_id",
                        as: "department"
                    }
                },
                /*  {
                     $unwind: {
                         path: "$department",
                         preserveNullAndEmptyArrays: true
                     },
                 }, */
                {
                    $lookup: {
                        from: collectionConstant.PAYROLL_GROUP,
                        localField: "user_id_payroll_group",
                        foreignField: "_id",
                        as: "payrollgroup"
                    }
                },
                /*  {
                     $unwind: {
                         path: "$payrollgroup",
                         preserveNullAndEmptyArrays: true
                     },
                 }, */
                {
                    $lookup: {
                        from: collectionConstant.JOB_TYPE,
                        localField: "userjob_type_id",
                        foreignField: "_id",
                        as: "jobtype"
                    }
                },
                // {
                //     $unwind: {
                //         path:"$jobtype",
                //         preserveNullAndEmptyArrays: true
                //     },
                // },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "usersupervisor_id",
                        foreignField: "_id",
                        as: "supervisor"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.LOCATIONS,
                        localField: "userlocation_id",
                        foreignField: "_id",
                        as: "location"
                    }
                },
                // {
                //     $unwind: {
                //         path:"$location",
                //         preserveNullAndEmptyArrays: true
                //     },
                // },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "usermanager_id",
                        foreignField: "_id",
                        as: "manager"
                    }
                },
                {
                    $lookup: {
                        from: "costcodes",
                        localField: "usercostcode",
                        foreignField: "_id",
                        as: "costcode"
                    }
                },
                {
                    $project: {
                        role_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$role.role_name" },
                                        {
                                            $arrayElemAt: ["$role.role_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        supervisor_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$supervisor.userfullname" },
                                        {
                                            $arrayElemAt: ["$supervisor.userfullname", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        manager_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$manager.userfullname" },
                                        {
                                            $arrayElemAt: ["$manager.userfullname", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        location_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$location.location_name" },
                                        {
                                            $arrayElemAt: ["$location.location_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        userjob_type_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$jobtype.job_type_name" },
                                        {
                                            $arrayElemAt: ["$jobtype.job_type_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        userjob_title_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$jobtitle.job_title_name" },
                                        {
                                            $arrayElemAt: ["$jobtitle.job_title_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        department_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$department.department_name" },
                                        {
                                            $arrayElemAt: ["$department.department_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        user_payroll_group_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$payrollgroup.payroll_group_name" },
                                        {
                                            $arrayElemAt: ["$payrollgroup.payroll_group_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },  /* role_name: "$role.role_name",
                        supervisor_name: { $ifNull: [{ $arrayElemAt: ["$supervisor.userfullname", 0] }, ""] },
                        manager_name: { $ifNull: [{ $arrayElemAt: ["$manager.userfullname", 0] }, ""] },
                        location_name: { $ifNull: [{ $arrayElemAt: ["$location.location_name", 0] }, ""] },
                        userjob_type_name: { $ifNull: [{ $arrayElemAt: ["$jobtype.job_type_name", 0] }, ""] },
                        userjob_title_name: { $ifNull: ["$jobtitle.job_title_name", ""] },
                        department_name: { $ifNull: ["$department.department_name", ""] },
                        user_payroll_group_name: { $ifNull: ["$payrollgroup.payroll_group_name", 0]  }, */
                        userroleId: 1,
                        useremail: 1,
                        username: 1,
                        usermiddlename: 1,
                        userlastname: 1,
                        userfullname: 1,
                        userssn: 1,
                        userdevice_pin: 1,
                        userphone: 1,
                        usersecondary_email: 1,
                        usergender: 1,
                        userdob: 1,
                        userstatus: 1,
                        userpicture: 1,
                        usermobile_picture: 1,
                        userfulladdress: 1,
                        userstreet1: 1,
                        userstreet2: 1,
                        usercity: 1,
                        user_state: 1,
                        userzipcode: 1,
                        usercountry: 1,
                        userstartdate: 1,
                        usersalary: 1,
                        usermanager_id: 1,
                        usersupervisor_id: 1,
                        userlocation_id: 1,
                        userjob_title_id: 1,
                        userdepartment_id: 1,
                        userjob_type_id: 1,
                        usernon_exempt: 1,
                        usermedicalBenifits: 1,
                        useradditionalBenifits: 1,
                        useris_password_temp: 1,
                        userterm_conditions: 1,
                        userweb_security_code: 1,
                        user_payroll_rules: 1,
                        user_id_payroll_group: 1,
                        usercostcode: 1,
                        costcode: { $ifNull: [{ $arrayElemAt: ["$costcode.value", 0] }, ""] },
                        userqrcode: 1,
                        userfirebase_id: 1,
                        user_no: 1,
                        card_no: 1,
                        card_type: 1,
                        login_from: 1,
                        is_first: 1,
                        allow_for_projects: 1,
                        user_languages: 1,
                        show_id_card_on_qrcode_scan: 1,
                        project_email_group: 1,
                        compliance_officer: 1,
                        vendors: 1,
                        is_delete: 1,
                    }
                }
            ]);
            res.send({ data: user_by_id[0], message: translator.getStr('SingleUser'), status: true });
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

module.exports.updateShowIDCardFlag = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;

            let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            requestObject.userupdated_at = Math.round(new Date().getTime() / 1000);
            requestObject.userupdated_by = decodedToken.UserData._id;
            let update_user = await userConnection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
            if (update_user) {
                res.send({ message: translator.getStr('UserProfileUpdated'), data: update_user, status: true });
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

module.exports.savePersonalInfo = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let admin_connection_db_api = await db_connection.connection_db_api(config.ADMIN_CONFIG);
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let history_object;
            let companyConnection = admin_connection_db_api.model(collectionConstant.SUPER_ADMIN_COMPANY, companySchema);
            let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);

            let company_data = await companyConnection.findOne({ companycode: decodedToken.companycode });

            var form = new formidable.IncomingForm();
            var fields = [];
            var notFonud = 0;
            var newOpenFile;
            var fileName;
            form.parse(req)
                .on('file', function (name, file) {
                    notFonud = 1;
                    fileName = file;
                })
                .on('field', function (name, field) {
                    fields[name] = field;
                })
                .on('error', function (err) {
                    throw err;
                }).on('end', async function () {
                    if (fields._id) {
                        newOpenFile = this.openedFiles;
                        var body = JSON.parse(fields.reqObject);
                        body.useremail = body.useremail.toLowerCase();
                        jobtitle = body.jobtitle_name;
                        department = body.department_name;
                        costcode = body.costcode_name;
                        body.allow_for_projects = body.allow_for_projects == "true" || body.allow_for_projects == true ? true : false;

                        delete body['jobtitle_name'];
                        delete body['department_name'];
                        delete body['costcode_name'];
                        delete body._id;
                        let user_edit_id = fields._id;
                        delete fields._id;

                        let temp_vendors = [];
                        let tempVendor = body.vendors;
                        if (tempVendor) {
                            for (let i = 0; i < tempVendor.length; i++) {
                                temp_vendors.push(ObjectID(tempVendor[i]));
                            }
                        }
                        body.vendors = temp_vendors;

                        body.userupdated_by = decodedToken.UserData._id;
                        if (body.password) {
                            body.password = common.generateHash(body.password);
                        }
                        let one_user = await userConnection.findOne({ _id: ObjectID(user_edit_id) }, { userroleId: 1, useremail: 1, username: 1, usermiddlename: 1, userlastname: 1, userfullname: 1, userssn: 1, usergender: 1, userdob1: 1, userstatus: 1, user_no: 1, allow_for_projects: 1, });
                        let get_user = await userConnection.findOne({ _id: ObjectID(user_edit_id) });
                        let checkEmailExist = await userConnection.findOne({ useremail: body.useremail });
                        let flg_update = false;
                        if (checkEmailExist) {
                            if (checkEmailExist._id == user_edit_id) {
                                let update_user_1 = await userConnection.updateOne({ _id: ObjectID(user_edit_id) }, body);
                                flg_update = true;
                            } else {
                                res.send({ message: translator.getStr('EmailAlreadyExists'), status: false });
                                return;
                            }
                        } else {
                            let update_user_1 = await userConnection.updateOne({ _id: ObjectID(user_edit_id) }, body);
                            flg_update = true;
                        }
                        if (body.password) {
                            companyUserObj = {
                                'invoice_user.useremail': body.useremail,
                                'invoice_user.password': body.password,
                                'invoice_user.userstatus': body.userstatus,
                            };
                        } else {
                            companyUserObj = {
                                'invoice_user.$.useremail': body.useremail,
                                'invoice_user.$.userstatus': body.userstatus,
                            };
                        }
                        let update_invoice_user = await companyConnection.updateOne({ _id: ObjectID(company_data._id), 'invoice_user.user_id': ObjectID(user_edit_id) }, { $set: companyUserObj });
                        history_object = body;
                        history_object.updated_id = user_edit_id;
                        if (flg_update) {
                            let LowerCase_bucket = decodedToken.companycode.toLowerCase();

                            let tempReqObj = {
                                userroleId: ObjectID(body.userroleId),
                                useremail: body.useremail,
                                username: body.username,
                                usermiddlename: body.usermiddlename,
                                userlastname: body.userlastname,
                                userfullname: body.userfullname,
                                userssn: body.userssn,
                                usergender: body.usergender,
                                userdob1: body.userdob1,
                                userstatus: body.userstatus,
                                user_no: body.user_no,
                                allow_for_projects: body.allow_for_projects,
                            };
                            recentActivity.saveRecentActivity({
                                user_id: decodedToken.UserData._id,
                                username: decodedToken.UserData.userfullname,
                                userpicture: decodedToken.UserData.userpicture,
                                data_id: user_edit_id,
                                title: body.userfullname,
                                module: 'User',
                                action: 'Update',
                                action_from: 'Web',
                            }, decodedToken);
                            if (notFonud == 1) {
                                var temp_path = newOpenFile[0].path;
                                var file_name = newOpenFile[0].name;
                                let extension = file_name.split(".")[1];
                                dirKeyName = config.INVOICE_WASABI_PATH + "/employee/" + user_edit_id + "/" + attachmentLocations.PROFILE_PICTURE + "/user_picture." + extension;
                                var fileBody = fs.readFileSync(temp_path);
                                params = { Bucket: LowerCase_bucket, Key: dirKeyName, Body: fileBody, ACL: 'public-read-write' };
                                //condition
                                if (get_user.userpicture != undefined && get_user.userpicture != "") {
                                    tmp_picArray = get_user.userpicture.split("/");
                                    last_picarray = tmp_picArray.splice(0, 4);

                                    let params_delete_pic = {
                                        Bucket: last_picarray[last_picarray.length - 1],
                                        Key: tmp_picArray.join("/")
                                    };
                                }
                                bucketOpration.uploadFile(params, async function (err, resultUpload) {
                                    if (err) {
                                        res.send({ message: translator.getStr('SomethingWrong'), error: err, status: false });
                                    } else {
                                        urlProfile = config.wasabisys_url + "/" + LowerCase_bucket + "/" + dirKeyName;
                                        history_object.userpicture = urlProfile;
                                        let update_user = await userConnection.updateOne({ _id: ObjectID(user_edit_id) }, { userpicture: urlProfile });
                                        if (update_user) {
                                            if (body.usergender == "Male") {
                                                if (get_user.usermobile_picture == undefined || get_user.usermobile_picture == null || get_user.usermobile_picture == '') {
                                                    await userConnection.updateOne({ _id: ObjectID(user_edit_id) }, { usermobile_picture: config.DEFAULT_MALE_PICTURE });
                                                }
                                            } else if (body.usergender == "Female") {
                                                if (get_user.usermobile_picture == undefined || get_user.usermobile_picture == null || get_user.usermobile_picture == '') {
                                                    await userConnection.updateOne({ _id: ObjectID(user_edit_id) }, { usermobile_picture: config.DEFAULT_FEMALE_PICTURE });
                                                }
                                            }
                                            addPersonalInfoHistory(user_edit_id, tempReqObj, one_user._doc, decodedToken, translator);
                                            res.send({ message: translator.getStr('UserUpdated'), data: body, status: true });
                                        }
                                    }
                                });
                            } else {
                                if (body.usergender == "Male") {
                                    if (get_user.userpicture == undefined || get_user.userpicture == null || get_user.userpicture == '') {
                                        await userConnection.updateOne({ _id: ObjectID(user_edit_id) }, { userpicture: config.DEFAULT_MALE_PICTURE });
                                    }
                                    if (get_user.usermobile_picture == undefined || get_user.usermobile_picture == null || get_user.usermobile_picture == '') {
                                        await userConnection.updateOne({ _id: ObjectID(user_edit_id) }, { usermobile_picture: config.DEFAULT_MALE_PICTURE });
                                    }
                                } else if (body.usergender == "Female") {
                                    if (get_user.userpicture == undefined || get_user.userpicture == null || get_user.userpicture == '') {
                                        await userConnection.updateOne({ _id: ObjectID(user_edit_id) }, { userpicture: config.DEFAULT_FEMALE_PICTURE });
                                    }
                                    if (get_user.usermobile_picture == undefined || get_user.usermobile_picture == null || get_user.usermobile_picture == '') {
                                        await userConnection.updateOne({ _id: ObjectID(user_edit_id) }, { usermobile_picture: config.DEFAULT_FEMALE_PICTURE });
                                    }
                                }
                                addPersonalInfoHistory(user_edit_id, tempReqObj, one_user._doc, decodedToken, translator);
                                res.send({ message: translator.getStr('UserUpdated'), data: body, status: true });
                            }
                        } else {
                            res.send({ message: translator.getStr('SomethingWrong'), status: false });
                        }
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

module.exports.saveMobilePhoto = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {

            let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            var form = new formidable.IncomingForm();
            var fields = [];
            var notFonud = 0;
            var newOpenFile;
            var fileName;
            form.parse(req)
                .on('file', function (name, file) {
                    notFonud = 1;
                    fileName = file;
                })
                .on('field', function (name, field) {
                    // console.log(name, field);
                    fields[name] = field;
                })
                .on('error', function (err) {
                    throw err;
                }).on('end', async function () {
                    let LowerCase_bucket = decodedToken.companycode.toLowerCase();
                    let user_edit_id = fields._id;
                    let one_user = await userConnection.findOne({ _id: ObjectID(user_edit_id) });

                    if (notFonud == 1) {
                        newOpenFile = this.openedFiles;
                        var temp_path = newOpenFile[0].path;
                        var file_name = newOpenFile[0].name;
                        let extension = file_name.split(".")[1];
                        dirKeyName = config.INVOICE_WASABI_PATH + "/employee/" + user_edit_id + "/" + attachmentLocations.PROFILE_PICTURE + "/mobile_picture." + extension;
                        var fileBody = fs.readFileSync(temp_path);
                        params = { Bucket: LowerCase_bucket, Key: dirKeyName, Body: fileBody, ACL: 'public-read-write' };
                        if (one_user.usermobile_picture != undefined && one_user.usermobile_picture != "") {
                            tmp_picArray = one_user.usermobile_picture.split("/");
                            last_picarray = tmp_picArray.splice(0, 4);
                            // console.log(tmp_picArray.join("/"));
                            let params_delete_pic = {
                                Bucket: last_picarray[last_picarray.length - 1],
                                Key: tmp_picArray.join("/")
                            };
                            /*  bucketOpration.deleteObject(params_delete_pic, function (err, resultUpload) {
                                 // console.log(err, resultUpload);
                             }); */
                        }
                        bucketOpration.uploadFile(params, async function (err, resultUpload) {
                            if (err) {
                                res.send({ message: translator.getStr('SomethingWrong'), error: err, status: false });
                            } else {
                                // console.log(resultUpload);
                                urlProfile = config.wasabisys_url + "/" + LowerCase_bucket + "/" + dirKeyName;
                                let update_user = await userConnection.updateOne({ _id: ObjectID(user_edit_id) }, { usermobile_picture: urlProfile });
                                // console.log(update_user);
                                if (update_user) {
                                    res.send({ message: translator.getStr('UserUpdated'), status: true });
                                }
                            }
                        });
                    } else {
                        res.send({ message: translator.getStr('UserUpdated'), status: true });
                    }
                });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            // connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.saveContactInfo = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {

            let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            let _id = req.body._id;
            delete req.body["_id"];
            let body = req.body;
            let get_user = await userConnection.findOne({ _id: ObjectID(_id) });
            let updateuser = await userConnection.updateOne({ _id: ObjectID(_id) }, body);
            if (updateuser) {
                body.updated_id = _id;
                addUSER_History("Update", body, decodedToken);
                recentActivity.saveRecentActivity({
                    user_id: decodedToken.UserData._id,
                    username: decodedToken.UserData.userfullname,
                    userpicture: decodedToken.UserData.userpicture,
                    data_id: _id,
                    title: get_user.userfullname,
                    module: 'User',
                    action: 'Update',
                    action_from: 'Web',
                }, decodedToken);
                //activityController.updateAllUser({ "api_setting.employee": true }, decodedToken);
                res.send({ message: translator.getStr('ContactInfoUpdated'), status: true });
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

module.exports.saveEmployeeInfo = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            let _id = req.body._id;
            delete req.body["_id"];
            if (req.body.usercostcode != "") {
                req.body.usercostcode = ObjectID(req.body.usercostcode);
            }
            if (req.body.usermanager_id != "") {
                req.body.usermanager_id = ObjectID(req.body.usermanager_id);
            }
            if (req.body.usersupervisor_id != "") {
                req.body.usersupervisor_id = ObjectID(req.body.usersupervisor_id);
            }
            if (req.body.userlocation_id != "") {
                req.body.userlocation_id = ObjectID(req.body.userlocation_id);
            }
            if (req.body.userjob_title_id != "") {
                req.body.userjob_title_id = ObjectID(req.body.userjob_title_id);
            }
            if (req.body.userdepartment_id != "") {
                req.body.userdepartment_id = ObjectID(req.body.userdepartment_id);
            }
            if (req.body.userjob_type_id != "") {
                req.body.userjob_type_id = ObjectID(req.body.userjob_type_id);
            }
            let body = req.body;

            jobtitle = body.jobtitle_name;
            department = body.department_name,
                costcode = body.costcode_name;
            role_name = body.role_name;

            delete body['jobtitle_name'];
            delete body['department_name'];
            delete body['costcode_name'];
            delete body['role_name'];
            let tempLang = body.user_languages;
            // console.log("iddd: ", body.user_languages, tempLang);
            let temp_user_languages = [];
            for (let i = 0; i < tempLang.length; i++) {
                temp_user_languages.push(ObjectID(tempLang[i]));
            }
            body.user_languages = temp_user_languages;
            let get_user = await userConnection.findOne({ _id: ObjectID(_id) });
            let one_user = await userConnection.findOne({ _id: ObjectID(_id) }, { usersalary: 1, userstartdate: 1, usermanager_id: 1, usersupervisor_id: 1, userlocation_id: 1, userjob_title_id: 1, userdepartment_id: 1, userjob_type_id: 1, user_languages: 1 });
            let updateuser = await userConnection.updateOne({ _id: ObjectID(_id) }, body);
            if (updateuser) {
                delete body['card_no'];
                delete body['card_type'];
                delete body['user_id_payroll_group'];
                delete body['user_payroll_rules'];
                delete body['usercostcode'];
                delete body['userqrcode'];
                delete body['userfullname'];
                body.usersalary = Number(body.usersalary);

                let userCollection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
                let locationCollection = connection_db_api.model(collectionConstant.INVOICE_LOCATION, invoiceLocationSchema);
                let departmentCollection = connection_db_api.model(collectionConstant.DEPARTMENTS, departmentSchema);
                let jobTitleCollection = connection_db_api.model(collectionConstant.JOB_TITLE, jobTitleSchema);
                let jobTypeCollection = connection_db_api.model(collectionConstant.JOB_TYPE, jobTypeSchema);
                let languageCollection = connection_db_api.model(collectionConstant.LANGUAGE, languageSchema);

                // find difference of object 
                let updatedData = await common.findUpdatedFieldHistory(body, one_user._doc);
                // Check for object id fields and if it changed then replace id with specific value
                let found_manager = _.findIndex(updatedData, function (tmp_data) { return tmp_data.key == 'usermanager_id'; });
                if (found_manager != -1) {
                    if (updatedData[found_manager].value != null && updatedData[found_manager].value != '' && updatedData[found_manager].value != undefined) {
                        let user = await userCollection.findOne({ _id: ObjectID(updatedData[found_manager].value) });
                        updatedData[found_manager].value = user.userfullname;
                    } else {
                        updatedData[found_manager].value = '';
                    }
                }

                let found_supervisor = _.findIndex(updatedData, function (tmp_data) { return tmp_data.key == 'usersupervisor_id'; });
                if (found_supervisor != -1) {
                    if (updatedData[found_supervisor].value != null && updatedData[found_supervisor].value != '' && updatedData[found_supervisor].value != undefined) {
                        let user = await userCollection.findOne({ _id: ObjectID(updatedData[found_supervisor].value) });
                        updatedData[found_supervisor].value = user.userfullname;
                    } else {
                        updatedData[found_supervisor].value = '';
                    }
                }

                let found_location = _.findIndex(updatedData, function (tmp_data) { return tmp_data.key == 'userlocation_id'; });
                if (found_location != -1) {
                    let location = await locationCollection.findOne({ _id: ObjectID(updatedData[found_location].value) });
                    updatedData[found_location].value = location.location_name;
                }

                let found_job_title = _.findIndex(updatedData, function (tmp_data) { return tmp_data.key == 'userjob_title_id'; });
                if (found_job_title != -1) {
                    let jobTitle = await jobTitleCollection.findOne({ _id: ObjectID(updatedData[found_job_title].value) });
                    updatedData[found_job_title].value = jobTitle.job_title_name;
                }

                let found_department = _.findIndex(updatedData, function (tmp_data) { return tmp_data.key == 'userdepartment_id'; });
                if (found_department != -1) {
                    let department = await departmentCollection.findOne({ _id: ObjectID(updatedData[found_department].value) });
                    updatedData[found_department].value = department.department_name;
                }

                let found_job_type = _.findIndex(updatedData, function (tmp_data) { return tmp_data.key == 'userjob_type_id'; });
                if (found_job_type != -1) {
                    let jobType = await jobTypeCollection.findOne({ _id: ObjectID(updatedData[found_job_type].value) });
                    updatedData[found_job_type].value = jobType.job_type_name;
                }

                let found_language = _.findIndex(updatedData, function (tmp_data) { return tmp_data.key == 'user_languages'; });
                if (found_language != -1) {
                    let tempId = [];
                    if (updatedData[found_language].value) {
                        updatedData[found_language].value.forEach((language) => {
                            tempId.push(ObjectID(language));
                        });
                    }
                    let languages = await languageCollection.find({ _id: { $in: tempId } });
                    let tempLanaguges = [];
                    languages.forEach((language) => {
                        tempLanaguges.push(language.name);
                    });
                    updatedData[found_language].value = tempLanaguges.join(", ");
                }

                let found_start_date = _.findIndex(updatedData, function (tmp_data) { return tmp_data.key == 'userstartdate'; });
                if (found_start_date != -1) {
                    updatedData[found_start_date].value = updatedData[found_start_date].value.split("T")[0];
                }

                let found_salary = _.findIndex(updatedData, function (tmp_data) { return tmp_data.key == 'usersalary'; });
                if (found_salary != -1) {
                    updatedData[found_salary].value = common.amount_field(updatedData[found_salary].value);
                }

                for (let i = 0; i < updatedData.length; i++) {
                    updatedData[i]['key'] = translator.getStr(`User_History.${updatedData[i]['key']}`);
                }
                let histioryObject = {
                    data: updatedData,
                    user_id: _id,
                };
                addUSER_History("Update", histioryObject, decodedToken);
                recentActivity.saveRecentActivity({
                    user_id: decodedToken.UserData._id,
                    username: decodedToken.UserData.userfullname,
                    userpicture: decodedToken.UserData.userpicture,
                    data_id: _id,
                    title: get_user.userfullname,
                    module: 'User',
                    action: 'Update',
                    action_from: 'Web',
                }, decodedToken);

                //activityController.updateAllUser({ "api_setting.employee": true }, decodedToken);
                res.send({ message: translator.getStr('EmployeeInfoUpdated'), status: true });
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

module.exports.deleteTeamMember = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let admin_connection_db_api = await db_connection.connection_db_api(config.ADMIN_CONFIG);
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let requestObject = req.body;
            let companyConnection = admin_connection_db_api.model(collectionConstant.SUPER_ADMIN_COMPANY, companySchema);
            let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            // let get_loginuser = await userConnection.findOne({ _id: ObjectID(decodedToken.UserData._id) });
            if (requestObject._id == decodedToken.UserData._id) {
                res.send({ message: "Logged user can't be archive. ", status: false });
            } else {
                let get_user = await userConnection.findOne({ _id: ObjectID(requestObject._id) });
                if (get_user) {
                    if (get_user.is_first == true) {
                        res.send({ message: "Firts user can't be archive.", status: false });
                    } else {
                        let update_user = await userConnection.updateMany({ _id: { $eq: ObjectID(requestObject._id), $ne: ObjectID(decodedToken.UserData._id) }, is_first: { $eq: false } }, { is_delete: 1, userstatus: 2, userroleId: '' });
                        if (update_user) {
                            let company_data = await companyConnection.findOne({ companycode: decodedToken.companycode });
                            let companyUserObj = {
                                'invoice_user.$.is_delete': 1,
                                'invoice_user.$.userstatus': 2,
                            };
                            let update_invoice_user = await companyConnection.updateOne({ _id: ObjectID(company_data._id), 'invoice_user.user_id': ObjectID(requestObject._id) }, { $set: companyUserObj });

                            let histioryObject = {
                                data: [],
                                user_id: requestObject._id,
                            };

                            recentActivity.saveRecentActivity({
                                user_id: decodedToken.UserData._id,
                                username: decodedToken.UserData.userfullname,
                                userpicture: decodedToken.UserData.userpicture,
                                data_id: requestObject._id,
                                title: get_user.userfullname,
                                module: 'User',
                                action: 'Archive',
                                action_from: 'Web',
                            }, decodedToken);
                            addUSER_History("Archive", histioryObject, decodedToken);

                            res.send({ message: translator.getStr('UserDeleted'), status: true });
                        }
                    }
                } else {
                    res.send({ message: "User is not found with this id.", status: true });
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

//multiple user archive
module.exports.deleteMultipleTeamMember = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let admin_connection_db_api = await db_connection.connection_db_api(config.ADMIN_CONFIG);
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let requestObject = req.body;
            let companyConnection = admin_connection_db_api.model(collectionConstant.SUPER_ADMIN_COMPANY, companySchema);
            let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            let update_user = await userConnection.updateMany({ _id: { $in: requestObject._id, $ne: ObjectID(decodedToken.UserData._id) }, is_first: { $eq: false } }, { is_delete: 1, userstatus: 2, userroleId: '' });

            if (update_user) {
                let company_data = await companyConnection.findOne({ companycode: decodedToken.companycode });
                let companyUserObj = {
                    'invoice_user.$.is_delete': 1,
                    'invoice_user.$.userstatus': 2,
                };
                for (let i = 0; i < requestObject._id.length; i++) {
                    let one_user = await userConnection.findOne({ _id: ObjectID(requestObject._id[i]) });
                    if (one_user.is_first && one_user._id == decodedToken.UserData._id) {
                    } else {
                        let update_invoice_user = await companyConnection.updateOne({ _id: ObjectID(company_data._id), 'invoice_user.user_id': ObjectID(requestObject._id[i]) }, { $set: companyUserObj });
                    }

                    let get_user = await userConnection.findOne({ _id: ObjectID(requestObject._id[i]) });

                    let histioryObject = {
                        data: [],
                        user_id: ObjectID(requestObject._id[i]),
                    };
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: requestObject._id[i],
                        title: get_user.userfullname,
                        module: 'User',
                        action: 'Archive',
                        action_from: 'Web',
                    }, decodedToken);
                    addUSER_History("Archive", histioryObject, decodedToken);
                }
                res.send({ message: translator.getStr('UserDeleted'), status: true });
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

module.exports.sendappinvitation = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        try {
            var requestObject = req.body;
            var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
            let talnate_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_TENANTS, { companycode: decodedToken.companycode });

            let emailTmp = {
                HELP: `${translator.getStr('EmailTemplateHelpEmailAt')} ${config.HELPEMAIL} ${translator.getStr('EmailTemplateCallSupportAt')} ${config.NUMBERPHONE}`,
                SUPPORT: `${translator.getStr('EmailTemplateEmail')} ${config.SUPPORTEMAIL} l ${translator.getStr('EmailTemplatePhone')} ${config.NUMBERPHONE2}`,
                ALL_RIGHTS_RESERVED: `${translator.getStr('EmailTemplateAllRightsReserved')}`,
                THANKS: translator.getStr('EmailTemplateThanks'),
                ROVUK_TEAM: translator.getStr('EmailTemplateRovukTeam'),
                COPYRIGHTNAME: `${config.COPYRIGHTNAME}`,

                TITLE: translator.getStr('EmailAppInvitationTitle'),
                USER_FULL_NAME: `${requestObject.name},`,
                TEXT1: translator.getStr('EmailAppInvitationAppDownloadInvitation'),
                TEXT2: translator.getStr('EmailAppInvitationDownloadApp'),
                USEREMAIL: `${translator.getStr('EmailAppInvitationLoginEmail')} ${requestObject.login_email}`,
                COMPANYCODE: `${translator.getStr('EmailAppInvitationCompanyCode')} ${decodedToken.companycode}`,
            };

            const file_data = fs.readFileSync(config.EMAIL_TEMPLATE_PATH + '/controller/emailtemplates/appinvitation.html', 'utf8');
            var template = handlebars.compile(file_data);
            var HtmlData = await template(emailTmp);
            sendEmail.sendEmail_client(talnate_data.smartaccupay_tenants.tenant_smtp_username, [requestObject.recipient], "App Download Invitation", HtmlData,
                talnate_data.smartaccupay_tenants.tenant_smtp_server, talnate_data.smartaccupay_tenants.tenant_smtp_port, talnate_data.smartaccupay_tenants.tenant_smtp_reply_to_mail,
                talnate_data.smartaccupay_tenants.tenant_smtp_password, talnate_data.smartaccupay_tenants.tenant_smtp_timeout, talnate_data.smartaccupay_tenants.tenant_smtp_security);
            res.send({ message: translator.getStr('AppInvitationSent'), status: true });
        }
        catch (e) {
            console.log("error:", e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        }
    }
    else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.senddocumentexpiration = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);

    let tmp_local_offset = Number(req.headers.local_offset);
    // console.log("tmp_local_offset", tmp_local_offset)
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
            let talnate_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_TENANTS, { companycode: decodedToken.companycode });
            let company_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: decodedToken.companycode });

            let emailTmp = {};
            let date = new Date();
            let currentEpoch = Math.round(date.setHours(0, 0, 0, 0) / 1000);
            currentEpoch = currentEpoch - tmp_local_offset;
            let sendResponse = 0; // 0-error response, 1-user document mail, 2-project document mail
            let recipients = [];
            if (requestObject.type == "user") {
                let userDocumentConnection = connection_db_api.model(collectionConstant.INVOICE_USER_DOCUMENT, userDocumentSchema);
                let user_document = await userDocumentConnection.aggregate([
                    {
                        $match: {
                            is_delete: 0,
                            _id: ObjectID(requestObject._id)
                        },
                    },
                    {
                        $lookup: {
                            from: collectionConstant.INVOICE_USER,
                            localField: "userdocument_user_id",
                            foreignField: "_id",
                            as: "user"
                        }
                    },
                    {
                        $unwind: "$user"
                    },
                    {
                        $lookup: {
                            from: collectionConstant.DOCUMENTTYPE,
                            localField: "userdocument_type_id",
                            foreignField: "_id",
                            as: "document"
                        }
                    },
                    {
                        $unwind: "$document"
                    },
                    {
                        $project: {
                            _id: 1,
                            userdocument_user_id: 1,
                            user_name: "$user.userfullname",
                            user_email: "$user.useremail",
                            type: "$document.document_type_name",
                            userdocument_expire_date: 1,
                            total_remain: {
                                $cond: [
                                    {
                                        $and: [
                                            { $ne: ["$userdocument_expire_date", 0] },
                                            { $gte: ["$userdocument_expire_date", currentEpoch] },
                                        ]
                                    },
                                    {
                                        $floor: {
                                            $divide: [{
                                                $subtract:
                                                    ["$userdocument_expire_date", currentEpoch]
                                            }, 86400]
                                        }
                                    },
                                    0
                                ],
                            }
                        }
                    }
                ]);
                // console.log("user_document:", user_document);
                if (user_document[0]['total_remain'] == 0) {
                    res.send({ message: translator.getStr('DocumentExpired'), status: true });
                } else {
                    recipients.push(user_document[0]['user_email']);
                    emailTmp = {
                        HELP: `${translator.getStr('EmailTemplateHelpEmailAt')} ${config.HELPEMAIL} ${translator.getStr('EmailTemplateCallSupportAt')} ${config.NUMBERPHONE}`,
                        SUPPORT: `${translator.getStr('EmailTemplateEmail')} ${config.SUPPORTEMAIL} l ${translator.getStr('EmailTemplatePhone')} ${config.NUMBERPHONE2}`,
                        ALL_RIGHTS_RESERVED: `${translator.getStr('EmailTemplateAllRightsReserved')}`,
                        THANKS: translator.getStr('EmailTemplateThanks'),
                        ROVUK_TEAM: translator.getStr('EmailTemplateRovukTeam'),

                        TITLE: translator.getStr('EmailSingleDocExpireTitle'),
                        HELLO_USERNAME: `${translator.getStr('EmailTemplateHello')} ${user_document[0]['user_name']}`,
                        MESSAGE: `${translator.getStr('EmailSingleDocExpireYourDocument')}, ${user_document[0]['type']} ${translator.getStr('EmailSingleDocExpireExpireInNext')} ${user_document[0]['total_remain']} ${translator.getStr('EmailSingleDocExpireUpdateDocument')}`,

                        COMPANYNAME: `${translator.getStr('EmailCompanyName')} ${company_data.companyname}`,
                        COMPANYCODE: `${translator.getStr('EmailCompanyCode')} ${company_data.companycode}`,
                    };
                    sendResponse = 1;
                }
            } else if (requestObject.type == "project") {
                let projectDocumentConnection = connection_db_api.model(collectionConstant.PROJECTDOCUMENTS, projectDocumentSchema);
                let project_document = await projectDocumentConnection.aggregate([
                    {
                        $match: {
                            is_delete: 0,
                            _id: ObjectID(requestObject._id)
                        },
                    },
                    {
                        $lookup: {
                            from: collectionConstant.PROJECT,
                            localField: "project_id",
                            foreignField: "_id",
                            as: "project"
                        }
                    },
                    {
                        $unwind: "$project"
                    },
                    {
                        $lookup: {
                            from: collectionConstant.PROJECT_SETTINGS,
                            localField: "project_id",
                            foreignField: "project_id",
                            as: "settings"
                        }
                    },
                    {
                        $unwind: "$settings"
                    },
                    {
                        $project: {
                            _id: 1,
                            project_id: 1,
                            project_name: "$project.project_name",
                            project_emails: "$settings.settings",
                            document_name: 1,
                            expiry_date: 1,
                            status: {
                                $cond: [
                                    {
                                        $eq: ["$expiry_date", 0]
                                    },
                                    "N/A",
                                    {
                                        $cond: [
                                            {
                                                $lt: ["$expiry_date", currentEpoch]
                                            },
                                            "Expired",
                                            "Current"
                                        ]
                                    }
                                ]
                            },
                            total_remain: {
                                $cond: [
                                    {
                                        $and: [
                                            { $ne: ["$expiry_date", 0] },
                                            { $gte: ["$expiry_date", currentEpoch] },
                                        ]
                                    },
                                    {
                                        $floor: {
                                            $divide: [{
                                                $subtract:
                                                    ["$expiry_date", currentEpoch]
                                            }, 86400]
                                        }
                                    },
                                    0
                                ],
                            }
                        }
                    }
                ]);
                if (project_document.length > 0) {
                    if (project_document[0]['status'] == "Expired") {
                        res.send({ message: translator.getStr('DocumentExpired'), status: true });
                    } else if (project_document[0]['status'] == "N/A") {
                        res.send({ message: translator.getStr('DocumentCantExpired'), status: true });
                    } else {
                        // console.log("s:", project_document[0]['project_emails']['email_recipients']['internal']);
                        recipients = project_document[0]['project_emails']['email_recipients']['internal'];
                        // console.log("mail:", recipients);
                        if (recipients == null || recipients.length == 0) {
                            res.send({ message: translator.getStr('EmptyInternalEmail'), status: true });
                        } else {
                            emailTmp = {
                                HELP: `${translator.getStr('EmailTemplateHelpEmailAt')} ${config.HELPEMAIL} ${translator.getStr('EmailTemplateCallSupportAt')} ${config.NUMBERPHONE}`,
                                SUPPORT: `${translator.getStr('EmailTemplateEmail')} ${config.SUPPORTEMAIL} l ${translator.getStr('EmailTemplatePhone')} ${config.NUMBERPHONE2}`,
                                ALL_RIGHTS_RESERVED: `${translator.getStr('EmailTemplateAllRightsReserved')}`,
                                THANKS: translator.getStr('EmailTemplateThanks'),
                                ROVUK_TEAM: translator.getStr('EmailTemplateRovukTeam'),
                                COPYRIGHTNAME: `${config.COPYRIGHTNAME}`,

                                TITLE: translator.getStr('EmailSingleDocExpireTitle'),
                                HELLO_USERNAME: `${translator.getStr('EmailTemplateHello')} ${decodedToken.UserData.userfullname}`,
                                MESSAGE: `${translator.getStr('EmailSingleDocExpireYourDocument')} ${project_document[0]['document_name']} ${translator.getStr('EmailSingleDocExpireExpireInNext')} ${project_document[0]['total_remain']} ${translator.getStr('EmailSingleDocExpireUpdateDocument')}`,

                                COMPANYNAME: `${translator.getStr('EmailCompanyName')} ${company_data.companyname}`,
                                COMPANYCODE: `${translator.getStr('EmailCompanyCode')} ${company_data.companycode}`,
                            };
                            sendResponse = 2;
                        }
                    }
                } else {
                    res.send({ message: translator.getStr('NoDataWithId'), status: true });
                }
            }
            if (sendResponse != 0) {
                const file_data = fs.readFileSync(config.EMAIL_TEMPLATE_PATH + '/controller/emailtemplates/singleDocumentExpiryAlert.html', 'utf8');
                var template = handlebars.compile(file_data);
                var HtmlData = await template(emailTmp);
                let subject = "";
                if (sendResponse == 1) {
                    subject = "Contact admin: Documents about to expire";
                } else if (sendResponse == 2) {
                    subject = "Documents about to expire";
                }
                sendEmail.sendEmail_client(talnate_data.smartaccupay_tenants.tenant_smtp_username, recipients, subject, HtmlData,
                    talnate_data.smartaccupay_tenants.tenant_smtp_server, talnate_data.smartaccupay_tenants.tenant_smtp_port, talnate_data.smartaccupay_tenants.tenant_smtp_reply_to_mail,
                    talnate_data.smartaccupay_tenants.tenant_smtp_password, talnate_data.smartaccupay_tenants.tenant_smtp_timeout, talnate_data.smartaccupay_tenants.tenant_smtp_security);
                res.send({ message: translator.getStr('DocumentExpirationWarningSent'), status: true });
            }
        }
        catch (e) {
            console.log("error:", e)
                ; res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    }
    else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.savesignature = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;

            let userCollection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            requestObject.userupdated_at = Math.round(new Date().getTime() / 1000);
            requestObject.userupdated_by = decodedToken.UserData._id;
            let update_user = await userCollection.updateOne({ _id: ObjectID(requestObject.user_id) }, requestObject);
            if (update_user) {
                res.send({ message: translator.getStr('SaveUserSignature'), data: update_user, status: true });
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
var usersdocument_historiesSchema = require('./../../../../../model/history/userdocument_history');
let historyCollectionConstant = require('./../../../../../config/historyCollectionConstant');

async function addUserDocumentHistory(action, data, decodedToken) {
    try {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        let usersdocument_historiesConnection = connection_db_api.model(historyCollectionConstant.INVOICE_USER_DOCUMENT_HISTORY, usersdocument_historiesSchema);
        data.action = action;
        data.created_at = Math.round(new Date().getTime() / 1000);
        data.created_by = decodedToken.UserData._id;
        let save_usersdocument_histories = new usersdocument_historiesConnection(data);
        save_usersdocument_histories.save();
    } catch (e) {
        console.log("=====USER DOCUMENT HISTORY ERROR=========", e);
    }
}

module.exports.getUserDocumentHistory = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let col = [];
            var requestObject = req.body;
            col.push("document_name", "action", "created_by", "taken_device");
            var start = parseInt(req.body.start);
            var perpage = parseInt(req.body.length);
            var columnData = (req.body.order != undefined && req.body.order != '') ? req.body.order[0].column : '';
            var columntype = (req.body.order != undefined && req.body.order != '') ? req.body.order[0].dir : '';
            var sort = {};
            sort[col[columnData]] = (columntype == 'asc') ? 1 : -1;
            let count_query = { is_delete: 0, userdocument_user_id: ObjectID(req.body.user_id) };
            var query = {
                $or: [
                    { "document_name": new RegExp(req.body.search.value, 'i') },
                ]
            };

            let usersdocument_historiesConnection = connection_db_api.model(historyCollectionConstant.INVOICE_USER_DOCUMENT_HISTORY, usersdocument_historiesSchema);
            let user_by_id = await usersdocument_historiesConnection.aggregate([
                {
                    $match: count_query
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "created_by",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.DOCUMENTTYPE,
                        localField: "userdocument_type_id",
                        foreignField: "_id",
                        as: "document"
                    }
                },
                {
                    $project: {
                        userdocument_user_id: 1,
                        userdocument_type_id: 1,
                        document_name: "$document.document_type_name",
                        userdocument_url: 1,
                        show_on_qrcode_scan: 1,
                        userdocument_expire_date: 1,
                        userdocument_created_by: 1,
                        userdocument_updated_by: 1,
                        userdocument_created_at: 1,
                        userdocument_updated_at: 1,
                        is_delete: 1,

                        created_at: 1,
                        action: 1,
                        created_by: { $ifNull: ["$user.userfullname", ""] },
                        taken_device: 1,
                    }
                },
                { $sort: sort },
                { $match: query },
                { $limit: perpage + start },
                { $skip: start },
            ]);
            let count = 0;
            count = await usersdocument_historiesConnection.countDocuments(count_query);
            var dataResponce = {};
            dataResponce.data = user_by_id;
            dataResponce.draw = req.body.draw;
            dataResponce.recordsTotal = count;
            dataResponce.recordsFiltered = (req.body.search.value) ? user_by_id.length : count;
            res.json(dataResponce);
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

var user_historySchema = require('./../../../../../model/history/user_history');
const invoiceRolesSchema = require('./../../../../../model/invoice_roles');

async function addUSER_History(action, data, decodedToken) {
    try {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        let user_historyCollection = connection_db_api.model(historyCollectionConstant.INVOICE_USER_HISTORY, user_historySchema);
        data.action = action;
        data.taken_device = config.WEB_ALL;
        data.history_created_at = Math.round(new Date().getTime() / 1000);
        data.history_created_by = decodedToken.UserData._id;
        let save_user_histories = new user_historyCollection(data);
        save_user_histories.save();
    } catch (e) {
        console.log("=====USER  History ERROR=========", e);
    }
}

module.exports.getAllUserHistory = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);

    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let col = [];
            var requestObject = req.body;
            col.push("created_at", "action", "created_by", "taken_device");
            var start = parseInt(req.body.start);
            var perpage = parseInt(req.body.length);
            var columnData = (req.body.order != undefined && req.body.order != '') ? req.body.order[0].column : '';
            var columntype = (req.body.order != undefined && req.body.order != '') ? req.body.order[0].dir : '';
            var sort = {};

            // if (req.body.draw == 1)
            // {
            //     sort = { "created_at": -1 };
            // } else
            // {

            // }
            sort[col[columnData]] = (columntype == 'asc') ? 1 : -1;
            let count_query = { is_delete: 0 };
            if (requestObject.employee_id != "" && requestObject.employee_id != undefined) {
                count_query = {
                    $or: [
                        { "deleted_id": ObjectID(requestObject.employee_id) },
                        { "updated_id": ObjectID(requestObject.employee_id) },
                        { "inserted_id": ObjectID(requestObject.employee_id) }
                    ],
                    "is_delete": 0
                };
            }
            var query = {
                $or: [{ "created_at": new RegExp(req.body.search.value, 'i') },
                { "action": new RegExp(req.body.search.value, 'i') },
                { "created_by": new RegExp(req.body.search.value, 'i') },
                { "role_name": new RegExp(req.body.search.value, 'i') },
                { "manager_name": new RegExp(req.body.search.value, 'i') },
                { "location_name": new RegExp(req.body.search.value, 'i') },
                { "userjob_type_name": new RegExp(req.body.search.value, 'i') },
                { "userjob_title_name": new RegExp(req.body.search.value, 'i') },
                { "department_name": new RegExp(req.body.search.value, 'i') },
                { "user_payroll_group_name": new RegExp(req.body.search.value, 'i') },
                { "useremail": new RegExp(req.body.search.value, 'i') },
                { "username": new RegExp(req.body.search.value, 'i') },
                { "usermiddlename": new RegExp(req.body.search.value, 'i') },
                { "userlastname": new RegExp(req.body.search.value, 'i') },
                { "userfullname": new RegExp(req.body.search.value, 'i') },
                { "userssn": new RegExp(req.body.search.value, 'i') },
                { "userdevice_pin": new RegExp(req.body.search.value, 'i') },
                { "userphone": new RegExp(req.body.search.value, 'i') },
                { "usersecondary_email": new RegExp(req.body.search.value, 'i') },
                { "userfulladdress": new RegExp(req.body.search.value, 'i') },
                { "userstreet1": new RegExp(req.body.search.value, 'i') },
                { "userstreet2": new RegExp(req.body.search.value, 'i') },
                { "city": new RegExp(req.body.search.value, 'i') },
                { "user_state": new RegExp(req.body.search.value, 'i') },
                { "userzipcode": new RegExp(req.body.search.value, 'i') },
                { "usercountry": new RegExp(req.body.search.value, 'i') },
                { "userstartdate": new RegExp(req.body.search.value, 'i') },
                { "usersalary": new RegExp(req.body.search.value, 'i') },
                { "usernon_exempt": new RegExp(req.body.search.value, 'i') },
                { "usermedicalBenifits": new RegExp(req.body.search.value, 'i') },
                { "useradditionalBenifits": new RegExp(req.body.search.value, 'i') },
                { "userterm_conditions": new RegExp(req.body.search.value, 'i') },
                { "user_payroll_rules": new RegExp(req.body.search.value, 'i') },
                { "costcode": new RegExp(req.body.search.value, 'i') },
                { "card_no": new RegExp(req.body.search.value, 'i') },
                { "card_type": new RegExp(req.body.search.value, 'i') },
                ]
            };

            let userConnection = connection_db_api.model(historyCollectionConstant.INVOICE_USER_HISTORY, user_historySchema);
            let user_by_id = await userConnection.aggregate([
                {
                    $match: count_query
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        let: { id: "$deleted_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $and: [{ $eq: ["$_id", "$$id"] }, { $eq: ["$is_delete", 1] }] }
                                },
                            },
                            {
                                $lookup: {
                                    from: collectionConstant.INVOICE_ROLES,
                                    localField: "userroleId",
                                    foreignField: "role_id",
                                    as: "role"
                                }
                            },
                            {
                                $lookup: {
                                    from: collectionConstant.INVOICE_USER,
                                    localField: "created_by",
                                    foreignField: "_id",
                                    as: "user"
                                }
                            },
                            {
                                $lookup: {
                                    from: collectionConstant.JOB_TITLE,
                                    localField: "userjob_title_id",
                                    foreignField: "_id",
                                    as: "jobtitle"
                                }
                            },
                            {
                                $lookup: {
                                    from: collectionConstant.DEPARTMENTS,
                                    localField: "userdepartment_id",
                                    foreignField: "_id",
                                    as: "department"
                                }
                            },
                            {
                                $lookup: {
                                    from: collectionConstant.PAYROLL_GROUP,
                                    localField: "user_id_payroll_group",
                                    foreignField: "_id",
                                    as: "payrollgroup"
                                }
                            },
                            {
                                $lookup: {
                                    from: collectionConstant.JOB_TYPE,
                                    localField: "userjob_type_id",
                                    foreignField: "_id",
                                    as: "jobtype"
                                }
                            },
                            {
                                $lookup: {
                                    from: collectionConstant.INVOICE_USER,
                                    localField: "usersupervisor_id",
                                    foreignField: "_id",
                                    as: "supervisor"
                                }
                            },
                            {
                                $lookup: {
                                    from: collectionConstant.LOCATIONS,
                                    localField: "userlocation_id",
                                    foreignField: "_id",
                                    as: "location"
                                }
                            },
                            {
                                $lookup: {
                                    from: collectionConstant.INVOICE_USER,
                                    localField: "usermanager_id",
                                    foreignField: "_id",
                                    as: "manager"
                                }
                            },
                            {
                                $lookup: {
                                    from: "costcodes",
                                    localField: "usercostcode",
                                    foreignField: "_id",
                                    as: "costcode"
                                }
                            },
                            {
                                $lookup: {
                                    from: collectionConstant.CREDITCARD,
                                    localField: "card_type",
                                    foreignField: "_id",
                                    as: "card"
                                }
                            },
                            {

                                $project: {
                                    role_name: {
                                        $ifNull: [
                                            {
                                                $cond: [
                                                    { $isArray: "$role.role_name" },
                                                    {
                                                        $arrayElemAt: ["$role.role_name", 0]
                                                    }, ""
                                                ]
                                            }, ""
                                        ]
                                    },
                                    supervisor_name: {
                                        $ifNull: [
                                            {
                                                $cond: [
                                                    { $isArray: "$supervisor.userfullname" },
                                                    {
                                                        $arrayElemAt: ["$supervisor.userfullname", 0]
                                                    }, ""
                                                ]
                                            }, ""
                                        ]
                                    },
                                    manager_name: {
                                        $ifNull: [
                                            {
                                                $cond: [
                                                    { $isArray: "$manager.userfullname" },
                                                    {
                                                        $arrayElemAt: ["$manager.userfullname", 0]
                                                    }, ""
                                                ]
                                            }, ""
                                        ]
                                    },
                                    location_name: {
                                        $ifNull: [
                                            {
                                                $cond: [
                                                    { $isArray: "$location.location_name" },
                                                    {
                                                        $arrayElemAt: ["$location.location_name", 0]
                                                    }, ""
                                                ]
                                            }, ""
                                        ]
                                    },
                                    userjob_type_name: {
                                        $ifNull: [
                                            {
                                                $cond: [
                                                    { $isArray: "$jobtype.job_type_name" },
                                                    {
                                                        $arrayElemAt: ["$jobtype.job_type_name", 0]
                                                    }, ""
                                                ]
                                            }, ""
                                        ]
                                    },
                                    userjob_title_name: {
                                        $ifNull: [
                                            {
                                                $cond: [
                                                    { $isArray: "$jobtitle.job_title_name" },
                                                    {
                                                        $arrayElemAt: ["$jobtitle.job_title_name", 0]
                                                    }, ""
                                                ]
                                            }, ""
                                        ]
                                    },
                                    department_name: {
                                        $ifNull: [
                                            {
                                                $cond: [
                                                    { $isArray: "$department.department_name" },
                                                    {
                                                        $arrayElemAt: ["$department.department_name", 0]
                                                    }, ""
                                                ]
                                            }, ""
                                        ]
                                    },
                                    user_payroll_group_name: {
                                        $ifNull: [
                                            {
                                                $cond: [
                                                    { $isArray: "$payrollgroup.payroll_group_name" },
                                                    {
                                                        $arrayElemAt: ["$payrollgroup.payroll_group_name", 0]
                                                    }, ""
                                                ]
                                            }, ""
                                        ]
                                    },

                                    userroleId: 1,
                                    useremail: 1,
                                    username: 1,
                                    usermiddlename: 1,
                                    userlastname: 1,
                                    userfullname: 1,
                                    userssn: 1,
                                    userdevice_pin: 1,
                                    userphone: 1,
                                    usersecondary_email: 1,
                                    usergender: 1,
                                    userdob: 1,
                                    userstatus: 1,
                                    userpicture: 1,
                                    usermobile_picture: 1,
                                    userfulladdress: 1,
                                    userstreet1: 1,
                                    userstreet2: 1,
                                    usercity: 1,
                                    user_state: 1,
                                    userzipcode: 1,
                                    usercountry: 1,
                                    userstartdate: 1,
                                    usersalary: 1,
                                    usermanager_id: 1,
                                    usersupervisor_id: 1,
                                    userlocation_id: 1,
                                    userjob_title_id: 1,
                                    userdepartment_id: 1,
                                    userjob_type_id: 1,

                                    usernon_exempt: 1,
                                    usermedicalBenifits: 1,
                                    useradditionalBenifits: 1,
                                    useris_password_temp: 1,
                                    userterm_conditions: 1,
                                    userweb_security_code: 1,
                                    user_payroll_rules: 1,
                                    user_id_payroll_group: 1,
                                    usercostcode: 1,
                                    costcode: { $ifNull: [{ $arrayElemAt: ["$costcode.value", 0] }, ""] },
                                    userqrcode: 1,
                                    userfirebase_id: 1,
                                    user_no: 1,
                                    card_no: { $ifNull: ["$card.name", ""] },
                                    card_type: 1,
                                    created_at: 1,
                                    action: 1,
                                    created_by: { $ifNull: ["$user.userfullname", ""] },
                                    allow_for_projects: 1,
                                    user_languages: 1,
                                    taken_device: 1,
                                    project_email_group: 1,
                                    //deleted_user: "$deleted_user",
                                    compliance_officer: 1,
                                }
                            }
                        ],
                        as: "deleted_user"
                    }
                },
                {
                    $unwind: {
                        path: "$deleted_user",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_ROLES,
                        localField: "userroleId",
                        foreignField: "role_id",
                        as: "role"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "created_by",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                /*  {
                     $unwind: {
                         path: "$role",
                         preserveNullAndEmptyArrays: true
                     },
                 }, */
                {
                    $lookup: {
                        from: collectionConstant.JOB_TITLE,
                        localField: "userjob_title_id",
                        foreignField: "_id",
                        as: "jobtitle"
                    }
                },
                /*   {
                      $unwind: {
                          path: "$jobtitle",
                          preserveNullAndEmptyArrays: true
                      },
                  }, */
                {
                    $lookup: {
                        from: collectionConstant.DEPARTMENTS,
                        localField: "userdepartment_id",
                        foreignField: "_id",
                        as: "department"
                    }
                },
                /*  {
                     $unwind: {
                         path: "$department",
                         preserveNullAndEmptyArrays: true
                     },
                 }, */
                {
                    $lookup: {
                        from: collectionConstant.PAYROLL_GROUP,
                        localField: "user_id_payroll_group",
                        foreignField: "_id",
                        as: "payrollgroup"
                    }
                },
                /*  {
                     $unwind: {
                         path: "$payrollgroup",
                         preserveNullAndEmptyArrays: true
                     },
                 }, */
                {
                    $lookup: {
                        from: collectionConstant.JOB_TYPE,
                        localField: "userjob_type_id",
                        foreignField: "_id",
                        as: "jobtype"
                    }
                },
                // {
                //     $unwind: {
                //         path:"$jobtype",
                //         preserveNullAndEmptyArrays: true
                //     },
                // },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "usersupervisor_id",
                        foreignField: "_id",
                        as: "supervisor"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.LOCATIONS,
                        localField: "userlocation_id",
                        foreignField: "_id",
                        as: "location"
                    }
                },
                // {
                //     $unwind: {
                //         path:"$location",
                //         preserveNullAndEmptyArrays: true
                //     },
                // },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "usermanager_id",
                        foreignField: "_id",
                        as: "manager"
                    }
                },
                {
                    $lookup: {
                        from: "costcodes",
                        localField: "usercostcode",
                        foreignField: "_id",
                        as: "costcode"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.CREDITCARD,
                        localField: "card_type",
                        foreignField: "_id",
                        as: "card"
                    }
                },
                {

                    $project: {
                        role_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$role.role_name" },
                                        {
                                            $arrayElemAt: ["$role.role_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        supervisor_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$supervisor.userfullname" },
                                        {
                                            $arrayElemAt: ["$supervisor.userfullname", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        manager_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$manager.userfullname" },
                                        {
                                            $arrayElemAt: ["$manager.userfullname", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        location_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$location.location_name" },
                                        {
                                            $arrayElemAt: ["$location.location_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        userjob_type_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$jobtype.job_type_name" },
                                        {
                                            $arrayElemAt: ["$jobtype.job_type_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        userjob_title_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$jobtitle.job_title_name" },
                                        {
                                            $arrayElemAt: ["$jobtitle.job_title_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        department_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$department.department_name" },
                                        {
                                            $arrayElemAt: ["$department.department_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        user_payroll_group_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$payrollgroup.payroll_group_name" },
                                        {
                                            $arrayElemAt: ["$payrollgroup.payroll_group_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },  /* role_name: "$role.role_name",
                        supervisor_name: { $ifNull: [{ $arrayElemAt: ["$supervisor.userfullname", 0] }, ""] },
                        manager_name: { $ifNull: [{ $arrayElemAt: ["$manager.userfullname", 0] }, ""] },
                        location_name: { $ifNull: [{ $arrayElemAt: ["$location.location_name", 0] }, ""] },
                        userjob_type_name: { $ifNull: [{ $arrayElemAt: ["$jobtype.job_type_name", 0] }, ""] },
                        userjob_title_name: { $ifNull: ["$jobtitle.job_title_name", ""] },
                        department_name: { $ifNull: ["$department.department_name", ""] },
                        user_payroll_group_name: { $ifNull: ["$payrollgroup.payroll_group_name", 0]  }, */

                        userroleId: 1,
                        useremail: 1,
                        username: 1,
                        usermiddlename: 1,
                        userlastname: 1,
                        userfullname: 1,
                        userssn: 1,
                        userdevice_pin: 1,
                        userphone: 1,
                        usersecondary_email: 1,
                        usergender: 1,
                        userdob: 1,
                        userstatus: 1,
                        userpicture: 1,
                        usermobile_picture: 1,
                        userfulladdress: 1,
                        userstreet1: 1,
                        userstreet2: 1,
                        usercity: 1,
                        user_state: 1,
                        userzipcode: 1,
                        usercountry: 1,
                        userstartdate: 1,
                        usersalary: 1,
                        usermanager_id: 1,
                        usersupervisor_id: 1,
                        userlocation_id: 1,
                        userjob_title_id: 1,
                        userdepartment_id: 1,
                        userjob_type_id: 1,

                        usernon_exempt: 1,
                        usermedicalBenifits: 1,
                        useradditionalBenifits: 1,
                        useris_password_temp: 1,
                        userterm_conditions: 1,
                        userweb_security_code: 1,
                        user_payroll_rules: 1,
                        user_id_payroll_group: 1,
                        usercostcode: 1,
                        costcode: { $ifNull: [{ $arrayElemAt: ["$costcode.value", 0] }, ""] },
                        userqrcode: 1,
                        userfirebase_id: 1,
                        user_no: 1,
                        card_no: { $ifNull: ["$card.name", ""] },
                        card_type: 1,
                        created_at: 1,
                        action: 1,
                        created_by: { $ifNull: ["$user.userfullname", ""] },
                        allow_for_projects: 1,
                        user_languages: 1,
                        taken_device: 1,
                        project_email_group: 1,
                        deleted_user: "$deleted_user",
                        compliance_officer: 1,
                    }
                },
                { $sort: sort },
                { $match: query },
                { $limit: perpage + start },
                { $skip: start },
            ]);
            let count = 0;
            count = await userConnection.countDocuments(count_query);
            var dataResponce = {};
            dataResponce.data = user_by_id;
            dataResponce.draw = req.body.draw;
            dataResponce.recordsTotal = count;
            dataResponce.recordsFiltered = (req.body.search.value) ? user_by_id.length : count;
            res.json(dataResponce);
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

module.exports.getUserHistory = async function (req, res) {
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
            let userConnection = connection_db_api.model(historyCollectionConstant.INVOICE_USER_HISTORY, user_historySchema);
            let get_data = await userConnection.aggregate([
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "user_id",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                { $unwind: "$user" },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "history_created_by",
                        foreignField: "_id",
                        as: "history_created_by"
                    }
                },
                { $unwind: "$history_created_by" },
                { $sort: { history_created_at: -1 } },
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

module.exports.getAllEmployeeReport = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            // let logo_url = await common.urlToBase64(config.INVOICE_LOGO);

            // let logo_url = requestObject.logo_url;
            let email_list = requestObject.email_list;
            var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
            let talnate_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_TENANTS, { companycode: decodedToken.companycode });
            let company_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: decodedToken.companycode });

            let userCollection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            let sort = { userfullname: 1 };
            let roleQuery = [];
            let query = [];
            if (requestObject.role_ids.length != 0) {
                let data_Query = [];
                for (let i = 0; i < requestObject.role_ids.length; i++) {
                    data_Query.push(ObjectID(requestObject.role_ids[i]));
                }
                roleQuery.push({ "role_id": { $in: data_Query } });
                query.push({ "userroleId": { $in: data_Query } });
            }

            if (requestObject.status_ids.length != 0) {
                query.push({ "userstatus": { $in: requestObject.status_ids } });
            }
            query = query.length == 0 ? {} : { $and: query };
            // let date_query = {};
            // if (requestObject.start_date != 0 && requestObject.end_date != 0) {
            //     date_query = { "timecard_clock_in": { $gte: requestObject.start_date, $lt: requestObject.end_date } };
            // }
            //date_query = date_query.length == 0 ? {} : { $or: date_query };
            //query = query.length == 0 ? {} : { $or: query };
            // console.log("date_query: ", date_query, query);

            let get_user = await userCollection.aggregate([
                {
                    $match: { is_delete: 0 },
                },
                { $match: query },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_ROLES,
                        localField: "userroleId",
                        foreignField: "role_id",
                        as: "role"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.JOB_TITLE,
                        localField: "userjob_title_id",
                        foreignField: "_id",
                        as: "jobtitle"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.DEPARTMENTS,
                        localField: "userdepartment_id",
                        foreignField: "_id",
                        as: "department"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.PAYROLL_GROUP,
                        localField: "user_id_payroll_group",
                        foreignField: "_id",
                        as: "payrollgroup"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.JOB_TYPE,
                        localField: "userjob_type_id",
                        foreignField: "_id",
                        as: "jobtype"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "usersupervisor_id",
                        foreignField: "_id",
                        as: "supervisor"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.LOCATIONS,
                        localField: "userlocation_id",
                        foreignField: "_id",
                        as: "location"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "usermanager_id",
                        foreignField: "_id",
                        as: "manager"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.CREDITCARD,
                        localField: "card_type",
                        foreignField: "_id",
                        as: "card"
                    }
                },
                {
                    $lookup: {
                        from: "costcodes",
                        localField: "usercostcode",
                        foreignField: "_id",
                        as: "costcode"
                    }
                },
                {
                    $project: {
                        role_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$role.role_name" },
                                        {
                                            $arrayElemAt: ["$role.role_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        supervisor_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$supervisor.userfullname" },
                                        {
                                            $arrayElemAt: ["$supervisor.userfullname", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        manager_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$manager.userfullname" },
                                        {
                                            $arrayElemAt: ["$manager.userfullname", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        location_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$location.location_name" },
                                        {
                                            $arrayElemAt: ["$location.location_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        userjob_type_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$jobtype.job_type_name" },
                                        {
                                            $arrayElemAt: ["$jobtype.job_type_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        userjob_title_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$jobtitle.job_title_name" },
                                        {
                                            $arrayElemAt: ["$jobtitle.job_title_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        department_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$department.department_name" },
                                        {
                                            $arrayElemAt: ["$department.department_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        user_payroll_group_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$payrollgroup.payroll_group_name" },
                                        {
                                            $arrayElemAt: ["$payrollgroup.payroll_group_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        card_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$card.name" },
                                        {
                                            $arrayElemAt: ["$card.name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        userroleId: 1,
                        useremail: 1,
                        username: 1,
                        usermiddlename: 1,
                        userlastname: 1,
                        userfullname: 1,
                        userssn: 1,
                        userdevice_pin: 1,
                        userphone: 1,
                        usersecondary_email: 1,
                        usergender: 1,
                        userdob: 1,
                        userstatus: 1,
                        userpicture: 1,
                        usermobile_picture: 1,
                        userfulladdress: 1,
                        userstreet1: 1,
                        userstreet2: 1,
                        usercity: 1,
                        user_state: 1,
                        userzipcode: 1,
                        usercountry: 1,
                        userstartdate: 1,
                        usersalary: 1,
                        usermanager_id: 1,
                        usersupervisor_id: 1,
                        userlocation_id: 1,
                        userjob_title_id: 1,
                        userdepartment_id: 1,
                        userjob_type_id: 1,
                        usernon_exempt: 1,
                        usermedicalBenifits: 1,
                        useradditionalBenifits: 1,
                        useris_password_temp: 1,
                        userterm_conditions: 1,
                        userweb_security_code: 1,
                        user_payroll_rules: 1,
                        user_id_payroll_group: 1,
                        usercostcode: 1,
                        costcode: { $ifNull: [{ $arrayElemAt: ["$costcode.value", 0] }, ""] },
                        userqrcode: 1,
                        userfirebase_id: 1,
                        user_no: 1,
                        card_no: 1,
                        card_type: 1,
                        login_from: 1,
                        is_first: 1,
                        allow_for_projects: 1,
                        user_languages: 1,
                        show_id_card_on_qrcode_scan: 1,
                        compliance_officer: 1,
                    }
                },
                { $sort: sort }
            ]);

            let workbook = new excel.Workbook();
            let title_tmp = translator.getStr('EmployeeTitle');
            let worksheet = workbook.addWorksheet(title_tmp);
            let xlsx_data = [];
            let result = await common.urlToBase64(config.INVOICE_LOGO);
            let logo_rovuk = await common.urlToBase64(config.INVOICE_LOGO);
            var languageSchema = require('./../../../../../model/language');
            let languageCollection = connection_db_api.model(collectionConstant.LANGUAGE, languageSchema);
            xlsx_data = await setUserData(get_user, languageCollection, translator);
            let headers = [translator.getStr('Employee_First_Name'), translator.getStr('Employee_Middle_Name'), translator.getStr('Employee_Last_Name'), translator.getStr('Employee_Email'), translator.getStr('Employee_SSN'), translator.getStr('Employee_Employee_Number'), translator.getStr('Employee_User_Role'), translator.getStr('Employee_Login_From'), translator.getStr('Employee_Gender'), translator.getStr('Employee_Date_Of_Birth'), translator.getStr('Employee_Status'), translator.getStr('Employee_Phone'), translator.getStr('Employee_Secondary_Email'), translator.getStr('Employee_Street_1'), translator.getStr('Employee_Street_2'), translator.getStr('Employee_City'), translator.getStr('Employee_State'), translator.getStr('Employee_Zipcode'), translator.getStr('Employee_Country'), translator.getStr('Employee_Cost_Code'), translator.getStr('Employee_Card_Type'), translator.getStr('Employee_Salary_Hourly_Rate'), translator.getStr('Employee_Start_Date'), translator.getStr('Employee_Manager'), translator.getStr('Employee_Supervisor'), translator.getStr('Employee_Location'), translator.getStr('Employee_Department'), translator.getStr('Employee_Job_Title'), translator.getStr('Employee_Job_Type'), translator.getStr('Employee_Payroll_Cycle'), translator.getStr('Employee_Payroll_Group'), translator.getStr('Employee_Language_Spoken'),];


            let d = new Date();
            let date = common.fullDate_format();

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
            worksheet.mergeCells('AF1:AF6');
            worksheet.addImage(rovukLogoImage, 'AF1:AF6');

            // Image between text 1
            let titleRowValue1 = worksheet.getCell('B1');
            titleRowValue1.value = `Team detailed report`;
            titleRowValue1.font = {
                name: 'Calibri',
                size: 15,
                bold: true,
            };
            titleRowValue1.alignment = { vertical: 'middle', horizontal: 'left' };
            worksheet.mergeCells(`B1:AE3`);

            // Image between text 2
            let titleRowValue2 = worksheet.getCell('B4');
            titleRowValue2.value = `Generated by: ${decodedToken.UserData.userfullname}`;
            titleRowValue2.font = {
                name: 'Calibri',
                size: 15,
                bold: true,
            };
            titleRowValue2.alignment = { vertical: 'middle', horizontal: 'left' };
            worksheet.mergeCells(`B4:AE6`);

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

            let footerRow = worksheet.addRow([translator.getStr('XlsxReportGeneratedAt') + date]);
            footerRow.alignment = { vertical: 'middle', horizontal: 'center' };
            worksheet.mergeCells(`A${footerRow.number}:AF${footerRow.number}`);
            const tmpResultExcel = await workbook.xlsx.writeBuffer();

            let status = `${translator.getStr('EmailExcelStatus')} `;
            let roles = `${translator.getStr('EmailExcelRoles')} `;
            let date_range = '';
            let projects = '';
            let vendors = '';
            let cards = '';
            let contacts = '';
            let item_types = '';
            let manufacturers = '';
            let cost_codes = '';
            let price_range = '';
            /* let  = [];
                        let  = []; */
            if (requestObject.All_Status) {
                status = `${translator.getStr('EmailExcelStatus')} ${translator.getStr('EmailExcelAllStatus')}`;
            } else {
                var tempStatus = requestObject.status_ids;
                for (var i = 0; i < tempStatus.length; i++) {
                    status += tempStatus[i] == 1 ? translator.getStr('Active_Status') : translator.getStr('Inactive_Status');
                    if (i != tempStatus.length - 1) {
                        status += ', ';
                    }
                }
            }

            if (requestObject.All_Roles) {
                roles = `${translator.getStr('EmailExcelRoles')} ${translator.getStr('EmailExcelAllRoles')}`;
            } else {
                roleQuery = roleQuery.length == 0 ? {} : { $or: roleQuery };
                let roleCollection = connection_db_api.model(collectionConstant.INVOICE_ROLES, invoiceRoleSchema);
                let all_role = await roleCollection.find(roleQuery, { role_name: 1 });
                for (var i = 0; i < all_role.length; i++) {
                    roles += all_role[i]['role_name'];
                    if (i != all_role.length - 1) {
                        roles += ', ';
                    }
                }
            }

            let companycode = decodedToken.companycode.toLowerCase();
            let key_url = config.INVOICE_WASABI_PATH + "/employee/excel_report/employee_" + new Date().getTime() + ".xlsx";
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
                    let excelUrl = config.wasabisys_url + "/" + companycode + "/" + key_url;
                    let emailTmp = {
                        HELP: `${translator.getStr('EmailTemplateHelpEmailAt')} ${config.HELPEMAIL} ${translator.getStr('EmailTemplateCallSupportAt')} ${config.NUMBERPHONE}`,
                        SUPPORT: `${translator.getStr('EmailTemplateEmail')} ${config.SUPPORTEMAIL} l ${translator.getStr('EmailTemplatePhone')} ${config.NUMBERPHONE2}`,
                        ALL_RIGHTS_RESERVED: `${translator.getStr('EmailTemplateAllRightsReserved')}`,
                        THANKS: translator.getStr('EmailTemplateThanks'),
                        ROVUK_TEAM: translator.getStr('EmailTemplateRovukTeam'),
                        VIEW_EXCEL: translator.getStr('EmailTemplateViewExcelReport'),
                        COPYRIGHTNAME: `${config.COPYRIGHTNAME}`,

                        EMAILTITLE: `${translator.getStr('EmailTeamReportTitle')}`,
                        TEXT1: translator.getStr('EmailTeamReportText1'),
                        TEXT2: translator.getStr('EmailTeamReportText2'),

                        FILE_LINK: excelUrl,

                        SELECTION: new handlebars.SafeString(`<h4>${roles}</h4><h4>${status}</h4>`),

                        COMPANYNAME: `${translator.getStr('EmailCompanyName')} ${company_data.companyname}`,
                        COMPANYCODE: `${translator.getStr('EmailCompanyCode')} ${company_data.companycode}`,
                    };
                    var template = handlebars.compile(file_data);
                    var HtmlData = await template(emailTmp);
                    sendEmail.sendEmail_client(talnate_data.smartaccupay_tenants.tenant_smtp_username, email_list, translator.getStr('EmailUserReportSubject'), HtmlData,
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

function setUserData(get_user, languageCollection, translator) {
    return new Promise(async function (resolve, reject) {
        let temp_user = [];
        if (get_user.length > 0) {
            for (let i = 0; i < get_user.length; i++) {
                let element = get_user[i];
                let formatter = new StringMask("(000) 000-0000", { reverse: true });
                let userPhone = formatter.apply(element.userphone);
                let status = element.userstatus == 1 ? translator.getStr('Active_Status') : translator.getStr('Inactive_Status');
                let payroll = config.PAYROLL_CYCLE.find(o => o.value == element.user_payroll_rules);
                let language = await getLanguages(element.user_languages, languageCollection);
                let userDOB = await common.MMDDYYYYFromStringDate(element.userdob);
                let userStartDate = await common.MMDDYYYYFromStringDate(element.userstartdate);
                temp_user.push([element.username, element.usermiddlename, element.userlastname, element.useremail, element.userssn,
                element.user_no, element.role_name, element.login_from, element.usergender, userDOB, status,
                    userPhone, element.usersecondary_email, element.userstreet1, element.userstreet2, element.usercity, element.user_state,
                element.userzipcode, element.usercountry, element.costcode, element.card_name, `$${element.usersalary.toFixed(2)}`, userStartDate,
                element.manager_name, element.supervisor_name, element.location_name, element.department_name, element.userjob_title_name, element.userjob_type_name,
                payroll.viewValue, element.user_payroll_group_name, language.join(","),]);
                if (i == get_user.length - 1) {
                    resolve(temp_user);
                }
            }
        } else {
            resolve(temp_user);
        }
    });
}

function getLanguages(langauges, languageCollection) {
    return new Promise(async function (resolve, reject) {
        let temp_language = [];
        if (langauges.length > 0) {
            for (let i = 0; i < langauges.length; i++) {
                let get_language = await languageCollection.findOne({ _id: ObjectID(langauges[i]) }, { name: 1 });
                temp_language.push(get_language.name);
                if (i == langauges.length - 1) {
                    resolve(temp_language);
                }
            }
        } else {
            resolve(temp_language);
        }
    });
}

/**
 * we added new function for import b'coz now correct data import in database after users persmission so create this function
 * this API not call until user insert correct data in xlsx file so need to now create complete xlsx file
 * 
 * Date :28-05-2022 : 05: 06 PM
 * By : Krunal T Tailor
 * 
 */
module.exports.checkAndInsertImportData = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let requestObject = req.body;
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
            let talnate_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_TENANTS, { companycode: decodedToken.companycode });
            let company_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: decodedToken.companycode });
            let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            const file_data = fs.readFileSync(config.EMAIL_TEMPLATE_PATH + '/controller/emailtemplates/invitationuser.html', 'utf8');
            for (let m = 0; m < requestObject.data.length; m++) {
                let check_user = await userConnection.findOne({
                    useremail: requestObject.data[m].useremail
                });
                if (check_user == null) {
                    //save

                    let tmp_password = requestObject.data[m].password;
                    requestObject.data[m].password = await common.generateHash(tmp_password);

                    let add_user = new userConnection(requestObject.data[m]);
                    let add = await add_user.save();

                    // let qrcode_Object = config.SITE_URL + '/user-publicpage?_id=' + add._id + '&company_code=' + company_data.companycode;
                    // let admin_qrCode = await QRCODE.generate_QR_Code(qrcode_Object);
                    // let key_url = "employee/" + add._id + "/" + add._id + new Date().getTime() + "_QRCode.png";
                    // let LowerCase_bucket = company_data.companycode.toLowerCase();
                    // let PARAMS = {
                    //     Bucket: LowerCase_bucket,
                    //     Key: key_url,
                    //     Body: admin_qrCode,
                    //     ACL: 'public-read-write'
                    // };

                    // bucketOpration.uploadFile(PARAMS, async function (err, resultUpload) {
                    //     if (err) {
                    //         //return { status: false, message: "Somthing Wrong with wasabi Qr Code upload" }
                    //     } else {
                    //         userqrcode = config.wasabisys_url + "/" + LowerCase_bucket + "/" + key_url;
                    //         let updateuser = await userConnection.updateOne({ _id: ObjectID(add._id) }, { userqrcode: userqrcode });
                    //     }

                    // })

                    let emailTmp = {
                        HELP: `${translator.getStr('EmailTemplateHelpEmailAt')} ${config.HELPEMAIL} ${translator.getStr('EmailTemplateCallSupportAt')} ${config.NUMBERPHONE}`,
                        SUPPORT: `${translator.getStr('EmailTemplateEmail')} ${config.SUPPORTEMAIL} l ${translator.getStr('EmailTemplatePhone')} ${config.NUMBERPHONE2}`,
                        ALL_RIGHTS_RESERVED: `${translator.getStr('EmailTemplateAllRightsReserved')}`,
                        THANKS: translator.getStr('EmailTemplateThanks'),
                        ROVUK_TEAM: translator.getStr('EmailTemplateRovukTeam'),
                        EMAILTITLE: translator.getStr('EmailInvitationUserTitle'),
                        USERNAME: `${translator.getStr('EmailLoginHello')} ${requestObject.data[m].userfirstname} ${requestObject.data[m].userlastname}`,
                        TEXT1: `${translator.getStr('EmailInvitationUserText1')}, ${company_data.companyname}.`,
                        TEXT2: translator.getStr('EmailInvitationUserText2'),
                        USEREMAIL: `${translator.getStr('EmailInvitationUserLoginEmail')} ${requestObject.data[m].useremail}`,
                        USERPASSWORD: `${translator.getStr('EmailInvitationUserTemporaryPassword')} ${tmp_password}`,
                        COMPANYCODE: `${translator.getStr('EmailInvitationUserCompanyCode')} ${company_data.companycode}`,
                        DOWNLOAD_APP: translator.getStr('EmailInvitationUserDownloadApp'),
                        LOG_IN: translator.getStr('EmailInvitationLogIn'),
                        LOGIN_LINK: config.SITE_URL + "/login",
                        COPYRIGHTNAME: `${config.COPYRIGHTNAME}`,

                        COMPANYNAME: `${translator.getStr('EmailCompanyName')} ${company_data.companyname}`,
                        COMPANYCODE: `${translator.getStr('EmailCompanyCode')} ${company_data.companycode}`,
                    };
                    var template = handlebars.compile(file_data);
                    var HtmlData = await template(emailTmp);

                    sendEmail.sendEmail_client(talnate_data.smartaccupay_tenants.tenant_smtp_username, requestObject.data[m].useremail, "SmartAccuPay Registration", HtmlData,
                        talnate_data.smartaccupay_tenants.tenant_smtp_server, talnate_data.smartaccupay_tenants.tenant_smtp_port, talnate_data.smartaccupay_tenants.tenant_smtp_reply_to_mail,
                        talnate_data.smartaccupay_tenants.tenant_smtp_password, talnate_data.smartaccupay_tenants.tenant_smtp_timeout, talnate_data.smartaccupay_tenants.tenant_smtp_security);
                }
            }
            res.send({ status: true, message: translator.getStr('Data_Insert_message') });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            //connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }

};

async function getalldepartment(decodedToken) {

    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {

            let departmentCollection = connection_db_api.model(collectionConstant.DEPARTMENTS, departmentSchema);
            let all_department = await departmentCollection.find();
            return all_department;
        } catch (e) {
            console.log(e);
            //res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            //connection_db_api.close()
        }
    } else {
        //res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

async function getAlljob_title(decodedToken) {
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {

            let jobtitleCollection = connection_db_api.model(collectionConstant.JOB_TITLE, jobtitleSchema);
            let all_jobtitle = await jobtitleCollection.find();
            return all_jobtitle;
            //res.send({ message: translator.getStr('JobTitleListing'), data: all_jobtitle, status: true });
        } catch (e) {
            console.log(e);
            //res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            //connection_db_api.close()
        }
    } else {
        //res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

async function getAlljob_type(decodedToken) {
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {

            let jobtypeCollection = connection_db_api.model(collectionConstant.JOB_TYPE, jobtypeSchema);
            let all_jobtype = await jobtypeCollection.find({});
            return all_jobtype;
        } catch (e) {
            console.log(e);
            //res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            //connection_db_api.close()
        }
    } else {
        //res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

async function getAllpayroll_group(decodedToken) {

    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let payrollgroupCollection = connection_db_api.model(collectionConstant.PAYROLL_GROUP, payrollgroupSchema);
            let all_payrollgroup = await payrollgroupCollection.find({});
            return all_payrollgroup;
        } catch (e) {
            console.log(e);

        } finally {
            //connection_db_api.close();
        }
    } else {

    }
};

async function getAllRoles(decodedToken) {
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let rolesCollection = connection_db_api.model(collectionConstant.INVOICE_ROLES, invoiceRoleSchema);
            let all_roles = await rolesCollection.find({ is_delete: 0 });
            return all_roles;
        } catch (e) {
            console.log(e);

        } finally {

        }
    } else {

    }
};

/**
 * 
 * Last Updated API : 28-05-2022
 * BY:- Krunal T Tailor
 * 
 * To check only duplicate data or not no need to insert in database
 * User need to import correct data in excel till we have to restrict it
 * 
 */
module.exports.importEmployees = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {

            let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            let creditcardsettingsCollection = connection_db_api.model(collectionConstant.CREDITCARD, creditcardsettingsSchema);
            let none_creditcardsettings = await creditcardsettingsCollection.findOne({ name: "None" });
            var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);

            let talnate_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_TENANTS, { companycode: decodedToken.companycode });
            let company_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: decodedToken.companycode, companystatus: 1 });
            let all_department = await getalldepartment(decodedToken);
            let All_job_title = await getAlljob_title(decodedToken);
            let All_job_type = await getAlljob_type(decodedToken);
            let All_payroll_group = await getAllpayroll_group(decodedToken);
            let AllRoles = await getAllRoles(decodedToken);
            var form = new formidable.IncomingForm();
            var fields = [];
            var notFonud = 0;
            var newOpenFile;
            form.parse(req)
                .on('file', function (name, file) {
                    notFonud = 1;
                    fileName = file;
                })
                .on('field', function (name, field) {
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
                            const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[i]], { header: 1 });
                            temp.forEach((res) => {
                                data.push(res);
                            });
                        }
                        // Printing data
                        header_ = data.shift();

                        const keys_OLD = ["userfirstname", "userlastname", "useremail", "password", "user_role",
                            "usergender", "userdepartment", "userjob_title", "userjob_type"];
                        if (JSON.stringify(keys_OLD.sort()) == JSON.stringify(header_.sort())) {
                            const file = reader.readFile(newOpenFile[0].path);
                            const sheets = file.SheetNames;
                            let data = [];
                            let success_data = [], error_data = [];
                            for (let i = 0; i < sheets.length; i++) {
                                const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[i]]);
                                temp.forEach((res) => {
                                    data.push(res);
                                });
                            }
                            let adminCount = 0;
                            let viewerCount = 0;
                            for (let m = 0; m < data.length; m++) {
                                if (data[m].userdepartment != undefined && data[m].userdepartment != null && data[m].userdepartment != "") {
                                    var Obj_department_name = _.find(all_department, function (o) { return o.department_name == data[m].userdepartment; });
                                    if (Obj_department_name != null || Obj_department_name != undefined) {
                                        data[m].userdepartment_id = Obj_department_name._id;
                                        //delete data[m].userdepartment
                                    }
                                }

                                if (data[m].userjob_title != undefined && data[m].userjob_title != null && data[m].userjob_title != "") {
                                    var Obj_job_title_name = _.find(All_job_title, function (o) { return o.job_title_name == data[m].userjob_title; });
                                    if (Obj_job_title_name != null || Obj_job_title_name != undefined) {
                                        data[m].userjob_title_id = Obj_job_title_name._id;
                                        //delete data[m].userjob_title
                                    }
                                }

                                if (data[m].userjob_type != undefined && data[m].userjob_type != null && data[m].userjob_type != "") {
                                    var Obj_job_type_name = _.find(All_job_type, function (o) { return o.job_type_name == data[m].userjob_type; });
                                    if (Obj_job_type_name != null || Obj_job_type_name != undefined) {
                                        data[m].userjob_type_id = Obj_job_type_name._id;
                                        //delete data[m].userjob_type
                                    }
                                }
                                if (data[m].user_role != undefined && data[m].user_role != null && data[m].user_role != "") {
                                    var Obj_AllRoles = _.find(AllRoles, function (o) { return o.role_name == data[m].user_role; });
                                    if (Obj_AllRoles != null || Obj_AllRoles != undefined) {
                                        data[m].userroleId = Obj_AllRoles.role_id;
                                        //delete data[m].user_role
                                    }
                                }

                                /* var Obj_payroll_cycle = _.find(config.payroll_cycle, function (o) { return o.viewValue == data[m].payroll_rules; });
                                if (Obj_payroll_cycle != null || Obj_payroll_cycle != undefined) {
                                    data[m].user_payroll_rules = Obj_payroll_cycle.value
                                    //delete data[m].payroll_rules
                                } */
                                data[m].user_payroll_rules = 1;

                                data[m].userstatus = 1;
                                data[m].login_from = "All";
                                data[m].card_type = none_creditcardsettings._id;

                                data[m].userfullname = `${data[m].userfirstname} ${data[m].userlastname}`;
                                if (data[m].userdepartment_id == undefined || data[m].userjob_title_id == undefined || data[m].userjob_type_id == undefined ||
                                    data[m].userroleId == undefined || data[m].user_payroll_rules == undefined) {
                                    data[m].status = false;
                                    data[m].message = translator.getStr('Data_Missing');
                                    error_data.push({ data: data[m], message: translator.getStr('Data_Missing') });
                                } else {
                                    let objRes = await userInsertCheck(connection_db_api, data[m], talnate_data, company_data, translator);
                                    if (objRes.status) {
                                        data[m].status = objRes.status;
                                        data[m].message = objRes.message;
                                        if (objRes.role != '' && objRes.role != null && objRes.role != undefined) {
                                            if (objRes.role == config.ROLE_VIEWER) {
                                                viewerCount++;
                                            } else {
                                                adminCount++;
                                            }
                                        }
                                        success_data.push({ data: data[m], message: objRes.message });
                                    } else {
                                        data[m].status = objRes.status;
                                        data[m].message = objRes.message;
                                        error_data.push({ data: data[m], message: objRes.message });
                                    }
                                }

                                if (m == (data.length - 1)) {
                                    res.send({
                                        message: translator.getStr('IMPORT_EMPLOYEE_MESSAGE'),
                                        status: true,
                                        data: data,
                                        error_data: error_data,
                                        success_data: success_data,
                                    });
                                }
                            }
                        }
                    }
                });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            //connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

async function userInsertCheck(connection_db_api, onedata, talnate_data, company_data, translator) {

    try {
        onedata.username = onedata.userfirstname;
        onedata.userfullname = onedata.userfirstname + " " + onedata.userlastname;
        let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
        let check_user = await userConnection.findOne({
            useremail: onedata.useremail
        });
        if (check_user == null) {
            return {
                status: true, message: translator.getStr('Data_Correct')
            };
        } else {
            return { status: false, message: translator.getStr("EmailAlreadyExists") };
        }

    } catch (e) {
        return { status: false, message: translator.getStr("Somthing_Wrong_with_connection") };
    }
}

module.exports.getarchiveteams = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {

            let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            let match = {};
            if (decodedToken.UserData.role_name == "Employee") {
                match = {
                    is_delete: 1,
                    _id: ObjectID(decodedToken.UserData._id),
                };
            } else {
                match = {
                    is_delete: 1
                };
            }
            let user_by_id = await userConnection.aggregate([
                {
                    $match: match,
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_ROLES,
                        localField: "userroleId",
                        foreignField: "role_id",
                        as: "role"
                    }
                },
                /*  {
                     $unwind: {
                         path: "$role",
                         preserveNullAndEmptyArrays: true
                     },
                 }, */
                {
                    $lookup: {
                        from: collectionConstant.JOB_TITLE,
                        localField: "userjob_title_id",
                        foreignField: "_id",
                        as: "jobtitle"
                    }
                },
                /*   {
                      $unwind: {
                          path: "$jobtitle",
                          preserveNullAndEmptyArrays: true
                      },
                  }, */
                {
                    $lookup: {
                        from: collectionConstant.DEPARTMENTS,
                        localField: "userdepartment_id",
                        foreignField: "_id",
                        as: "department"
                    }
                },
                /*  {
                     $unwind: {
                         path: "$department",
                         preserveNullAndEmptyArrays: true
                     },
                 }, */
                {
                    $lookup: {
                        from: collectionConstant.PAYROLL_GROUP,
                        localField: "user_id_payroll_group",
                        foreignField: "_id",
                        as: "payrollgroup"
                    }
                },
                /*  {
                     $unwind: {
                         path: "$payrollgroup",
                         preserveNullAndEmptyArrays: true
                     },
                 }, */
                {
                    $lookup: {
                        from: collectionConstant.JOB_TYPE,
                        localField: "userjob_type_id",
                        foreignField: "_id",
                        as: "jobtype"
                    }
                },
                // {
                //     $unwind: {
                //         path:"$jobtype",
                //         preserveNullAndEmptyArrays: true
                //     },
                // },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "usersupervisor_id",
                        foreignField: "_id",
                        as: "supervisor"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.LOCATIONS,
                        localField: "userlocation_id",
                        foreignField: "_id",
                        as: "location"
                    }
                },
                // {
                //     $unwind: {
                //         path:"$location",
                //         preserveNullAndEmptyArrays: true
                //     },
                // },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "usermanager_id",
                        foreignField: "_id",
                        as: "manager"
                    }
                },
                {
                    $lookup: {
                        from: "costcodes",
                        localField: "usercostcode",
                        foreignField: "_id",
                        as: "costcode"
                    }
                },
                {
                    $project: {
                        role_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$role.role_name" },
                                        {
                                            $arrayElemAt: ["$role.role_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        supervisor_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$supervisor.userfullname" },
                                        {
                                            $arrayElemAt: ["$supervisor.userfullname", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        manager_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$manager.userfullname" },
                                        {
                                            $arrayElemAt: ["$manager.userfullname", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        location_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$location.location_name" },
                                        {
                                            $arrayElemAt: ["$location.location_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        userjob_type_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$jobtype.job_type_name" },
                                        {
                                            $arrayElemAt: ["$jobtype.job_type_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        userjob_title_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$jobtitle.job_title_name" },
                                        {
                                            $arrayElemAt: ["$jobtitle.job_title_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        department_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$department.department_name" },
                                        {
                                            $arrayElemAt: ["$department.department_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        user_payroll_group_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$payrollgroup.payroll_group_name" },
                                        {
                                            $arrayElemAt: ["$payrollgroup.payroll_group_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },  /* role_name: "$role.role_name",
                        supervisor_name: { $ifNull: [{ $arrayElemAt: ["$supervisor.userfullname", 0] }, ""] },
                        manager_name: { $ifNull: [{ $arrayElemAt: ["$manager.userfullname", 0] }, ""] },
                        location_name: { $ifNull: [{ $arrayElemAt: ["$location.location_name", 0] }, ""] },
                        userjob_type_name: { $ifNull: [{ $arrayElemAt: ["$jobtype.job_type_name", 0] }, ""] },
                        userjob_title_name: { $ifNull: ["$jobtitle.job_title_name", ""] },
                        department_name: { $ifNull: ["$department.department_name", ""] },
                        user_payroll_group_name: { $ifNull: ["$payrollgroup.payroll_group_name", 0]  }, */
                        userroleId: 1,
                        useremail: 1,
                        username: 1,
                        usermiddlename: 1,
                        userlastname: 1,
                        userfullname: 1,
                        userssn: 1,
                        userdevice_pin: 1,
                        userphone: 1,
                        usersecondary_email: 1,
                        usergender: 1,
                        userdob: 1,
                        userstatus: 1,
                        userpicture: 1,
                        usermobile_picture: 1,
                        userfulladdress: 1,
                        userstreet1: 1,
                        userstreet2: 1,
                        usercity: 1,
                        user_state: 1,
                        userzipcode: 1,
                        usercountry: 1,
                        userstartdate: 1,
                        usersalary: 1,
                        usermanager_id: 1,
                        usersupervisor_id: 1,
                        userlocation_id: 1,
                        userjob_title_id: 1,
                        userdepartment_id: 1,
                        userjob_type_id: 1,
                        usernon_exempt: 1,
                        usermedicalBenifits: 1,
                        useradditionalBenifits: 1,
                        useris_password_temp: 1,
                        userterm_conditions: 1,
                        userweb_security_code: 1,
                        user_payroll_rules: 1,
                        user_id_payroll_group: 1,
                        usercostcode: 1,
                        costcode: { $ifNull: [{ $arrayElemAt: ["$costcode.value", 0] }, ""] },
                        userqrcode: 1,
                        userfirebase_id: 1,
                        user_no: 1,
                        card_no: 1,
                        card_type: 1,
                        is_first: 1,
                        allow_for_projects: 1,
                        user_languages: 1,
                    }
                },
                {
                    $sort: { 'userstartdate': -1 }
                }
            ]);
            res.send({ data: user_by_id, message: translator.getStr('UserListing'), status: true });
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

module.exports.recoverteam = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let admin_connection_db_api = await db_connection.connection_db_api(config.ADMIN_CONFIG);
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let companyConnection = admin_connection_db_api.model(collectionConstant.SUPER_ADMIN_COMPANY, companySchema);
            let userCollection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            let compnay_collection = await db_rest_api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
            let company_data = await db_rest_api.findOne(compnay_collection, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: decodedToken.companycode });
            let selectedPlan = company_data.billingplan;
            let get_user = await userCollection.findOne({ _id: ObjectID(requestObject._id) });
            let checkEmailExist = await userCollection.findOne({ useremail: get_user.useremail, is_delete: 0 });
            if (checkEmailExist) {
                res.send({ message: translator.getStr('EmailAlreadyExists'), status: false });
            } else {
                let update_team = await userCollection.updateOne({ _id: ObjectID(requestObject._id) }, { is_delete: 0, userstatus: requestObject.userstatus, userroleId: ObjectID(requestObject.userroleId) });
                if (update_team) {
                    let company_data = await companyConnection.findOne({ companycode: decodedToken.companycode });
                    let companyUserObj = {
                        'invoice_user.$.is_delete': 0,
                        'invoice_user.$.userstatus': requestObject.userstatus,
                    };
                    let one_user = await userCollection.findOne({ _id: ObjectID(requestObject._id) });
                    if (one_user.is_first && one_user._id == decodedToken.UserData._id) {
                    } else {
                        let update_invoice_user = await companyConnection.updateOne({ _id: ObjectID(company_data._id), 'invoice_user.user_id': ObjectID(requestObject._id) }, { $set: companyUserObj });
                    }
                    let histioryObject = {
                        data: [],
                        user_id: ObjectID(requestObject._id),
                    };
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: requestObject._id,
                        title: get_user.userfullname,
                        module: 'User',
                        action: 'Restore',
                        action_from: 'Web',
                    }, decodedToken);

                    addUSER_History("Restore", histioryObject, decodedToken);
                    if (one_user.userstatus == 1) {
                        res.send({ message: translator.getStr('recoverTeamMember'), data: update_team, status: true });
                    } else if (one_user.userstatus == 2) {
                        res.send({ message: translator.getStr('recoverInactiveTeamMember'), data: update_team, status: true });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), status: false });
                    }
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            }
            // }
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

// Get Management user
module.exports.listManagementUser = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let managementUserConnection = connection_db_api.model(collectionConstant.USER, userSchema);
            let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            let match = {
                is_delete: 0,
                userstatus: 1,
            };
            let temp_users = await userConnection.find(match, { _id: 0, useremail: 1 });
            let users = [''];
            temp_users.forEach((user) => {
                users.push(user.useremail);
            });
            match.useremail = { $nin: users };
            let get_user = await managementUserConnection.find(match);
            res.send({ status: true, data: get_user });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            //connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

// get only those user whose email are not used as Invoice user's email
module.exports.importManagementUser = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
            let talnate_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_TENANTS, { companycode: decodedToken.companycode });
            let company_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: decodedToken.companycode });
            let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            let managementUserConnection = connection_db_api.model(collectionConstant.USER, userSchema);

            let selectedPlan = company_data.billingplan;



            for (let i = 0; i < requestObject.users.length; i++) {
                let management_user = await managementUserConnection.findOne({ _id: ObjectID(requestObject.users[i]._id) }, { _id: 0, __v: 0 });
                let new_user = new userConnection({ useremail: management_user.useremail });
                let add = await new_user.save();
                management_user.userroleId = requestObject.users[i].role_id;
                management_user.usermanager_id = '';
                management_user.usersupervisor_id = '';
                management_user.userlocation_id = '';
                management_user.usercreated_at = Math.round(new Date().getTime() / 1000);
                management_user.userupdated_at = Math.round(new Date().getTime() / 1000);
                management_user.usercreated_by = decodedToken.UserData._id;
                management_user.userupdated_by = decodedToken.UserData._id;
                await userConnection.updateOne({ _id: ObjectID(add._id) }, management_user);
                // let add_user = new userConnection(management_user);
                // let add = await add_user.save();
                if (add) {
                    history_object = management_user;
                    history_object.user_id = add._id;
                    // addUSER_History("Insert", history_object, decodedToken);
                    const file_data = fs.readFileSync(config.EMAIL_TEMPLATE_PATH + '/controller/emailtemplates/invitationuser.html', 'utf8');
                    let emailTmp = {
                        HELP: `${translator.getStr('EmailTemplateHelpEmailAt')} ${config.HELPEMAIL} ${translator.getStr('EmailTemplateCallSupportAt')} ${config.NUMBERPHONE}`,
                        SUPPORT: `${translator.getStr('EmailTemplateEmail')} ${config.SUPPORTEMAIL} l ${translator.getStr('EmailTemplatePhone')} ${config.NUMBERPHONE2}`,
                        ALL_RIGHTS_RESERVED: `${translator.getStr('EmailTemplateAllRightsReserved')}`,
                        THANKS: translator.getStr('EmailTemplateThanks'),
                        ROVUK_TEAM: translator.getStr('EmailTemplateRovukTeam'),
                        EMAILTITLE: `${translator.getStr('EmailInvitationUserTitle')} ${company_data.companyname} ${translator.getStr('EmailInvitationPortal')}`,
                        USERNAME: `${translator.getStr('EmailLoginHello')} ${management_user.username}`,
                        TEXT1: `${translator.getStr('EmailInvitationUserText1')}, ${company_data.companyname}.`,
                        TEXT2: translator.getStr('EmailInvitationUserText2'),
                        USEREMAIL: `${translator.getStr('EmailInvitationUserLoginEmail')} ${management_user.useremail}`,
                        USERPASSWORD: ``,
                        COMPANYCODE: `${translator.getStr('EmailInvitationUserCompanyCode')} ${decodedToken.companycode}`,
                        DOWNLOAD_APP: translator.getStr('EmailInvitationUserDownloadApp'),
                        LOG_IN: translator.getStr('EmailInvitationLogIn'),
                        LOGIN_LINK: config.SITE_URL + "/login",
                        COPYRIGHTNAME: `${config.COPYRIGHTNAME}`,

                        COMPANYNAME: `${translator.getStr('EmailCompanyName')} ${company_data.companyname}`,
                        COMPANYCODE: `${translator.getStr('EmailCompanyCode')} ${company_data.companycode}`,
                    };
                    //translator.getStr('SomethingWrong')
                    var template = handlebars.compile(file_data);
                    var HtmlData = await template(emailTmp);
                    let LowerCase_bucket = decodedToken.companycode.toLowerCase();
                    var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
                    let talnate_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_TENANTS, { companycode: decodedToken.companycode });
                    sendEmail.sendEmail_client(talnate_data.smartaccupay_tenants.tenant_smtp_username, management_user.useremail, "SmartAccuPay Registration", HtmlData,
                        talnate_data.smartaccupay_tenants.tenant_smtp_server, talnate_data.smartaccupay_tenants.tenant_smtp_port, talnate_data.smartaccupay_tenants.tenant_smtp_reply_to_mail,
                        talnate_data.smartaccupay_tenants.tenant_smtp_password, talnate_data.smartaccupay_tenants.tenant_smtp_timeout, talnate_data.smartaccupay_tenants.tenant_smtp_security);
                }
                if (i == requestObject.users.length - 1) {
                    res.send({ message: translator.getStr('ManagementUserImported'), status: true });
                }
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            //connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

//get all User
module.exports.getUserForTable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            let start = parseInt(requestObject.start);
            var perpage = parseInt(requestObject.length);

            var columnName = (requestObject.sort != undefined && requestObject.sort != '') ? requestObject.sort.field : '';
            var columnOrder = (requestObject.sort != undefined && requestObject.sort != '') ? requestObject.sort.order : '';
            var sort = {};
            sort[columnName] = (columnOrder == 'asc') ? 1 : -1;

            let match = {};
            if (decodedToken.UserData.role_name == "Employee") {
                match = {
                    is_delete: requestObject.is_delete,
                    _id: ObjectID(decodedToken.UserData._id),
                };
            } else {
                match = {
                    is_delete: requestObject.is_delete
                };
            }
            var query = {
                $or: [
                    { "userfullname": new RegExp(requestObject.search, 'i') },
                    { "useremail": new RegExp(requestObject.search, 'i') },
                    { "userphone": new RegExp(requestObject.search, 'i') },
                    { "role_name": new RegExp(requestObject.search, 'i') },
                    { "userjob_title_name": new RegExp(requestObject.search, 'i') },
                    { "department_name": new RegExp(requestObject.search, 'i') },
                ]
            };
            let get_user = await userConnection.aggregate([
                {
                    $match: match,
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_ROLES,
                        localField: "userroleId",
                        foreignField: "role_id",
                        as: "role"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.JOB_TITLE,
                        localField: "userjob_title_id",
                        foreignField: "_id",
                        as: "jobtitle"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.DEPARTMENTS,
                        localField: "userdepartment_id",
                        foreignField: "_id",
                        as: "department"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.PAYROLL_GROUP,
                        localField: "user_id_payroll_group",
                        foreignField: "_id",
                        as: "payrollgroup"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.JOB_TYPE,
                        localField: "userjob_type_id",
                        foreignField: "_id",
                        as: "jobtype"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "usersupervisor_id",
                        foreignField: "_id",
                        as: "supervisor"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.LOCATIONS,
                        localField: "userlocation_id",
                        foreignField: "_id",
                        as: "location"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "usermanager_id",
                        foreignField: "_id",
                        as: "manager"
                    }
                },
                {
                    $lookup: {
                        from: "costcodes",
                        localField: "usercostcode",
                        foreignField: "_id",
                        as: "costcode"
                    }
                },
                {
                    $project: {
                        role_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$role.role_name" },
                                        {
                                            $arrayElemAt: ["$role.role_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        supervisor_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$supervisor.userfullname" },
                                        {
                                            $arrayElemAt: ["$supervisor.userfullname", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        manager_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$manager.userfullname" },
                                        {
                                            $arrayElemAt: ["$manager.userfullname", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        location_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$location.location_name" },
                                        {
                                            $arrayElemAt: ["$location.location_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        userjob_type_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$jobtype.job_type_name" },
                                        {
                                            $arrayElemAt: ["$jobtype.job_type_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        userjob_title_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$jobtitle.job_title_name" },
                                        {
                                            $arrayElemAt: ["$jobtitle.job_title_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        department_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$department.department_name" },
                                        {
                                            $arrayElemAt: ["$department.department_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        user_payroll_group_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$payrollgroup.payroll_group_name" },
                                        {
                                            $arrayElemAt: ["$payrollgroup.payroll_group_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },  /* role_name: "$role.role_name",
                        supervisor_name: { $ifNull: [{ $arrayElemAt: ["$supervisor.userfullname", 0] }, ""] },
                        manager_name: { $ifNull: [{ $arrayElemAt: ["$manager.userfullname", 0] }, ""] },
                        location_name: { $ifNull: [{ $arrayElemAt: ["$location.location_name", 0] }, ""] },
                        userjob_type_name: { $ifNull: [{ $arrayElemAt: ["$jobtype.job_type_name", 0] }, ""] },
                        userjob_title_name: { $ifNull: ["$jobtitle.job_title_name", ""] },
                        department_name: { $ifNull: ["$department.department_name", ""] },
                        user_payroll_group_name: { $ifNull: ["$payrollgroup.payroll_group_name", 0]  }, */
                        userroleId: 1,
                        useremail: 1,
                        username: 1,
                        usermiddlename: 1,
                        userlastname: 1,
                        userfullname: 1,
                        userssn: 1,
                        userdevice_pin: 1,
                        userphone: 1,
                        usersecondary_email: 1,
                        usergender: 1,
                        userdob: 1,
                        userstatus: 1,
                        userpicture: 1,
                        usermobile_picture: 1,
                        userfulladdress: 1,
                        userstreet1: 1,
                        userstreet2: 1,
                        usercity: 1,
                        user_state: 1,
                        userzipcode: 1,
                        usercountry: 1,
                        userstartdate: 1,
                        usersalary: 1,
                        usermanager_id: 1,
                        usersupervisor_id: 1,
                        userlocation_id: 1,
                        userjob_title_id: 1,
                        userdepartment_id: 1,
                        userjob_type_id: 1,
                        usernon_exempt: 1,
                        usermedicalBenifits: 1,
                        useradditionalBenifits: 1,
                        useris_password_temp: 1,
                        userterm_conditions: 1,
                        userweb_security_code: 1,
                        user_payroll_rules: 1,
                        user_id_payroll_group: 1,
                        usercostcode: 1,
                        costcode: { $ifNull: [{ $arrayElemAt: ["$costcode.value", 0] }, ""] },
                        userqrcode: 1,
                        userfirebase_id: 1,
                        user_no: 1,
                        card_no: 1,
                        card_type: 1,
                        is_first: 1,
                        allow_for_projects: 1,
                        user_languages: 1,
                        compliance_officer: 1,
                    }
                },
                { $sort: sort },
                { $match: query },
                { $limit: perpage + start },
                { $skip: start },
            ]).collation({ locale: "en_US" });
            let total_count = await userConnection.find(match).countDocuments();
            let pager = {
                start: start,
                length: perpage,
                total: total_count
            };
            res.send({ status: true, data: get_user, pager });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false, error: e });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

//user active or inactive
module.exports.updateUserStatus = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var admin_connection_db_api = await db_connection.connection_db_api(config.ADMIN_CONFIG);
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let companyConnection = admin_connection_db_api.model(collectionConstant.SUPER_ADMIN_COMPANY, companySchema);
            let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            var requestObject = req.body;
            var id = requestObject._id;
            delete requestObject._id;
            if (id == decodedToken.UserData._id) {
                res.send({ message: "Logged user can't be inactive. ", status: false });
            } else {
                var get_user = await userConnection.findOne({ _id: ObjectID(id) });
                if (get_user) {
                    if (get_user.is_first == true) {
                        res.send({ message: "Firts user can't be inactive. ", status: false });
                    } else {
                        var updateStatus = await userConnection.updateMany({ _id: { $eq: ObjectID(id), $ne: ObjectID(decodedToken.UserData._id) }, is_first: { $eq: false } }, { userstatus: requestObject.userstatus });
                        let company_data = await companyConnection.findOne({ companycode: decodedToken.companycode });

                        if (updateStatus) {
                            let companyUserObj = {
                                'invoice_user.$.userstatus': requestObject.userstatus,
                            };
                            let update_invoice_user = await companyConnection.updateOne({ _id: ObjectID(company_data._id), 'invoice_user.user_id': ObjectID(id) }, { $set: companyUserObj });

                            let action = '';
                            let message = '';
                            if (requestObject.userstatus == 1) {
                                action = "Active";
                                message = "User status active successfully.";
                            } else {
                                action = "Inactive";
                                message = "User status inactive successfully.";
                            }
                            let histioryObject = {
                                data: [],
                                user_id: id,
                            };

                            recentActivity.saveRecentActivity({
                                user_id: decodedToken.UserData._id,
                                username: decodedToken.UserData.userfullname,
                                userpicture: decodedToken.UserData.userpicture,
                                data_id: id,
                                title: get_user.userfullname,
                                module: 'User',
                                action: action,
                                action_from: 'Web',
                            }, decodedToken);

                            res.send({ message: message, status: true });
                        } else {
                            res.send({ message: translator.getStr('SomethingWrong'), status: false });
                        }
                    }
                } else {
                    res.send({ message: "User not found with this id.", status: false, error: e });
                }
            }
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

//multiple user active/inactive
module.exports.updateMultipleUserStatus = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var admin_connection_db_api = await db_connection.connection_db_api(config.ADMIN_CONFIG);
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let companyConnection = admin_connection_db_api.model(collectionConstant.SUPER_ADMIN_COMPANY, companySchema);
            let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            var requestObject = req.body;
            var updateStatus = await userConnection.updateMany({ _id: { $in: requestObject._id, $ne: ObjectID(decodedToken.UserData._id) }, is_first: { $eq: false } }, { userstatus: requestObject.userstatus });

            if (updateStatus) {
                let action = '';
                let message = '';
                if (requestObject.userstatus == 1) {
                    action = "Active";
                    message = "User status active successfully.";
                } else {
                    action = "Inactive";
                    message = "User status inactive successfully.";
                }

                let company_data = await companyConnection.findOne({ companycode: decodedToken.companycode });
                let companyUserObj = {
                    'invoice_user.$.userstatus': requestObject.userstatus,
                };
                for (let i = 0; i < requestObject._id.length; i++) {
                    var get_user = await userConnection.findOne({ _id: ObjectID(requestObject._id[i]) });
                    if (get_user.is_first && get_user._id == decodedToken.UserData._id) {
                    } else {
                        let update_invoice_user = await companyConnection.updateOne({ _id: ObjectID(company_data._id), 'invoice_user.user_id': ObjectID(requestObject._id[i]) }, { $set: companyUserObj });
                    }

                    let histioryObject = {
                        data: [],
                        user_id: requestObject._id[i],
                    };

                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: requestObject._id[i],
                        title: get_user.userfullname,
                        module: 'User',
                        action: action,
                        action_from: 'Web',
                    }, decodedToken);
                }
                res.send({ message: message, status: true });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
            }
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

//view capture
module.exports.view_capture = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    if (decodedToken) {
        try {
            var requestBody = req.body;
            var connection_db_api = await db_connection.connection_db_api(decodedToken);
            let view_capture_Connection = await connection_db_api.model(collectionConstant.VIEW_CAPTURE, view_capture_Schema);
            requestBody.update_date = Math.floor(new Date().getTime() / 1000.0);
            requestBody.create_date = Math.floor(new Date().getTime() / 1000.0);
            requestBody.performby_id = decodedToken.UserData._id;

            var add_view_capture = new view_capture_Connection(requestBody);
            var save_view_capture = await add_view_capture.save();
            if (save_view_capture) {
                res.send({ message: "View capture save successfull.", data: save_view_capture, status: true });
            } else {
                res.send({ message: "View capture not save.", status: true });
            }
        }
        catch (error) {
            console.log('error', error);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });

        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

//get view capture
module.exports.get_view_capture = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    if (decodedToken) {
        try {

            var requestBody = req.body;
            let connection_db_api = await db_connection.connection_db_api(decodedToken);
            // let tenants_Connection = await connection_db_api.model(collectionConstant.TENANTS, tenant_Schema);

            // if (requestBody._id != "") {
            //     var one_tenant = await tenants_Connection.findOne({ company_id: ObjectID(requestBody._id) });
            //     connection_db_api = await db_connection.connection_db_api(one_tenant);
            // }

            let view_capture_Connection = await connection_db_api.model(collectionConstant.VIEW_CAPTURE, view_capture_Schema);

            let perpage = 10;
            let current_page = requestBody.current_page;
            var start = (parseInt(requestBody.current_page) - 1) * perpage;

            var query_where = {};
            var performby_ids = new Array();

            if (requestBody.performby_id.length > 0) {

                if (requestBody.start_date != 0 && requestBody.end_date != 0) {

                    for (let i = 0; i < requestBody.performby_id.length; i++) {
                        performby_ids[i] = ObjectID(requestBody.performby_id[i]);
                    }

                    query_where = {
                        performby_id: { $in: performby_ids },
                        create_date: { $gte: requestBody.start_date, $lte: requestBody.end_date }
                    };

                } else {
                    for (let i = 0; i < requestBody.performby_id.length; i++) {
                        performby_ids[i] = ObjectID(requestBody.performby_id[i]);
                    }
                    query_where = {
                        performby_id: { $in: performby_ids }
                    };
                }

            } else if (requestBody.start_date != 0 && requestBody.end_date != 0) {

                query_where = {
                    create_date: { $gte: requestBody.start_date, $lte: requestBody.end_date }
                };

            }

            let get_view_capture = await view_capture_Connection.aggregate([
                {
                    $match: query_where
                },
                {
                    $lookup: {
                        from: collectionConstant.USER,
                        localField: "performby_id",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $unwind: {
                        preserveNullAndEmptyArrays: true,
                        path: "$user"
                    }
                },

                {
                    $project: {
                        performby_id: 1,
                        performby: {
                            _id: {
                                $ifNull: [
                                    "$user._id",
                                    ""
                                ]
                            },
                            username: {
                                $ifNull: [
                                    "$user.username",
                                    ""
                                ]
                            },
                            user_picture: {
                                $ifNull: [
                                    "$user.userpicture",
                                    ""
                                ]
                            },
                        },
                        create_date: 1,
                        update_date: 1,
                        module: 1,
                        data_name: 1,
                        action: 1,
                        text: 1,
                        reason: 1,
                        extra: 1,
                        for: 1
                    }
                },
                { $sort: { create_date: -1 } },
                { $limit: perpage + start },
                { $skip: start }
            ]);
            let count = 0;
            count = await view_capture_Connection.countDocuments(query_where);
            pager = {
                current_page: requestBody.current_page,
                last_page: Math.ceil(count / perpage),
                total_records: count,
            };
            res.send({ status: true, data: get_view_capture, pager: pager });

        } catch (error) {
            console.log(error);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};
