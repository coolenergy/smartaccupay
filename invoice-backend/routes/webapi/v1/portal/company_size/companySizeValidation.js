var validator = require("../../../../../controller/common/validationforrequest");

const saveCompanySize = (req, res, next) => {
    const validationRule = {
        "name": "required"
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

const deleteCompanySize = (req, res, next) => {
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

const getCompanySizeOcpr = (req, res, next) => {
    const validationRule = {
        "name": "required"
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
    saveCompanySize,
    deleteCompanySize,
    getCompanySizeOcpr
}