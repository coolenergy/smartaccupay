var formidable = require('formidable');
var fs = require('fs');
var bucketOpration = require('./s3-wasabi');
var config = require('./../../config/config');
var common = require('./common');
var moment = require('moment');
const sharp = require('sharp');
const imageThumbnail = require('image-thumbnail');
module.exports.saveAttechment = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        try {
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
                    console.log(name, field);
                    fields[name] = field;
                })
                .on('error', function (err) {
                    throw err;
                }).on('end', async function () {
                    newOpenFile = this.openedFiles;
                    let dir_name = config.INVOICE_WASABI_PATH + "/" + fields.dir_name;
                    let LowerCase_bucket = decodedToken.companycode.toLowerCase();
                    let that = this;
                    let resObject = [];
                    let tmp_i = 0;
                    if (notFonud == 1) {
                        for (let i = 0; i < this.openedFiles.length; i++) {
                            var temp_path = this.openedFiles[i].path;
                            let date = moment().format('D_MMM_YYYY_hh_mm_ss_SSS_A');
                            let array_name = this.openedFiles[i].name.split(".");
                            var file_name_ext = array_name[array_name.length - 1];
                            var file_name = date + "." + file_name_ext;
                            var fileBody = fs.readFileSync(temp_path);
                            var temp_data = await imageUploadOnly(fileBody, LowerCase_bucket, dir_name, file_name);
                            if (temp_data == 'error') {
                                tmp_i++;
                            } else {
                                tmp_i++;
                                resObject.push(temp_data);
                            }
                            if (tmp_i == that.openedFiles.length) {
                                console.log("finallllllll: ", resObject);
                                res.send({ message: translator.getStr('AttachmentAdded'), status: true, data: resObject });
                            }
                        }
                    } else {
                        res.send({ message: translator.getStr('AttachmentAdded'), status: true, data: [] });
                    }
                });
        } catch (e) {
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.saveAttechmentV2 = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        try {
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
                    let dir_name = config.INVOICE_WASABI_PATH + "/" + fields.dir_name;
                    let thumb_dir_name = config.INVOICE_WASABI_PATH + "/" + fields.thumb_dir_name;
                    let local_date = fields.local_date == undefined || fields.local_date == null ? "" : fields.local_date;
                    let LowerCase_bucket = decodedToken.companycode.toLowerCase();
                    let that = this;
                    let resObject = [];
                    let thumb_data = [];
                    let tmp_i = 0;
                    if (notFonud == 1) {
                        for (let i = 0; i < this.openedFiles.length; i++) {
                            var temp_path = this.openedFiles[i].path;
                            let date = moment().format('D_MMM_YYYY_hh_mm_ss_SSS_A');
                            let array_name = this.openedFiles[i].name.split(".");
                            var file_name_ext = array_name[array_name.length - 1];
                            var file_name = date + "." + file_name_ext;

                            var fileBody = fs.readFileSync(temp_path);
                            var temp_data = await imageCompressAndUpload(fileBody, LowerCase_bucket, dir_name, thumb_dir_name, file_name, file_name_ext, local_date);
                            if (temp_data == 'error') {
                                tmp_i++;
                            } else {
                                tmp_i++;
                                resObject.push(temp_data.urlProfile);
                                thumb_data.push(temp_data.urlProfile_thumb);
                            }
                            if (tmp_i == that.openedFiles.length) {
                                console.log("final: ", resObject, thumb_data);
                                res.send({ message: translator.getStr('AttachmentAdded'), status: true, data: resObject, thumb_data: thumb_data });
                            }
                        }
                    } else {
                        res.send({ message: translator.getStr('AttachmentAdded'), status: true, data: [], thumb_data: [] });
                    }
                });
        } catch (e) {
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

function imageCompressAndUpload(fileBody, LowerCase_bucket, dir_name, thumb_dir_name, file_name, file_name_ext, local_date) {
    return new Promise(async function (resolve, reject) {
        dirKeyName = dir_name + "/" + file_name;
        file_name_ext = file_name_ext.toLowerCase();
        if (file_name_ext == 'jpg' || file_name_ext == 'jpeg' || file_name_ext == 'png' || file_name_ext == 'webp') {
            params = { Bucket: LowerCase_bucket, Key: dirKeyName, Body: fileBody, ACL: 'public-read-write' };
            var urlProfile = config.wasabisys_url + "/" + LowerCase_bucket + "/" + dir_name + "/" + file_name;
            bucketOpration.uploadFile(params, async function (err, result) {
                if (err) {
                    console.log("err", err);
                    resolve('error');
                } else {
                    console.log("urlProfile: ", urlProfile);
                    try {
                        let option = {
                            width: 150, height: 150, fit: 'fill'
                        };

                        const thumbnail = await imageThumbnail({ uri: urlProfile }, option);
                        const width = 150;
                        const height = 150;
                        const svgText = `
                        <svg width="${width}" height="${height}">
                        <style>
                        .title { fill: white; font-size: 15px}
                        .title_black { fill: black; font-size: 15px}
                        </style>
                        <text  x="49%" y="90%"  text-anchor="middle" class="title">${local_date}</text>
                        <text  x="49.5%" y="90.5%"  text-anchor="middle" class="title_black">${local_date}</text>
                        </svg>`;
                        const svgBuffer = Buffer.from(svgText);
                        sharp(thumbnail)
                            .composite([{ input: svgBuffer, left: 10, top: 10 }])
                            .toBuffer().then(async (data) => {
                                let tmp_dirKeyName = thumb_dir_name + "/" + file_name;
                                var urlProfile_thumb = config.wasabisys_url + "/" + LowerCase_bucket + "/" + thumb_dir_name + "/" + file_name;
                                params = { Bucket: LowerCase_bucket, Key: tmp_dirKeyName, Body: data, ACL: 'public-read-write' };
                                bucketOpration.uploadFile(params, async function (err, result) {
                                    if (err) {
                                        console.log("err", err);
                                        resolve({
                                            urlProfile, urlProfile_thumb: urlProfile
                                        });
                                    } else {
                                        resolve({ urlProfile, urlProfile_thumb });
                                    }
                                });
                            });
                    } catch (err) {
                        console.error(err);
                    }
                }
            });
        } else {
            console.log("other type attachment");
            params = { Bucket: LowerCase_bucket, Key: dirKeyName, Body: fileBody, ACL: 'public-read-write' };
            var urlProfile = config.wasabisys_url + "/" + LowerCase_bucket + "/" + dir_name + "/" + file_name;
            bucketOpration.uploadFile(params, async function (err, result) {
                if (err) {
                    console.log("err", err);
                    resolve('error');
                } else {
                    console.log("urlProfile: ", urlProfile);
                    let urlProfile_thumb = urlProfile;
                    resolve({ urlProfile, urlProfile_thumb });
                }
            });
        }
    });
}

function imageUploadOnly(fileBody, LowerCase_bucket, dir_name, file_name) {
    return new Promise(async function (resolve, reject) {
        let array_name = file_name.split(".");
        var file_name_ext = array_name[array_name.length - 1];
        let dirKeyName = dir_name + "/" + file_name;
        file_name_ext = file_name_ext.toLowerCase();
        if (file_name_ext == 'jpg' || file_name_ext == 'jpeg' || file_name_ext == 'png' || file_name_ext == 'webp') {
            console.log("image");
            params = { Bucket: LowerCase_bucket, Key: dirKeyName, Body: fileBody, ACL: 'public-read-write' };
            var urlProfile = config.wasabisys_url + "/" + LowerCase_bucket + "/" + dir_name + "/" + file_name;
            bucketOpration.uploadFile(params, async function (err, result) {
                if (err) {
                    console.log("err", err);
                    resolve('error');
                } else {
                    console.log("urlProfile: ", urlProfile);
                    resolve(urlProfile);
                }
            });
        } else {
            console.log("other type attachment");
            params = { Bucket: LowerCase_bucket, Key: dirKeyName, Body: fileBody, ACL: 'public-read-write' };
            var urlProfile = config.wasabisys_url + "/" + LowerCase_bucket + "/" + dir_name + "/" + file_name;
            bucketOpration.uploadFile(params, async function (err, result) {
                if (err) {
                    console.log("err", err);
                    resolve('error');
                } else {
                    console.log("urlProfile: ", urlProfile);
                    resolve(urlProfile);
                }
            });
            //resolve(data);
        }
    });
}

module.exports.saveProfileImagesCompany = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        try {
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
                    console.log(name, field);
                    fields[name] = field;
                })
                .on('error', function (err) {
                    throw err;
                }).on('end', async function () {
                    newOpenFile = this.openedFiles;
                    let folder_name = fields.folder_name;
                    let LowerCase_bucket = decodedToken.companycode.toLowerCase();
                    let that = this;
                    if (notFonud == 1) {
                        var temp_path = this.openedFiles[0].path;
                        var file_name = this.openedFiles[0].name;
                        dirKeyName = config.INVOICE_WASABI_PATH + "/" + "company/" + folder_name + "/profile/" + file_name;
                        var fileBody = fs.readFileSync(temp_path);
                        params = { Bucket: LowerCase_bucket, Key: dirKeyName, Body: fileBody, ACL: 'public-read-write' };
                        var urlProfile = config.wasabisys_url + "/" + LowerCase_bucket + "/" + "company/" + folder_name + "/profile/" + file_name;
                        console.log("urlProfile", urlProfile);
                        bucketOpration.uploadFile(params, async function (err, result) {
                            if (err) {
                                res.send({ message: translator.getStr('SomethingWrong'), status: false, data: "" });
                            } else {
                                res.send({ message: translator.getStr('AttachmentAdded'), status: true, data: urlProfile });
                            }
                        });
                    } else {
                        res.send({ message: translator.getStr('AttachmentAdded'), status: true, data: "" });
                    }
                });
        } catch (e) {
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};


