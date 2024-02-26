var validator = require('./../../../../../controller/common/validationforrequest');

const getOneAPReceivingSlip = (req, res, next) => {
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

const deleteAPReceivingSlip = (req, res, next) => {
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
    getOneAPReceivingSlip,
    deleteAPReceivingSlip,
};