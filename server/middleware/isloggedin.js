const User=require('../models/user');
const jwt=require('jsonwebtoken');

const key=process.env.JWT
const isloggedin=async(req,res,next)=>{
    try{
        if(!req.cookies.token||req.cookies.token==''){
        //window.alert('plzzz login first');
        return res.status(500).json({message:"You must login first"});
    }
    const data=jwt.verify(req.cookies.token,key);
    const user=await User.findOne({email:data.email});
    if(!user){
            window.alert('plzzz login first');
            return res.status(500).json({message:"You must login first"});
        }
        req.user=user;
        next();
    }
    catch(err){
        console.log(err);
    }

}
module.exports=isloggedin;