var validator = require("../../../../../controller/common/validationforrequest");

const locationValidation = (req, res, next) => {
    const validationRule = {
        // "location_customer_id": "required",
        "location_contact_name": "required",
        "location_contact_number": "required",
        "location_name": "required",
        // "location_full_address": "required",
        // "location_city": "required",
        // "location_state": "required",
        // "location_postcode": "required",
        // "location_country": "required",
        "location_lat": "required",
        "location_lng": "required"
    }
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
}

const locationDeleteValidation = (req, res, next) => {
    const validationRule = {
        "_id": "required|string"
    }
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
}

module.exports = {
    locationValidation, locationDeleteValidation
}