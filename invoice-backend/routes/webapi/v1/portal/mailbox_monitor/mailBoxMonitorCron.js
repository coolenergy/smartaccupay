var CronJob = require('cron').CronJob;
var config = require('./../../../../../config/config');
let common = require('./../../../../../controller/common/common');
let db_connection = require('./../../../../../controller/common/connectiondb');
let collectionConstant = require('./../../../../../config/collectionConstant');
let rest_Api = require("../../../../../config/db_rest_api");
var mailboxMonitorSchema = require('./../../../../../model/mailbox_monitor');
var ObjectID = require('mongodb').ObjectID;
const Imap = require('imap');
const { simpleParser } = require('mailparser');
var fs = require("fs");
var moment = require('moment');
var bucketOpration = require('../../../../../controller/common/s3-wasabi');
var apDocumentProcessController = require('./../ap_document_process/apDocumentProcessController');

module.exports.mailboxMonitorCronAPI = async function (req, res) {
    mailboxMonitorCronFunction({});
};

async function mailboxMonitorCronFunction(query) {
    try {
        let connection_MDM_main = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
        let All_Compnay = await rest_Api.find(connection_MDM_main, collectionConstant.SUPER_ADMIN_COMPANY, { companystatus: 1, companycode: { $ne: '' } });
        for (const item_new of All_Compnay) {
            let item = await rest_Api.findOne(connection_MDM_main, collectionConstant.SUPER_ADMIN_TENANTS, { companycode: item_new.companycode });
            if (item) {
                let connection_db_api = await db_connection.connection_db_api(item);
                let mailboxMonitorCollection = connection_db_api.model(collectionConstant.INVOICE_MAILBOX_MONITORS, mailboxMonitorSchema);
                var get_mail_box = await mailboxMonitorCollection.find(query);
                console.log("Mail box ************************************", item_new.companycode, "********", get_mail_box.length);
                for (let i = 0; i < get_mail_box.length; i++) {
                    const imapConfig = {
                        user: get_mail_box[i].email,
                        password: get_mail_box[i].password,
                        host: get_mail_box[i].imap,
                        port: Number(get_mail_box[i].port),
                        tls: true,
                        tlsOptions: {
                            rejectUnauthorized: false
                        },
                        connTimeout: 10000,
                        authTimeout: 50000,
                    };
                    await readMail(imapConfig, connection_db_api, item_new.companycode);
                }
            }
        }
        // console.log("--------------------Mailbox Monitor CRON--------------------");
    } catch (e) {
        console.log(e);
    }
}
function readMail(imapConfig, connection_db_api, companycode) {
    return new Promise(function (resolve, reject) {
        console.log("imapConfig: ", imapConfig);
        let email = imapConfig.user;
        const imap = new Imap(imapConfig);
        imap.once('ready', function () {
            imap.openBox('INBOX', true, function () {
                imap.search(['UNSEEN', ['SINCE', new Date()]], function (err, results) {
                    console.log("mails: ", results.length);
                    if (results.length != 0) {
                        const f = imap.fetch(results, { bodies: '' });
                        f.on('message', msg => {
                            msg.on('body', stream => {
                                simpleParser(stream, async (err, parsed) => {
                                    await checkAttachment(connection_db_api, companycode, parsed, email);
                                });
                            });
                            msg.once('attributes', attrs => {
                                const { uid } = attrs;
                                imap.addFlags(uid, ['\\Seen'], () => {
                                    // Mark the email as read after reading it
                                    console.log('Marked as read!');
                                });
                            });
                        });
                        f.once('error', ex => {
                            console.log("rejection error", ex);
                            return Promise.reject(ex);
                        });
                        f.once('end', () => {
                            console.log('Done fetching all messages!');
                            imap.end();
                            resolve();
                        });
                    }
                });
            });
        });

        imap.once('error', err => {
            console.log("err: ", err);
        });

        imap.once('end', () => {
            console.log('Connection ended');
        });

        imap.connect();
    });
}

