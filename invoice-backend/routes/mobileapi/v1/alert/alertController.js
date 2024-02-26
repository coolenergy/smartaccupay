var ObjectID = require('mongodb').ObjectID;
let collectionConstant = require('../../../../config/collectionConstant');
var alertSchema = require('../../../../model/alerts');
var apInvoiceSchema = require('../../../../model/ap_invoices');
var processInvoiceSchema = require('../../../../model/process_invoice');
var ObjectID = require('mongodb').ObjectID;
let common = require('../../../../controller/common/common');
let db_connection = require('../../../../controller/common/connectiondb');
var formidable = require('formidable');
const reader = require('xlsx');
let config = require('../../../../config/config');
const excel = require("exceljs");
var bucketOpration = require('../../../../controller/common/s3-wasabi');
const fs = require('fs');
let rest_Api = require('../../../../config/db_rest_api');
var handlebars = require('handlebars');
let sendEmail = require('../../../../controller/common/sendEmail');
var PdfPrinter = require('pdfmake/src/printer');
var StringMask = require('string-mask');
var moment = require('moment');

module.exports.getAllAlert = async function (req, res) {
    var translator = new common.Language('en');
    var decodedToken = common.decodedJWT(req.headers.authorization);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let alertConnection = connection_db_api.model(collectionConstant.AP_ALERTS, alertSchema);
            let invoiceConnection = connection_db_api.model(collectionConstant.AP_INVOICE, apInvoiceSchema);
            let processInvoiceConnection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);

            let perpage = 10;
            let start = requestObject.start == 0 ? 0 : perpage * requestObject.start;
            let get_data = await alertConnection.aggregate([
                {
                    $match: {
                        user_id: ObjectID(decodedToken.UserData._id),
                        is_delete: 0,
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "user_id",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $unwind: "$user",
                },
                { $sort: { created_at: -1 } },
                { $limit: perpage + start },
                { $skip: start },
            ]);
            /* for (let i = 0; i < get_data.length; i++) {
                if (get_data[i].module_route._id) {
                    get_data[i].allow_navigation = true;
                    if (get_data[i].module_name == "Invoice") {
                        get_data[i].invoice = await getOneData(invoiceConnection, get_data[i].module_route._id);
                    }
                    if (get_data[i].module_name == "PO") {
                        get_data[i].po = await getOneData(invoiceConnection, get_data[i].module_route._id);
                    }
                    if (get_data[i].module_name == "Quote") {
                        get_data[i].quote = await getOneData(invoiceConnection, get_data[i].module_route._id);
                    }
                    if (get_data[i].module_name == "Packing Slip") {
                        get_data[i].packing_slip = await getOneData(invoiceConnection, get_data[i].module_route._id);
                    }
                    if (get_data[i].module_name == "Receiving Slip") {
                        get_data[i].receiving_slip = await getOneData(invoiceConnection, get_data[i].module_route._id);
                    }
                } else if (get_data[i].module_route.document_id) {
                    get_data[i].allow_navigation = false;
                    if (get_data[i].module_name == "INVOICE") {
                        get_data[i].invoice = await getOneData(invoiceConnection, get_data[i].module_route.document_id);
                    }
                    if (get_data[i].module_name == "PO") {
                        get_data[i].po = await getOneData(invoiceConnection, get_data[i].module_route.document_id);
                    }
                    if (get_data[i].module_name == "Quote") {
                        get_data[i].quote = await getOneData(invoiceConnection, get_data[i].module_route.document_id);
                    }
                    if (get_data[i].module_name == "Packing Slip") {
                        get_data[i].packing_slip = await getOneData(invoiceConnection, get_data[i].module_route.document_id);
                    }
                    if (get_data[i].module_name == "Receiving Slip") {
                        get_data[i].receiving_slip = await getOneData(invoiceConnection, get_data[i].module_route.document_id);
                    }
                }
            } */
            let count_query = {
                user_id: ObjectID(decodedToken.UserData._id),
                is_delete: 0,
                is_seen: false,
            };
            let unseen_count = await alertConnection.countDocuments(count_query);
            res.send({ data: get_data, unseen_count, status: true });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

function getOneData(collection, id) {
    return new Promise(async function (resolve, reject) {
        let one_data = await collection.findOne({ _id: ObjectID(id) });
        resolve(one_data);
    });
}

module.exports.getAlertDatatables = async function (req, res) {
    var translator = new common.Language('en');
    var decodedToken = common.decodedJWT(req.headers.authorization);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var col = [];
            col.push("user.userfullname", "notification_title", "notification_description",
                "is_seen", "is_complete", "created_at");
            var start = parseInt(requestObject.start);
            var perpage = parseInt(requestObject.length);
            var columnData = (requestObject.order != undefined && requestObject.order != '') ? requestObject.order[0].column : '';
            var columntype = (requestObject.order != undefined && requestObject.order != '') ? requestObject.order[0].dir : '';

            let sort = {};
            if (requestObject.draw == 1) {
                sort = { created_at: -1 };
            } else {
                sort[col[columnData]] = (columntype == 'asc') ? 1 : -1;
            }

            var query = {
                $or: [
                    { "user.userfullname": new RegExp(requestObject.search.value, 'i') },
                    { "notification_title": new RegExp(requestObject.search.value, 'i') },
                    { "notification_description": new RegExp(requestObject.search.value, 'i') },
                ]
            };
            var match = {
                is_delete: 0,
            };
            let agg_query = [
                { $match: match },
                {
                    $lookup: {
                        from: collectionConstant.GRID_USER,
                        localField: "user_id",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                { $unwind: "$user" },
                { $match: query },
                { $sort: sort },
                { $limit: perpage + start },
                { $skip: start }];
            let alertConnection = connection_db_api.model(collectionConstant.AP_ALERTS, alertSchema);
            let count = 0;
            count = await alertConnection.countDocuments(match);
            let alertData = await alertConnection.aggregate(agg_query).collation({ locale: "en_US" });
            var dataResponce = {};
            dataResponce.data = alertData;
            dataResponce.draw = requestObject.draw;
            dataResponce.recordsTotal = count;
            dataResponce.recordsFiltered = (requestObject.search.value) ? alertData.length : count;
            res.json(dataResponce);
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

module.exports.saveAlert = async function (requestObject, connection_db_api) {
    let alertConnection = connection_db_api.model(collectionConstant.AP_ALERTS, alertSchema);
    requestObject.created_at = Math.round(new Date().getTime() / 1000);
    requestObject.updated_at = Math.round(new Date().getTime() / 1000);
    let add_alert = new alertConnection(requestObject);
    let save_alert = await add_alert.save();
};

module.exports.updateAlert = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let _id = requestObject._id;
            delete requestObject._id;
            let alertConnection = connection_db_api.model(collectionConstant.AP_ALERTS, alertSchema);
            let updateObject = await alertConnection.updateOne({ _id: ObjectID(_id) }, requestObject);
            if (updateObject) {
                let isDelete = updateObject.nModified;
                if (isDelete == 0) {
                    res.send({ message: translator.getStr('NoDataWithId'), status: false });
                } else {
                    res.send({ message: requestObject.message, status: true });
                }
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

module.exports.updateAllAlert = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let alertConnection = connection_db_api.model(collectionConstant.AP_ALERTS, alertSchema);
            let updateObject = await alertConnection.updateMany({ user_id: ObjectID(decodedToken.UserData._id) }, requestObject);
            if (updateObject) {
                let isDelete = updateObject.nModified;
                if (isDelete == 0) {
                    res.send({ message: translator.getStr('NoDataWithId'), status: false });
                } else {
                    res.send({ message: requestObject.message, status: true });
                }
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

module.exports.getAlertExcelReport = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    var local_offset = Number(req.headers.local_offset);
    var timezone = req.headers.timezone;
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let requestObject = req.body;
            let query = [];
            let email_list = requestObject.email_list;
            var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
            let talnate_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_TENANTS, { companycode: decodedToken.companycode });
            let company_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: decodedToken.companycode });

            let alertConnection = connection_db_api.model(collectionConstant.AP_ALERTS, alertSchema);

            if (requestObject.seen && requestObject.seen.length != 0) {
                let data_Query = [];
                for (let i = 0; i < requestObject.seen.length; i++) {
                    data_Query.push(requestObject.seen[i]);
                }
                query.push({ "is_seen": { $in: data_Query } });
            }

            if (requestObject.complete && requestObject.complete.length != 0) {
                let data_Query = [];
                for (let i = 0; i < requestObject.complete.length; i++) {
                    data_Query.push(requestObject.complete[i]);
                }
                query.push({ "is_complete": { $in: data_Query } });
            }
            query = query.length == 0 ? {} : { $or: query };

            let date_query = {};
            if (requestObject.start_date != 0 && requestObject.end_date != 0) {
                date_query = { "created_at": { $gte: requestObject.start_date, $lt: requestObject.end_date } };
            }

            let get_alerts = await alertConnection.aggregate([
                { $match: { is_delete: 0 } },
                { $match: query },
                { $match: date_query },
                {
                    $lookup: {
                        from: collectionConstant.USER,
                        localField: "user_id",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                { $unwind: "$user" },
                { $sort: { created_at: -1 } },
            ]);
            console.log("sagar ------------------------ ,", get_alerts.length);
            let workbook = new excel.Workbook();
            let title_tmp = 'Alert';
            let worksheet = workbook.addWorksheet(title_tmp);
            let xlsx_data = [];

            let result = await common.urlToBase64(company_data.companylogo);
            let logo_rovuk = await common.urlToBase64(config.GRID_LOGO);
            for (let i = 0; i < get_alerts.length; i++) {
                xlsx_data.push([
                    get_alerts[i].user.userfullname,
                    get_alerts[i].notification_title,
                    get_alerts[i].notification_description,
                    get_alerts[i].is_seen ? 'Yes' : 'No',
                    get_alerts[i].is_complete ? 'Yes' : 'No',
                    common.notificationDateTime(get_alerts[i].created_at + local_offset)
                ]);
            }
            let headers = ['Name', 'Title', 'Description', 'Read', 'Complete', 'Date'];

            let d = new Date();
            let date = common.fullDate_format();

            //compnay logo
            let myLogoImage = workbook.addImage({
                base64: result,
                extension: 'png',
            });
            worksheet.addImage(myLogoImage, "A1:A6");
            worksheet.mergeCells('A1:A6');

            //grid logo
            let rovukLogoImage = workbook.addImage({
                base64: logo_rovuk,
                extension: 'png',
            });
            worksheet.mergeCells('F1:F6');
            worksheet.addImage(rovukLogoImage, 'F1:F6');

            // Image between text 1
            let titleRowValue1 = worksheet.getCell('B1');
            titleRowValue1.value = `Alert report`;
            titleRowValue1.font = {
                name: 'Calibri',
                size: 15,
                bold: true,
            };
            titleRowValue1.alignment = { vertical: 'middle', horizontal: 'left' };
            worksheet.mergeCells(`B1:E3`);

            // Image between text 2
            let titleRowValue2 = worksheet.getCell('B4');
            titleRowValue2.value = `Generated by: ${decodedToken.UserData.userfullname}`;
            titleRowValue2.font = {
                name: 'Calibri',
                size: 15,
                bold: true,
            };
            titleRowValue2.alignment = { vertical: 'middle', horizontal: 'left' };
            worksheet.mergeCells(`B4:E6`);

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
                worksheet.addRow(d);
            });

            worksheet.columns.forEach(function (column, i) {
                column.width = 30;
            });
            worksheet.getColumn(3).width = 30;
            worksheet.addRow([]);

            let footerRow = worksheet.addRow([translator.getStr('XlsxReportGeneratedAt') + date]);
            footerRow.alignment = { vertical: 'middle', horizontal: 'center' };
            worksheet.mergeCells(`A${footerRow.number}:F${footerRow.number}`);

            const tmpResultExcel = await workbook.xlsx.writeBuffer();

            let read = "";
            let complete = "";
            let date_range = "";

            if (requestObject.All_seen) {
                read = "Read: All";
            } else {
                let temp_seen = [];
                for (var i = 0; i < requestObject.seen.length; i++) {
                    temp_seen.push(requestObject.seen ? 'Yes' : 'No');
                }
                read = `Read: ${temp_seen.join(", ")}`;
            }

            if (requestObject.All_complete) {
                complete = "Complete: All";
            } else {
                let temp_complete = [];
                for (var i = 0; i < requestObject.complete.length; i++) {
                    temp_complete.push(requestObject.complete ? 'Yes' : 'No');
                }
                complete = `Complete: ${temp_complete.join(", ")}`;
            }

            if (requestObject.start_date != 0 && requestObject.end_date != 0) {
                let check_start = new Date(requestObject.start_date);
                let check_end = new Date(requestObject.end_date);
                let start_dst = moment(check_start.getTime() * 1000).tz(timezone);
                start_dst = start_dst.isDST();
                let end_dst = moment(check_end.getTime() * 1000).tz(timezone);
                end_dst = end_dst.isDST();
                // console.log("sagar check: ", start_dst, end_dst);
                let temp_start = start_dst ? common.MMDDYYYY_DST(requestObject.start_date + local_offset) : common.MMDDYYYY(requestObject.start_date + local_offset);
                let temp_end = end_dst ? common.MMDDYYYY_DST(requestObject.end_date + local_offset) : common.MMDDYYYY(requestObject.end_date + local_offset);
                date_range = `${translator.getStr('EmailDate')} ${temp_start} - ${temp_end}`;
            } else {
                date_range = '';
            }
            /* if (requestObject.start_date == 0 && requestObject.end_date == 0) {
                date_range = '';
            } else {
                date_range += `${common.MMDDYYYY(requestObject.start_date + local_offset)} - ${common.MMDDYYYY(requestObject.end_date + local_offset)}`;
            } */
            let companycode = decodedToken.companycode.toLowerCase();
            let key_url = config.SUPPLIER_DIVERSITY_WASABI_PATH + "/alert/excel_report/alert_" + new Date().getTime() + ".xlsx";
            let PARAMS = {
                Bucket: companycode,
                Key: key_url,
                Body: tmpResultExcel,
                ACL: 'public-read-write'
            };
            const file_data = fs.readFileSync('./controller/emailtemplates/excelReport.html', 'utf8');
            bucketOpration.uploadFile(PARAMS, async function (err, resultUpload) {
                if (err) {
                    res.send({ message: translator.getStr('SomethingWrong'), error: err, status: false });
                } else {
                    console.log("url: ", config.wasabisys_url + "/" + companycode + "/" + key_url);
                    let userqrcode = config.wasabisys_url + "/" + companycode + "/" + key_url;
                    let emailTmp = {
                        HELP: `${translator.getStr('EmailTemplateHelpEmailAt')} ${config.HELPEMAIL} ${translator.getStr('EmailTemplateCallSupportAt')} ${config.NUMBERPHONE}`,
                        SUPPORT: `${translator.getStr('EmailTemplateEmail')} ${config.SUPPORTEMAIL} l ${translator.getStr('EmailTemplatePhone')} ${config.NUMBERPHONE2}`,
                        ALL_RIGHTS_RESERVED: `${translator.getStr('EmailTemplateAllRightsReserved')}`,
                        THANKS: translator.getStr('EmailTemplateThanks'),
                        ROVUK_TEAM: translator.getStr('EmailTemplateRovukTeam'),
                        COPYRIGHTNAME: `${config.COPYRIGHTNAME}`,
                        ROVUK_TEAM_SEC: translator.getStr('EmailTemplateRovukTeamSec'),
                        VIEW_EXCEL: translator.getStr('EmailTemplateViewExcelReport'),

                        FILE_LINK: userqrcode,

                        EMAILTITLE: "Here is your alert report!",
                        TEXT1: "We have created an Excel file containing the alert report based on the following selection:",
                        TEXT2: "To modify these preferences please go to settings tap in the user portal.",

                        STATUS: read,
                        DOCUMENT_TYPE: complete,
                        MINORITY_TYPE: date_range,

                        COMPANYNAME: `${translator.getStr('EmailCompanyName')} ${company_data.companyname}`,
                        COMPANYCODE: `${translator.getStr('EmailCompanyCode')} ${company_data.companycode}`,
                    };
                    var template = handlebars.compile(file_data);
                    var HtmlData = await template(emailTmp);
                    sendEmail.sendEmail_client(talnate_data.smartaccupay_tenants.tenant_smtp_username, email_list, 'Supplier Diversity Alert Report', HtmlData,
                        talnate_data.smartaccupay_tenants.tenant_smtp_server, talnate_data.smartaccupay_tenants.tenant_smtp_port, talnate_data.smartaccupay_tenants.tenant_smtp_reply_to_mail,
                        talnate_data.smartaccupay_tenants.tenant_smtp_password, talnate_data.smartaccupay_tenants.tenant_smtp_timeout, talnate_data.smartaccupay_tenants.tenant_smtp_security);
                    res.send({ message: translator.getStr('Report_Sent_Successfully'), status: true });
                }
            });
        } catch (e) {
            console.log("e", e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};