var validator = require('./../../../../../controller/common/validationforrequest');

const getOneVendor = (req, res, next) => {
    const validationRule = {
        "_id": "required",
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

const getVendorForTable = (req, res, next) => {
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

const saveVendor = (req, res, next) => {
    const validationRule = {
        "vendor_name": "required",
        "vendor_phone": "required",
        "vendor_email": "required",
        "vendor_address": "required",
        "vendor_city": "required",
        "vendor_state": "required",
        "vendor_zipcode": "required",
        "vendor_terms": "required",
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

const deleteVendor = (req, res, next) => {
    const validationRule = {
        "is_delete": "required|integer"
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

const deleteMultipleVendor = (req, res, next) => {
    const validationRule = {
        "_id": "required",
        "is_delete": "required|integer"
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

const updateVendorStatus = (req, res, next) => {
    const validationRule = {
        "vendor_status": "required"
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

const updateMultipleVendorStatus = (req, res, next) => {
    const validationRule = {
        "_id": "required",
        "vendor_status": "required"
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
    getOneVendor,
    getVendorForTable,
    saveVendor,
    deleteVendor,
    updateVendorStatus,
    updateMultipleVendorStatus,
    deleteMultipleVendor
};