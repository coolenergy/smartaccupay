let db_connection = require('./../../../../../controller/common/connectiondb');
let config = require('./../../../../../config/config');
let collectionConstant = require('./../../../../../config/collectionConstant');
let common = require('./../../../../../controller/common/common');
var ObjectID = require('mongodb').ObjectID;
var handlebars = require('handlebars');
let sendEmail = require('./../../../../../controller/common/sendEmail');
let rest_Api = require('../../../../../config/db_rest_api');
var formidable = require('formidable');
var fs = require('fs');
var companyCollection = "company";
var tenantsCollection = "tenants";
var userSchema = require('./../../../../../model/user');
var rolesandpermissionsSchema = require('./../../../../../model/rolesandpermissions');
var invoiceRoleSchema = require('./../../../../../model/invoice_roles');
var bucketOpration = require('./../../../../../controller/common/s3-wasabi');
const nodemailer = require('nodemailer');
var customerStateSchema = require('./../../../../../model/customer_monthly_states');
var apiCountSchema = require('./../../../../../model/api_count');
var tenantsSchema = require('../../../../../model/tenants');

module.exports.compnayinformation = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        try {
            var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
            let company_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: decodedToken.companycode });
            res.send({ message: translator.getStr('CompanyListing'), data: company_data, status: true });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.compnayupdateinformation = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        try {
            let reqObject = req.body;
            let id = reqObject._id;
            delete reqObject["_id"];
            var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
            let company_data = await rest_Api.update(connection_MDM, collectionConstant.SUPER_ADMIN_COMPANY, { _id: ObjectID(id) }, reqObject);
            if (company_data.result.nModified == 1) {
                res.send({ message: translator.getStr('CompanyUpdated'), data: company_data.result, status: true });
            }
            else if (company_data.result.nModified == 0 && company_data.result.ok) {
                res.send({ message: translator.getStr('CompanyAlreadyUpdated'), data: company_data.result, status: true });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.editCompany = function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
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
            }).on('end', function () {
                newOpenFile = this.openedFiles;
                var body = JSON.parse(fields.reqObject);
                var compnayCode_tmp = fields.editcopmanycode.toLowerCase();
                var id = fields._id;
                delete body['_id'];
                DB.update(companyCollection, { _id: ObjectID(id) }, body, function (err, resultUpdate) {
                    if (err) {
                        res.send({ message: translator.getStr('SomethingWrong'), error: err, status: false });
                    } else {
                        if (notFonud == 1) {
                            var temp_path = newOpenFile[0].path;
                            var file_name = newOpenFile[0].name;
                            dirKeyName = "logo/" + file_name;
                            var fileBody = fs.readFileSync(temp_path);
                            params = { Bucket: compnayCode_tmp, Key: dirKeyName, Body: fileBody, ACL: 'public-read-write' };
                            bucketOpration.uploadFile(params, function (err, resultUpload) {
                                if (err) {
                                    res.send({ message: translator.getStr('SomethingWrong'), error: err, status: false });
                                } else {
                                    urlProfile = config.wasabisys_url + "/" + compnayCode_tmp + "/" + dirKeyName;
                                    DB.update(companyCollection, { _id: ObjectID(id) }, { companylogo: urlProfile }, function (err, resultupdate) {
                                        if (err) {
                                            res.send({ message: translator.getStr('SomethingWrong'), error: err, status: false });
                                        } else {
                                            res.send({ message: translator.getStr("CompanyUpdated"), data: resultUpdate, status: true });
                                        }
                                    });
                                }
                            });
                        } else {
                            res.send({ message: translator.getStr("CompanyUpdated"), data: resultUpdate, status: true });
                        }

                    }
                });
            });
    } else {
        res.send({ message: "Invalid user for this action", status: false });
    }
};

