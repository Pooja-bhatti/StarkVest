import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './Portfolio.css';

const API_KEY = process.env.REACT_APP_STOCK_API_KEY;

export const Portfolio = () => {
  const [stocks, setStocks] = useState([]);
  const [activeTrade, setActiveTrade] = useState(null);
  const [tradeQuantity, setTradeQuantity] = useState('');
  const [selectedExchange, setSelectedExchange] = useState({});
  const [livePrices, setLivePrices] = useState({});
  const [unrealisedPL, setUnrealisedPL] = useState(0);

  const isMounted = useRef(true); // prevent state updates after unmount

  // Fetch portfolio
  useEffect(() => {
    isMounted.current = true;
    const controller = new AbortController();

    const fetchPortfolio = async () => {
      try {
        const res = await axios.get('/getstocks', { signal: controller.signal });
        if (res.status === 200 && isMounted.current) {
          setStocks(res.data.stocks || []);
        }
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          console.error("Failed to load portfolio:", err);
        }
      }
    };
    fetchPortfolio();

    return () => {
      isMounted.current = false;
      controller.abort();
    };
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
    const controller = new AbortController();

    try {
      const res = await axios.get(
        `https://stock.indianapi.in/stock?name=${encodeURIComponent(cleaned)}`,
        {
          headers: { 'x-api-key': API_KEY },
          signal: controller.signal
        }
      );
      if (!res.data.error && isMounted.current) {
        setLivePrices(prev => ({
          ...prev,
          [company]: {
            NSE: res.data.currentPrice?.NSE,
            BSE: res.data.currentPrice?.BSE
          }
        }));
        setSelectedExchange(prev => ({ ...prev, [company]: 'NSE' }));
      }
    } catch (err) {
      if (err.name !== "CanceledError" && err.name !== "AbortError") {
        console.error(`Live price fetch failed for ${company}:`, err);
      }
    }

    return () => controller.abort();
  };

  // Calculate unrealised P/L whenever prices, stocks, or exchange selection change
  useEffect(() => {
    let total = 0;
    stocks.forEach(stock => {
      const live = livePrices[stock.company];
      const exchange = selectedExchange[stock.company] || 'NSE';
      const livePrice = live?.[exchange];

      if (livePrice) {
        const pl = (livePrice - stock.average_price) * stock.quantity;
        total += pl;
      }
    });
    if (isMounted.current) setUnrealisedPL(total);
  }, [livePrices, stocks, selectedExchange]);

  const handleBuySell = async (type, company) => {
    const quantity = parseInt(tradeQuantity);
    const exchange = selectedExchange[company];
    const price = livePrices[company]?.[exchange];

    if (!quantity || !price || quantity <= 0) return alert("Enter valid quantity and wait for price.");

    const con = window.confirm(`Are you sure you want to ${type} ${quantity} stocks of ${company}?`);
    if (!con) return;

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
  };

  const getStockPL = (stock) => {
    const live = livePrices[stock.company];
    const exchange = selectedExchange[stock.company] || 'NSE';
    const livePrice = live?.[exchange];
    if (!livePrice) return null;
    return (livePrice - stock.average_price) * stock.quantity;
  };

  const getTotalValue = () => {
    let total = 0;
    stocks.forEach(stock => {
      const live = livePrices[stock.company];
      const exchange = selectedExchange[stock.company] || 'NSE';
      const livePrice = live?.[exchange];
      if (livePrice) {
        total += livePrice * stock.quantity;
      } else {
        total += stock.average_price * stock.quantity;
      }
    });
    return total;
  };

  return (
    <div className="sv-portfolio" id="portfolio-page">
      {/* Header */}
      <header className="sv-portfolio__header">
        <div>
          <h1 className="sv-portfolio__title">Portfolio</h1>
          <p className="sv-portfolio__subtitle">Manage your holdings and execute trades</p>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="sv-portfolio__summary">
        <div className="sv-portfolio__summary-card">
          <span className="sv-portfolio__summary-label">Total Holdings</span>
          <span className="sv-portfolio__summary-value">{stocks.length}</span>
        </div>
        <div className="sv-portfolio__summary-card">
          <span className="sv-portfolio__summary-label">Portfolio Value</span>
          <span className="sv-portfolio__summary-value">₹{getTotalValue().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="sv-portfolio__summary-card">
          <span className="sv-portfolio__summary-label">Unrealised P/L</span>
          <span className={`sv-portfolio__summary-value ${unrealisedPL >= 0 ? 'sv-portfolio__summary-value--profit' : 'sv-portfolio__summary-value--loss'}`}>
            {unrealisedPL >= 0 ? '+' : ''}₹{unrealisedPL.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Stocks List */}
      {stocks.length === 0 ? (
        <div className="sv-portfolio__empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
          <h3>No holdings yet</h3>
          <p>Search for a stock in the navbar to start trading</p>
        </div>
      ) : (
        <div className="sv-portfolio__list">
          {stocks.map(stock => {
            const live = livePrices[stock.company] || {};
            const isActive = activeTrade === stock.company;
            const pl = getStockPL(stock);
            const exchange = selectedExchange[stock.company] || 'NSE';
            const currentPrice = live[exchange];

            if (!live.NSE && !live.BSE) fetchLivePrice(stock.company);

            return (
              <div key={stock.company} className={`sv-stock-card ${isActive ? 'sv-stock-card--expanded' : ''}`}>
                <div className="sv-stock-card__main">
                  <div className="sv-stock-card__info">
                    <h3 className="sv-stock-card__name">{stock.company}</h3>
                    <span className="sv-stock-card__qty">{stock.quantity} shares</span>
                  </div>

                  <div className="sv-stock-card__prices">
                    <div className="sv-stock-card__price-item">
                      <span className="sv-stock-card__price-label">Avg Buy</span>
                      <span className="sv-stock-card__price-value">₹{Number(stock.average_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="sv-stock-card__price-item">
                      <span className="sv-stock-card__price-label">NSE</span>
                      <span className="sv-stock-card__price-value">{live.NSE ? `₹${Number(live.NSE).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}</span>
                    </div>
                    <div className="sv-stock-card__price-item">
                      <span className="sv-stock-card__price-label">BSE</span>
                      <span className="sv-stock-card__price-value">{live.BSE ? `₹${Number(live.BSE).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}</span>
                    </div>
                  </div>

                  <div className="sv-stock-card__pl">
                    {pl !== null ? (
                      <>
                        <span className={`sv-stock-card__pl-value ${pl >= 0 ? 'sv-stock-card__pl-value--profit' : 'sv-stock-card__pl-value--loss'}`}>
                          {pl >= 0 ? '+' : ''}₹{pl.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="sv-stock-card__pl-label">P/L</span>
                      </>
                    ) : (
                      <span className="sv-stock-card__loading">Loading...</span>
                    )}
                  </div>

                  {!isActive ? (
                    <button
                      className="sv-stock-card__trade-btn"
                      onClick={() => setActiveTrade(stock.company)}
                    >
                      Trade
                    </button>
                  ) : (
                    <button
                      className="sv-stock-card__trade-btn sv-stock-card__trade-btn--cancel"
                      onClick={() => { setActiveTrade(null); setTradeQuantity(''); }}
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {/* Trade Panel */}
                {isActive && (
                  <div className="sv-stock-card__trade-panel">
                    <div className="sv-stock-card__trade-row">
                      <div className="sv-stock-card__trade-field">
                        <label>Quantity</label>
                        <input
                          type="number"
                          placeholder="Enter qty"
                          value={tradeQuantity}
                          onChange={(e) => setTradeQuantity(e.target.value)}
                        />
                      </div>

                      <div className="sv-stock-card__trade-field">
                        <label>Exchange</label>
                        <select
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
                      </div>

                      {currentPrice && (
                        <div className="sv-stock-card__trade-field">
                          <label>Price</label>
                          <span className="sv-stock-card__trade-price">₹{Number(currentPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}
                    </div>

                    <div className="sv-stock-card__trade-actions">
                      <button
                        className="sv-stock-card__buy-btn"
                        onClick={() => handleBuySell("buy", stock.company)}
                      >
                        Buy
                      </button>
                      <button
                        className="sv-stock-card__sell-btn"
                        onClick={() => handleBuySell("sell", stock.company)}
                      >
                        Sell
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
