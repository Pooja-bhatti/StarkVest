require('dotenv').config();
require('./config/connection')
const express=require('express')
const User=require('./models/user')
const get_token=require('./JWT/gentoken')
const cooki_parser=require('cookie-parser');
const Portfolio=require('./models/stocks');
const isloggedin=require('./middleware/isloggedin');
const puppeteer = require('puppeteer');

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
  res.clearCookie('token'); // Correct cookie name
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


async function getMarketStatusIST() {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.bseindia.com/markets.html', { waitUntil: 'networkidle2' });

    // Wait for the element to load (adjust selector if needed)
    await page.waitForSelector('.topdatearea strong');

    const status = await page.$eval('.topdatearea strong', el => el.textContent.trim());

    await browser.close();
    console.log(status);
    return status==="Open"?true:false;

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// function getMarketStatusIST() {
//   // Manually simulate 1:00:00 PM IST on any date
//   const ist = new Date('2025-07-14T13:00:00+05:30'); // ISO string with IST offset

//   const hours = ist.getHours();
//   const minutes = ist.getMinutes();
//   const currentMinutes = hours * 60 + minutes;

//   const openMinutes = 9 * 60 + 15;   // 555
//   const closeMinutes = 15 * 60 + 30; // 930

//   const isOpen = currentMinutes >= openMinutes && currentMinutes <= closeMinutes;

//   const formattedTime = ist.toLocaleTimeString('en-IN', {
//     hour: '2-digit',
//     minute: '2-digit',
//     second: '2-digit',
//     hour12: true
//   });

//   return {
//     isOpen,
//     time: formattedTime
//   };
// }






app.post('/orderbuy', isloggedin, async (req, res) => {
  
if (!(await getMarketStatusIST())) {
  return res.status(202).json({
    message: `Market is closed as of now We can not proceed with the order`
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

      myuser.netInvestment+=cost;
      await myuser.save();
      return res.status(200).json({ message: "Order executed successfully." });
    }


    return res.status(400).json({ message: "Only BUY action is supported for now." });

  } catch (err) {

    return res.status(500).json({ message: "Internal server error" });
  }
});



app.post('/ordersell', isloggedin, async (req, res) => {
  if (!(await getMarketStatusIST())) {
  return res.status(202).json({
    message: `Market is closed as of now We can not proceed with the order`
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

app.get('/userdata',isloggedin,async(req,res)=>{
  const myuser=req.user;
  return res.status(200).json({investment:myuser.netInvestment,PL:myuser.realisedPL});
})





// function my_func(){
//   console.log("listening to 5000")
// }

app.listen(5000,()=>{console.log("listening over 5000")})