module.exports.compnaysmtp = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        try {
            var admin_connection_db_api = await db_connection.connection_db_api(config.ADMIN_CONFIG);
            var tenantsConnection = admin_connection_db_api.model(collectionConstant.SUPER_ADMIN_TENANTS, tenantsSchema);
            var one_tenants = await tenantsConnection.findOne({ companycode: decodedToken.companycode });
            res.send({ message: translator.getStr('CompanySMTP'), data: one_tenants, status: true });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.compnayverifysmtp = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        try {
            let reqObject = req.body;

            var mailerOptions = {
                transport: "SMTP",
                host: reqObject.tenant_smtp_server,
                port: reqObject.tenant_smtp_port,
                secure: false,
                requireTLS: reqObject.tenant_smtp_security == "yes" ? true : false,
                ignoreTLS: false,
                requiresAuth: true,
                auth: {
                    user: reqObject.tenant_smtp_username,
                    pass: reqObject.tenant_smtp_password
                },
                tls: { rejectUnauthorized: false },
                debug: true
            };

            // create reusable transporter object using the default SMTP transport
            var transporter = nodemailer.createTransport(mailerOptions);

            // setup e-mail data with unicode symbols
            var mailOptions = {
                from: reqObject.tenant_smtp_reply_to_mail, // sender address
                to: reqObject.tenant_smtp_reply_to_mail, // list of receivers
                subject: 'SMTP Test', // Subject line
                text: 'This email is ent for check SMTP credentials. Kindly ignore this email or do not reply to this email.', // plaintext body
                html: '' // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    res.send({ message: 'SMTP credentials are not verified, kindly check the information is provided by you.', error: error, status: false });
                    return console.log(error);
                }
                console.log('Message sent: ' + info.response);
                res.send({ message: 'SMTP credentials verified successfully', data: info.response, status: true });
            });


        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.compnayupdatesmtp = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        try {
            let requestObject = req.body;
            let id = requestObject._id;
            delete requestObject["_id"];
            var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
            let reqObject = {
                'smartaccupay_tenants.tenant_smtp_server': requestObject.tenant_smtp_server,
                'smartaccupay_tenants.tenant_smtp_username': requestObject.tenant_smtp_username,
                'smartaccupay_tenants.tenant_smtp_port': requestObject.tenant_smtp_port,
                'smartaccupay_tenants.tenant_smtp_timeout': requestObject.tenant_smtp_timeout,
                'smartaccupay_tenants.tenant_smtp_password': requestObject.tenant_smtp_password,
                'smartaccupay_tenants.tenant_smtp_security': requestObject.tenant_smtp_security,
                'smartaccupay_tenants.tenant_smtp_reply_to_mail': requestObject.tenant_smtp_reply_to_mail,
            };
            let company_data = await rest_Api.update(connection_MDM, collectionConstant.SUPER_ADMIN_TENANTS, { company_id: ObjectID(id) }, reqObject);
            if (company_data.result.nModified == 1) {
                res.send({ message: translator.getStr('CompanySMPTUpdated'), data: company_data.result, status: true });
            }
            else if (company_data.result.nModified == 0 && company_data.result.ok) {
                res.send({ message: translator.getStr('CompanySMPTAlreadyUpdated'), data: company_data.result, status: true });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.sendIframeCode = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        try {
            let requestObject = req.body;
            var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
            let talnate_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_TENANTS, { companycode: decodedToken.companycode });
            let company_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: decodedToken.companycode });
            await rest_Api.update(connection_MDM, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: decodedToken.companycode }, { vendor_registration_url: requestObject.regitration_url });
            let emailTmp = {
                HELP: `${translator.getStr('EmailTemplateHelpEmailAt')} ${config.HELPEMAIL} ${translator.getStr('EmailTemplateCallSupportAt')} ${config.NUMBERPHONE}`,
                SUPPORT: `${translator.getStr('EmailTemplateEmail')} ${config.SUPPORTEMAIL} l ${translator.getStr('EmailTemplatePhone')} ${config.NUMBERPHONE2}`,
                ALL_RIGHTS_RESERVED: `${translator.getStr('EmailTemplateAllRightsReserved')}`,
                THANKS: translator.getStr('EmailTemplateThanks'),
                ROVUK_TEAM: translator.getStr('EmailTemplateRovukTeam'),
                COPYRIGHTNAME: `${config.COPYRIGHTNAME}`,
                TITLE: `${translator.getStr('iFrame_IntegrationWith')} ${company_data.companyname}`,
                COPY_CODE: translator.getStr('Copy_Code'),
                TEXT1: `${translator.getStr('EmailTemplateHello')} ${company_data.companyname},`,
                TEXT2: translator.getStr('Iframe_LINK_COPY_DESCRIPTION'),
                HTML_FREAM: requestObject.iframecode,
                REGISTRATION_LINK: requestObject.regitration_url,

                COMPANYNAME: `${translator.getStr('EmailCompanyName')} ${company_data.companyname}`,
                COMPANYCODE: `${translator.getStr('EmailCompanyCode')} ${company_data.companycode}`,
            };
            const file_data = fs.readFileSync(config.EMAIL_TEMPLATE_PATH + '/controller/emailtemplates/sendIfameCode.html', 'utf8');
            var template = handlebars.compile(file_data);
            var HtmlData = await template(emailTmp);
            sendEmail.sendEmail_client(talnate_data.smartaccupay_tenants.tenant_smtp_username, requestObject.emailsList, "Iframe Code", HtmlData,
                talnate_data.smartaccupay_tenants.tenant_smtp_server, talnate_data.smartaccupay_tenants.tenant_smtp_port, talnate_data.smartaccupay_tenants.tenant_smtp_reply_to_mail,
                talnate_data.smartaccupay_tenants.tenant_smtp_password, talnate_data.smartaccupay_tenants.tenant_smtp_timeout, talnate_data.smartaccupay_tenants.tenant_smtp_security);

            res.send({ message: translator.getStr('SEND_MAIL_TEAMPLETE'), status: true });

        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.compnayUsage = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let reqObject = req.body;
            let BucketName = decodedToken.companycode.toLowerCase();
            let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            let roleConnection = connection_db_api.model(collectionConstant.INVOICE_ROLES, invoiceRoleSchema);
            let totalUserCount = await userConnection.countDocuments({ is_delete: 0 });
            let admin_role = await roleConnection.findOne({ role_name: config.ADMIN_ROLE }, { _id: 1 });
            let supervisor_role = await roleConnection.findOne({ role_name: config.ROLE_SUPERVISOR }, { _id: 1 });
            let totalAdminCount = await userConnection.countDocuments({ is_delete: 0, userroleId: ObjectID(admin_role._id) });
            let totalSuervisorCount = await userConnection.countDocuments({ is_delete: 0, userroleId: ObjectID(supervisor_role._id) });
            let totalUser = Number(totalUserCount) - Number(totalAdminCount) - Number(totalSuervisorCount);
            let resObject = {
                totalUser: totalUser,
                totalSuervisor: totalSuervisorCount,
                bucket_size: 0
            };
            bucketOpration.getBucketSize(BucketName, function (err_bucket, result_bucket) {
                if (err_bucket) {
                    res.send({ message: translator.getStr('SomethingWrong'), data: resObject, status: true });
                } else {
                    resObject.bucket_size = result_bucket;
                    res.send({ message: translator.getStr('CompanyWasabiUsage'), data: resObject, status: true });
                }
            });
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

