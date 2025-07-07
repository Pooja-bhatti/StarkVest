const mongoose=require('mongoose')
const connection_string=process.env.DB_CONNECTION
mongoose.connect(connection_string)
module.exports=mongoose.connection;