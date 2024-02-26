var creditcardsettingsSchema = require('../../../../../model/creditcardsettings');

const mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var common = require("../../../../../controller/common/common");
let db_connection = require('../../../../../controller/common/connectiondb');
let collectionConstant = require('../../../../../config/collectionConstant');

module.exports.getcreditcardsettings = async function (req, res)
{
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken)
    {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try
        {

            let creditcardsettingsCollection = connection_db_api.model(collectionConstant.CREDITCARD, creditcardsettingsSchema);
            let all_creditcardsettings = await creditcardsettingsCollection.find({ is_delete: 0 });
            res.send({ message: translator.getStr('CreditCardListing'), data: all_creditcardsettings, status: true });
        } catch (e)
        {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally
        {
            connection_db_api.close()
        }
    } else
    {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.savecreditcardsettings = async function (req, res)
{
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken)
    {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try
        {
            var requestObject = req.body;

            let creditcardsettingsCollection = connection_db_api.model(collectionConstant.CREDITCARD, creditcardsettingsSchema);
            if (requestObject._id)
            {
                let update_creditcardsettings = await creditcardsettingsCollection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
                if (update_creditcardsettings)
                {
                    res.send({ message: translator.getStr('CreditCardUpdated'), data: update_creditcardsettings, status: true });
                } else
                {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else
            {
                let add_creditcardsettings = new creditcardsettingsCollection(requestObject);
                let save_creditcardsettings = await add_creditcardsettings.save();
                if (save_creditcardsettings)
                {
                    res.send({ message: translator.getStr('CreditCardAdded'), data: save_creditcardsettings, status: true });
                } else
                {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            }
        } catch (e)
        {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally
        {
            connection_db_api.close()
        }
    } else
    {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.deletecreditcardsettings = async function (req, res)
{
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken)
    {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try
        {
            requestObject = req.body;

            let creditcardsettingsCollection = connection_db_api.model(collectionConstant.CREDITCARD, creditcardsettingsSchema);
            let update_creditcardsettings = await creditcardsettingsCollection.updateOne({ _id: ObjectID(requestObject._id) }, { is_delete: 1 });
            let isDelete = update_creditcardsettings.nModified;
            if (update_creditcardsettings)
            {
                if (isDelete == 0)
                {
                    res.send({ message: translator.getStr('NoDataWithId'), status: false });
                } else
                {
                    res.send({ message: translator.getStr('CreditCardDeleted'), status: true });
                }
            } else
            {
                console.log(e);
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
            }
        } catch (e)
        {
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally
        {
            connection_db_api.close()
        }
    } else
    {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};