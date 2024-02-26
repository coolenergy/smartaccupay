var validator = require('./../../../../controller/common/validationforrequest');

const getStatusWiseInvoice = (req, res, next) => {
    const validationRule = {
        "status": "required",
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

const getOneInvoice = (req, res, next) => {
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

const updateInvoiceStatus = (req, res, next) => {
    const validationRule = {
        "_id": "required",
        "status": "required",
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

const saveInvoiceNotes = (req, res, next) => {
    const validationRule = {
        "invoice_id": "required",
        "notes": "required",
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

const deleteInvoiceNote = (req, res, next) => {
    const validationRule = {
        "invoice_id": "required",
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

const saveInvoiceAttachment = (req, res, next) => {
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

const savePackingSlipNotes = (req, res, next) => {
    const validationRule = {
        "invoice_id": "required",
        "notes": "required",
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

const deletePackingSlipNote = (req, res, next) => {
    const validationRule = {
        "invoice_id": "required",
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

const savePackingSlipAttachment = (req, res, next) => {
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

const saveReceivingSlipNotes = (req, res, next) => {
    const validationRule = {
        "invoice_id": "required",
        "notes": "required",
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

const deleteReceivingSlipNote = (req, res, next) => {
    const validationRule = {
        "invoice_id": "required",
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

const saveReceivingSlipAttachment = (req, res, next) => {
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

const savePONotes = (req, res, next) => {
    const validationRule = {
        "invoice_id": "required",
        "notes": "required",
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

const deletePONote = (req, res, next) => {
    const validationRule = {
        "invoice_id": "required",
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

const savePOAttachment = (req, res, next) => {
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

const saveQuoteNotes = (req, res, next) => {
    const validationRule = {
        "invoice_id": "required",
        "notes": "required",
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

const deleteQuoteNote = (req, res, next) => {
    const validationRule = {
        "invoice_id": "required",
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

const saveQuoteAttachment = (req, res, next) => {
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
    getStatusWiseInvoice,
    getOneInvoice,
    updateInvoiceStatus,
    saveInvoiceNotes,
    deleteInvoiceNote,
    saveInvoiceAttachment,
    savePackingSlipNotes,
    deletePackingSlipNote,
    savePackingSlipAttachment,
    saveReceivingSlipNotes,
    deleteReceivingSlipNote,
    saveReceivingSlipAttachment,
    savePONotes,
    deletePONote,
    savePOAttachment,
    saveQuoteNotes,
    deleteQuoteNote,
    saveQuoteAttachment,
};
