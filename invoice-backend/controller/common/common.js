
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
const { Db, ObjectID } = require('mongodb');
var tokensecret = "secretCenturion1#";
let en = require('./../../config/en');
let es = require('./../../config/es');
var config = require('./../../config/config');
var moment = require('moment');
const docx = require("docx");
let common = require('./common');
let db_rest_api = require('./../../config/db_rest_api');
let db_connection = require('./../../controller/common/connectiondb');
let collectionConstant = require('./../../config/collectionConstant');
const {
    Footer,
    Paragraph,
    TextRun,
    Table,
    TableBorders,
    TableCell,
    TableRow,
    ImageRun,
    AlignmentType,
    WidthType,
    VerticalAlign,
    ShadingType,
    PageNumber
} = docx;
const _ = require("lodash");

module.exports.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};


//-\----check the password is valid or not 
module.exports.validPassword = function (password, passwordDB) {
    return bcrypt.compareSync(password, passwordDB);
};


module.exports.generateJWT = function (userObject) {
    return jwt.sign(userObject, tokensecret);
};

module.exports.decodedJWT = function (token) {
    return jwt.verify(token, tokensecret, function (err, result) {
        if (err) {
            return false;
        } else {
            return result;
        }
    });
};


module.exports.checkAndGenerateCompanyCode = function () {
    sixdidgitnumber = Math.floor(Math.random() * (9 * Math.pow(10, 6 - 1))) + Math.pow(10, 6 - 1);
    sixdidgitnumber = "R-" + sixdidgitnumber;
    return sixdidgitnumber;
};

module.exports.checkTokenExistOrNot = function (req, res, next) {
    if (req.headers.authorization == undefined || req.headers.authorization == "") {
        res.send({
            success: false,
            message: 'Authentication token not found.',
        });
    } else {
        next();
    }
};

module.exports.rendomPassword = function (length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

//genrate Alphanumeric otp
module.exports.generateRandomOTP = function () {
    var result = '';
    var digitString = '0123456789';
    var alphabeticString = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (var i = 2; i > 0; --i) {
        result += digitString[Math.floor(Math.random() * digitString.length)];
    }
    for (var i = 4; i > 0; --i) {
        result += alphabeticString[Math.floor(Math.random() * alphabeticString.length)];
    }
    result = shuffleString(result);
    return result;
};

function shuffleString(text) {
    var array = text.split('');
    var n = array.length;

    for (var i = 0; i < n - 1; ++i) {
        var j = Math.floor(Math.random() * n);
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    text = array.join('');
    return text;
}

module.exports.timeDateToepoch = function (new_datetime) {
    var dateObj = new Date(new_datetime).getTime();
    return Math.round(dateObj / 1000);
};

module.exports.epochToDateTime = function (epochTime) {
    var dateObj = epochTime * 1000;
    return new Date(dateObj);
};

module.exports.formatAMPM = function (date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = ("0" + (hours)).slice(-2) + ':' + ("0" + (minutes)).slice(-2) + ' ' + ampm;

    return strTime;
};

module.exports.MMDDYYYYFromStringDate = function (string_date) {
    if (string_date == '') {
        return '';
    }
    let temp_date = string_date.split("T")[0];
    let new_date = temp_date.split("-");
    return `${new_date[1]}/${new_date[2]}/${new_date[0]}`;
};

module.exports.MMDDYYYY_daily_report = function (epochTime) {
    var dateObj = epochTime * 1000;
    let date = new Date(dateObj);
    let date_tmp = ("0" + (date.getMonth() + 1)).slice(-2) + "_" + ("0" + date.getDate()).slice(-2) + "_" + date.getFullYear();
    return date_tmp;
};

module.exports.MMDDYYYY = function (epochTime) {
    if (epochTime == 0) {
        return '';
    }
    var dateObj = epochTime * 1000;
    let date = new Date(dateObj);
    let date_tmp = ("0" + (date.getMonth() + 1)).slice(-2) + "/" + ("0" + date.getDate()).slice(-2) + "/" + date.getFullYear();
    return date_tmp;
};

module.exports.MMDDYYYY_local_offset = function (epochTime, locale, offset) {
    if (epochTime == 0) {
        return '';
    }
    moment.locale(locale);
    var dateObj = epochTime * 1000;
    let date = new Date(dateObj);
    let local_date = moment(date).utcOffset(Math.floor(offset / 60)).format("DD/MM/YYYY");
    return local_date;
};

module.exports.DDMMYYYY = function (epochTime) {
    var dateObj = epochTime * 1000;
    let date = new Date(dateObj);
    let date_tmp = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
    return date_tmp;
};

module.exports.epochToOnlyTimeEpochForCompare = function (epochTime) {
    var dateObjEpoch = epochTime * 1000;
    let DateObject = new Date(dateObjEpoch);
    let Time_tmp = DateObject.getHours() + ":" + DateObject.getMinutes() + ":" + DateObject.getSeconds();
    let timeEpoch = new Date('January 1 1970 ' + Time_tmp).getTime();
    return Math.round(timeEpoch / 1000);
};

module.exports.epochToOnlyDateEpochForCompare = function (epochTime) {
    var dateObjEpoch = epochTime * 1000;
    let DateObject = new Date(dateObjEpoch);
    let Time_tmp = DateObject.getHours() + ":" + DateObject.getMinutes() + ":" + DateObject.getSeconds();
    let timeEpoch = new Date('January 1 1970 ' + Time_tmp).getTime();
    return Math.round(timeEpoch / 1000);
};

module.exports.notificationDateTime = function (epochTime) {
    if (epochTime == 0 || epochTime == undefined || epochTime == null) return ' ';
    var dateObj = epochTime * 1000;
    let date = new Date(dateObj);
    let date_tmp = ("0" + date.getDate()).slice(-2) + " " + config.SHORT_MONTHS_ARRAY[date.getMonth()] + ", " + date.getFullYear();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    var minutes_ = minutes < 10 ? '0' + minutes : minutes;
    var strTime = ("0" + (hours)).slice(-2) + ':' + ("0" + (minutes_)).slice(-2) + ' ' + ampm;
    return date_tmp + " at " + strTime;
};

module.exports.getDates = function (startDate, stopDate) {
    var dateArray = new Array();
    var currentDate = startDate;
    while (currentDate <= stopDate) {
        dateArray.push(currentDate);
        currentDate = currentDate.addDays(1);
    }
    return dateArray;
};

module.exports.amount_field = function (amount) {
    return (amount).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
    });
};

module.exports.percentage_field = function (percentage) {
    return parseFloat(percentage).toFixed(2) + "%";
};

module.exports.TIME = function (epochTime, locale) {
    moment.locale(locale);
    var dateObj = epochTime * 1000;
    let date = new Date(dateObj);
    let date_tmp = moment(date).format('hh:mm A');
    return date_tmp;
    // var dateObj = epochTime * 1000;
    // let date = new Date(dateObj);

    // var hours = date.getHours();
    // var minutes = date.getMinutes();
    // var ampm = hours >= 12 ? 'PM' : 'AM';
    // hours = hours % 12;
    // hours = hours ? hours : 12; // the hour '0' should be '12'
    // var minutes_ = minutes < 10 ? '0' + minutes : minutes;
    // var strTime = ("0" + (hours)).slice(-2) + ':' + ("0" + (minutes_)).slice(-2) + ' ' + ampm;
    // return strTime;
};

