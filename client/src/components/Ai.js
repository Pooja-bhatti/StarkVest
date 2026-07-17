import React, { useState } from 'react';
import axios from 'axios';
import './Ai.css';

export const Ai = () => {
  const [stockName, setStockName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!stockName.trim()) return;

    setLoading(true);
    setResult(null);
    setError('');

    try {
      const res = await axios.post('/aisuggest', { stockName: stockName.trim() });
      setResult(res.data.answer);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err.response?.data?.details || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getActionClass = (action) => {
    if (!action) return '';
    const a = action.toUpperCase();
    if (a === 'BUY') return 'action-buy';
    if (a === 'SELL') return 'action-sell';
    return 'action-hold';
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'score-high';
    if (score >= 45) return 'score-mid';
    return 'score-low';
  };

  const getRiskClass = (risk) => {
    if (!risk) return '';
    const r = risk.toLowerCase();
    if (r === 'high') return 'risk-high';
    if (r === 'low') return 'risk-low';
    return 'risk-medium';
  };

  return (
    <div className="sv-ai" id="ai-page">
      <header className="sv-ai__header">
        <h1 className="sv-ai__title">AI Stock Advisor</h1>
        <p className="sv-ai__subtitle">Ask about any stock — get an instant BUY, HOLD, or SELL recommendation backed by market insights</p>
      </header>

      {/* Search Form */}
      <form onSubmit={handleAnalyze} className="sv-ai__search-form">
        <div className="sv-ai__search-wrap">
          <svg className="sv-ai__search-icon" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
          </svg>
          <input
            type="text"
            value={stockName}
            onChange={(e) => setStockName(e.target.value)}
            placeholder="Enter a company name... e.g. Reliance, TCS, HDFC Bank"
            disabled={loading}
            autoFocus
            id="ai-stock-input"
          />
        </div>
        <button type="submit" disabled={loading || !stockName.trim()} className="sv-ai__analyze-btn">
          {loading ? (
            <>
              <span className="sv-ai__btn-spinner"></span>
              Analyzing...
            </>
          ) : (
            <>
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
              </svg>
              Analyze Stock
            </>
          )}
        </button>
      </form>

      {/* Error State */}
      {error && (
        <div className="sv-ai__error">
          <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="sv-ai__loading">
          <div className="sv-ai__spinner"></div>
          <h3>Analyzing {stockName}...</h3>
          <p>Checking market data, recent news, and financial indicators...</p>
        </div>
      )}

      {/* Result Card */}
      {result && !loading && (
        <div className="sv-ai__result">

          {/* Header: Company + Action Badge */}
          <div className="sv-ai__result-header">
            <div className="sv-ai__result-company">
              <h2>{result.companyName || stockName}</h2>
              <div className="sv-ai__result-meta">
                {result.ticker && <span className="sv-ai__ticker">{result.ticker}</span>}
                {result.sector && <span className="sv-ai__sector-tag">{result.sector}</span>}
                {result.riskLevel && (
                  <span className={`sv-ai__risk-tag ${getRiskClass(result.riskLevel)}`}>
                    {result.riskLevel} Risk
                  </span>
                )}
              </div>
            </div>
            <div className={`sv-ai__action-badge ${getActionClass(result.action)}`}>
              {result.action}
            </div>
          </div>

          {/* Confidence Score */}
          <div className="sv-ai__confidence">
            <div className="sv-ai__confidence-header">
              <span className="sv-ai__confidence-label">AI Confidence</span>
              <span className={`sv-ai__confidence-value ${getScoreColor(result.confidenceScore)}`}>
                {result.confidenceScore}%
              </span>
            </div>
            <div className="sv-ai__confidence-bar">
              <div
                className={`sv-ai__confidence-fill ${getScoreColor(result.confidenceScore)}`}
                style={{ width: `${result.confidenceScore}%` }}
              ></div>
            </div>
          </div>

          {/* Summary */}
          {result.summary && (
            <div className="sv-ai__summary">
              <p>{result.summary}</p>
            </div>
          )}

          {/* Bull & Bear Cases */}
          <div className="sv-ai__cases">
            {result.bullCase && (
              <div className="sv-ai__case sv-ai__case--bull">
                <h4>
                  <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"/>
                  </svg>
                  Bull Case
                </h4>
                <p>{result.bullCase}</p>
              </div>
            )}
            {result.bearCase && (
              <div className="sv-ai__case sv-ai__case--bear">
                <h4>
                  <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                    <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd"/>
                  </svg>
                  Bear Case
                </h4>
                <p>{result.bearCase}</p>
              </div>
            )}
          </div>

          {/* News Insights */}
          {result.newsInsights && result.newsInsights.length > 0 && (
            <div className="sv-ai__news">
              <h4>
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                  <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd"/>
                  <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z"/>
                </svg>
                Recent News & Catalysts
              </h4>
              <ul>
                {result.newsInsights.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <div className="sv-ai__disclaimer">
            ⚠️ This is an AI-generated suggestion for educational purposes only. Always do your own research before making investment decisions.
          </div>

          {/* Search Again */}
          <button className="sv-ai__again-btn" onClick={() => { setResult(null); setStockName(''); }}>
            ← Analyze Another Stock
          </button>
        </div>
      )}
    </div>
  );
};