// Customer Monthly States
module.exports.getCustomerStatesDatatable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let customerStateCollection = connection_db_api.model(collectionConstant.INVOICE_CUSTOMER_STATES, customerStateSchema);
            var col = [];
            col.push("month_name");
            var start = parseInt(requestObject.start) || 0;
            var perpage = parseInt(requestObject.length);
            var columnData = (requestObject.order != undefined && requestObject.order != '') ? requestObject.order[0].column : '';
            var columntype = (requestObject.order != undefined && requestObject.order != '') ? requestObject.order[0].dir : '';
            var sort = {};
            sort[col[columnData]] = (columntype == 'asc') ? 1 : -1;
            let query = {};
            if (requestObject.search.value) {
                query = {
                    $or: [
                        { "month_name": new RegExp(requestObject.search.value, 'i') },
                    ]
                };
            }
            var match_query = { is_delete: 0 };
            var aggregateQuery = [
                { $match: match_query },
                // { $match: query },
                {
                    $project: {
                        year: 1,
                        month: 1,
                        month_name: { $concat: [{ $toString: "$month" }, " ", { $toString: "$year" }] },
                        po_expense: 1,
                        po_forms: 1,
                        packing_slip_expense: 1,
                        packing_slip_forms: 1,
                        receiving_slip_expense: 1,
                        receiving_slip_forms: 1,
                        quote_expense: 1,
                        quote_forms: 1,
                        invoice_expense: 1,
                        invoice_forms: 1,
                        unknown_expense: 1,
                        unknown_forms: 1,
                    }
                },
                { $sort: sort },
                { $limit: start + perpage },
                { $skip: start },
            ];
            let count = 0;
            count = await customerStateCollection.countDocuments(match_query);
            let get_data = await customerStateCollection.aggregate(aggregateQuery).collation({ locale: "en_US" });
            var dataResponce = {};
            dataResponce.data = get_data;
            dataResponce.draw = requestObject.draw;
            dataResponce.recordsTotal = count;
            dataResponce.recordsFiltered = (requestObject.search.value) ? get_data.length : count;
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

