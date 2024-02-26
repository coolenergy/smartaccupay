var validator = require("../../../../../controller/common/validationforrequest");

const savevendortype = (req, res, next) => {
    const validationRule = {
        "name": "required"
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

const deletevendortype = (req, res, next) => {
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

const getVendorTypeForTableValidation = (req, res, next) => {
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
module.exports = {
    savevendortype,
    deletevendortype,
    getVendorTypeForTableValidation
};