module.exports.FULL_DATE = function (epochTime, locale) {
    moment.locale(locale);
    var dateObj = epochTime * 1000;
    let date = new Date(dateObj);
    let date_tmp = moment(date).format('ddd, MMM DD YYYY');
    //let date_tmp = config.SHORT_WEEK_ARRAY[date.getDay()] + ", " + config.SHORT_MONTHS_ARRAY[date.getMonth()] + " " + ("0" + date.getDate()).slice(-2) + " " + date.getFullYear();
    return date_tmp;
};

module.exports.FULL_MONTH = function (epochTime) {
    var dateObj = epochTime * 1000;
    let date = new Date(dateObj);
    return config.MONTHS_ARRAY[date.getMonth()];
};

module.exports.EST_FULL_DATETIME = function (epochTime, locale) {
    moment.locale(locale);
    var dateObj = (epochTime * 1000) - 18000;
    let date = new Date(dateObj);
    let date_tmp = moment(date).format('ddd, MMM DD YYYY hh:mm A');
    return date_tmp + " (EST)";
};

module.exports.FULL_DATETIME = function (epochTime, locale) {
    moment.locale(locale);
    var dateObj = epochTime * 1000;
    let date = new Date(dateObj);
    let date_tmp = moment(date).format('ddd, MMM DD YYYY hh:mm A');
    return date_tmp;
};

module.exports.REPORT_DATA_DATE = function (epochTime, locale, offset) {
    moment.locale(locale);
    var dateObj = epochTime * 1000;
    let date = new Date(dateObj);
    let local_date = moment(date).utcOffset(Math.floor(offset / 60)).format("ddd, MMM DD YYYY hh:mm A");
    return local_date;
};

module.exports.MMDDYYYY_formet = function (epochTime) {
    var dateObj = epochTime * 1000;
    let date = new Date(dateObj);
    let date_tmp = ("0" + (date.getMonth() + 1)).slice(-2) + "/" + ("0" + date.getDate()).slice(-2) + "/" + date.getFullYear();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    var minutes_ = minutes < 10 ? '0' + minutes : minutes;
    var strTime = ("0" + (hours)).slice(-2) + ':' + ("0" + (minutes_)).slice(-2) + ' ' + ampm;
    return date_tmp + " " + strTime;
};

module.exports.DDMMYYYY_formet = function (epochTime) {
    var dateObj = epochTime * 1000;
    let date = new Date(dateObj);
    let date_tmp = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    var minutes_ = minutes < 10 ? '0' + minutes : minutes;
    var strTime = ("0" + (hours)).slice(-2) + ':' + ("0" + (minutes_)).slice(-2) + ' ' + ampm;
    return date_tmp + " " + strTime;
};

module.exports.YYYYMMDD_formet = function (epochTime) {
    // var dateObj = epochTime * 1000;
    let date = new Date(epochTime);
    let date_tmp = (date.getFullYear()) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + ("0" + date.getDate()).slice(-2);
    // var hours = date.getHours();
    // var minutes = date.getMinutes();
    // var ampm = hours >= 12 ? 'PM' : 'AM';
    // hours = hours % 12;
    // hours = hours ? hours : 12; // the hour '0' should be '12'
    // var minutes_ = minutes < 10 ? '0' + minutes : minutes;
    // var strTime = ("0" + (hours)).slice(-2) + ':' + ("0" + (minutes_)).slice(-2) + ' ' + ampm;
    return date_tmp;
};

module.exports.LanguageDate = function (language) {
    var moment = require('moment');
    moment.locale(language);
    return moment().format('MMMM Do YYYY, h:mm:ss a');
};

module.exports.LanguageGivenDate = function (language, date) {
    var moment = require('moment');
    moment.locale(language);
    return moment(date).format('MMMM Do YYYY');
};

module.exports.urlToBase64 = async function (url) {
    var request = require('request').defaults({ encoding: null });
    // return request.get('http://tinypng.org/images/example-shrunk-8cadd4c7.png', function (error, response, body) {
    // if (!error && response.statusCode == 200) {
    //     data = "data:" + response.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64');
    //     return { status : true , data : data}
    // }else{
    // 	return { status : false , data : []}
    // }

    const options = {
        url: url,
        method: 'GET',
    };

    // Return new promise
    return new Promise(function (resolve, reject) {
        // Do async job
        request.get(options, function (err, resp, body) {
            if (err) {
                reject(err);
            } else {
                resolve("data:" + resp.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64'));
            }
        });
    });
};

module.exports.httpGetCall = async function (url) {
    var request = require('request');
    const options = {
        url: url,
        method: 'GET',
    };
    return new Promise(function (resolve, reject) {
        request.get(options, function (err, resp, body) {
            if (err) {
                reject(err);
            } else {
                resolve({ body });
            }
        });
    });
};

module.exports.sendNotification = async function (registration_ids, notification) {
    var request = require('request');
    const options = {
        'method': 'POST',
        'url': 'https://fcm.googleapis.com/fcm/send',
        'headers': {
            'Authorization': 'key=' + config.NOTIFICATION_AUTHORIZATION,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "registration_ids": registration_ids,
            "notification": notification
        })

    };;
    return new Promise(function (resolve, reject) {
        request(options, function (err, resp, body) {
            if (err) {
                reject(err);
            } else {
                resolve({ body });
            }
        });
    });
};

module.exports.sendNotificationWithData = async function (registration_ids, notification, data) {
    var request = require('request');
    const options = {
        'method': 'POST',
        'url': 'https://fcm.googleapis.com/fcm/send',
        'headers': {
            'Authorization': 'key=' + config.NOTIFICATION_AUTHORIZATION,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "registration_ids": registration_ids,
            "notification": notification,
            "data": data,
        }),
        badge: '1'
    };;
    return new Promise(function (resolve, reject) {
        request(options, function (err, resp, body) {
            if (err) {
                reject(err);
            } else {
                resolve({ body });
            }
        });
    });
};

module.exports.urlToBase64Api = async function (req, res) {
    var request = require('request').defaults({ encoding: null });
    let url = req.body.url;
    const options = {
        url: url,
        method: 'GET',
    };

    // Return new promise
    return new Promise(function (resolve, reject) {
        // Do async job
        request.get(options, function (err, resp, body) {
            if (err) {
                res.send({ err: err, status: false });
                //reject(err);
            } else {
                let data = "data:" + resp.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64');
                res.send({ data: data, status: false });
                //resolve();
            }
        });
    });
};

module.exports.fullDate_format = function () {
    let d = new Date();
    let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
    let mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
    let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
    return `${da}-${mo}-${ye}`;
};



