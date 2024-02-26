var validator = require("../../../../controller/common/validationforrequest");

const login = (req, res, next) => {
    const validationRule = {
        "useremail": "required|email",
        "password": "required",
        "companycode": "required"
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

const sendOTPforLoginValidation = (req, res, next) => {
    const validationRule = {
        "useremail": "required|email",
        "companycode": "required|string"
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
const submitEmailOTPforLoginValidation = (req, res, next) => {
    const validationRule = {
        "useremail": "required|email",
        "companycode": "required|string",
        "otp": "required|string"
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
const changePasswordValidation = (req, res, next) => {
    const validationRule = {
        "password": "required|confirmed",
        "oldpassword": "required|string",
        "password_confirmation": "required"
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
const forgetPasswordValidation = (req, res, next) => {
    const validationRule = {
        "useremail": "required|email",
        "companycode": "required|string"
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

const helpMail = (req, res, next) => {
    const validationRule = {
        "help_subject": "required",
        "help_email": "required",
        "help_phone": "required",
        "help_message": "required",
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

const getLoginCompanyList = (req, res, next) => {
    const validationRule = {
        "useremail": "required|email",
        "password": "required",
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

const sendEmailOTP = (req, res, next) => {
    const validationRule = {
        "useremail": "required",
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

const submitEmailOTP = (req, res, next) => {
    const validationRule = {
        "useremail": "required",
        "otp": "required",
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

const loginWithEmailOTP = (req, res, next) => {
    const validationRule = {
        "useremail": "required",
        "_id": "required",
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

const emailForgotPassword = (req, res, next) => {
    const validationRule = {
        "useremail": "required",
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

const sendEmailForgotPassword = (req, res, next) => {
    const validationRule = {
        "useremail": "required",
        "_id": "required",
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

const getMyCompanyList = (req, res, next) => {
    const validationRule = {
        "useremail": "required",
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
    login,
    sendOTPforLoginValidation,
    submitEmailOTPforLoginValidation,
    changePasswordValidation,
    forgetPasswordValidation,
    helpMail,
    getLoginCompanyList,
    sendEmailOTP,
    submitEmailOTP,
    loginWithEmailOTP,
    emailForgotPassword,
    sendEmailForgotPassword,
    getMyCompanyList,
};