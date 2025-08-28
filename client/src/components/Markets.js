import React, { useState } from 'react';
import TradingViewWidget from './TradingViewWidget';

function Markets() {
  const [selectedIndex, setSelectedIndex] = useState('BSE:SENSEX');

  const indexOptions = [
    { name: 'Bitcoin', symbol: 'BINANCE:BTCUSDT' },
    { name: 'Sensex', symbol: 'BSE:SENSEX' },
    { name: 'Nasdaq 100', symbol: 'NASDAQ:NDX' },
    { name: 'Gold', symbol: 'OANDA:XAUUSD' },
  ];

  return (
    <div className="p-4 bg-black min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">Global Indices</h1>

      {/* Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        {indexOptions.map(index => (
          <button
            key={index.symbol}
            onClick={() => setSelectedIndex(index.symbol)}
            className={`px-4 py-2 rounded-lg font-semibold transition duration-200 ${
              selectedIndex === index.symbol
                ? 'bg-white text-black'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {index.name}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="w-full">
        <TradingViewWidget symbol={selectedIndex} />
      </div>
    </div>
  );
}

export default Markets;