module.exports.Language = function (lang) {
    var __construct = function () {
        if (eval('typeof ' + lang) == 'undefined') {
            lang = "en";
        }
        return;
    }();
    this.getStr = function (str, defaultStr) {
        var retStr = eval('eval(lang).' + str);
        if (typeof retStr != 'undefined') {
            return retStr;
        } else {
            if (typeof defaultStr != 'undefined') {
                return defaultStr;
            } else {
                return eval('en.' + str);
            }
        }
    };
};
function getWorkTime(totalWorkTime) {
    var hrs = Math.floor(totalWorkTime / 60);
    var min;
    let mis = (totalWorkTime % 60);
    if (mis <= 59 && mis >= 38) {
        min = ".75";
    } else if (mis <= 37 && mis >= 23) {
        min = ".5";
    } else if (mis <= 22 && mis >= 8) {
        min = ".25";
    } else if (mis <= 7 && mis >= 0) {
        min = "";
    }
    return hrs + min;
}

module.exports.base64toblob = function (base64Data) {
    return new Promise(function (resolve, reject) {
        base64Data = base64Data.replace(/^data:image\/\w+;base64,/, "");
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });
        resolve(blob);
    });
};

module.exports.emailTemplate = function (logo, header, body, footer) {
    return new Promise(function (resolve, reject) {
        resolve(
            "<!DOCTYPE html>" +
            "<html lang='en'>" +
            "<head>" +
            "</head>" +
            "<body style='background: rgb(236, 236,236); padding: 5px;'>" +
            "<div style='margin: 0 auto; margin-top: 20px; margin-bottom: 20px; background: white; border: black 1px solid;'>" +
            "<div style='text-align: center;'>" +
            "<div>" +
            "<img src='" + logo + "' width='15%' style='padding-top: 15px;' />" +
            "<p>" +
            "<h3>" + header + "</h3>" +
            "</p>" +
            "<hr />" +
            "<div style='padding: 0px 50px;margin: auto;width: 70%;text-align: left'>" +
            "<h4>" + body + "</h4>" +
            "<br />" +
            "</div>" +
            "<div style='font-size: 15px;color: #9a9a9a;padding-left: 15%;padding-right: 15%;'>" +
            "<p>" + footer + "</p>" +
            "</div>" +
            "</div>" +
            "</div>" +
            "</div>" +
            "</body>" +
            "</html> "
        );
    });
};

module.exports.pdfSetTableHeader = function (backgroundColor) {
    return {
        fillColor: function (rowIndex, node, columnIndex) {
            return (rowIndex == 0) ? backgroundColor : null;
        },
        hLineColor: function (i, node) {
            return 'grey';
        },
        vLineColor: function (i, node) {
            return 'grey';
        }
    };
};

module.exports.pdfSetTableHeaderData = function (backgroundColor) {
    return {
        fillColor: function (rowIndex, node, columnIndex) {
            return (rowIndex == 0) ? backgroundColor : null;
        },
    };
};

module.exports.pdfTableHeaderText = function (text) {
    return { text: text, color: 'white', border: [false, false, false, false], alignment: 'center', bold: false, fontSize: 8.5, margin: [0, 2] };
};

module.exports.pdfTableHeaderTextFontSize = function (text, font) {
    return { text: text, color: 'white', border: [false, false, false, false], alignment: 'center', bold: false, fontSize: font, margin: [0, 2] };
};

module.exports.pdfTableContentHeaderTextAlignment = function (text, alignment, backgroundColor) {
    return {
        margin: [0, 2],
        border: [false, false, false, false],
        table: {
            widths: ['*'],
            body: [
                [
                    { text: text, color: 'white', border: [false, false, false, false], alignment: alignment, bold: false, fontSize: 8.5, margin: [0, 2], },
                ],
            ]
        },
        layout: {
            fillColor: function (rowIndex, node, columnIndex) {
                return (rowIndex == 0) ? backgroundColor : null;
            }
        }
    };
};

module.exports.pdfTableChangeOrderHeader = function (text) {
    let widths = [];
    let backgroundColor = '#848484';
    if (text.length == 3) {
        widths = ['33%', '33%', '33%'];
        backgroundColor = '#023E8A';
    } else if (text.length == 6) {
        widths = ['15%', '25%', '15%', '15%', '15%', '15%'];
    } else {
        widths = ['13%', '22%', '13%', '13%', '13%', '13%', '13%'];
    }
    let data = [];
    text.forEach((element) => {
        data.push({
            table: {
                widths: ['*'],
                body: [
                    [{ text: element, color: 'white', border: [false, false, false, false], alignment: 'left', bold: false, fontSize: 7, margin: [0, 2], },],
                ],

            },
            layout: {
                fillColor: function (rowIndex, node, columnIndex) {
                    return (rowIndex == 0) ? backgroundColor : null;
                }
            }
        });
    });
    return {
        border: [false, false, false, false],
        table: {
            widths: widths,
            body: [data],
        },
        layout: 'noBorders'
    };
};

module.exports.pdfTableChangeOrderData = function (text) {
    let widths = [];
    if (text.length == 3) {
        widths = ['33%', '33%', '33%'];
    } else if (text.length == 6) {
        widths = ['15%', '25%', '15%', '15%', '15%', '15%'];
    } else {
        widths = ['13%', '22%', '13%', '13%', '13%', '13%', '13%'];
    }
    let data = [];
    for (let i = 0; i < text.length; i++) {
        let alignment = 'left';
        if (((i == text.length - 1) || (i == text.length - 2)) || text.length == 3) {
            alignment = 'right';
        }
        data.push({
            table: {
                widths: ['*'],
                body: [
                    [{ text: text[i], color: 'black', border: [true, true, true, true], alignment: alignment, bold: false, fontSize: 7, margin: [0, 2], },],
                ]
            },
        });
    }
    return {
        border: [false, false, false, false],
        table: {
            widths: widths,
            body: [data]
        },
        layout: 'noBorders'
    };
};

module.exports.pdfTableContentHeaderTwoTextAlignment = function (text1, text2, alignment, backgroundColor) {
    return {
        margin: [0, 2],
        border: [false, false, false, false],
        table: {
            widths: ['*', 10, '*'],
            body: [
                [
                    {
                        table: {
                            widths: ['*'],
                            body: [
                                [
                                    { text: text1, color: 'white', border: [false, false, false, false], alignment: alignment, bold: false, fontSize: 8.5, margin: [0, 2], },
                                ],
                            ]
                        },
                        layout: {
                            fillColor: function (rowIndex, node, columnIndex) {
                                return (rowIndex == 0) ? backgroundColor : null;
                            }
                        }
                    },
                    '',
                    {
                        table: {
                            widths: ['*'],
                            body: [
                                [
                                    { text: text2, color: 'white', border: [false, false, false, false], alignment: alignment, bold: false, fontSize: 8.5, margin: [0, 2], },
                                ],
                            ]
                        },
                        layout: {
                            fillColor: function (rowIndex, node, columnIndex) {
                                return (rowIndex == 0) ? backgroundColor : null;
                            }
                        }
                    },
                ],
            ]
        },
        layout: 'noBorders'
    };
};

module.exports.pdfTableHeaderLeftRightText = function (text1, text2, backgroundColor) {
    return {
        margin: [0, 2],
        border: [false, false, false, false],
        table: {
            widths: ['*', '*'],
            body: [
                [
                    { text: text1, color: 'white', border: [false, false, false, false], alignment: 'left', bold: false, fontSize: 8.5, margin: [0, 1], },
                    { text: text2, color: 'white', border: [false, false, false, false], alignment: 'right', bold: false, fontSize: 8.5, margin: [0, 1], },
                ],
            ]
        },
        layout: {
            fillColor: function (rowIndex, node, columnIndex) {
                return (rowIndex == 0) ? backgroundColor : null;
            }
        }
    };
};

