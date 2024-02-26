var validator = require("../../../../../controller/common/validationforrequest");

const departmentValidation = (req, res, next) => {
    const validationRule = {
        "department_name": "required|string"
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

const departmentDeleteValidation = (req, res, next) => {
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

const getdepartmentForTableValidation = (req, res, next) => {
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
    departmentValidation,
    departmentDeleteValidation,
    getdepartmentForTableValidation
};