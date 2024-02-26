var validator = require('./../../../../../controller/common/validationforrequest');

const savecostcode = (req, res, next) => {
    const validationRule = {
        "division": "required",
        "cost_code": "required",

    };
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.send({ status: false, message: err });
        } else {
            next();
        }
    });
};

const deletecostCode = (req, res, next) => {
    const validationRule = {
        "_id": "required"
    };
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.send({ status: false, message: err });
        }
        else {
            next();
        }
    });
};

module.exports = { savecostcode, deletecostCode };