function checkAttachment(connection_db_api, companycode, parsed, email) {
    return new Promise(function (resolve, reject) {
        const { from, subject, textAsHtml, text, attachments } = parsed;
        console.log("attachments: ", attachments.length);
        if (attachments.length == 0) {
            resolve();
        } else {
            for (let m = 0; m < attachments.length; m++) {
                let filenamesss = attachments[m].filename.split(".");
                var extension = filenamesss[filenamesss.length - 1];
                if (extension.toLocaleLowerCase() == 'pdf') {
                    let key_url = "email_file/" + moment().format('D_MMM_YYYY_hh_mm_ss_SSS_A') + "." + extension;
                    let PARAMS = {
                        Bucket: companycode.toLowerCase(),
                        Key: key_url,
                        Body: attachments[m].content,
                        ACL: 'public-read-write'
                    };
                    console.log("PARAMS: ", PARAMS);
                    bucketOpration.uploadFile(PARAMS, async function (err, resultUpload) {
                        if (err) {
                            resolve();
                            console.log("upload err", err);
                        } else {
                            var fileUrl = config.wasabisys_url + "/" + companycode.toLowerCase() + "/" + key_url;
                            console.log("fileUrl: ", fileUrl);
                            apDocumentProcessController.mailBoxSaveAPDocumentProcess(connection_db_api, companycode, [fileUrl], email);
                            resolve();
                        }
                    });
                }
            }
        }
    });
}

var mainboxMonitorCron = new CronJob(config.CRON_JOB.MAILBOX_MONITOR, async function () {
    let cronTimes = await setCRONTimes();
    if (cronTimes.length > 0) {
        mailboxMonitorCronFunction({ cron_time: { $in: cronTimes }, is_delete: 0 });
    }
});
mainboxMonitorCron.start();

var five_Minutes = {
    cronTime: '*/5 * * * *',
    time: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55],
};
var ten_Minutes = {
    cronTime: '*/10 * * * *',
    time: [0, 10, 20, 30, 40, 50],
};
var fifteen_Minutes = {
    cronTime: '*/15 * * * *',
    time: [0, 15, 30, 45],
};
var twenty_Minutes = {
    cronTime: '*/20 * * * *',
    time: [0, 20, 40],
};
var thirty_Minutes = {
    cronTime: '*/30 * * * *',
    time: [0, 30],
};
var one_Hours = {
    cronTime: '*/60 * * * *',
    time: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
};
var four_Hours = {
    cronTime: '0 */4 * * *',
    time: [0, 4, 8, 12, 16, 20],
};
var eight_Hours = {
    cronTime: '0 */8 * * *',
    time: [0, 8, 16],
};
var twelve_Hours = {
    cronTime: '0 */12 * * *',
    time: [0, 12],
};
var twentyFour_Hours = {
    cronTime: '0 */24 * * *',
    time: [0],
};

function setCRONTimes() {
    return new Promise(async function (resolve, reject) {
        var cronTimes = [];
        let date = moment();

        var check5Minutes = await checkInArray(date.minute(), five_Minutes);
        if (check5Minutes != '') {
            cronTimes.push(check5Minutes);
        }
        var check10Minutes = await checkInArray(date.minute(), ten_Minutes);
        if (check10Minutes != '') {
            cronTimes.push(check10Minutes);
        }
        var check15Minutes = await checkInArray(date.minute(), fifteen_Minutes);
        if (check15Minutes != '') {
            cronTimes.push(check15Minutes);
        }
        var check20Minutes = await checkInArray(date.minute(), twenty_Minutes);
        if (check20Minutes != '') {
            cronTimes.push(check20Minutes);
        }
        var check30Minutes = await checkInArray(date.minute(), thirty_Minutes);
        if (check30Minutes != '') {
            cronTimes.push(check30Minutes);
        }

        console.log("min", date.minute() == 0);
        if (date.minute() == 0) {
            var check1Hour = await checkInArray(date.hour(), one_Hours);
            if (check1Hour != '') {
                cronTimes.push(check1Hour);
            }
            var check4Hours = await checkInArray(date.hour(), four_Hours);
            if (check4Hours != '') {
                cronTimes.push(check4Hours);
            }
            var check8Hours = await checkInArray(date.hour(), eight_Hours);
            if (check8Hours != '') {
                cronTimes.push(check8Hours);
            }
            var check12Hours = await checkInArray(date.hour(), twelve_Hours);
            if (check12Hours != '') {
                cronTimes.push(check12Hours);
            }
            var check24Hours = await checkInArray(date.hour(), twentyFour_Hours);
            if (check24Hours != '') {
                cronTimes.push(check24Hours);
            }
        }
        resolve(cronTimes);
    });
}

function checkInArray(minute, object) {
    console.log("minute: ", minute);
    console.log("object: ", object);
    return new Promise(async function (resolve, reject) {
        var check = object.time.find(function (element) {
            return element == minute;
        });
        if (check == undefined) {
            resolve('');
        } else {
            resolve(object.cronTime);
        }
    });
}