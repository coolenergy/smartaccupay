var ObjectID = require('mongodb').ObjectID;
let collectionConstant = require('./../../../../../config/collectionConstant');
var supplier_compnay_codesSchema = require('./../../../../../model/supplier_compnay_codes');
let common = require('./../../../../../controller/common/common');
let db_connection = require('./../../../../../controller/common/connectiondb');
var formidable = require('formidable');
const reader = require('xlsx');

module.exports.getCompanyCodeOcpr = async function (req, res) {
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
                            let supplierCompnayCodesSchemaConnection = connection_db_api.model(collectionConstant.SUPPLIER_COMPANY_CODE, supplier_compnay_codesSchema);
                            var aggregateQuery = [
                                { $match: { is_delete: 0 } },
                                {
                                    $project: {
                                        category: { $concat: ["$category_code", " - ", "$category_name"] },
                                        tmpObject: {
                                            _id: "$_id",
                                            category_code: "$category_code",
                                            category_name: "$category_name",
                                            sub_category_code: "$sub_category_code",
                                            sub_category_code_name: "$sub_category_code_name",
                                        },
                                    }
                                },
                                {
                                    $group: {
                                        _id: "$category",
                                        data: { $push: "$tmpObject" },
                                    }
                                },
                                { $sort: { _id: 1 } }
                            ];

                            let getData = await supplierCompnayCodesSchemaConnection.aggregate(aggregateQuery);
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

module.exports.getCompanyCode = async function (req, res) {
    var translator = new common.Language('en');
    var decodedToken = common.decodedJWT(req.headers.authorization);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {

            var requestObject = req.body;
            //update
            let supplierCompnayCodesSchemaConnection = connection_db_api.model(collectionConstant.SUPPLIER_COMPANY_CODE, supplier_compnay_codesSchema);
            var aggregateQuery = [
                { $match: { is_delete: 0 } },
                {
                    $project: {
                        category: { $concat: ["$category_code", " - ", "$category_name"] },
                        tmpObject: {
                            _id: "$_id",
                            category_code: "$category_code",
                            category_name: "$category_name",
                            sub_category_code: "$sub_category_code",
                            sub_category_code_name: "$sub_category_code_name",
                        },
                    }
                },
                {
                    $group: {
                        _id: "$category",
                        data: { $push: "$tmpObject" },
                    }
                },
                { $sort: { _id: 1 } }
            ];

            let getData = await supplierCompnayCodesSchemaConnection.aggregate(aggregateQuery);
            res.send({ data: getData, status: true });

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

module.exports.saveCompanyCode = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let _id = requestObject._id;
            delete requestObject._id;
            let supplierCompnayCodesSchemaConnection = connection_db_api.model(collectionConstant.SUPPLIER_COMPANY_CODE, supplier_compnay_codesSchema);
            let get_one = await supplierCompnayCodesSchemaConnection.findOne({ sub_category_code: requestObject.sub_category_code, sub_category_code_name: requestObject.sub_category_code_name, is_delete: 0 });
            if (_id) {
                if (get_one != null) {
                    if (get_one._id == _id) {
                        let update_company_code = await supplierCompnayCodesSchemaConnection.updateOne({ _id: ObjectID(_id) }, requestObject);
                        if (update_company_code) {
                            res.send({ message: translator.getStr('CompanyCodeUpdate'), data: update_company_code, status: true });
                        } else {
                            res.send({ message: translator.getStr('SomethingWrong'), status: false });
                        }
                    } else {
                        res.send({ message: translator.getStr('CompanyCodeAlreadyExist'), status: false });
                    }
                } else {
                    let update_company_code = await supplierCompnayCodesSchemaConnection.updateOne({ _id: ObjectID(_id) }, requestObject);
                    if (update_company_code) {
                        res.send({ message: translator.getStr('CompanyCodeUpdate'), data: update_company_code, status: true });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), status: false });
                    }
                }
            } else {
                if (get_one == null) {
                    let add_company_code = new supplierCompnayCodesSchemaConnection(requestObject);
                    let save_company_code = await add_company_code.save();
                    if (save_company_code) {
                        res.send({ message: translator.getStr('CompanyCodeAdd'), data: save_company_code, status: true });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), status: false });
                    }
                } else {
                    res.send({ message: translator.getStr('CompanyCodeAlreadyExist'), status: false });
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

module.exports.deleteCompanyCode = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let supplierCompnayCodesSchemaConnection = connection_db_api.model(collectionConstant.SUPPLIER_COMPANY_CODE, supplier_compnay_codesSchema);
            let deleteObject = await supplierCompnayCodesSchemaConnection.updateOne({ _id: ObjectID(requestObject._id) }, { is_delete: 1 });
            if (deleteObject) {
                let isDelete = deleteObject.nModified;
                if (isDelete == 0) {
                    res.send({ message: translator.getStr('NoDataWithId'), status: false });
                } else {
                    res.send({ message: translator.getStr('CompanyCodeDelete'), status: true });
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

module.exports.getOneCompanyCode = async function (req, res) {
    var translator = new common.Language('en');
    var decodedToken = common.decodedJWT(req.headers.authorization);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let supplierCompnayCodesSchemaConnection = connection_db_api.model(collectionConstant.SUPPLIER_COMPANY_CODE, supplier_compnay_codesSchema);
            let getData = await supplierCompnayCodesSchemaConnection.findOne({ _id: ObjectID(requestObject._id) });
            res.send({ data: getData, status: true });
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

module.exports.getCompanyCodeDatatables = async function (req, res) {
    var translator = new common.Language('en');
    var decodedToken = common.decodedJWT(req.headers.authorization);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let supplierCompnayCodesSchemaConnection = connection_db_api.model(collectionConstant.SUPPLIER_COMPANY_CODE, supplier_compnay_codesSchema);
            var col = [];

            col.push('category_name', "category_code", "sub_category_code", "sub_category_code_name");

            var start = parseInt(requestObject.start);
            var perpage = parseInt(requestObject.length);
            var columnData = (requestObject.order != undefined && requestObject.order != '') ? requestObject.order[0].column : '';
            var columntype = (requestObject.order != undefined && requestObject.order != '') ? requestObject.order[0].dir : '';
            var query_tmp = {
                is_delete: 0
            };
            var sort = {};
            sort[col[columnData]] = (columntype == 'asc') ? 1 : -1;

            var query = {
                $or: [{ "category_name": new RegExp(requestObject.search.value, 'i') },
                { "category_code": new RegExp(requestObject.search.value, 'i') },
                { "sub_category_code": new RegExp(requestObject.search.value, 'i') },
                { "sub_category_code_name": new RegExp(requestObject.search.value, 'i') }]
            };
            var aggregateQuery = [
                { $sort: sort },
                { $match: query_tmp },
                { $match: query },
                { $skip: start },
                { $limit: perpage },
            ];
            let count_data = await supplierCompnayCodesSchemaConnection.countDocuments(query_tmp);
            let tmp_get_data = await supplierCompnayCodesSchemaConnection.aggregate(aggregateQuery);
            var dataResponce = {};
            dataResponce.data = tmp_get_data;
            dataResponce.draw = requestObject.draw;
            dataResponce.recordsTotal = tmp_get_data.length;
            dataResponce.recordsFiltered = (requestObject.search.value) ? tmp_get_data.length : count_data;
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

module.exports.importCompnayCode = async function (req, res) {
    var translator = new common.Language('en');
    var decodedToken = common.decodedJWT(req.headers.authorization);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let supplierCompnayCodesSchemaConnection = connection_db_api.model(collectionConstant.SUPPLIER_COMPANY_CODE, supplier_compnay_codesSchema);
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
                        let main_object = [];
                        let categoryCode = '';
                        let categoryName = '';
                        for (let i = 2; i < data.length; i++) {
                            let find_data = { sub_category_code: data[i]['__EMPTY_1'].toString(), sub_category_code_name: data[i]['__EMPTY_2'], is_delete: 0 };
                            let onecategory_main = await supplierCompnayCodesSchemaConnection.findOne(find_data);
                            if (onecategory_main == null) {
                                if (data[i]['NAICS Codes']) {
                                    categoryCode = data[i]['NAICS Codes'];
                                }
                                if (data[i]['__EMPTY']) {
                                    categoryName = data[i]['__EMPTY'];
                                }
                                let requestObject = {
                                    "category_code": categoryCode.toString(),
                                    "category_name": categoryName,
                                    "sub_category_code": data[i]['__EMPTY_1'].toString(),
                                    "sub_category_code_name": data[i]['__EMPTY_2'],
                                    "is_delete": 0
                                };
                                let add_company_code = new supplierCompnayCodesSchemaConnection(requestObject);
                                let save_company_code = await add_company_code.save();
                                // main_object.push(requestObject)
                            } else {
                                //res.send({ message: "Certification type already exist", status: false })
                            }
                        }
                        // res.send(main_object)
                        res.send({ status: true, message: translator.getStr('CompanyCodeAdd') });
                    }
                });
        } catch (e) {
            res.send({ message: translator.getStr('SomethingWrong'), status: false });
        } finally {
            // connection_db_api.close()
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.exportcompnaycode = async function (req, res) {
    var translator = new common.Language('en');
    var decodedToken = common.decodedJWT(req.headers.authorization);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {


            let supplierCompnayCodesSchemaConnection = connection_db_api.model(collectionConstant.SUPPLIER_COMPANY_CODE, supplier_compnay_codesSchema);
            var aggregateQuery = [
                { $match: { is_delete: 0 } },
                {
                    $project: {
                        category: { $concat: ["$category_code", " - ", "$category_name"] },
                        tmpObject: {
                            _id: "$_id",
                            category_code: "$category_code",
                            category_name: "$category_name",
                            sub_category_code: "$sub_category_code",
                            sub_category_code_name: "$sub_category_code_name",
                        },
                    }
                },
                {
                    $group: {
                        _id: "$category",
                        data: { $push: "$tmpObject" },
                    }
                }
            ];

            let getData = await supplierCompnayCodesSchemaConnection.aggregate(aggregateQuery);

            res.send({ data: getData, status: true });

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