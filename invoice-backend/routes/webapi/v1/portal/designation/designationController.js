var designationSchema = require('./../../../../../model/designation');
var vendorContactSchema = require('./../../../../../model/vendor_contact');
var ObjectID = require('mongodb').ObjectID;
var common = require("./../../../../../controller/common/common");
let db_connection = require('./../../../../../controller/common/connectiondb');
let collectionConstant = require('./../../../../../config/collectionConstant');

module.exports.getdesignations = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {

            let designationCollection = connection_db_api.model(collectionConstant.DESIGNATION, designationSchema);
            let all_designation = await designationCollection.find();
            res.send({ message: translator.getStr('DesignationListing'), data: all_designation, status: true });
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

module.exports.savedesignation = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;

            let designationCollection = connection_db_api.model(collectionConstant.DESIGNATION, designationSchema);
            if (requestObject._id) {
                let update_designation = await designationCollection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
                let isUpdated = update_designation['nModified'];
                if (update_designation) {
                    if (isUpdated == 0) {
                        res.send({ message: translator.getStr('NoDataWithId'), status: false });
                    } else {
                        res.send({ message: translator.getStr('DesignationUpdated'), data: update_designation, status: true });
                    }
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                let add_designation = new designationCollection(requestObject);
                let save_designation = await add_designation.save();
                if (save_designation) {
                    res.send({ message: translator.getStr('DesignationAdded'), data: save_designation, status: true });
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

module.exports.deletedesignation = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {

            let vendorContactCollection = connection_db_api.model(collectionConstant.VENDOR_CONTACT, vendorContactSchema);
            let vendorContactObject = await vendorContactCollection.find({ designation_id: ObjectID(req.body._id) });
            if (vendorContactObject.length > 0) {
                res.send({ message: translator.getStr('DesignationHasData'), status: false });
            } else {
                let designationCollection = connection_db_api.model(collectionConstant.DESIGNATION, designationSchema);
                let designationObject = await designationCollection.remove({ _id: ObjectID(req.body._id) });
                let isDeleted = designationObject['deletedCount'];
                if (designationObject) {
                    if (isDeleted == 0) {
                        res.send({ message: translator.getStr('NoDataWithId'), status: false });
                    } else {
                        res.send({ message: translator.getStr('DesignationDeleted'), status: true });
                    }
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            }
        } catch (e) {
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};