module.exports.pdfTableDataText = function (text) {
    return { text: text, color: 'black', border: [true, false, true, true], alignment: 'center', bold: false, fontSize: 8, margin: [0, 1] };
};

module.exports.pdfTableDataTextFontWithoutBorder = function (text, color, font, alignment) {
    return { text: text, color: color, border: [false, false, false, false], alignment: alignment, bold: false, fontSize: font, margin: [0, 1] };
};

module.exports.pdfTableDataSmallTextWithEachBorderAlignment = function (text, left, top, right, bottom, alignment) {
    return { text: text, color: 'black', border: [left, top, right, bottom], alignment: alignment, bold: false, fontSize: 6.5, margin: [0, 1] };
};

module.exports.pdfTableDataTextWithEachBorder = function (text, left, top, right, bottom) {
    return { text: text, color: 'black', border: [left, top, right, bottom], alignment: 'center', bold: false, fontSize: 8, margin: [0, 1] };
};

module.exports.pdfTableDataTextAlignment = function (text, alignment) {
    return { text: text, color: 'black', border: [true, false, true, true], alignment: alignment, bold: false, fontSize: 8, margin: [0, 0] };
};

module.exports.pdfTableImageWidth = function (image, width) {
    return { image: image, width: width, border: [false, false, false, false] };
};

module.exports.pdfTableImageWidthAlignment = function (image, width, alignment) {
    return { image: image, width: width, alignment: alignment, border: [false, false, false, false] };
};

module.exports.pdfFooter = function (currentPage, pageCount, sponsorLogo, reportDate) {
    return [
        {
            columns: [
                {
                    margin: [20, 0],
                    table: {
                        widths: [160, '*', 70, 90],
                        body: [
                            [
                                { text: `Date Generated ${reportDate}`, fontSize: 7, alignment: 'left', margin: [0, 5, 0, 0] },
                                { text: currentPage.toString() + ' of ' + pageCount, fontSize: 7, alignment: 'center', margin: [0, 5, 0, 0] },
                                { text: 'Powered by ROVUK ', fontSize: 7, alignment: 'right', margin: [0, 5, 0, 0] },
                                { image: sponsorLogo, width: 90, alignment: 'left', },
                            ],
                        ]
                    },
                    layout: 'noBorders'
                },
            ]
        }
    ];
};
module.exports.pdfSignatureWithText = function (text, image, backgroundColor) {
    return {
        style: 'tableExample',
        border: [true, false, true, true],
        table: {
            widths: ['*'],
            body: [
                [
                    { text: text, color: 'white', border: [false, false, false, false], alignment: 'left', bold: false, fontSize: 7.5, margin: [0, 2], }
                ],
                [
                    {
                        style: 'tableExample',
                        border: [true, false, true, true],
                        table: {
                            widths: ['*', '50%', '*'],
                            body: [
                                [
                                    { text: '', border: [false, false, false, false] },
                                    { image: `${image}`, fit: [400, 400], alignment: 'center', margin: [0, 20, 0, 0], border: [false, false, false, false] },
                                    { text: '', border: [false, false, false, false] },
                                ],
                            ]
                        },

                    }
                ],
            ]
        },
        layout: {
            fillColor: function (rowIndex, node, columnIndex) {
                return (rowIndex == 0) ? backgroundColor : null;
            },
            hLineColor: function (i, node) {
                return 'grey';
            },
            vLineColor: function (i, node) {
                return 'grey';
            }
        }
    };
};
module.exports.pdfVendorMinorityHeading = function (title, minorityCode, amount, percentage) {
    return [
        { text: title, color: 'white', border: [false, false, false, false], margin: [0, 1.5], fontSize: 7, alignment: 'left', bold: true, },
        { text: minorityCode, color: 'white', border: [false, false, false, false], margin: [0, 1.5], fontSize: 7, alignment: 'right', bold: true, },
        { text: amount, color: 'white', border: [false, false, false, false], margin: [0, 1.5], fontSize: 7, alignment: 'right', bold: true, },
        { text: percentage, color: 'white', border: [false, false, false, false], margin: [0, 1.5], fontSize: 7, alignment: 'right', bold: true, },
    ];
};

module.exports.pdfVendorMinorityData = function (companyName, minorityCode, amount, percentage) {
    return [
        { text: companyName, color: 'black', border: [false, false, false, false], margin: [0, 1.5], fontSize: 7, alignment: 'left', },
        { text: minorityCode, color: 'black', border: [false, false, false, false], margin: [0, 1.5], fontSize: 7, alignment: 'right', },
        { text: amount, color: 'black', border: [false, false, false, false], margin: [0, 1.5], fontSize: 7, alignment: 'right', },
        { text: percentage, color: 'black', border: [false, false, false, false], margin: [0, 1.5], fontSize: 7, alignment: 'right', },
    ];
};

module.exports.pdfVendorMinorityTotal = function (totalAmount, totalPercentage) {
    return {
        style: 'tableHeader',
        margin: [0, 3],
        table: {
            widths: ['*', '20%'],
            body: [
                [
                    { text: totalAmount, color: 'white', border: [false, false, false, false], margin: [0, 1.5], fontSize: 7, alignment: 'right', },
                    { text: totalPercentage, color: 'white', border: [false, false, false, false], margin: [0, 1.5], fontSize: 7, alignment: 'right', },
                ]
            ]
        },
        layout: {
            fillColor: function (rowIndex, node, columnIndex) {
                return '#023E8A';
            }
        }
    };
};

module.exports.pdfVendorMinoritySubTotal = function (minorityText, minorityAmount, nonMinorityText, nonMinorityAmount) {
    return {
        style: 'tableHeader',
        margin: [0, 3],
        table: {
            widths: ['*', '20%'],
            body: [
                [
                    { text: minorityText, color: 'white', border: [false, false, false, false], margin: [0, 1.5], fontSize: 7, alignment: 'right', },
                    { text: minorityAmount, color: 'white', border: [false, false, false, false], margin: [0, 1.5], fontSize: 7, alignment: 'right', },
                ],
                [
                    { text: nonMinorityText, color: 'white', border: [false, false, false, false], margin: [0, 1.5], fontSize: 7, alignment: 'right', },
                    { text: nonMinorityAmount, color: 'white', border: [false, false, false, false], margin: [0, 1.5], fontSize: 7, alignment: 'right', },
                ]
            ]
        },
        layout: {
            /*  hLineWidth: function (rowIndex, node) {
                 return (rowIndex === 0 || rowIndex === node.table.body.length) ? 1 : 0;
             }, */
            fillColor: function (rowIndex, node, columnIndex) {
                return '#4B8CDF';
            }
        }
    };
};

