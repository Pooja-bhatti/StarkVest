import React from 'react';
import { useLocation } from 'react-router-dom';

export const Details = () => {
  const location = useLocation();
  const stockData = location.state?.stockData;

  if (!stockData) return <p className='text-white'>No stock data found.</p>;

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
      <button>BUY</button>
      <br/>
      <button>SELL</button>
    </div>
  );
};
