var validator = require("../../../../../controller/common/validationforrequest");

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

const changePasswordValidation = (req, res, next) => {
    const validationRule = {
        "password": "required|confirmed",
        "oldpassword": "required|string",
        "password_confirmation": "required"
    };
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            let error = err.first('password') ? err.first('password') : "";
            error += err.first('oldpassword') ? err.first('oldpassword') : "";
            error += err.first('password_confirmation') ? err.first('password_confirmation') : "";
            res.send({
                status: false,
                message: error,
                data: err
            });
        } else {
            next();
        }
    });
};

const sponsorforgetpassword = (req, res, next) => {
    const validationRule = {
        "email": "required|email",
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

const sendUserPasswordValidation = (req, res, next) => {
    const validationRule = {
        "password": "required"
    };
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            let error = err.first('password') ? err.first('useremail') : "";
            res.send({
                status: false,
                message: error
            });
        } else {
            next();
        }
    });
};

const getCompanySetting = (req, res, next) => {
    const validationRule = {
        "companycode": "required"
    };
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            let error = err.first('companycode') ? err.first('companycode') : "";
            res.send({
                status: false,
                message: error
            });
        } else {
            next();
        }
    });
};

const sendOTP = (req, res, next) => {
    const validationRule = {
        "companycode": "required",
        "useremail": "required",
    };
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            let error = err.first('companycode') ? err.first('companycode') : "";
            res.send({
                status: false,
                message: error
            });
        } else {
            next();
        }
    });
};

const submitOTP = (req, res, next) => {
    const validationRule = {
        "companycode": "required",
        "useremail": "required",
        "otp": "required",
    };
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            let error = err.first('companycode') ? err.first('companycode') : "";
            res.send({
                status: false,
                message: error
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
    changePasswordValidation,
    sponsorforgetpassword,
    sendUserPasswordValidation,
    getCompanySetting,
    sendOTP,
    submitOTP,
    getLoginCompanyList,
    sendEmailOTP,
    submitEmailOTP,
    loginWithEmailOTP,
    emailForgotPassword,
    sendEmailForgotPassword,
    getMyCompanyList,
};