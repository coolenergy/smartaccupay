const mongoose = require('mongoose');


module.exports.connection_db_api = async function (reqData)
{
    var url = "mongodb://";
    if (reqData.DB_USERNAME != "")
    {
        url += reqData.DB_USERNAME + ":" + reqData.DB_PASSWORD + "@" + reqData.DB_HOST + ":" + reqData.DB_PORT + "/" + reqData.DB_NAME;
    } else
    {
        url += reqData.DB_HOST + ":" + reqData.DB_PORT + "/" + reqData.DB_NAME;
    }

    var connnection = await mongoose.createConnection(url, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, });
    return connnection;
}