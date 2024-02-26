var validator = require("../../../../../controller/common/validationforrequest");

const getOneAPDocumentProcess = (req, res, next) => {
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

const saveAPDocumentProcess = (req, res, next) => {
    const validationRule = {
        "ids": "pdf_urls|array"
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
    getOneAPDocumentProcess,
    saveAPDocumentProcess,
};