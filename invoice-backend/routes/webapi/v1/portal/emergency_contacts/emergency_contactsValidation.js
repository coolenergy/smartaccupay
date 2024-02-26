var validator = require("../../../../../controller/common/validationforrequest");

const emergencycontactsValidation = (req, res, next) => {
    const validationRule = {
        "emergency_contact_name": "required",
        "emergency_contact_relation": "required",
        "emergency_contact_userid": "required",
        "emergency_contact_phone": "required",
        "emergency_contact_email": "required"
    };
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            let error = err.first('emergency_contact_name') ? err.first('emergency_contact_name') : "";
            error += err.first('emergency_contact_relation') ? err.first('emergency_contact_relation') : "";
            error += err.first('emergency_contact_userid') ? err.first('emergency_contact_userid') : "";
            error += err.first('emergency_contact_phone') ? err.first('emergency_contact_phone') : "";
            error += err.first('emergency_contact_email') ? err.first('emergency_contact_email') : "";
            res.send({
                status: false,
                message: error,
            });
        } else {
            next();
        }
    });
};


const emergencycontactsDeleteValidation = (req, res, next) => {
    const validationRule = {
        "_id": "required"
    };
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            let error = err.first('_id') ? err.first('_id') : "";
            res.send({
                status: false,
                message: error,
            });
        } else {
            next();
        }
    });
};

const emergencycontactsSendReminderValidation = (req, res, next) => {
    const validationRule = {
        "_id": "required"
    };
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            let error = err.first('_id') ? err.first('_id') : "";
            res.send({
                status: false,
                message: error,
            });
        } else {
            next();
        }
    });
};

module.exports = {
    emergencycontactsValidation,
    emergencycontactsDeleteValidation,
    emergencycontactsSendReminderValidation
};
