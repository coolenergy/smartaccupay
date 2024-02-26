const MongoClient = require('mongodb').MongoClient;

async function connectionMongoDB(DB_HOST,DB_PORT,DB_USER,DB_PASSWORD,DB_NAME){
    let url = 'mongodb://';
    if(DB_USER != "" ){
        url += DB_USER+":"+DB_PASSWORD+"@"+DB_HOST+":"+DB_PORT;
    }else{
        url += DB_HOST+":"+DB_PORT;
    }
    console.log(url);
    let M_DB_client = await MongoClient.connect(url, { useNewUrlParser: true,useUnifiedTopology: true }).catch(err => { console.log(err); });
    let M_DB = M_DB_client.db(DB_NAME);
    return M_DB;
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
async function insert(connectionM_DB,collection,query){
    
    var collection = connectionM_DB.collection(collection);
    var result = await  collection.insert(query);
    return result;
}

async function insertMany(connectionM_DB,collection,query){
    
    var collection = connectionM_DB.collection(collection);
    query.timestamp = new Date();
    var result = await  collection.insertMany(query);
    return result;
}

async function findLimit(connectionM_DB,collection,query,other){
    var collection = connectionM_DB.collection(collection);
    var result = await  collection.find(query).sort({timestamp:-1}).skip(parseInt(other.skip)).
    limit(parseInt(other.limit)).toArray();
    return result;  
}

async function findLimitOffset(connectionM_DB,collection,query,other){
    var collection = connectionM_DB.collection(collection);
    var result = await collection.find(query).sort(other.order).skip(parseInt(other.skip)).
    limit(parseInt(other.limit)).toArray();
    return result; 
}

async function find(connectionM_DB,collectionName,query){
    
    var collection = connectionM_DB.collection(collectionName);
    var result = await collection.find(query).toArray();   
    return result;
}

async function findSelect(connectionM_DB,collectionName,query, show, callback){
    
    var collection = connectionM_DB.collection(collectionName);
    var result = await collection.find(query, show).toArray();
    return result;       
}

async function findOne(connectionM_DB,collectionName,query){
    
    var collection = connectionM_DB.collection(collectionName);
    var result = await collection.findOne(query);
    return result;          
}

async function findOneField(connectionM_DB,collectionName,query,q2){
    var collection = connectionM_DB.collection(collectionName);
    var result = await collection.findOne(query, { projection:  q2 });    
    return result;    
}

async function remove (connectionM_DB,collection,query){
    
    var collection = connectionM_DB.collection(collection);
    var result = await collection.remove(query);
    return result;   
}

async function update (connectionM_DB,collection, query, update){
    
    var collection = connectionM_DB.collection(collection);
    if(isEmptyObject(update) === false){
        var updateQuery = {"$set" : update}
        if(update['$push'] || update['$pull'] || update['$addToSet'] || update['$inc']){
            updateQuery = update
        }
        
        var result = await collection.updateOne(query, updateQuery,{upsert:false});  
        return result;     
    }else{
        return {err : true , msg : "Update query not found"};
    }
}

async function upsert(connectionM_DB,collection, query, update){
    
    var collection = connectionM_DB.collection(collection);
    if(isEmptyObject(update) === false){
        var result = await collection.updateOne(query, {"$push":update}, { upsert: true });
        return result;
    }else{
        return {err : true , msg : "Update query not found"};
    }
}

async function updateMulti(connectionM_DB,collection, query, update){
    
    var collection = connectionM_DB.collection(collection);
    if(isEmptyObject(update) === false){
        var updateQuery = {"$set" : update}
        if(update['$push'] || update['$pull'] || update['$addToSet'] || update['$inc']){
          
            var updateQuery = update
        }
        
        var result = awaitcollection.update(query, updateQuery,{multi:true});  
        return result;    
    }else{
        return {err : true , msg : "Update query not found"};
    }
}


async function aggregate(connectionM_DB,collection,query,callback) {
    
    var collection = connectionM_DB.collection(collection);
    var result = await collection.aggregate(query).collation({locale: "en_US"}).toArray();
    return result;
}

async function countData(connectionM_DB,collection){
    var collection = connectionM_DB.collection(collection);
    var result = await collection.count()
    return result;
}

async function countWithQuery(connectionM_DB,collection,query){
    var collection = connectionM_DB.collection(collection);
    var result = await collection.count(query)
    return result;
}

module.exports = {
    insert,insertMany,connectionMongoDB,findLimit,findLimitOffset,
    find,findSelect,findOne,findOneField,remove,update,
    upsert,aggregate,updateMulti,countData,countWithQuery
}