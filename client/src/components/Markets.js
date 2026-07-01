import React, { useState } from 'react';
import TradingViewWidget from './TradingViewWidget';
import './Markets.css';

function Markets() {
  const [selectedIndex, setSelectedIndex] = useState('BSE:SENSEX');

  const indexOptions = [
    { name: 'Sensex', symbol: 'BSE:SENSEX', icon: '🇮🇳' },
    { name: 'Nasdaq 100', symbol: 'NASDAQ:NDX', icon: '🇺🇸' },
    { name: 'Bitcoin', symbol: 'BINANCE:BTCUSDT', icon: '₿' },
    { name: 'Gold', symbol: 'OANDA:XAUUSD', icon: '🥇' },
  ];

  return (
    <div className="sv-markets" id="markets-page">
      <header className="sv-markets__header">
        <h1 className="sv-markets__title">Markets</h1>
        <p className="sv-markets__subtitle">Track global indices and assets in real-time</p>
      </header>

      {/* Index Tabs */}
      <div className="sv-markets__tabs">
        {indexOptions.map(index => (
          <button
            key={index.symbol}
            onClick={() => setSelectedIndex(index.symbol)}
            className={`sv-markets__tab ${selectedIndex === index.symbol ? 'sv-markets__tab--active' : ''}`}
          >
            <span className="sv-markets__tab-icon">{index.icon}</span>
            {index.name}
          </button>
        ))}
      </div>

      {/* Chart Container */}
      <div className="sv-markets__chart">
        <TradingViewWidget symbol={selectedIndex} />
      </div>
    </div>
  );
}

export default Markets;
