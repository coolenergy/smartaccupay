var validator = require("../../../../../controller/common/validationforrequest");

const savejobname = (req, res, next) => {
    const validationRule = {
        "name": "required",
        "email_contact": "required"
    };
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.send({
                status: false,
                message: err
            });
        }
        else {
            next();
        }
    });
};

const deletejobname = (req, res, next) => {
    const validationRule = {
        "_id": "required"
    };
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.send({
                status: false,
                message: err
            });
        }
        else {
            next();
        }
    });
};

const getJobNameForTableValidation = (req, res, next) => {
    const validationRule = {
        "is_delete": "required",
    };
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
};

module.exports = { savejobname, deletejobname, getJobNameForTableValidation };