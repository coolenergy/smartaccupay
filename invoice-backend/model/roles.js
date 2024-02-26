var mongoose=require('mongoose');
var Schema = mongoose.Schema;
var rolesSchema= new Schema({
    role_name: {type:String},
    role_permission : {type : Schema.Types.Mixed ,default : null},
    is_delete: { type: Number, default: 0 }
});
   
module.exports = rolesSchema