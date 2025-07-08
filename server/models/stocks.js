const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true
  },
  average_price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  exchange:{
    type:String,
    require:true
  }
}, { _id: false }); // optional: don't create _id for each stock entry

const portfolioSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user', // Make sure your User model is exported as 'User'
    required: true
  },
  stocks: [stockSchema]
});

module.exports = mongoose.model('Portfolio', portfolioSchema);