module.exports.pdfVendorMinorityPerSubTotal = function (minorityText, minorityAmount, minorityPercentage, nonMinorityText, nonMinorityAmount, nonMinorityPercentage) {
    return {
        style: 'tableHeader',
        margin: [0, 3],
        table: {
            widths: ['*', '20%', '20%'],
            body: [
                [
                    { text: minorityText, color: 'white', border: [false, false, false, false], margin: [0, 1.5], fontSize: 7, alignment: 'right', },
                    { text: minorityAmount, color: 'white', border: [false, false, false, false], margin: [0, 1.5], fontSize: 7, alignment: 'right', },
                    { text: minorityPercentage, color: 'white', border: [false, false, false, false], margin: [0, 1.5], fontSize: 7, alignment: 'right', },
                ],
                [
                    { text: nonMinorityText, color: 'white', border: [false, false, false, false], margin: [0, 1.5], fontSize: 7, alignment: 'right', },
                    { text: nonMinorityAmount, color: 'white', border: [false, false, false, false], margin: [0, 1.5], fontSize: 7, alignment: 'right', },
                    { text: nonMinorityPercentage, color: 'white', border: [false, false, false, false], margin: [0, 1.5], fontSize: 7, alignment: 'right', },
                ]
            ]
        },
        layout: {
            /*  hLineWidth: function (rowIndex, node) {
                 return (rowIndex === 0 || rowIndex === node.table.body.length) ? 1 : 0;
             }, */
            fillColor: function (rowIndex, node, columnIndex) {
                return '#4B8CDF';
            }
        }
    };
};

module.exports.pdfVendorMinorityMainTotal = function (minorityText, minorityAmount, nonMinorityText, nonMinorityAmount) {
    return {
        style: 'tableHeader',
        margin: [0, 3],
        table: {
            widths: ['*', '20%'],
            body: [
                [
                    { text: minorityText, color: 'white', border: [false, false, false, false], margin: [0, 1.5], fontSize: 7, alignment: 'right', },
                    { text: minorityAmount, color: 'white', border: [false, false, false, false], margin: [0, 1.5], fontSize: 7, alignment: 'right', },
                ],
                [
                    { text: nonMinorityText, color: 'white', border: [false, false, false, false], margin: [0, 1.5], fontSize: 7, alignment: 'right', },
                    { text: nonMinorityAmount, color: 'white', border: [false, false, false, false], margin: [0, 1.5], fontSize: 7, alignment: 'right', },
                ]
            ]
        },
        layout: {
            fillColor: function (rowIndex, node, columnIndex) {
                return '#227804';
            }
        }
    };
};

module.exports.pdfVendorMinorityPerMainTotal = function (minorityText, minorityAmount, minorityPercentage, nonMinorityText, nonMinorityAmount, nonMinorityPercentage) {
    return {
        style: 'tableHeader',
        margin: [0, 3],
        table: {
            widths: ['*', '20%', '20%'],
            body: [
                [
                    { text: minorityText, color: 'white', border: [false, false, false, false], margin: [0, 1.5], fontSize: 7, alignment: 'right', },
                    { text: minorityAmount, color: 'white', border: [false, false, false, false], margin: [0, 1.5], fontSize: 7, alignment: 'right', },
                    { text: minorityPercentage, color: 'white', border: [false, false, false, false], margin: [0, 1.5], fontSize: 7, alignment: 'right', },
                ],
                [
                    { text: nonMinorityText, color: 'white', border: [false, false, false, false], margin: [0, 1.5], fontSize: 7, alignment: 'right', },
                    { text: nonMinorityAmount, color: 'white', border: [false, false, false, false], margin: [0, 1.5], fontSize: 7, alignment: 'right', },
                    { text: nonMinorityPercentage, color: 'white', border: [false, false, false, false], margin: [0, 1.5], fontSize: 7, alignment: 'right', },
                ]
            ]
        },
        layout: {
            fillColor: function (rowIndex, node, columnIndex) {
                return '#227804';
            }
        }
    };
};

module.exports.documentTableHeaderCell = function (text, width) {
    return new TableCell({
        verticalAlign: VerticalAlign.CENTER,
        width: {
            size: width,
            type: WidthType.PERCENTAGE,
        },
        shading: {
            fill: "023E8A",
            type: ShadingType.CLEAR,
            color: "auto",
        },
        children: [
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: {
                    before: 100,
                    after: 100,
                },
                children: [
                    new TextRun({
                        text: text,
                        size: 24,
                        color: 'FFFFFF'
                    }),
                ],
            }),
        ]
    });
};

module.exports.documentTableDataCell = function (text, width) {
    return new TableCell({
        verticalAlign: VerticalAlign.CENTER,
        width: {
            size: width,
            type: WidthType.PERCENTAGE,
        },
        children: [
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: {
                    before: 70,
                    after: 70,
                },
                children: [
                    new TextRun({
                        text: text,
                        size: 20,
                        color: '000000'
                    }),
                ],
            }),
        ]
    });
};

module.exports.documentImageAlignment = function (image, size, alignment) {
    return new Paragraph({
        alignment: alignment,
        children: [
            new ImageRun({
                data: image,
                transformation: {
                    width: size,
                    height: size,
                },
            }),
        ]
    });
};

module.exports.documentFooter = function (sponsorLogo) {
    return new Footer({
        children: [
            new Table({
                alignment: AlignmentType.CENTER,
                borders: TableBorders.NONE,
                width: {
                    size: 90,
                    type: WidthType.PERCENTAGE,
                },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                verticalAlign: VerticalAlign.CENTER,
                                width: {
                                    size: 30,
                                    type: WidthType.PERCENTAGE,
                                },
                                children: []
                            }),
                            new TableCell({
                                verticalAlign: VerticalAlign.CENTER,
                                width: {
                                    size: 30,
                                    type: WidthType.PERCENTAGE,
                                },
                                children: [
                                    new Paragraph({
                                        alignment: AlignmentType.CENTER,
                                        children: [
                                            new TextRun({
                                                children: [PageNumber.CURRENT, " of ", PageNumber.TOTAL_PAGES],
                                            }),
                                        ],
                                    }),
                                ]
                            }),
                            new TableCell({
                                verticalAlign: VerticalAlign.CENTER,
                                width: {
                                    size: 20,
                                    type: WidthType.PERCENTAGE,
                                },
                                children: [
                                    new Paragraph({
                                        spacing: {
                                            before: 130,
                                            after: 130,
                                        },
                                        alignment: AlignmentType.RIGHT,
                                        children: [
                                            new TextRun({
                                                text: `Powered by  `,
                                                size: 24,
                                            }),
                                        ],
                                    }),
                                ]
                            }),
                            new TableCell({
                                verticalAlign: VerticalAlign.CENTER,
                                width: {
                                    size: 5,
                                    type: WidthType.PERCENTAGE,
                                },
                                children: [
                                    new Paragraph({
                                        alignment: AlignmentType.LEFT,
                                        children: [
                                            new ImageRun({
                                                data: sponsorLogo,
                                                transformation: {
                                                    width: 130,
                                                    height: 30,
                                                },
                                            }),
                                        ],
                                    }),
                                ]
                            }),
                        ]
                    }),
                    new TableRow({
                        children: [
                            new TableCell({
                                verticalAlign: VerticalAlign.CENTER,
                                width: {
                                    size: 90,
                                    type: WidthType.PERCENTAGE,
                                },
                                columnSpan: 4,
                                children: [
                                    new Paragraph({
                                        alignment: AlignmentType.CENTER,
                                        children: [
                                            new TextRun({
                                                children: ["  "],
                                            }),
                                        ],
                                    }),
                                ]
                            }),
                        ]
                    })
                ]
            })
        ],
    });
};

