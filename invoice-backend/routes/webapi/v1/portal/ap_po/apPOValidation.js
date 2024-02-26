var validator = require('./../../../../../controller/common/validationforrequest');

const getOneAPPO = (req, res, next) => {
    const validationRule = {
        "_id": "required",
    };
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.send({ status: false, message: err });
        } else {
            next();
        }
    });
};

const deleteAPPO = (req, res, next) => {
    const validationRule = {
        "is_delete": "required|integer",
    };
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.send({ status: false, message: err });
        } else {
            next();
        }
    });
};

module.exports = {
    getOneAPPO,
    deleteAPPO,
};