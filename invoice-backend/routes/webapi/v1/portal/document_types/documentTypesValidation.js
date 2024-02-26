var validator = require("../../../../../controller/common/validationforrequest");

const saveDocumentType = (req, res, next) => {
    const validationRule = {
        "name": "required"
    }
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
}

const deleteDocumentType = (req, res, next) => {
    const validationRule = {
        "_id": "required"
    }
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
}

module.exports = {
    saveDocumentType,
    deleteDocumentType
}