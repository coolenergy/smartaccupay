var apDocumentProcessSchema = require('./../../../../../model/ap_document_processes');
var userSchema = require('./../../../../../model/user');
var tenantSchema = require('../../../../../model/tenants');
var ObjectID = require('mongodb').ObjectID;
let db_connection = require('./../../../../../controller/common/connectiondb');
let common = require('./../../../../../controller/common/common');
let collectionConstant = require('./../../../../../config/collectionConstant');
var config = require('./../../../../../config/config');

module.exports.getAPDocumentProcess = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let apDocumentProcessCollection = connection_db_api.model(collectionConstant.AP_DOCUMENT_PROCESS, apDocumentProcessSchema);
            let get_data = await apDocumentProcessCollection.find({ is_delete: 0 });
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

module.exports.getOneAPDocumentProcess = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let apDocumentProcessCollection = connection_db_api.model(collectionConstant.AP_DOCUMENT_PROCESS, apDocumentProcessSchema);
            let get_data = await apDocumentProcessCollection.findOne({ _id: ObjectID(requestObject._id) });
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

module.exports.saveAPDocumentProcess = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let apDocumentProcessCollection = connection_db_api.model(collectionConstant.AP_DOCUMENT_PROCESS, apDocumentProcessSchema);
            if (requestObject._id) {
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let update_process = await apDocumentProcessCollection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
                if (update_process) {
                    res.send({ message: 'Document sent for process updated successfully.', data: update_process, status: true });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
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
                let insert_data = await apDocumentProcessCollection.insertMany(saveObj);
                if (insert_data) {
                    let documentIds = [];
                    for (let i = 0; i < insert_data.length; i++) {
                        documentIds.push(insert_data[i]._id);
                    }
                    var data = await common.sendInvoiceForProcess({
                        pdf_urls: documentIds,
                        company: decodedToken.companycode,
                        authorization: req.headers.authorization,
                        api_base_url: config.API_URL,
                    });
                    console.log("process document response: ", data);
                    /*let json = JSON.parse(data.body);
                    invoiceProgressController.saveInvoiceProgress({ process_id: json.process_id }, decodedToken);  */
                    res.send({ message: 'Document sent for process added successfully.', data: insert_data, status: true });
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

module.exports.mailBoxSaveAPDocumentProcess = async function (connection_db_api, companycode, pdf_urls, email) {
    try {
        let admin_connection_db_api = await db_connection.connection_db_api(decodedToken);
        let tenantsConnection = admin_connection_db_api.model(collectionConstant.SUPER_ADMIN_TENANTS, tenantSchema);
        let one_tenant = await tenantsConnection.findOne({ companycode: companycode });
        let apDocumentProcessCollection = connection_db_api.model(collectionConstant.AP_DOCUMENT_PROCESS, apDocumentProcessSchema);
        let userCollection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
        let UserData = await userCollection.aggregate([
            { $match: { is_first: true } },
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
                $unwind: {
                    path: "$card",
                    preserveNullAndEmptyArrays: true
                },
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
                    password: 1,
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
                    userqrcode: 1,
                    userfirebase_id: 1,
                    login_from: 1,
                    card_type_name: { $ifNull: ["$card.name", ""] },
                    card_type: 1,
                    api_setting: 1,
                    signature: 1,
                    allow_for_projects: 1,
                    user_languages: 1,
                    show_id_card_on_qrcode_scan: 1,
                    compliance_officer: 1,
                }
            }
        ]);
        UserData = UserData[0];

        var resObject_db = {
            "DB_HOST": one_tenant.DB_HOST,
            "DB_NAME": one_tenant.DB_NAME,
            "DB_PORT": one_tenant.DB_PORT,
            "DB_USERNAME": one_tenant.DB_USERNAME,
            "DB_PASSWORD": one_tenant.DB_PASSWORD,
            "companycode": one_tenant.companycode,
            "token": ""
        };
        let resObject = {
            ...resObject_db,
            UserData
        };
        var token = await common.generateJWT(resObject);


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
        let insert_data = await apDocumentProcessCollection.insertMany(saveObj);
        if (insert_data) {
            let documentIds = [];
            for (let i = 0; i < insert_data.length; i++) {
                documentIds.push(insert_data[i]._id);
            }
            console.log("api data: ", {
                pdf_urls: documentIds,
                company: companycode,
                // authorization: req.headers.authorization,
                api_base_url: config.API_URL,
            });
            var data = await common.sendInvoiceForProcess({
                pdf_urls: documentIds,
                company: companycode,
                authorization: token,
                api_base_url: config.API_URL,
            });
            console.log("process document response: ", data);
        }
    } catch (e) {
        console.log(e);
    } finally {
    }
};