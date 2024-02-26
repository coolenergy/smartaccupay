var validator = require("../../../../../controller/common/validationforrequest");

const getOneInvoiceMessage = (req, res, next) => {
    const validationRule = {
        "invoice_id": "required",
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

const sendInvoiceMessage = (req, res, next) => {
    const validationRule = {
        "users": "required|array",
        "invoice_id": "required",
        "message": "required",
        "is_first": "required|boolean",
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

const deleteInvoiceMessage = (req, res, next) => {
    const validationRule = {
        "_id": "required",
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

module.exports = {
    getOneInvoiceMessage,
    sendInvoiceMessage,
    deleteInvoiceMessage,
};