module.exports.saveSeftyTalksFile = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        try {
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
                    console.log(name, field);
                    fields[name] = field;
                })
                .on('error', function (err) {
                    throw err;
                }).on('end', async function () {
                    newOpenFile = this.openedFiles;
                    let folder_name = fields.folder_name;
                    let LowerCase_bucket = decodedToken.companycode.toLowerCase();
                    let that = this;
                    let resObject = [];
                    let tmp_i = 0;
                    if (notFonud == 1) {
                        var temp_path = this.openedFiles[0].path;
                        let date = moment().format('D_MMM_YYYY_hh_mm_ss_SSS_A');
                        let array_name = this.openedFiles[0].name.split(".");
                        var file_name_ext = array_name[array_name.length - 1];
                        var file_name = this.openedFiles[0].name;
                        var fileBody = fs.readFileSync(temp_path);
                        console.log("start: ", typeof fileBody);
                        var temp_data = await fileUploadOnly(fileBody, LowerCase_bucket, folder_name, file_name, file_name_ext);
                        console.log("end: ", typeof temp_data, temp_data);
                        if (temp_data == 'error') {
                            res.send({ message: translator.getStr('AttachmentAdded'), status: true, data: "" });
                        } else {
                            res.send({ message: translator.getStr('AttachmentAdded'), status: true, data: temp_data });
                        }


                    } else {
                        res.send({ message: translator.getStr('AttachmentAdded'), status: true, data: "" });
                    }
                });
        } catch (e) {
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};


