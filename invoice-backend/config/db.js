var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
//var config = require('../config/config') 
// Connection URL 

//url = 'mongodb://'+DB_USERNAME+':'+DB_PASSWORD+'@'+DB_HOST+':'+DB_PORT+'/aadhya';
//var url = 'mongodb://'+config.mongodbUser+':'+config.mongodbPwd+'@'+config.mongoDbHost+':'+config.mongoDbPort+'/'+config.mongoDbName+'';
var url = "mongodb://localhost:27017";
var dbConnection;



function mongoDB(){
    MongoClient.connect(url,{useUnifiedTopology: true,}, function(err, db) {
       if (err) {
    
        } else {
    
          
          return dbConnection = db.db("rovuk_admin");
           // db.close();
      }
    });
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

 

mongoDB.prototype.insert = function(collection,query,callback){
    var collection = dbConnection.collection(collection);
    query.created_date = new Date();
    query.updated_date = new Date();
    query.timestamp = new Date();
    collection.insertOne(query,function(err,result){
        if(err){
            callback(err,null);
        }else{
            callback(null,result);
        }
    })
}

mongoDB.prototype.insertMany = function(collection,query,callback){
    var collection = dbConnection.collection(collection);
    query.created_date = new Date();
    query.updated_date = new Date();
    query.timestamp = new Date();
    collection.insertMany(query,function(err,result){
        if(err){
            callback(err,null);
        }else{
            callback(null,result);
        }
    })
}

mongoDB.prototype.findLimit = function(collection,query,other,callback){
    var collection = dbConnection.collection(collection);
    collection.find(query).sort({timestamp:-1}).skip(parseInt(other.skip)).limit(parseInt(other.limit)).toArray(function(err,result){
        if(err){
            callback(err,null);
        }else{
            callback(null,result);
        }
    });
}

mongoDB.prototype.findLimitOffset = function(collection,query,other,callback){
    var collection = dbConnection.collection(collection);
    collection.find(query).sort(other.order).skip(parseInt(other.skip)).limit(parseInt(other.limit)).toArray(function(err,result){
        if(err){
            callback(err,null);
        }else{
            callback(null,result);
        }
    });
}

mongoDB.prototype.find = function(collectionName,query,callback){
    var collection = dbConnection.collection(collectionName);
    if(collectionName === 'chatHistory' || collectionName === 'searchHistory'){
        var limit = 30;
        if(collectionName === 'searchHistory'){
            limit = 5;
        }
        collection.find(query).sort({timestamp:-1}).limit(limit).toArray(function(err,result){
            if(err){
                callback(err,null);
            }else{
                callback(null,result);
            }
        });
    }else{
        collection.find(query).toArray(function(err,result){
            if(err){
                callback(err,null);
            }else{
                callback(null,result);
            }
        });   
    }
}

mongoDB.prototype.findSelect = function(collectionName,query, show, callback){
    var collection = dbConnection.collection(collectionName);

        collection.find(query, show).toArray(function(err,result){
            if(err){
                callback(err,null);
            }else{
                callback(null,result);
            }
        });       
}

mongoDB.prototype.findOne = function(collectionName,query, callback){
    var collection = dbConnection.collection(collectionName);
        collection.findOne(query,function(err,result){
            if(err){
                callback(err,null);
            }else{
                callback(null,result);
            }
        });       
}

mongoDB.prototype.remove = function(collection,query,callback){
    var collection = dbConnection.collection(collection);
    collection.remove(query, function(err,result){
        if(err){
            callback(err,null);
        }else{
            callback(null,result);
        }
    });
}


mongoDB.prototype.update = function(collection, query, update, callback){
    var collection = dbConnection.collection(collection);
    if(isEmptyObject(update) === false){
        var updateQuery = {"$set" : update}
        if(update['$push'] || update['$pull'] || update['$addToSet'] || update['$inc']){
          
            var updateQuery = update
        }

        collection.update(query, updateQuery,{upsert:false}, function(err,result){
            if(err){
              callback(err,null);
            }else{
              callback(null, result);
            }
        });      
    }else{
        callback(null,null);
    }
}

mongoDB.prototype.upsert = function(collection, query, update, callback){
    var collection = dbConnection.collection(collection);
    if(isEmptyObject(update) === false){
        collection.update(query, {"$push":update}, { upsert: true }, function(err,result){
            if(err){
              callback(err,null);
            }else{
              callback(null, result);
            }
        });
    }else{
        callback(null,null)
    }
}

mongoDB.prototype.aggregate = function(collection,query,callback) {
    var collection = dbConnection.collection(collection);
    collection.aggregate(query,function(err,result){
        if(err){
          callback(err,null);
        }else{
          callback(null, result.toArray());
        } 
    })
}

mongoDB.prototype.updateMulti = function(collection, query, update, callback){
    var collection = dbConnection.collection(collection);
    if(isEmptyObject(update) === false){
        var updateQuery = {"$set" : update}
        if(update['$push'] || update['$pull'] || update['$addToSet'] || update['$inc']){
          
            var updateQuery = update
        }

        collection.update(query, updateQuery,{multi:true}, function(err,result){
            if(err){
              callback(err,null);
            }else{
              callback(null, result);
            }
        });      
    }else{
        callback(null,null)
    }
}

mongoDB.prototype.countData = function(collection,  callback){
     var collection = dbConnection.collection(collection);
     collection.countDocuments(function(err,result){
            if(err){
              callback(err,null);
            }else{
              callback(null, result);
            }
     })
}

mongoDB.prototype.countDataWithCondition = function(collection,QueryCondition,  callback){
    var collection = dbConnection.collection(collection);
    collection.find(QueryCondition).count(function(err,result){
           if(err){
             callback(err,null);
           }else{
             callback(null, result);
           }
    })
}


module.exports = mongoDB;

