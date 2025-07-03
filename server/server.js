require('dotenv').config();
require('./config/connection')
const express=require('express')
const User=require('./models/user')
const get_token=require('./JWT/gentoken')
const cooki_parser=require('cookie-parser');
const user = require('./models/user');
const isloggedin=require('./middleware/isloggedin');
const app=express()
app.use(express.urlencoded({extended:true}))
app.use(cooki_parser());
app.use(express.json())
// const cors = require('cors');
// app.use(cors({
//   origin: 'http://localhost:3000', // or your frontend URL
//   credentials: true
// }));
app.post('/signin', async (req, res) => {
    const { email, name } = req.body;

    try {
        let myuser = await User.findOne({ email });

        if (!myuser) {
            myuser = await User.create({ name, email });
            console.log(myuser)
            const token = get_token(myuser);
            res.status(200).cookie('token', token).json({ message: "User verified",name,fund:myuser.current_funds});
        }
        else{
            console.log(myuser)
            const token = get_token(myuser);
            res.status(200).cookie('token', token).json({ message: "User verified",name:myuser.name,fund:myuser.current_funds});
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

app.post('/editfunds',isloggedin,async(req,res)=>{
    const user=req.user;
    try{
        await user.updateOne({current_funds:req.body.fund});
        return res.status(200).json({message:"Funds updated "})
    }
    catch(err)
    {
        console.log(err);
    }
})


app.get('/logout',isloggedin,(req,res)=>{
    res.clearCookie('token');

    res.status(200).json({ message: 'Logged out' });
})

app.listen(5000,()=>{console.log("listening over 5000")})