var rolesSchema = require('./../../../../../model/roles')
const mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
let db_connection = require('./../../../../../controller/common/connectiondb');
let common = require('./../../../../../controller/common/common');
let collectionConstant = require('./../../../../../config/collectionConstant');


module.exports.getAllRoles = async function(req,res){
    var decodedToken = common.decodedJWT(req.headers.authorization)
    if(decodedToken){
        try{
            let connection_db_api = await db_connection.connection_db_api(decodedToken)
            let rolesCollection = connection_db_api.model(collectionConstant.ROLEANDPERMISSION, rolesSchema);
            let all_roles = await rolesCollection.find({is_delete : 0});
            res.send({message : "Roles",data: all_roles,status : true});
        }catch(e){
            console.log(e)
            res.send({message : "Something went wrong.!" , error : e ,status : false});
        }
    }else{
        res.send({message : "Invalid user for this action" ,status : false});
    }
}