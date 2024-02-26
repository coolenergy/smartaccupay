var validator = require("../../../../../controller/common/validationforrequest");

const sendAppInvitationValidation = (req, res, next) => {
    const validationRule = {
        "name": "required",
        "recipient": "required",
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

const sendDocumentExpirationValidation = (req, res, next) => {
    const validationRule = {
        "_id": "required",
        "type": "required",
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

const saveSignatureValidation = (req, res, next) => {
    const validationRule = {
        "user_id": "required",
        "signature": "required",
    };
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.send({
                status: false,
                message: 'Validation failed',
                err: err,
            });
        } else {
            next();
        }
    });
};

const userIdCardFlagUpdateValidation = (req, res, next) => {
    const validationRule = {
        "_id": "required",
        "show_id_card_on_qrcode_scan": "required|boolean",
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

const getUserForTableValidation = (req, res, next) => {
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
    sendAppInvitationValidation,
    sendDocumentExpirationValidation,
    saveSignatureValidation,
    userIdCardFlagUpdateValidation,
    getUserForTableValidation
};