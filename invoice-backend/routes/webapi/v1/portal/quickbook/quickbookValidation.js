var validator = require("../../../../../controller/common/validationforrequest");

const savequickBookValidation = (req, res, next) => {
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
            console.log("else");
            next();
        }
    });
};
const isConnecttoQBOValidation = (req, res, next) => {
    const validationRule = {
        "data": "required"
    };

    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.send({
                status: false,
                message: err,
            });
        } else {
            console.log("else");
            next();
        }
    });
};
const logoutValidation = (req, res, next) => {
    const validationRule = {
        "companycode": "required"
    };

    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.send({
                status: false,
                message: err,
            });
        } else {
            console.log("else");
            next();
        }
    });
};
module.exports = {
    savequickBookValidation,
    isConnecttoQBOValidation,
    logoutValidation
};