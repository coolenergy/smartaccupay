const { validate } = require('string-mask');
var validator = require('./../../../../../controller/common/validationforrequest');

//save and update template
const saveTemplate = (req, res, next) => {
    const validationRule = {
        "template_name": "required",
        "status": "required",
        "note": "required"
    };
    validator(req.body, validationRule, {}, (erorr, status) => {
        if (!status) {
            res.send({ status: false, erorr: erorr });
        } else {
            next();
        }

    });
};

//delete template 
const deleteTemplate = (req, res, next) => {
    const validationRule = {
        "_id": "required",
        "is_delete": "required"
    };
    validator(req.body, validationRule, {}, (error, status) => {
        if (!status) {
            res.send({ status: false, error: error });
        } else {
            next();
        }
    });
};

//data table for template
const datatableTemplate = (req, res, next) => {
    const validationRule = {
        "is_delete": "required|integer",
    };
    validator(req.body, validationRule, {}, (error, status) => {
        if (!status) {
            res.send({ status: false, erorr: error });
        } else {
            next();
        }
    });
};

//data table for history template
const datatablehistoryTemplate = (req, res, next) => {
    const validationRule = {
        "is_delete": "required|integer",
    };
    validator(req.body, validationRule, {}, (error, status) => {
        if (!status) {
            res.send({ status: false, erorr: error });
        } else {
            next();
        }
    });
};

module.exports = { saveTemplate, deleteTemplate, datatableTemplate, datatablehistoryTemplate  };
