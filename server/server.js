require('dotenv').config();
require('./config/connection')
const express=require('express')
const User=require('./models/user')
const get_token=require('./JWT/gentoken')
const cooki_parser=require('cookie-parser');
const Portfolio=require('./models/stocks');
const isloggedin=require('./middleware/isloggedin');
// const { GoogleGenerativeAI } = require('@google/generative-ai');
const app=express()
// const genAI = new GoogleGenerativeAI(process.env.gemini_API);
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
            const portF=await Portfolio.create({user:myuser._id});
            myuser.stocks = portF._id;
            await myuser.save();
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

function isMarketOpenIST() {
  const nowUTC = new Date();

  // Convert UTC to IST (UTC + 5:30)
  const istOffset = 5.5 * 60 * 60 * 1000;
  const nowIST = new Date(nowUTC.getTime() + istOffset);

  const hours = nowIST.getHours();
  const minutes = nowIST.getMinutes();
  const currentMinutes = hours * 60 + minutes;

  const openMinutes = 9 * 60 + 15;  // 9:15 AM = 555
  const closeMinutes = 15 * 60 + 30; // 3:30 PM = 930

  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
}



app.post('/orderbuy', isloggedin, async (req, res) => {
  if (!isMarketOpenIST()) {
    return res.status(202).json({
      message: "Market is closed. Trades allowed only between 9:15 AM and 3:30 PM IST."
    });
  }
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


      return res.status(200).json({ message: "Order executed successfully." });
    }


    return res.status(400).json({ message: "Only BUY action is supported for now." });

  } catch (err) {

    return res.status(500).json({ message: "Internal server error" });
  }
});

// async function askDeepSeek(prompt) {
//   try {
//     console.log(prompt);
//     const response=await fetch("https://openrouter.ai/api/v1/chat/completions", {
//     method: "POST",
//     headers: {
//       "Authorization": "Bearer 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",
//       "HTTP-Referer": "<YOUR_SITE_URL>", // Optional. Site URL for rankings on openrouter.ai.
//       "X-Title": "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify({
//       "model": "deepseek/deepseek-r1-0528:free",
//       "messages": [
//         {
//           "role": "user",
//           "content": prompt
//         }
//       ]
//     })
//   });
//   const data=await response.json();
//   console.log(data);

//   return data.choices?.[0]?.message?.content||"No response";
//   } 
//   catch (error) {
//     console.error("DeepSeek Error:", error.response?.data || error.message);
//     return null;
//   }
// }

app.post('/ordersell', isloggedin, async (req, res) => {
  if (!isMarketOpenIST()) {
    return res.status(202).json({
      message: "Market is closed. Trades allowed only between 9:15 AM and 3:30 PM IST."
    });
  }
  const { quantity } = req.body.data;
  const stock = req.body.stock;
  const price = parseFloat(req.body.price); // Current price from frontend
  const myuser = req.user;

  const parsedQuantity = parseInt(quantity);


  if (isNaN(parsedQuantity) || parsedQuantity <= 0 || isNaN(price)) {
    return res.status(400).json({ message: "Invalid quantity or price format" });
  }

  try {
    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); 

    // const prompt = "Is the Indian stock market (NSE/BSE) currently open right now? Answer in a single word: Yes or No. Just one single word not even a dot after that. Assume the current time is Indian Standard Time (IST).";
    // const result = await model.generateContent(prompt);
    // const text = result.response.text().toLowerCase();

    // if (!text.includes("yes")) {
    //   return res.status(403).json({ message: "Market is currently closed. You can only sell stocks during market hours (9:15 AM - 3:30 PM IST)." });
    // }
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

// app.post('/ordersell', isloggedin, async (req, res) => {
//   const { quantity } = req.body.data;
//   const stock = req.body.stock;
//   const price = parseFloat(req.body.price);
//   const myuser = req.user;
//   const parsedQuantity = parseInt(quantity);

//   if (isNaN(parsedQuantity) || parsedQuantity <= 0 || isNaN(price)) {
//     return res.status(400).json({ message: "Invalid quantity or price format" });
//   }

//   // Ask DeepSeek if market is open
//   const prompt = "Is the Indian stock market (NSE/BSE) currently open? Answer in just one word: Yes or No. Assume the current time is in Indian Standard Time.";
//   const response = await askDeepSeek(prompt);

//   if (!response || !response.toLowerCase().includes("yes")) {
//     return res.status(403).json({ message: "Market is currently closed. Try during NSE/BSE market hours." });
//   }

//   try {
//     const portfolio = await Portfolio.findOne({ user: myuser._id });
//     if (!portfolio) {
//       return res.status(400).json({ message: `You do not hold any stocks to sell.` });
//     }

//     const existingStock = portfolio.stocks.find(s => s.company === stock);
//     if (!existingStock) {
//       return res.status(201).json({ message: `You do not own any shares of ${stock}.` });
//     }

//     if (existingStock.quantity < parsedQuantity) {
//       return res.status(201).json({ message: `Insufficient shares to sell. You only have ${existingStock.quantity}.` });
//     }

//     existingStock.quantity -= parsedQuantity;
//     if (existingStock.quantity === 0) {
//       portfolio.stocks = portfolio.stocks.filter(s => s.company !== stock);
//     }

//     const credit = price * parsedQuantity;
//     myuser.current_funds += credit;

//     await myuser.save();
//     await portfolio.save();

//     return res.status(200).json({
//       message: `Successfully sold ${parsedQuantity} shares of ${stock} for ₹${credit.toFixed(2)}.`,
//       updatedFunds: myuser.current_funds
//     });

//   } catch (err) {
//     console.error("Sell error:", err);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// });

app.get('/getstocks', isloggedin, async (req, res) => {
  const myuser = req.user;
  try {
    const portfolio = await Portfolio.findOne({ user: myuser._id });
    if (!portfolio) return res.status(200).json({ stocks: [] });

    res.status(200).json({ stocks: portfolio.stocks }); // ✅ FIXED: return only stocks
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch portfolio" });
  }
});





app.listen(5000,()=>{console.log("listening over 5000")})