module.exports.documentVendorMinorityCode = function (text) {
    return new Table({
        alignment: AlignmentType.CENTER,
        borders: TableBorders.NONE,
        width: {
            size: 90,
            type: WidthType.PERCENTAGE,
        },
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        shading: {
                            fill: "023E8A",
                            type: ShadingType.CLEAR,
                            color: "auto",
                        },
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.LEFT,
                                spacing: {
                                    before: 120,
                                    after: 120,
                                },
                                children: [
                                    new TextRun({
                                        text: `   ${text}`,
                                        size: 26,
                                        color: 'FFFFFF'
                                    }),
                                ],
                            }),
                        ]
                    }),
                ]
            }),
        ]
    });
};

module.exports.documentVendorMinorityHeading = function (text, minority, amount, percentage) {
    return new Table({
        alignment: AlignmentType.CENTER,
        borders: TableBorders.NONE,
        width: {
            size: 90,
            type: WidthType.PERCENTAGE,
        },
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        width: {
                            size: 30,
                            type: WidthType.PERCENTAGE,
                        },
                        shading: {
                            fill: "848484",
                            type: ShadingType.CLEAR,
                            color: "auto",
                        },
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.LEFT,
                                spacing: {
                                    before: 70,
                                    after: 70,
                                },
                                children: [
                                    new TextRun({
                                        text: `   ${text}`,
                                        size: 22,
                                        color: 'FFFFFF'
                                    }),
                                ],
                            }),
                        ]
                    }),
                    new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        width: {
                            size: 20,
                            type: WidthType.PERCENTAGE,
                        },
                        shading: {
                            fill: "848484",
                            type: ShadingType.CLEAR,
                            color: "auto",
                        },
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.RIGHT,
                                spacing: {
                                    before: 70,
                                    after: 70,
                                },
                                children: [
                                    new TextRun({
                                        text: minority,
                                        size: 22,
                                        color: 'FFFFFF'
                                    }),
                                ],
                            }),
                        ]
                    }),
                    new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        width: {
                            size: 20,
                            type: WidthType.PERCENTAGE,
                        },
                        shading: {
                            fill: "848484",
                            type: ShadingType.CLEAR,
                            color: "auto",
                        },
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.RIGHT,
                                spacing: {
                                    before: 70,
                                    after: 70,
                                },
                                children: [
                                    new TextRun({
                                        text: amount,
                                        size: 22,
                                        color: 'FFFFFF'
                                    }),
                                ],
                            }),
                        ]
                    }),
                    new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        width: {
                            size: 20,
                            type: WidthType.PERCENTAGE,
                        },
                        shading: {
                            fill: "848484",
                            type: ShadingType.CLEAR,
                            color: "auto",
                        },
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.RIGHT,
                                spacing: {
                                    before: 70,
                                    after: 70,
                                },
                                children: [
                                    new TextRun({
                                        text: percentage,
                                        size: 22,
                                        color: 'FFFFFF'
                                    }),
                                ],
                            }),
                        ]
                    }),
                ]
            }),
        ]
    });
};

module.exports.documentVendorMinorityData = function (companyName, minority, amount, percentage) {
    return new Table({
        alignment: AlignmentType.CENTER,
        borders: TableBorders.NONE,
        width: {
            size: 90,
            type: WidthType.PERCENTAGE,
        },
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        width: {
                            size: 30,
                            type: WidthType.PERCENTAGE,
                        },
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.LEFT,
                                spacing: {
                                    before: 70,
                                    after: 70,
                                },
                                children: [
                                    new TextRun({
                                        text: `   ${companyName}`,
                                        size: 21,
                                        color: '000000'
                                    }),
                                ],
                            }),
                        ]
                    }),
                    new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        width: {
                            size: 20,
                            type: WidthType.PERCENTAGE,
                        },
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.RIGHT,
                                spacing: {
                                    before: 70,
                                    after: 70,
                                },
                                children: [
                                    new TextRun({
                                        text: minority,
                                        size: 21,
                                        color: '000000'
                                    }),
                                ],
                            }),
                        ]
                    }),
                    new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        width: {
                            size: 20,
                            type: WidthType.PERCENTAGE,
                        },
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.RIGHT,
                                spacing: {
                                    before: 70,
                                    after: 70,
                                },
                                children: [
                                    new TextRun({
                                        text: `$${amount}`,
                                        size: 21,
                                        color: '000000'
                                    }),
                                ],
                            }),
                        ]
                    }),
                    new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        width: {
                            size: 20,
                            type: WidthType.PERCENTAGE,
                        },
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.RIGHT,
                                spacing: {
                                    before: 70,
                                    after: 70,
                                },
                                children: [
                                    new TextRun({
                                        text: `${percentage}%  `,
                                        size: 21,
                                        color: '000000'
                                    }),
                                ],
                            }),
                        ]
                    }),
                ]
            }),
        ]
    });
};

module.exports.documentVendorMinorityTotal = function (totalAmount, totalPercentage) {
    return new Table({
        alignment: AlignmentType.CENTER,
        borders: TableBorders.NONE,
        width: {
            size: 90,
            type: WidthType.PERCENTAGE,
        },
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        width: {
                            size: 70,
                            type: WidthType.PERCENTAGE,
                        },
                        shading: {
                            fill: "023E8A",
                            type: ShadingType.CLEAR,
                            color: "auto",
                        },
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.RIGHT,
                                spacing: {
                                    before: 70,
                                    after: 70,
                                },
                                children: [
                                    new TextRun({
                                        text: `Total Amount $${totalAmount}`,
                                        size: 21,
                                        color: 'FFFFFF'
                                    }),
                                ],
                            }),
                        ]
                    }),
                    new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        width: {
                            size: 20,
                            type: WidthType.PERCENTAGE,
                        },
                        shading: {
                            fill: "023E8A",
                            type: ShadingType.CLEAR,
                            color: "auto",
                        },
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.RIGHT,
                                spacing: {
                                    before: 70,
                                    after: 70,
                                },
                                children: [
                                    new TextRun({
                                        text: `Total Percentage ${totalPercentage}%  `,
                                        size: 21,
                                        color: 'FFFFFF'
                                    }),
                                ],
                            }),
                        ]
                    }),
                ]
            }),
        ]
    });
};

