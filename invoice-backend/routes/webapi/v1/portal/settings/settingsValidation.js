var validator = require("../../../../../controller/common/validationforrequest");

const smtpUpdateValidation = (req, res, next) => {
    const validationRule = {
        "tenant_smtp_password": "required",
        "tenant_smtp_port": "required",
        "tenant_smtp_reply_to_mail": "required",
        "tenant_smtp_security": "required",
        "tenant_smtp_server": "required",
        "tenant_smtp_timeout": "required",
        "tenant_smtp_username": "required"
    };

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
};
const companyValidation = (req, res, next) => {
    const validationRule = {
        "companyname": "required",
        "companyphone": "required",
        "companyemail": "required"
    };
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
};

const smtpGetValidation = (req, res, next) => {
    const validationRule = {
        "_id": "required"
    };
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
};

const compnayupdatequickbooksValidation = (req, res, next) => {
    const validationRule = {
        "quickbooks_client_id": "required",
        "quickbooks_client_secret": "required"
    };
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
};
module.exports = {
    smtpUpdateValidation,
    smtpGetValidation,
    companyValidation,
    compnayupdatequickbooksValidation
};