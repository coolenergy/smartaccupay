var validator = require("../../../../../controller/common/validationforrequest");

const getCostCodeValidation = (req, res, next) => {
    const validationRule = {
        "module": "required",
    };
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
};

const getAllCostCodeValidation = (req, res, next) => {
    const validationRule = {
    };
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
};

const costCodeValidation = (req, res, next) => {
    const validationRule = {
        "cost_code": "required",
        "division": "required",
        "module": "required",
    };
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
};

const costCodeDeleteValidation = (req, res, next) => {
    const validationRule = {
        "_id": "required|string"
    };
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
};

const getCostCodeForTableValidation = (req, res, next) => {
    const validationRule = {
        "is_delete": "required",
    };
    validator(req.body, validationRule, {}, (error, status) => {
        if (!status) {
            res.send({ status: false, error: error });
        }
        else {
            next();
        }
    });
};

module.exports = {
    costCodeValidation, costCodeDeleteValidation, getAllCostCodeValidation, getCostCodeValidation, getCostCodeForTableValidation
};