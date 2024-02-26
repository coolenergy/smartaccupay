var validator = require("../../../../../controller/common/validationforrequest");

const getOneProcessInvoice = (req, res, next) => {
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

const deleteInvoiceProcess = (req, res, next) => {
    const validationRule = {
        "ids": "required|Array"
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
    getOneProcessInvoice,
    deleteInvoiceProcess,
};