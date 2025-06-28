require('dotenv').config();
require('./config/connection')
const express=require('express')
const User=require('./models/user')
const get_token=require('./JWT/gentoken')
const cooki_parser=require('cookie-parser')
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
        }
        console.log(myuser)
        const token = get_token(myuser);
        res.status(200)
  .cookie('token', token)
  .json({ message: "User verified" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});


app.get('/logout',(req,res)=>{
    res.clearCookie('token');

    res.status(200).json({ message: 'Logged out' });
})

app.listen(5000,()=>{console.log("listening over 5000")})