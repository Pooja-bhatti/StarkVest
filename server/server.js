require('dotenv').config();
require('./config/connection')
const express=require('express')
const User=require('./models/user')
const get_token=require('./JWT/gentoken')
const cooki_parser=require('cookie-parser');
const Portfolio=require('./models/stocks');
const isloggedin=require('./middleware/isloggedin');
const axios = require("axios");
const fs = require('fs');
const path = require('path');
const { askAi } = require('./services/openRouter.service.js');

const order=require('./middleware/order');


const app=express()

app.use(express.urlencoded({extended:true}))
app.use(cooki_parser());
app.use(express.json())

app.post('/signin', async (req, res) => {
    const { email, name } = req.body;

    try {
        let myuser = await User.findOne({ email });

        if (!myuser) {
            myuser = await User.create({ name, email });
            const portF=await Portfolio.create({user:myuser._id});
            myuser.stocks = portF._id;
            await myuser.save();
            console.log(myuser)
            const token = get_token(myuser);
            res.status(200).cookie('token', token).json({ message: "User verified",name,fund:myuser.current_funds});
        }
        else{
            // console.log(myuser)
            const token = get_token(myuser);
            res.status(200).cookie('token', token).json({ message: "User verified",name:myuser.name,fund:myuser.current_funds});
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

app.get('/logout', isloggedin, (req, res) => {
  res.clearCookie('token'); 
  return res.status(200).send('Logged out successfully');
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



app.post('/orderbuy', isloggedin,order, async (req, res) => {
  
  const { action,quantity} = req.body.data;
  const stock=req.body.stock;

  const myuser = req.user;



  const parsedQuantity = parseInt(quantity);
  const parsedPrice = parseFloat(req.body.price);

  if (isNaN(parsedQuantity) || isNaN(parsedPrice)) {
    return res.status(400).json({ message: "Invalid quantity or price format" });
  }

  const cost = parsedPrice * parsedQuantity;


  try {
    if (action.toLowerCase() === "buy") {

      if (myuser.current_funds < cost) {

        return res.status(201).json({ message: "You do not have sufficient funds (gareeb he tu)" });
      }


      myuser.current_funds -= cost;
      await myuser.save();



      let portfolio = await Portfolio.findOne({ user: myuser._id });
      


      const existingStock = portfolio.stocks.find(s => s.company === stock);


      if (existingStock) {
        const totalCost = existingStock.average_price * existingStock.quantity + cost;
        const totalQty = existingStock.quantity + parsedQuantity;
        existingStock.average_price = parseFloat((totalCost / totalQty).toFixed(2));
        existingStock.quantity = totalQty;

      } else {
        portfolio.stocks.push({
          company: stock,
          average_price: parsedPrice,
          quantity: parsedQuantity
        });

      }

      await portfolio.save();

      myuser.netInvestment+=cost;
      await myuser.save();
      return res.status(200).json({ message: "Order executed successfully." });
    }


    return res.status(400).json({ message: "Only BUY action is supported for now." });

  } catch (err) {

    return res.status(500).json({ message: "Internal server error" });
  }
});



app.post('/ordersell', isloggedin,order, async (req, res) => {

  const { quantity } = req.body.data;
  const stock = req.body.stock;
  const price = parseFloat(req.body.price); 
  const myuser = req.user;

  const parsedQuantity = parseInt(quantity);


  if (isNaN(parsedQuantity) || parsedQuantity <= 0 || isNaN(price)) {
    return res.status(400).json({ message: "Invalid quantity or price format" });
  }

  try {
    
    const portfolio = await Portfolio.findOne({ user: myuser._id });

    if (!portfolio) {
      return res.status(400).json({ message: `You do not hold any stocks to sell.` });
    }

    const existingStock = portfolio.stocks.find(s => s.company === stock);

    if (!existingStock) {
      return res.status(201).json({ message: `You do not own any shares of ${stock}.` });
    }

    if (existingStock.quantity < parsedQuantity) {
      return res.status(201).json({ message: `Insufficient shares to sell. You only have ${existingStock.quantity}.` });
    }


    existingStock.quantity -= parsedQuantity;

    if (existingStock.quantity === 0) {
      portfolio.stocks = portfolio.stocks.filter(s => s.company !== stock);
    }

    const credit = price * parsedQuantity;
    const realisedProfit = (price - existingStock.average_price) * parsedQuantity;
    myuser.realisedPL += realisedProfit;
    myuser.current_funds += credit;



    await myuser.save();
    await portfolio.save();

    return res.status(200).json({
      message: `Successfully sold ${parsedQuantity} shares of ${stock} for ₹${credit.toFixed(2)}.`,
      updatedFunds: myuser.current_funds
    });

  } catch (err) {
    console.error("Sell error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});


app.get('/getstocks', isloggedin, async (req, res) => {
  const myuser = req.user;
  try {
    const portfolio = await Portfolio.findOne({ user: myuser._id });
    if (!portfolio) return res.status(200).json({ stocks: [] });

    res.status(200).json({ stocks: portfolio.stocks }); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch portfolio" });
  }
});


app.post("/aisuggest", isloggedin, async (req, res) => {
  try {
    const { stockName } = req.body;

    if (!stockName || typeof stockName !== "string" || !stockName.trim()) {
      return res.status(400).json({ error: "Missing or invalid 'stockName' in body" });
    }

    const prompt = `
You are an expert Indian stock market analyst. Analyze the stock "${stockName.trim()}" and provide an investment suggestion.

Your analysis must be based on:
1. The company's current market position, recent financial performance, and business fundamentals.
2. Recent news sentiment and events surrounding this company (earnings reports, regulatory changes, partnerships, controversies, sector trends).
3. Technical indicators and market momentum.

Return your analysis as a valid JSON object with this exact structure:
{
  "companyName": "Full official company name",
  "ticker": "NSE ticker symbol",
  "action": "BUY" or "HOLD" or "SELL",
  "confidenceScore": 78,
  "summary": "A 1-2 sentence overall verdict on the stock.",
  "newsInsights": [
    "Recent news point 1 affecting this stock",
    "Recent news point 2 affecting this stock",
    "Recent news point 3 affecting this stock"
  ],
  "bullCase": "Why this stock could go up (1-2 sentences)",
  "bearCase": "Why this stock could go down (1-2 sentences)",
  "sector": "The sector this company belongs to",
  "riskLevel": "Low" or "Medium" or "High"
}

Rules:
- confidenceScore must be 0-100 (how confident you are in your recommendation).
- newsInsights must have exactly 3 items based on real, recent developments.
- action must be exactly one of: "BUY", "HOLD", or "SELL".
- Return ONLY the JSON object. No markdown, no explanation outside JSON.
`.trim();

    const messages = [{ role: "user", content: prompt }];
    const answerStr = await askAi(messages);

    // Strip markdown code fences if present
    const cleaned = answerStr.replace(/^```[\w]*\n?|```$/g, "").trim();
    const answer = JSON.parse(cleaned);

    return res.json({ answer });

  } catch (err) {
    console.error("Error in /aisuggest:", err.message);
    return res.status(500).json({
      error: "Internal Server Error",
      details: err.message,
    });
  }
})



app.get('/userdata',isloggedin,async(req,res)=>{
  const myuser=req.user;
  return res.status(200).json({investment:myuser.netInvestment,PL:myuser.realisedPL});
})


app.listen(5000,()=>{console.log("listening over 5000")})