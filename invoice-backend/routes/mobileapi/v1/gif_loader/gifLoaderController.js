var request = require('request');
var ObjectID = require('mongodb').ObjectID;
let config = require('../../../../config/config');
let db_rest_api = require('../../../../config/db_rest_api');
let collectionConstant = require('../../../../config/collectionConstant');
var ObjectID = require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;

module.exports.getGIFLoader = async function (req, res) {
    try {
        let query = { module_name: 'Rovuk A/P' };
        let main_db = await db_rest_api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
        let oneColor_main = await db_rest_api.findOne(main_db, collectionConstant.GIF_LOADER, query);
        res.send({ message: "Listing", data: oneColor_main, status: true });
    } catch (e) {

    } finally {
    }
};