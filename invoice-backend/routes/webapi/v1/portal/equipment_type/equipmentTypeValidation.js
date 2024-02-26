var validator = require("../../../../../controller/common/validationforrequest");

const saveEquipmentType = (req, res, next) => {
    const validationRule = {
        "name": "required"
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

const deleteEquipmentType = (req, res, next) => {
    const validationRule = {
        "_id": "required"
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
    saveEquipmentType,
    deleteEquipmentType
}