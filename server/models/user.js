const mongoose=require('mongoose')
const user_schema=mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    }
})
module.exports=mongoose.model('user',user_schema)