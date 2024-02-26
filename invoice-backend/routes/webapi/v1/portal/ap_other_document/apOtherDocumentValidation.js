var validator = require('./../../../../../controller/common/validationforrequest');

const getOneAPOtherDocument = (req, res, next) => {
    const validationRule = {
        "_id": "required",
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

module.exports = {
    getOneAPOtherDocument,
};