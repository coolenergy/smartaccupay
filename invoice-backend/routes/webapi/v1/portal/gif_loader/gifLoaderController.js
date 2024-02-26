var request = require('request');
var ObjectID = require('mongodb').ObjectID;
var gifLoaderSchema = require('./../../../../../model/gif_loader');
let config = require('../../../../../config/config');
let db_rest_api = require('../../../../../config/db_rest_api');
let collectionConstant = require('../../../../../config/collectionConstant');
var ObjectID = require('mongodb').ObjectID;
let db_connection = require('./../../../../../controller/common/connectiondb');
var bucketOpration = require('../../../../../controller/common/s3-wasabi');
var MongoClient = require('mongodb').MongoClient;

module.exports.getGIFLoader = async function (req, res) {
    try {
        var requestObject = req.body;
        let query = { module_name: requestObject.module_name };
        let main_db = await db_rest_api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
        let oneColor_main = await db_rest_api.findOne(main_db, collectionConstant.GIF_LOADER, query);
        res.send({ message: "Listing", data: oneColor_main, status: true });
    } catch (e) {

    } finally {
    }
};