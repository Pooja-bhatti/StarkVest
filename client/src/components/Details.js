import axios from 'axios';
import React from 'react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export const Details = () => {
  const { setFund } = useUser();
  const location = useLocation();
  const stockData = location.state?.stockData;

  const [tradeForm, setTradeForm] = useState({
    action: "buy",     // default radio
    exchange: "NSE",   // default dropdown
    quantity:0,
    
    // stock:stockData.companyName
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setTradeForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!stockData) return <p className='text-white'>No stock data found.</p>;

  const handleSubmit=async(e)=>{
    e.preventDefault();
    
    if(tradeForm.quantity<=0){
      window.alert("Plz enter a valid quantity for Stocks You want to BUY/SELL");
      return;
    }
    const con=window.confirm(`Are you sure you want to ${tradeForm.action} ${tradeForm.quantity} stocks of ${stockData.companyName}`)
    if(con){
      try{
      
        const price = parseFloat(
  tradeForm.exchange === "NSE"
    ? stockData.currentPrice.NSE
    : stockData.currentPrice.BSE
);

        if(tradeForm.action==="buy"){
          const response=await axios.post('/orderbuy',{data:tradeForm,stock:stockData.companyName,price});
          if(response.status===200){
            window.alert("Congradulations your order was successfully placed and when execute you will be able to see it in portfolio")
            const quantity = parseInt(tradeForm.quantity, 10);
            if (!isNaN(price) && !isNaN(quantity)) {
              const cost = price * quantity;
              setFund(prev => Number(prev) - cost); 
            }

          }
          else{
            // console.log(response.data.message);
            window.alert(response.data.message);
          }
        }
        else{
          const response=await axios.post('/ordersell',{data:tradeForm,stock:stockData.companyName,price});
          if(response.status===200){
            window.alert("Congradulations your order was successfully placed and when execute you will be able to see change in portfolio")
            const quantity = parseInt(tradeForm.quantity, 10);
            if (!isNaN(price) && !isNaN(quantity)) {
              const cost = price * quantity;
              setFund(prev => Number(prev) + cost); 
            }

          }
          else{
            // console.log(response.data.message);
            window.alert(response.data.message);
          }
        }

        
      }
      catch(err){
        console.log(err)
      }

    }
  }



  // 🧠 Normalize function for comparison
  const normalize = str =>
    str?.toLowerCase().replace(/\bltd\b|\blimited\b|\./g, '').trim();

  const baseName = normalize(stockData.companyName);

  // ✅ Try best match for peerCompanyList
  const peerSelf = stockData.companyProfile?.peerCompanyList?.find(peer =>
    normalize(peer.companyName).includes(baseName)
  );

  const marketCap = peerSelf?.marketCap;
  const peRatio = peerSelf?.priceToEarningsValueRatio;

  // ✅ EPS Calculation
  const incomeData = stockData.financials?.[0]?.stockFinancialMap?.INC || [];
  const netIncome = parseFloat(
    incomeData.find(item => item.key === "NetIncome")?.value
  );
  const shares = parseFloat(
    incomeData.find(item => item.key === "DilutedWeightedAverageShares")?.value
  );
  const eps = netIncome && shares ? (netIncome / shares).toFixed(2) : null;
  const navigate=useNavigate;
  // const buyStocks = () => {
  //   navigate('/buy', { state: { stockData } });
  // };
  return (
    <div className='text-white p-4'>
      <h2 className='text-xl font-bold mb-4'>{stockData.companyName}</h2>
      <p><strong>Industry:</strong> {stockData.industry}</p>

      <h3 className='mt-4 text-lg font-semibold'>Stock Prices</h3>
      <p><strong>BSE:</strong> ₹{stockData.currentPrice?.BSE}</p>
      <p><strong>NSE:</strong> ₹{stockData.currentPrice?.NSE}</p>
      <p><strong>52 Week High:</strong> ₹{stockData.yearHigh}</p>
      <p><strong>52 Week Low:</strong> ₹{stockData.yearLow}</p>
      <p><strong>Percent Change:</strong> {stockData.percentChange}%</p>

      <h3 className='mt-4 text-lg font-semibold'>Financial Info</h3>
      <p><strong>Market Cap:</strong> ₹{marketCap ?? "N/A"}</p>
      <p><strong>PE Ratio:</strong> {peRatio ?? "N/A"}</p>
      <p><strong>EPS:</strong> ₹{eps ?? "N/A"}</p>

      <h3 className='mt-4 text-lg font-semibold'>Company Description</h3>
      <p>{stockData.companyProfile?.companyDescription}</p>
      <form className="mt-6 space-y-4 text-white" onSubmit={handleSubmit}>
        <div>
          <label className="mr-4 font-medium">
            <input
              type="radio"
              name="action"
              value="buy"
              checked={tradeForm.action === "buy"}
              onChange={handleFormChange}
              className="mr-1"
            />
            Buy
          </label>
          <label className="font-medium">
            <input
              type="radio"
              name="action"
              value="sell"
              checked={tradeForm.action === "sell"}
              onChange={handleFormChange}
              className="mr-1"
            />
            Sell
          </label>
        </div>

        <div>
          <label htmlFor="exchange" className="block font-medium mb-1">Select Exchange:</label>
          <select
            name="exchange"
            id="exchange"
            value={tradeForm.exchange}
            onChange={handleFormChange}
            className="bg-gray-800 border border-gray-600 p-2 rounded"
          >
            <option value="NSE">NSE</option>
            <option value="BSE">BSE</option>
          </select>
        </div>

        <input type="number" className='text-black' name="quantity" value={tradeForm.quantity} required onChange={handleFormChange}/>

        <button type="submit" className="bg-green-500 text-black font-semibold px-4 py-2 rounded hover:bg-green-400 transition">
          Submit
        </button>
      </form>


    </div>
  );
};
