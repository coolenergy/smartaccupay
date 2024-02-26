var validator = require("../../../../../controller/common/validationforrequest");

const documentTypeValidation = (req, res, next) => {
    const validationRule = {
        "document_type_name": "required|string"
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

const documentTypeDeleteValidation = (req, res, next) => {
    const validationRule = {
        "_id": "required|string"
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
const getdocumentTypeForTableValidation = (req, res, next) => {
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
    documentTypeValidation,
    documentTypeDeleteValidation,
    getdocumentTypeForTableValidation
};