var validator = require("../../../../../controller/common/validationforrequest");


const getCompanyCodeOcpr = (req, res, next) => {
    const validationRule = {
        "sponsor_id": "required"
    }
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.send({
                status: false,
                message: 'Validation failed',
                data: err
            });
        } else {
            next();
        }
    });
}


const saveCompanyCode = (req, res, next) => {
    const validationRule = {
        "category_code": "required",
        "category_name": "required",
        "sub_category_code": "required",
        "sub_category_code_name": "required"
    }
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.send({
                status: false,
                message: 'Validation failed',
                data: err
            });
        } else {
            next();
        }
    });
}

const deleteCompanyCode = (req, res, next) => {
    const validationRule = {
        "_id": "required"
    }
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.send({
                status: false,
                message: 'Validation failed',
                data: err
            });
        } else {
            next();
        }
    });
}

module.exports = {
    getCompanyCodeOcpr,
    saveCompanyCode,
    deleteCompanyCode
}