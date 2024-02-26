var validator = require('./../../../../../controller/common/validationforrequest');

const saveTerm = (req, res, next) => {
    const validationRule = {
        "name": "required",
        "due_days": "required|integer",
    };
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.send({ status: false, message: err });
        } else {
            next();
        }
    });
};

const deleteTerm = (req, res, next) => {
    const validationRule = {
        "_id": "required"
    };
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.send({ status: false, message: err });
        }
        else {
            next();
        }
    });
};


const getTermForTableValidation = (req, res, next) => {
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
    saveTerm,
    deleteTerm,
    getTermForTableValidation
};