function fileUploadOnly(fileBody, LowerCase_bucket, folder_name, file_name, file_name_ext) {
    return new Promise(async function (resolve, reject) {
        console.log("file_name: ", file_name);
        dirKeyName = config.INVOICE_WASABI_PATH + "/" + "company/" + folder_name + "/" + file_name;
        file_name_ext = file_name_ext.toLowerCase();

        params = { Bucket: LowerCase_bucket, Key: dirKeyName, Body: fileBody, ACL: 'public-read-write' };
        var urlProfile = config.wasabisys_url + "/" + LowerCase_bucket + "/" + "company/" + folder_name + "/" + file_name;
        console.log("start uploading");
        bucketOpration.uploadFile(params, async function (err, result) {
            console.log("att uploaded");
            if (err) {
                console.log("err", err);
                resolve('error');

            } else {
                console.log("urlProfile: ", urlProfile);

                resolve(urlProfile);

            }
        });


    });
}

module.exports.saveImagesInWasabiV2 = async function (req, res) {
    // when ever call this api image store in sapecifcic location which give by user request peremetere dirkeyname
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        try {
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
                    console.log(name, field);
                    fields[name] = field;
                })
                .on('error', function (err) {
                    throw err;
                }).on('end', async function () {
                    newOpenFile = this.openedFiles;
                    let folder_name = fields.folder_name;
                    let LowerCase_bucket = decodedToken.companycode.toLowerCase();
                    let that = this;
                    if (notFonud == 1) {
                        var temp_path = this.openedFiles[0].path;
                        var file_name = this.openedFiles[0].name;
                        dirKeyName = config.INVOICE_WASABI_PATH + "/" + fields.dirkeyname + file_name;
                        var fileBody = fs.readFileSync(temp_path);
                        params = { Bucket: LowerCase_bucket, Key: dirKeyName, Body: fileBody, ACL: 'public-read-write' };
                        var urlProfile = config.wasabisys_url + "/" + LowerCase_bucket + "/" + config.INVOICE_WASABI_PATH + "/" + fields.dirkeyname + file_name;
                        console.log("urlProfile", urlProfile);
                        bucketOpration.uploadFile(params, async function (err, result) {
                            if (err) {
                                res.send({ message: translator.getStr('SomethingWrong'), status: false, data: "" });
                            } else {
                                res.send({ message: translator.getStr('AttachmentAdded'), status: true, data: urlProfile });
                            }
                        });
                    } else {
                        res.send({ message: translator.getStr('AttachmentAdded'), status: true, data: "" });
                    }
                });
        } catch (e) {
            console.log("=============e", e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};