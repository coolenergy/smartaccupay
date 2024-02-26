var ObjectID = require('mongodb').ObjectID;
let collectionConstant = require('../../../../../config/collectionConstant');
var ObjectID = require('mongodb').ObjectID;
var certificationTypesSchema = require('../../../../../model/supplier_certifications_types');
var vendorCertificationSchema = require('../../../../../model/supplier_vendor_certificates');
let common = require('../../../../../controller/common/common');
let db_connection = require('../../../../../controller/common/connectiondb');

module.exports.getCertificationTypeOcpr = async function (req, res) {
    var requestObject = req.body;
    var translator = new common.Language('en');
    DB.findOne(collectionConstant.SUPER_ADMIN_COMPANY, { _id: ObjectID(requestObject.sponsor_id) }, function (err, resultfind) {
        if (err) {
            res.send({ message: translator.getStr('SomethingWrong'), error: err, status: false });
        } else {
            if (resultfind != null) {
                DB.findOne(collectionConstant.SUPER_ADMIN_TENANTS, { companycode: resultfind.companycode }, async function (err, resulttanent) {
                    if (err) {
                        res.send({ message: translator.getStr('SomethingWrong'), error: err, status: false });
                    } else {
                        var translator = new common.Language('en');
                        let connection_db_api = await db_connection.connection_db_api(resulttanent);
                        try {
                            let vendorCertificationConnection = connection_db_api.model(collectionConstant.SUPPLIER_VENDOR_CERTIFICATES, vendorCertificationSchema);
                            let vendor_certi = await vendorCertificationConnection.find({ vendor_id: ObjectID(requestObject.vendor_id) });
                            let certiIds = [];
                            vendor_certi.forEach((element) => {
                                certiIds.push(ObjectID(element.certificate_type_id));
                            });
                            let certificationTypeConnection = connection_db_api.model(collectionConstant.SUPPLIER_CERTIFICATION_TYPE, certificationTypesSchema);
                            var aggregateQuery = [
                                {
                                    $match: {
                                        is_delete: 0, is_parent: true,
                                        // _id: { $nin: certiIds }
                                    }
                                },
                                { $sort: { name: 1 } }
                            ];
                            let getData = await certificationTypeConnection.aggregate(aggregateQuery);
                            res.send({ data: getData, status: true });
                        } catch (e) {
                            console.log("e", e);
                            res.send({ message: translator.getStr('SomethingWrong'), status: false });
                        } finally {
                            connection_db_api.close();
                        }
                    }
                });
            } else {
                res.send({ message: translator.getStr('SponsorNotExist'), error: err, status: false });
            }
        }
    });
};


module.exports.getCertificationType = async function (req, res) {
    var translator = new common.Language('en');
    var decodedToken = common.decodedJWT(req.headers.authorization);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let certificationTypeConnection = connection_db_api.model(collectionConstant.SUPPLIER_CERTIFICATION_TYPE, certificationTypesSchema);

            var aggregateQuery = [
                { $match: { is_delete: 0, is_parent: true } },
                /*  {
                     $lookup: {
                         from: collectionConstant.SUPPLIER_CERTIFICATION_TYPE,
                         localField: "_id",
                         foreignField: "parent_type_id",
                         as: "document_type",
                     },
                 }, */
                {
                    $lookup: {
                        from: collectionConstant.SUPPLIER_CERTIFICATION_TYPE,
                        let: { id: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$parent_type_id", "$$id"] },
                                            { $eq: ["$is_delete", 0] }
                                        ]
                                    }
                                },
                            },
                        ],
                        as: "document_type"
                    }
                },
                { $sort: { name: 1 } }
            ];
            let getData = await certificationTypeConnection.aggregate(aggregateQuery);
            // let getData = await certificationTypeConnection.find({ is_delete: 0 })
            res.send({ data: getData, status: true });
        } catch (e) {
            res.send({ message: translator.getStr('SomethingWrong'), status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.saveCertificationType = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let _id = requestObject._id;
            delete requestObject._id;
            let certificationTypeConnection = connection_db_api.model(collectionConstant.SUPPLIER_CERTIFICATION_TYPE, certificationTypesSchema);
            let get_one = await certificationTypeConnection.findOne({ name: requestObject.name, is_expiration: requestObject.is_expiration, is_delete: 0 });
            if (_id) {
                if (get_one != null) {
                    if (get_one._id == _id) {
                        let update_certification_type = await certificationTypeConnection.updateOne({ _id: ObjectID(_id) }, requestObject);
                        if (update_certification_type) {
                            res.send({ message: translator.getStr('CertificationTypeUpdate'), data: update_certification_type, status: true });
                        } else {
                            res.send({ message: translator.getStr('SomethingWrong'), status: false });
                        }
                    } else {
                        res.send({ message: translator.getStr('CertificationTypeAlreadyExist'), status: false });
                    }
                } else {
                    let update_certification_type = await certificationTypeConnection.updateOne({ _id: ObjectID(_id) }, requestObject);
                    if (update_certification_type) {
                        res.send({ message: translator.getStr('CertificationTypeUpdate'), data: update_certification_type, status: true });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), status: false });
                    }
                }
            } else {
                if (get_one == null) {
                    let add_certification_type = new certificationTypeConnection(requestObject);
                    let save_certification_type = await add_certification_type.save();
                    if (save_certification_type) {
                        res.send({ message: translator.getStr('CertificationTypeAdd'), data: save_certification_type, status: true });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), status: false });
                    }
                } else {
                    res.send({ message: translator.getStr('CertificationTypeAlreadyExist'), status: false });
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

module.exports.deleteCertificationType = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let certificationTypeConnection = connection_db_api.model(collectionConstant.SUPPLIER_CERTIFICATION_TYPE, certificationTypesSchema);
            let deleteObject = await certificationTypeConnection.updateOne({ _id: ObjectID(requestObject._id) }, { is_delete: 1 });
            if (deleteObject) {
                let isDelete = deleteObject.nModified;
                if (isDelete == 0) {
                    res.send({ message: translator.getStr('NoDataWithId'), status: false });
                } else {
                    res.send({ message: translator.getStr('CertificationTypeDelete'), status: true });
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