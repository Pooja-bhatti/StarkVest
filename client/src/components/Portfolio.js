import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_KEY = process.env.REACT_APP_STOCK_API_KEY;

export const Portfolio = () => {
  const [stocks, setStocks] = useState([]);
  const [activeTrade, setActiveTrade] = useState(null); // company name
  const [tradeQuantity, setTradeQuantity] = useState('');
  const [selectedExchange, setSelectedExchange] = useState({}); // { TCS: "NSE" }
  const [livePrices, setLivePrices] = useState({}); // { TCS: { NSE: 1234, BSE: 1220 } }

  // Fetch portfolio
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await axios.get('/getstocks');
        if (res.status === 200) {
          setStocks(res.data.stocks || []);
        }
      } catch (err) {
        console.error("Failed to load portfolio:", err);
      }
    };
    fetchPortfolio();
  }, []);

  // Clean company name for API
  const cleanCompanyName = (name) => {
    let cleaned = name.toLowerCase();
    const patternsToRemove = [
      /\s+ltd\.?$/, /\s+limited$/, /\s+pvt\.?\s+ltd\.?$/, /\s+private\s+limited$/, /\s+llc$/,
      /\s+inc\.?$/, /\s+corporation$/, /\s+corp\.?$/, /\s+plc$/, /\s+co\.?$/, /\s+company$/
    ];
    patternsToRemove.forEach(pattern => cleaned = cleaned.replace(pattern, ''));
    return cleaned.trim();
  };

  // Fetch NSE/BSE prices
  const fetchLivePrice = async (company) => {
    const cleaned = cleanCompanyName(company);
    try {
      const res = await axios.get(`https://stock.indianapi.in/stock?name=${encodeURIComponent(cleaned)}`, {
        headers: { 'x-api-key': API_KEY }
      });
      if (!res.data.error) {
        setLivePrices(prev => ({
          ...prev,
          [company]: {
            NSE: res.data.currentPrice?.NSE,
            BSE: res.data.currentPrice?.BSE
          }
        }));
        setSelectedExchange(prev => ({ ...prev, [company]: 'NSE' })); // default to NSE
      }
    } catch (err) {
      console.error(`Live price fetch failed for ${company}:`, err);
    }
  };

  const handleBuySell = async (type, company) => {
    const quantity = parseInt(tradeQuantity);
    const exchange = selectedExchange[company];
    const price = livePrices[company]?.[exchange];

    if (!quantity || !price||quantity<=0) return alert("Enter valid quantity and wait for price.");

    const con=window.confirm(`Are you sure you want to ${type} ${quantity} stocks of ${company}`);
    if(con){
      try {
        if (type === "buy") {
          const res = await axios.post('/orderbuy', {
            data: { action: 'buy', quantity },
            stock: company,
            price,
          });
          alert(res.data.message);
        } else {
          const res = await axios.post('/ordersell', {
            data: { quantity },
            stock: company,
            price,
          });
          alert(res.data.message);
        }
        window.location.reload();
      } catch (err) {
        alert("Trade failed");
        console.error(err);
      }

    }
    else{
      return;
    }

  };

  return (
    <div className="text-white">
      <h2 className="text-xl font-bold mb-4">Your Portfolio</h2>
      {stocks.length === 0 ? (
        <p>No stocks to show</p>
      ) : (
        stocks.map(stock => {
          const live = livePrices[stock.company] || {};
          const isActive = activeTrade === stock.company;

          if (!live.NSE && !live.BSE) fetchLivePrice(stock.company);

          return (
            <div key={stock.company} className="border-b border-gray-600 mb-4 pb-2">
              <div><strong>Company:</strong> {stock.company}</div>
              <div><strong>Average Buy Price:</strong> ₹{stock.average_price}</div>
              <div><strong>Quantity:</strong> {stock.quantity}</div>
              <div>
                <strong>Live Price:</strong>
                <span className="ml-2">NSE: {live.NSE ?? 'Loading...'}</span> |
                <span className="ml-2">BSE: {live.BSE ?? 'Loading...'}</span>
              </div>

              {!isActive ? (
                <button
                  className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
                  onClick={() => setActiveTrade(stock.company)}
                >
                  BUY/SELL
                </button>
              ) : (
                <div className="mt-2">
                  <input
                    type="number"
                    placeholder="Enter quantity"
                    value={tradeQuantity}
                    onChange={(e) => setTradeQuantity(e.target.value)}
                    className="text-black p-1 mr-2"
                  />

                  <select
                    className="text-black mr-2 p-1"
                    value={selectedExchange[stock.company]}
                    onChange={(e) =>
                      setSelectedExchange((prev) => ({
                        ...prev,
                        [stock.company]: e.target.value,
                      }))
                    }
                  >
                    <option value="NSE">NSE</option>
                    <option value="BSE">BSE</option>
                  </select>

                  <button
                    className="bg-green-600 px-3 py-1 rounded mr-2"
                    onClick={() => handleBuySell("buy", stock.company)}
                  >
                    Buy
                  </button>
                  <button
                    className="bg-red-600 px-3 py-1 rounded"
                    onClick={() => handleBuySell("sell", stock.company)}
                  >
                    Sell
                  </button>
                  <button
                    className="ml-3 text-sm text-gray-400 underline"
                    onClick={() => {
                      setActiveTrade(null);
                      setTradeQuantity('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};
