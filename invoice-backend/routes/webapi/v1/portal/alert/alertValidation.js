var validator = require("../../../../../controller/common/validationforrequest");

const getScheduleOfItemDocument = (req, res, next) => {
    const validationRule = {
        "schedule_of_item_id": "required",
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

const getOneScheduleOfItemDocument = (req, res, next) => {
    const validationRule = {
        "_id": "required",
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

const saveScheduleOfItemDocument = (req, res, next) => {
    const validationRule = {
        "schedule_of_item_id": "required",
        "document_name": "required",
        "document_description": "required",
        "document_type_id": "required",
        "document_link": "required",
        "start_epoch": "required|integer",
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

const deleteScheduleOfItemDocument = (req, res, next) => {
    const validationRule = {
        "_id": "required",
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

const getScheduleOfItemDocumentHistoryDatatables = (req, res, next) => {
    const validationRule = {
        "schedule_of_item_id": "required",
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

const sendScheduleDocument = (req, res, next) => {
    const validationRule = {
        "link": "required",
        "recipients": "required|array",
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
    getScheduleOfItemDocument,
    getOneScheduleOfItemDocument,
    saveScheduleOfItemDocument,
    deleteScheduleOfItemDocument,
    getScheduleOfItemDocumentHistoryDatatables,
    sendScheduleDocument,
};