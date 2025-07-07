const jwt=require('jsonwebtoken')
const key=process.env.JWT
const get_token=(user)=>{
    const token=jwt.sign({id:user._id,name:user.name,email:user.email},key)
    return token
}
module.exports=get_token;
