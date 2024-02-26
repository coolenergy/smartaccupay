var validator = require("../../../../../controller/common/validationforrequest");

const manufacturerValidation = (req, res, next) => {
    const validationRule = {
        "name": "required|string"
    }
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.send({
                status: false,
                message: err,
            });
        } else {
            next();
        }
    });
}

const manufacturerDeleteValidation = (req, res, next) => {
    const validationRule = {
        "_id": "required|string"
    }
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.send({
                status: false,
                message: err
            });
        } else {
            next();
        }
    });
}

module.exports = {
    manufacturerValidation,
    manufacturerDeleteValidation
}