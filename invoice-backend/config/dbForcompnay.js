var MongoClient = require('mongodb').MongoClient;

var dbConnection;

function mongoDB(HOSTNAME, HOSTPORT, USERNAME, PASSWORD, DATABASENAME) {
    console.log(HOSTNAME, HOSTPORT, USERNAME, PASSWORD, DATABASENAME);
    var url = "mongodb://";
    if (USERNAME != "") {
        url += USERNAME + ":" + PASSWORD + "@" + HOSTNAME + ":" + HOSTPORT;
    } else {
        url += HOSTNAME + ":" + HOSTPORT;
    }

    return MongoClient.connect(url, { useUnifiedTopology: true, }, function (err, db) {
        if (err) {
            console.log('Unable to connect to the mongoDB server. Error:', err);
            return false;
        } else {
            console.log('Connection established to', url);
            return dbConnection = db.db(DATABASENAME);
        }
    });

    // return dbConnection
}

function isEmptyObject(obj) {
    var name;
    for (name in obj) {
        if (obj.hasOwnProperty(name)) {
            return false;
        }
    }
    return true;
}



mongoDB.prototype.insert = function (collection, query, callback) {
    var collection = dbConnection.collection(collection);
    query.created_date = new Date();
    query.updated_date = new Date();
    query.timestamp = new Date();
    collection.insertOne(query, function (err, result) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
};

mongoDB.prototype.findLimit = function (collection, query, other, callback) {
    var collection = dbConnection.collection(collection);
    collection.find(query).sort({ timestamp: -1 }).skip(parseInt(other.skip)).limit(parseInt(other.limit)).toArray(function (err, result) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
};

mongoDB.prototype.findLimitOffset = function (collection, query, other, callback) {
    var collection = dbConnection.collection(collection);
    collection.find(query).sort(other.order).skip(parseInt(other.skip)).limit(parseInt(other.limit)).toArray(function (err, result) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
};

mongoDB.prototype.find = function (collectionName, query, callback) {
    console.log('find method called ' + collectionName);
    var collection = dbConnection.collection(collectionName);
    if (collectionName === 'chatHistory' || collectionName === 'searchHistory') {
        var limit = 30;
        if (collectionName === 'searchHistory') {
            limit = 5;
        }
        collection.find(query).sort({ timestamp: -1 }).limit(limit).toArray(function (err, result) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, result);
            }
        });
    } else {
        collection.find(query).toArray(function (err, result) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, result);
            }
        });
    }
};

mongoDB.prototype.findSelect = function (collectionName, query, show, callback) {
    console.log('find method called ' + collectionName);
    var collection = dbConnection.collection(collectionName);

    collection.find(query, show).toArray(function (err, result) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
};

mongoDB.prototype.findOne = function (collectionName, query, callback) {
    console.log('find method called ' + collectionName);
    var collection = dbConnection.collection(collectionName);
    collection.findOne(query, function (err, result) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
};

mongoDB.prototype.remove = function (collection, query, callback) {
    console.log('remove method called ' + collection);
    var collection = dbConnection.collection(collection);
    collection.remove(query, function (err, result) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
};


mongoDB.prototype.update = function (collection, query, update, callback) {
    console.log('update method called ' + collection + ' query ' + JSON.stringify(query) + ' update ' + JSON.stringify(update));
    var collection = dbConnection.collection(collection);
    if (isEmptyObject(update) === false) {
        var updateQuery = { "$set": update };
        if (update['$push'] || update['$pull'] || update['$addToSet'] || update['$inc']) {

            var updateQuery = update;
        }
        console.log('updateQuery at update db ' + JSON.stringify(updateQuery));
        collection.update(query, updateQuery, { upsert: false }, function (err, result) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, result);
            }
        });
    } else {
        callback(null, null);
    }
};

mongoDB.prototype.upsert = function (collection, query, update, callback) {
    console.log('update method called ' + collection);
    var collection = dbConnection.collection(collection);
    if (isEmptyObject(update) === false) {
        collection.update(query, { "$push": update }, { upsert: true }, function (err, result) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, result);
            }
        });
    } else {
        callback(null, null);
    }
};

mongoDB.prototype.aggregate = function (collection, query, callback) {
    console.log('collection name ' + collection);
    var collection = dbConnection.collection(collection);
    collection.aggregate(query, function (err, result) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, result.toArray());
        }
    });
};

mongoDB.prototype.updateMulti = function (collection, query, update, callback) {
    console.log('update method called ' + collection + ' query ' + JSON.stringify(query) + ' update ' + JSON.stringify(update));
    var collection = dbConnection.collection(collection);
    if (isEmptyObject(update) === false) {
        var updateQuery = { "$set": update };
        if (update['$push'] || update['$pull'] || update['$addToSet'] || update['$inc']) {

            var updateQuery = update;
        }
        console.log('updateQuery at update db ' + JSON.stringify(updateQuery));
        collection.update(query, updateQuery, { multi: true }, function (err, result) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, result);
            }
        });
    } else {
        callback(null, null);
    }
};

mongoDB.prototype.countData = function (collection, callback) {
    var collection = dbConnection.collection(collection);
    collection.countDocuments(function (err, result) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
};


module.exports = mongoDB;

