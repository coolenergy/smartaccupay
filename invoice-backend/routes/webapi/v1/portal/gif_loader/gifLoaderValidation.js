var validator = require("../../../../../controller/common/validationforrequest");

const getGIFLoader = (req, res, next) => {
    const validationRule = {
        "module_name": "required",
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

module.exports = {
    getGIFLoader,
};