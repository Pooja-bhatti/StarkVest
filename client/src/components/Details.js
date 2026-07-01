import axios from 'axios';
import React from 'react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './Details.css';

export const Details = () => {
  const { setFund } = useUser();
  const location = useLocation();
  const stockData = location.state?.stockData;

  const [tradeForm, setTradeForm] = useState({
    action: "buy",
    exchange: "NSE",
    quantity: 0,
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setTradeForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!stockData) return (
    <div className="sv-details__empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <h3>No stock data found</h3>
      <p>Search for a stock from the navbar to view details</p>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (tradeForm.quantity <= 0) {
      window.alert("Please enter a valid quantity for Stocks you want to BUY/SELL");
      return;
    }
    const con = window.confirm(`Are you sure you want to ${tradeForm.action} ${tradeForm.quantity} stocks of ${stockData.companyName}`);
    if (con) {
      try {
        const price = parseFloat(
          tradeForm.exchange === "NSE"
            ? stockData.currentPrice.NSE
            : stockData.currentPrice.BSE
        );

        if (tradeForm.action === "buy") {
          const response = await axios.post('/orderbuy', { data: tradeForm, stock: stockData.companyName, price });
          if (response.status === 200) {
            window.alert(response.data.message);
            const quantity = parseInt(tradeForm.quantity, 10);
            if (!isNaN(price) && !isNaN(quantity)) {
              const cost = price * quantity;
              setFund(prev => Number(prev) - cost);
            }
          } else {
            window.alert(response.data.message);
          }
        } else {
          const response = await axios.post('/ordersell', { data: tradeForm, stock: stockData.companyName, price });
          if (response.status === 200) {
            window.alert(response.data.message);
            const quantity = parseInt(tradeForm.quantity, 10);
            if (!isNaN(price) && !isNaN(quantity)) {
              const cost = price * quantity;
              setFund(prev => Number(prev) + cost);
            }
          } else {
            window.alert(response.data.message);
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  const normalize = str =>
    str?.toLowerCase().replace(/\bltd\b|\blimited\b|\./g, '').trim();

  const baseName = normalize(stockData.companyName);

  const peerSelf = stockData.companyProfile?.peerCompanyList?.find(peer =>
    normalize(peer.companyName).includes(baseName)
  );

  const marketCap = peerSelf?.marketCap;
  const peRatio = peerSelf?.priceToEarningsValueRatio;

  const incomeData = stockData.financials?.[0]?.stockFinancialMap?.INC || [];
  const netIncome = parseFloat(
    incomeData.find(item => item.key === "NetIncome")?.value
  );
  const shares = parseFloat(
    incomeData.find(item => item.key === "DilutedWeightedAverageShares")?.value
  );
  const eps = netIncome && shares ? (netIncome / shares).toFixed(2) : null;

  const nsePrice = stockData.currentPrice?.NSE;
  const bsePrice = stockData.currentPrice?.BSE;
  const yearHigh = stockData.yearHigh;
  const yearLow = stockData.yearLow;
  const percentChange = stockData.percentChange;

  // Calculate 52-week position
  const currentPrice = nsePrice || bsePrice;
  const weekPosition = yearHigh && yearLow && currentPrice
    ? ((currentPrice - yearLow) / (yearHigh - yearLow)) * 100
    : 50;

  return (
    <div className="sv-details" id="details-page">
      {/* Company Header */}
      <header className="sv-details__header">
        <div className="sv-details__company">
          <h1 className="sv-details__name">{stockData.companyName}</h1>
          <span className="sv-details__industry">{stockData.industry}</span>
        </div>
        <div className="sv-details__change">
          <span className={`sv-details__percent ${percentChange >= 0 ? 'sv-details__percent--up' : 'sv-details__percent--down'}`}>
            {percentChange >= 0 ? '▲' : '▼'} {Math.abs(percentChange)}%
          </span>
        </div>
      </header>

      <div className="sv-details__body">
        {/* Left: Stock Info */}
        <div className="sv-details__info">
          {/* Price Cards */}
          <div className="sv-details__price-grid">
            <div className="sv-details__price-card">
              <span className="sv-details__price-label">NSE</span>
              <span className="sv-details__price-value">₹{nsePrice ? Number(nsePrice).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : 'N/A'}</span>
            </div>
            <div className="sv-details__price-card">
              <span className="sv-details__price-label">BSE</span>
              <span className="sv-details__price-value">₹{bsePrice ? Number(bsePrice).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : 'N/A'}</span>
            </div>
          </div>

          {/* 52 Week Range */}
          <div className="sv-details__range-card">
            <h3>52 Week Range</h3>
            <div className="sv-details__range">
              <span className="sv-details__range-low">₹{yearLow}</span>
              <div className="sv-details__range-bar">
                <div className="sv-details__range-fill" style={{ width: `${Math.min(Math.max(weekPosition, 2), 98)}%` }}></div>
                <div className="sv-details__range-marker" style={{ left: `${Math.min(Math.max(weekPosition, 2), 98)}%` }}></div>
              </div>
              <span className="sv-details__range-high">₹{yearHigh}</span>
            </div>
          </div>

          {/* Financial Metrics */}
          <div className="sv-details__metrics">
            <h3>Financial Metrics</h3>
            <div className="sv-details__metrics-grid">
              <div className="sv-details__metric">
                <span className="sv-details__metric-label">Market Cap</span>
                <span className="sv-details__metric-value">{marketCap ? `₹${marketCap}` : 'N/A'}</span>
              </div>
              <div className="sv-details__metric">
                <span className="sv-details__metric-label">P/E Ratio</span>
                <span className="sv-details__metric-value">{peRatio ?? 'N/A'}</span>
              </div>
              <div className="sv-details__metric">
                <span className="sv-details__metric-label">EPS</span>
                <span className="sv-details__metric-value">{eps ? `₹${eps}` : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {stockData.companyProfile?.companyDescription && (
            <div className="sv-details__description">
              <h3>About</h3>
              <p>{stockData.companyProfile.companyDescription}</p>
            </div>
          )}
        </div>

        {/* Right: Trade Form */}
        <div className="sv-details__trade">
          <div className="sv-details__trade-card">
            <h3>Place Order</h3>

            <form onSubmit={handleSubmit}>
              {/* Buy/Sell Toggle */}
              <div className="sv-details__toggle">
                <button
                  type="button"
                  className={`sv-details__toggle-btn ${tradeForm.action === 'buy' ? 'sv-details__toggle-btn--active sv-details__toggle-btn--buy' : ''}`}
                  onClick={() => setTradeForm(prev => ({ ...prev, action: 'buy' }))}
                >
                  Buy
                </button>
                <button
                  type="button"
                  className={`sv-details__toggle-btn ${tradeForm.action === 'sell' ? 'sv-details__toggle-btn--active sv-details__toggle-btn--sell' : ''}`}
                  onClick={() => setTradeForm(prev => ({ ...prev, action: 'sell' }))}
                >
                  Sell
                </button>
              </div>

              {/* Exchange */}
              <div className="sv-details__field">
                <label htmlFor="exchange">Exchange</label>
                <select
                  name="exchange"
                  id="exchange"
                  value={tradeForm.exchange}
                  onChange={handleFormChange}
                >
                  <option value="NSE">NSE</option>
                  <option value="BSE">BSE</option>
                </select>
              </div>

              {/* Quantity */}
              <div className="sv-details__field">
                <label htmlFor="quantity">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  id="quantity"
                  value={tradeForm.quantity}
                  required
                  onChange={handleFormChange}
                  min="1"
                  placeholder="0"
                />
              </div>

              {/* Order Summary */}
              {tradeForm.quantity > 0 && (
                <div className="sv-details__order-summary">
                  <div className="sv-details__order-row">
                    <span>Price ({tradeForm.exchange})</span>
                    <span>₹{tradeForm.exchange === 'NSE' ? Number(nsePrice).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : Number(bsePrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="sv-details__order-row">
                    <span>Quantity</span>
                    <span>×{tradeForm.quantity}</span>
                  </div>
                  <div className="sv-details__order-row sv-details__order-row--total">
                    <span>Total</span>
                    <span>₹{(parseFloat(tradeForm.exchange === 'NSE' ? nsePrice : bsePrice) * parseInt(tradeForm.quantity || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              )}

              <button type="submit" className={`sv-details__submit ${tradeForm.action === 'buy' ? 'sv-details__submit--buy' : 'sv-details__submit--sell'}`}>
                {tradeForm.action === 'buy' ? 'Buy Now' : 'Sell Now'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