module.exports.documentVendorMinoritySubTotal = function (minorityText, minorityAmount, minorityPercentage, nonMinorityText, nonMinorityAmount, nonMinorityPercentage) {
    return new Table({
        alignment: AlignmentType.CENTER,
        borders: TableBorders.NONE,
        width: {
            size: 90,
            type: WidthType.PERCENTAGE,
        },
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        width: {
                            size: 50,
                            type: WidthType.PERCENTAGE,
                        },
                        shading: {
                            fill: "4B8CDF",
                            type: ShadingType.CLEAR,
                            color: "auto",
                        },
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.RIGHT,
                                spacing: {
                                    before: 70,
                                    after: 70,
                                },
                                children: [
                                    new TextRun({
                                        text: minorityText,
                                        size: 22,
                                        color: 'FFFFFF'
                                    }),
                                ],
                            }),
                        ]
                    }),
                    new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        width: {
                            size: 20,
                            type: WidthType.PERCENTAGE,
                        },
                        shading: {
                            fill: "4B8CDF",
                            type: ShadingType.CLEAR,
                            color: "auto",
                        },
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.RIGHT,
                                spacing: {
                                    before: 70,
                                    after: 70,
                                },
                                children: [
                                    new TextRun({
                                        text: `$${minorityAmount}`,
                                        size: 22,
                                        color: 'FFFFFF'
                                    }),
                                ],
                            }),
                        ]
                    }),
                    new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        width: {
                            size: 20,
                            type: WidthType.PERCENTAGE,
                        },
                        shading: {
                            fill: "4B8CDF",
                            type: ShadingType.CLEAR,
                            color: "auto",
                        },
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.RIGHT,
                                spacing: {
                                    before: 70,
                                    after: 70,
                                },
                                children: [
                                    new TextRun({
                                        text: `${minorityPercentage}%  `,
                                        size: 22,
                                        color: 'FFFFFF'
                                    }),
                                ],
                            }),
                        ]
                    }),
                ]
            }),
            new TableRow({
                children: [
                    new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        width: {
                            size: 50,
                            type: WidthType.PERCENTAGE,
                        },
                        shading: {
                            fill: "4B8CDF",
                            type: ShadingType.CLEAR,
                            color: "auto",
                        },
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.RIGHT,
                                spacing: {
                                    before: 70,
                                    after: 70,
                                },
                                children: [
                                    new TextRun({
                                        text: nonMinorityText,
                                        size: 22,
                                        color: 'FFFFFF'
                                    }),
                                ],
                            }),
                        ]
                    }),
                    new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        width: {
                            size: 20,
                            type: WidthType.PERCENTAGE,
                        },
                        shading: {
                            fill: "4B8CDF",
                            type: ShadingType.CLEAR,
                            color: "auto",
                        },
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.RIGHT,
                                spacing: {
                                    before: 70,
                                    after: 70,
                                },
                                children: [
                                    new TextRun({
                                        text: `$${nonMinorityAmount}`,
                                        size: 22,
                                        color: 'FFFFFF'
                                    }),
                                ],
                            }),
                        ]
                    }),
                    new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        width: {
                            size: 20,
                            type: WidthType.PERCENTAGE,
                        },
                        shading: {
                            fill: "4B8CDF",
                            type: ShadingType.CLEAR,
                            color: "auto",
                        },
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.RIGHT,
                                spacing: {
                                    before: 70,
                                    after: 70,
                                },
                                children: [
                                    new TextRun({
                                        text: `${nonMinorityPercentage}%  `,
                                        size: 22,
                                        color: 'FFFFFF'
                                    }),
                                ],
                            }),
                        ]
                    }),
                ]
            }),
        ]
    });
};

module.exports.documentVendorMinorityMainTotal = function (text, amount, percentage) {
    return new TableRow({
        children: [
            new TableCell({
                verticalAlign: VerticalAlign.CENTER,
                width: {
                    size: 50,
                    type: WidthType.PERCENTAGE,
                },
                shading: {
                    fill: "227804",
                    type: ShadingType.CLEAR,
                    color: "auto",
                },
                children: [
                    new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        spacing: {
                            before: 100,
                            after: 100,
                        },
                        children: [
                            new TextRun({
                                text: text,
                                size: 22,
                                color: 'FFFFFF'
                            }),
                        ],
                    }),
                ]
            }),
            new TableCell({
                verticalAlign: VerticalAlign.CENTER,
                width: {
                    size: 20,
                    type: WidthType.PERCENTAGE,
                },
                shading: {
                    fill: "227804",
                    type: ShadingType.CLEAR,
                    color: "auto",
                },
                children: [
                    new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        spacing: {
                            before: 100,
                            after: 100,
                        },
                        children: [
                            new TextRun({
                                text: `$${amount.toString()}`,
                                size: 22,
                                color: 'FFFFFF'
                            }),
                        ],
                    }),
                ]
            }),
            new TableCell({
                verticalAlign: VerticalAlign.CENTER,
                width: {
                    size: 20,
                    type: WidthType.PERCENTAGE,
                },
                shading: {
                    fill: "227804",
                    type: ShadingType.CLEAR,
                    color: "auto",
                },
                children: [
                    new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        spacing: {
                            before: 100,
                            after: 100,
                        },
                        children: [
                            new TextRun({
                                text: `${percentage.toString()}%  `,
                                size: 22,
                                color: 'FFFFFF'
                            }),
                        ],
                    }),
                ]
            }),
        ]
    });
};

async function commonAttachmentFunction(thumbnail_attachment_array, attachment_array) {
    let tempData = [];
    let noteAttach = [];
    for (let m = 0; m < attachment_array.length; m++) {
        if (attachment_array[m].includes('jpg') || attachment_array[m].includes('jpeg') || attachment_array[m].includes('png')
            || attachment_array[m].includes('JPG') || attachment_array[m].includes('JPEG') || attachment_array[m].includes('PNG')) {
            let image = await common.urlToBase64(thumbnail_attachment_array[m]);
            if (attachment_array[m].includes('webp')) {
                console.log("image", image);
            }
            tempData.push({ image: `${image}`, link: `${attachment_array[m]}`, alignment: 'center', fit: [100, 100], margin: [0, 0, 0, 0,], alignment: 'center', border: [false, false, false, false], },);
        } else {

            let index = attachment_array[m].lastIndexOf("/");
            let filename = attachment_array[m].substring(index + 1);
            let extension = filename.split(".")[1];
            extension = extension.toLowerCase();
            let image;
            if (extension == "doc" || extension == "docx") {
                image = await common.urlToBase64("https://s3.us-west-1.wasabisys.com/rovukdata/dailyreport_doc.png");
            } else if (extension == "pdf") {
                image = await common.urlToBase64("https://s3.us-west-1.wasabisys.com/rovukdata/dailyreport_pdf.png");
            } else if (extension == "xls" || extension == "xlsx" || extension == "csv") {
                image = await common.urlToBase64("https://s3.us-west-1.wasabisys.com/rovukdata/dailyreport_xls.png");
            } else if (extension == "zip") {
                image = await common.urlToBase64("https://s3.us-west-1.wasabisys.com/rovukdata/dailyreport_zip.png");
            } else if (extension == "ppt" || extension == "pptx") {
                image = await common.urlToBase64("https://s3.us-west-1.wasabisys.com/rovukdata/dailyreport_ppt.png");
            } else if (extension == "rtf") {
                image = await common.urlToBase64("https://s3.us-west-1.wasabisys.com/rovukdata/rtf_big.png");
            } else if (extension == "odt") {
                image = await common.urlToBase64("https://s3.us-west-1.wasabisys.com/rovukdata/dailyreport_odt.png");
            } else if (extension == "gif") {
                image = await common.urlToBase64("https://s3.us-west-1.wasabisys.com/rovukdata/gif_big.png");
            } else if (extension == "svg") {
                image = await common.urlToBase64("https://s3.us-west-1.wasabisys.com/rovukdata/dailyreport_svg.png");
            } else if (extension == "txt") {
                image = await common.urlToBase64("https://s3.us-west-1.wasabisys.com/rovukdata/dailyreport_txt.png");
            } else {
                image = await common.urlToBase64("https://s3.us-west-1.wasabisys.com/rovukdata/no-preview_big.png");
            }
            tempData.push({ image: `${image}`, link: `${attachment_array[m]}`, alignment: 'center', fit: [100, 100], margin: [0, 0, 0, 0,], alignment: 'center', border: [false, false, false, false], },);
        }
        if (tempData.length == 5) {
            noteAttach.push(tempData);
            tempData = [];
        }
    }
    if (tempData.length != 0) {
        let neededData = 5 - tempData.length;
        for (let j = 0; j < neededData; j++) {
            tempData.push({ text: '', border: [false, false, false, false] });
        }
        noteAttach.push(tempData);
    }

    let table_image = {
        widths: ['20%', '20%', '20%', '20%', '20%'],
        body: [[]]
    };
    if (noteAttach.length != 0) {
        table_image = {
            widths: ['20%', '20%', '20%', '20%', '20%'],
            body: noteAttach,
        };
    }
    return table_image;
}

