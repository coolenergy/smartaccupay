var job_nameSchema = require('../../../../../model/job_name');
let db_connection = require('../../../../../controller/common/connectiondb');
let collectionConstant = require('../../../../../config/collectionConstant');
let common = require('../../../../../controller/common/common');
var ObjectID = require('mongodb').ObjectID;
var formidable = require('formidable');
const reader = require('xlsx');

// job name insert Edit 
module.exports.savejobname = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var jobnameConnection = connection_db_api.model(collectionConstant.JOB_NAME, job_nameSchema);
            let id = requestObject._id;
            delete requestObject._id;

            let get_data = await jobnameConnection.findOne({ name: requestObject.name, is_delete: 0 });

            if (id) {
                //update  job name
                if (get_data != null) {
                    if (get_data._id == id) {
                        let updatejobname = await jobnameConnection.updateOne({ _id: ObjectID(id) }, requestObject);
                        if (updatejobname) {
                            res.send({ status: true, message: "job name update successfully..!" });
                        } else {
                            res.send({ message: translator.getStr('SomethingWrong'), status: false });
                        }
                    } else {
                        res.send({ message: "job name allready exist", status: false });

                    }
                } else {
                    let updatejobname = await jobnameConnection.updateOne({ _id: ObjectID(id) }, requestObject);
                    if (updatejobname) {
                        res.send({ status: true, message: "job name update succesfully..!" });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });

                    }
                }

            }
            else {
                //insert invoice job name

                var nameexist = await jobnameConnection.findOne({ "name": requestObject.name });
                if (nameexist) {
                    res.send({ status: false, message: "job name allready exist" });
                }
                else {
                    var add_jobname = new jobnameConnection(requestObject);
                    var save_jobname = await add_jobname.save();
                    res.send({ status: true, message: "job name insert successfully..!", data: add_jobname });
                }

            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        }
        finally {
            connection_db_api.close();
        }
    }
    else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};


// get job name
module.exports.getjobname = async function (req, res) {

    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);

    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var jobnameConnection = connection_db_api.model(collectionConstant.JOB_NAME, job_nameSchema);
            let get_data = await jobnameConnection.find({ is_delete: 0 });
            res.send({ status: true, message: "Get job name", data: get_data });

        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    }
    else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

//delete job name

module.exports.deletejobname = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {

            var requestObject = req.body;
            let id = requestObject._id;
            delete requestObject._id;
            var jobnameConnection = connection_db_api.model(collectionConstant.JOB_NAME, job_nameSchema);
            let updated_data = await jobnameConnection.updateOne({ _id: ObjectID(id) }, { is_delete: 1 });
            var is_delete = updated_data.nModified;
            if (is_delete == 0) {
                res.send({ status: false, message: "There is no data with this id" });
            }
            else {
                res.send({ status: true, message: "job name deleted successfully..!", data: updated_data });

            }
        } catch (e) {
            console.log(e);
            res.send({ status: false, message: translator.getStr('SomethingWrong'), rerror: e });
        } finally {
            connection_db_api.close();
        }
    }
    else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });

    }
};

// bulk upload 
module.exports.importjobname = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var jobnameConnection = connection_db_api.model(collectionConstant.JOB_NAME, job_nameSchema);

            var form = new formidable.IncomingForm();
            var fields = [];
            var notFonud = 0;
            var newOpenFile;
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
                }).on('end', async function () {
                    newOpenFile = this.openedFiles;

                    if (notFonud == 1) {

                        const file = reader.readFile(newOpenFile[0].path);
                        const sheets = file.SheetNames;
                        let data = [];
                        for (let i = 0; i < sheets.length; i++) {
                            const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[i]]);
                            temp.forEach((ress) => {
                                data.push(ress);
                            });
                        }
                        for (let m = 0; m < data.length; m++) {
                            requestObject = {};
                            let onecategory_main = await jobnameConnection.findOne({ name: data[m].name, email_contact: data[m].email_contact, is_delete: 0 });
                            if (onecategory_main == null) {
                                requestObject.name = data[m].name;
                                requestObject.email_contact = data[m].email_contact;
                                let add_jobname = new jobnameConnection(requestObject);
                                let save_jobname = await add_jobname.save();
                            } else {
                                res.send({ status: true, message: "job name info name or email contact is allready exist." });
                            }
                        }
                        res.send({ status: true, message: "job name info add successfully." });

                    } else {
                        res.send({ status: false, message: translator.getStr('SomethingWrong'), rerror: e });
                    }
                });
        } catch (error) {
            console.log(error);
            res.send({ status: false, message: translator.getStr('SomethingWrong'), rerror: e });
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.getJobNameForTable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var jobnameConnection = connection_db_api.model(collectionConstant.JOB_NAME, job_nameSchema);
            var getdata = await jobnameConnection.find({ is_delete: requestObject.is_delete });
            if (getdata) {
                res.send(getdata);
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
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};