module.exports.getAPAPICount = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let apiCountCollection = connection_db_api.model(collectionConstant.API_COUNT, apiCountSchema);
            let get_data = await apiCountCollection.aggregate([
                { $match: { is_delete: 0 } },
                {
                    $project: {
                        year: 1,
                        month: 1,
                        month_name: {
                            $concat: [
                                {
                                    $arrayElemAt: [
                                        ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                                        "$month"
                                    ]
                                }, ", ", { $toString: "$year" }
                            ]
                        },
                        PURCHASE_ORDER: 1,
                        PACKING_SLIP: 1,
                        RECEIVING_SLIP: 1,
                        QUOTE: 1,
                        INVOICE: 1,
                        OTHER: 1,
                        DUPLICATED: 1,
                    }
                },
                { $sort: { year: -1, month: -1 } },
            ]).collation({ locale: "en_US" });
            res.json(get_data);
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

// getCustomerStates
module.exports.getCustomerStates = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let customerStateCollection = connection_db_api.model(collectionConstant.INVOICE_CUSTOMER_STATES, customerStateSchema);
            var match_query = { is_delete: 0 };
            var getData = await customerStateCollection.aggregate([
                { $match: match_query },

                {
                    $project: {
                        title: { $concat: [{ $toString: "$month" }, " ", { $toString: "$year" }] },
                        tmpObject: {
                            month_name: { $concat: [{ $toString: "$month" }, " ", { $toString: "$year" }] },
                            year: "$year",
                            month: "$month",
                            po_expense: "$po_expense",
                            po_forms: "$po_forms",
                            packing_slip_expense: "$packing_slip_expense",
                            packing_slip_forms: "$packing_slip_forms",
                            receiving_slip_expense: "$receiving_slip_expense",
                            receiving_slip_forms: "$receiving_slip_forms",
                            quote_expense: "$quote_expense",
                            quote_forms: "$quote_forms",
                            invoice_expense: "$invoice_expense",
                            invoice_forms: "$invoice_forms",
                            unknown_expense: "$unknown_expense",
                            unknown_forms: "$unknown_forms",
                        },

                    }
                },
                {
                    $group: {
                        _id: "$title",
                        invoice: {
                            $min: {
                                invoice_expense: "$tmpObject.invoice_expense",
                                invoice_forms: "$tmpObject.invoice_forms",
                            }
                        },
                        Purchase_Order: {
                            $min: {
                                po_expense: "$tmpObject.po_expense",
                                po_forms: "$tmpObject.po_forms",
                            }
                        },
                        Quote: {
                            $min: {
                                quote_expense: "$tmpObject.quote_expense",
                                quote_forms: "$tmpObject.quote_forms",
                            }
                        },
                        Packing_Slip: {
                            $min: {
                                packing_slip_expense: "$tmpObject.packing_slip_expense",
                                packing_slip_forms: "$tmpObject.packing_slip_forms",
                            }
                        },
                        Receiving_Slip: {
                            $min: {
                                unknown_expense: "$tmpObject.unknown_expense",
                                unknown_forms: "$tmpObject.unknown_forms",
                            }
                        },
                        Unkown: {
                            $min: {
                                receiving_slip_expense: "$tmpObject.receiving_slip_expense",
                                receiving_slip_forms: "$tmpObject.receiving_slip_forms",
                            }
                        },
                    }
                },

            ]);
            var dataResponce = {};
            dataResponce = getData;
            res.json(dataResponce);

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