module.exports.commonAttachmentTableFunction = function (thumbnail_attachment_array, attachment_array) {
    return commonAttachmentFunction(thumbnail_attachment_array, attachment_array);
};

module.exports.saveProjectInManagement = function (requestObject) {
    var request = require('request');
    const options = {
        'method': 'POST',
        'url': config.managementAPIUrl + '/webapi/v2/portal/saveprojectfromsupplier',
        'headers': {
            'Content-Type': 'application/json'
        },
        rejectUnauthorized: false,
        body: JSON.stringify(requestObject)
    };
    return new Promise(function (resolve, reject) {
        request(options, function (err, resp, body) {
            if (err) {
                reject(err);
            } else {
                resolve({ body });
            }
        });
    });
};

// Update Company Logo if Vendor is Rovuk Client
module.exports.updateCompanyLogoOfVendor = async function (decodedToken, vendorId) {
    let connection_db_api1 = await db_connection.connection_db_api(decodedToken);
    let ocpsVendorSchemaConnection = connection_db_api1.model(collectionConstant.VENDOR_USER, ocps_vendorSchema);
    let find_one_vendor = await ocpsVendorSchemaConnection.findOne({ _id: ObjectID(vendorId) });
    if (find_one_vendor.is_rovuk_client) {
        let main_db = await db_rest_api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
        let update_vendor_company_logo = await db_rest_api.update(main_db, collectionConstant.SUPER_ADMIN_COMPANY, { _id: ObjectID(find_one_vendor.company_id) }, { companylogo: find_one_vendor.vendor_profile });
        console.log("update_vendor_company_logo: ", update_vendor_company_logo);
    }
};

// Update Company Logo if Vendor is Rovuk Client
module.exports.updateCompanyLogoOfiFrameVendor = async function (ocpsVendorSchemaConnection, vendorId) {
    // let connection_db_api1 = await db_connection.connection_db_api(decodedToken);
    // let ocpsVendorSchemaConnection = connection_db_api1.model(collectionConstant.VENDOR_USER, ocps_vendorSchema);
    let find_one_vendor = await ocpsVendorSchemaConnection.findOne({ _id: ObjectID(vendorId) });
    if (find_one_vendor.is_rovuk_client) {
        let main_db = await db_rest_api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
        let update_vendor_company_logo = await db_rest_api.update(main_db, collectionConstant.SUPER_ADMIN_COMPANY, { _id: ObjectID(find_one_vendor.company_id) }, { companylogo: find_one_vendor.vendor_profile });
        console.log("update_vendor_company_logo: ", update_vendor_company_logo);
    }
};

module.exports.setInsertedFieldHistory = async function (requestObject) {
    return new Promise(function (resolve, reject) {
        let newObj = {};
        Object.keys(requestObject)
            .sort()
            .forEach(function (key, i) {
                newObj[key] = requestObject[key];
            });
        const arr = Object.entries(newObj).map(([key, value]) => ({ key, value }));
        resolve(arr);
    });
};

module.exports.findUpdatedFieldHistory = async function (requestObject, dbData) {
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
        const result = _.pickBy(newObj, (request, database) => !_.isEqual(newData[database], request));
        const arr = Object.entries(result).map(([key, value]) => ({ key, value }));
        resolve(arr);
    });
};

// Call API of Send Invoice for processing
module.exports.sendInvoiceForProcess = function (requestObject) {
    return new Promise(function (resolve, reject) {
        var request = require('request');
        // 'url': 'http://db-invoice.rovuk.us:8000/process', 
        const options = {
            'method': 'POST',
            'url': 'http://74.208.214.203:5000/process_invoice',
            'headers': {
                'Content-Type': 'application/json'
            },
            // rejectUnauthorized: false,
            body: JSON.stringify(requestObject)
        };
        request(options, function (err, resp, body) {
            if (err) {
                reject(err);
            } else {
                resolve({ body });
            }
        });
    });
};

// Call API of Get Invoice Process Status
module.exports.getInvoiceProcessStatus = function (queryString) {
    return new Promise(function (resolve, reject) {
        var request = require('request');
        const options = {
            'method': 'GET',
            'url': `http://db-invoice.rovuk.us:8000/get_process_status${queryString}`,
            'headers': {
                'Content-Type': 'application/json',
                'X-API-KEY': '4194168a-4a32-45d9-9d7c-0a730f887e7f'
            },
            rejectUnauthorized: false,
        };
        request(options, function (err, resp, body) {
            if (err) {
                reject(err);
            } else {
                if (resp.statusCode == 200) {
                    resolve({ status: true, data: JSON.parse(body) });
                } else {
                    resolve({ status: false });
                }
            }
        });
    });
};

// Call API of Get Invoice for processing
module.exports.getProcessedDocuments = function (requestObject) {
    var request = require('request');
    const options = {
        'method': 'GET',
        'url': `http://db-invoice.rovuk.us:8000/get_documents_by_id${requestObject}`,
        'headers': {
            'Content-Type': 'application/json',
            'X-API-KEY': '4194168a-4a32-45d9-9d7c-0a730f887e7f'
        },
        rejectUnauthorized: false,
    };
    return new Promise(function (resolve, reject) {
        request(options, function (err, resp, body) {
            if (err) {
                reject(err);
            } else {
                if (resp.statusCode == 200) {
                    resolve({ status: true, data: JSON.parse(body) });
                } else {
                    resolve({ status: false });
                }
            }
        });
    });
};

// Call API of Get Invoice for processing
module.exports.getCustomerStates = function (companycode) {
    var request = require('request');
    const options = {
        'method': 'GET',
        'url': `http://db-invoice.rovuk.us:8000/customer_monthly_stats?customer_id=${companycode}`,
        'headers': {
            'Content-Type': 'application/json',
            'X-API-KEY': '4194168a-4a32-45d9-9d7c-0a730f887e7f'
        },
        rejectUnauthorized: false,
    };
    return new Promise(function (resolve, reject) {
        request(options, function (err, resp, body) {
            if (err) {
                reject(err);
            } else {
                if (resp.statusCode == 200) {
                    resolve({ status: true, data: JSON.parse(body) });
                } else {
                    resolve({ status: false });
                }
            }
        });
    });
};