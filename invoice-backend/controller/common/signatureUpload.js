
var formidable = require('formidable');
var fs = require('fs');
var bucketOpration = require('./s3-wasabi');
var config = require('./../../config/config');
var common = require('./common');

module.exports.saveSignature = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        try {
            let LowerCase_bucket = decodedToken.companycode.toLowerCase();
            dirKeyName = config.INVOICE_WASABI_PATH + "/" + "company/" + req.body.foldername + "/signature/" + req.body._id + "/signature" + new Date().getTime() + ".png";
            buf = Buffer.from(req.body.fileBody.replace(/^data:image\/\w+;base64,/, ""), 'base64');
            params = { Bucket: LowerCase_bucket, Key: dirKeyName, Body: buf, ACL: 'public-read-write' };
            var urlProfile = config.wasabisys_url + "/" + LowerCase_bucket + "/" + dirKeyName;
            bucketOpration.uploadFile(params, async function (err, result) {
                if (err) {
                    console.log(err);
                    res.send({ message: translator.getStr('SignatureUploaded'), status: true, data: "" });
                } else {
                    res.send({ message: translator.getStr('SignatureUploaded'), status: true, data: urlProfile });
                }
            });
        } catch (e) {
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};


module.exports.saveSignatureWasabiv2 = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        try {
            let LowerCase_bucket = decodedToken.companycode.toLowerCase();
            dirKeyName = config.INVOICE_WASABI_PATH + "/" + req.body.dirkeyname + "/signature_" + new Date().getTime() + ".png";
            buf = Buffer.from(req.body.fileBody.replace(/^data:image\/\w+;base64,/, ""), 'base64');
            params = { Bucket: LowerCase_bucket, Key: dirKeyName, Body: buf, ACL: 'public-read-write' };
            var urlProfile = config.wasabisys_url + "/" + LowerCase_bucket + "/" + dirKeyName;
            bucketOpration.uploadFile(params, async function (err, result) {
                if (err) {
                    console.log(err);
                    res.send({ message: translator.getStr('SignatureUploaded'), status: true, data: "" });
                } else {
                    res.send({ message: translator.getStr('SignatureUploaded'), status: true, data: urlProfile });
                }
            });
        } catch (e) {
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};