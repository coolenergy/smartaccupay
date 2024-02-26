var validator = require("../../../../../controller/common/validationforrequest");

const saveclientValidation = (req, res, next) => {
    const validationRule = {
        "client_name": "required",
        "client_email": "required"
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

const deleteclientvalidation = (req, res, next) => {
    const validationRule = {
        "is_delete": "required"
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

module.exports = {
    saveclientValidation,
    deleteclientvalidation,
};