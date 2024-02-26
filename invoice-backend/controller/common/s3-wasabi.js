var AWS = require('aws-sdk');
var config = require('./../../config/config')

AWS.config.update({
    'endpoint' : 'https://s3.wasabisys.com',
    'region' : 'us-east-1',
    'version' : 'latest',
    accessKeyId : config.AWS_ACCESS_KEY_ID,
    secretAccessKey : config.AWS_SECRET_ACCESS_KEY
});

var s3 = new AWS.S3();

module.exports.createBucket = async function(BUCKET_NAME,callback){
    const params = {
        Bucket: BUCKET_NAME,
        CreateBucketConfiguration: {
            LocationConstraint: "us-east-1"
        }
    };
    await s3.createBucket(params, function(err, data) {
        if (err) {
            callback(err,null)
        }
        else{  
            callback(null,data)
        }
    });
}

module.exports.deleteBucket =  async function(BUCKET_NAME,callback){
    const params = {
        Bucket: BUCKET_NAME
    };
    await s3.deleteBucket(params, function(err, data) {
        if (err) {
            callback(err,null)
        }
        else{  
            callback(null,data)
        }
    });
}

module.exports.getBucketSize =  async function(BUCKET_NAME,callback){
    const params = {
        Bucket: BUCKET_NAME
    };
    var totalSize = 0
    await s3.listObjectsV2(params, function(err, data) {
        if (err) {
            callback(err,null)
        }
        else{  
            data.Contents.forEach((element,index) => {
                totalSize = totalSize + element.Size;
                if(index+1 == data.Contents.length){
                    var sizeInKB = (totalSize / (1024 * 1024)).toFixed(3);
                    callback(null,sizeInKB + 'MB')
                }
            });
        }
    });
}

module.exports.uploadFile = function(PARAMS,callback){
    s3.putObject(PARAMS, function(err, data) {
        if (err) {
            callback(err,null)
        }
        else{ 
            callback(null,data)
        }
    })
}
module.exports.uploadFileWithoutCallback = async function(PARAMS){
    let result =  await s3.putObject(PARAMS);
    return result;
}
module.exports.deleteObject = function(PARAMS,callback){
    s3.deleteObject(PARAMS,function(err,result){
        if(err){
            callback(err,null)
        }else{
            callback(null,result)
        }
    })
}



module.exports.listBuckets =  function(PARMAS, callback){
    s3.listBuckets(PARMAS, function(err, data) {
        data.Buckets.forEach((element,index) => {
            console.log(element.Name);
            const params = {
                Bucket: element.Name
            };

            // s3.listObjectsV2(params, function(err, data) {
            //     if (err) {
            //         callback(err,null)
            //     }
            //     else{  
            //         console.log(data.Contents)
            //         // const params1 = {
            //         //     Bucket: element.Name,
            //         //     Delete: { Objects:{ Objects :  data.Contents }}
            //         // };
                    
            //         // s3.deleteObjects(params1,function(err,result){
            //         //     console.log(err,result);
            //         // })
            //         // data.Contents.forEach((element2,index) => {
            //         //     console.log(element2.Key);
            //         //     const params1 = {
            //         //             Bucket: element.Name,
            //         //             Key : element2.Key
            //         //         };
            //         //     s3.deleteObject(params1,function(err,result){
            //         //           console.log(err,result);
            //         //     })
            //         // });
            //     }
            // });
            s3.deleteBucket(params, function(err, data) {
                if (err) {
                    console.log(err)
                    //callback(err,null)
                }
                else{  
                    console.log(data)
                    //callback(null,data)
                }
            });
        })
       // callback(err, data.Buckets);
    });
}



