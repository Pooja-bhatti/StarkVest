const mongoose=require('mongoose')
const user_schema=mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    current_funds:{
        type:Number,
        default:0
    },
    stocks:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Portfolio'
    }
})
module.exports=mongoose.model('user',user_schema)