import React, { useState } from 'react';
import axios from 'axios';
import './Ai.css';

export const Ai = () => {
  const [response, setResponse] = useState('');
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState(null);

  const handleRequest = async (actionType) => {
    setLoading(true);
    setResponse('');
    setActiveAction(actionType);

    const data = { action: actionType };
    if (actionType === 'buy') data.budget = Number(budget);

    try {
      const result = await axios.post('/aisuggest', data);
      setResponse(result.data.answer || 'No response');
    } catch (err) {
      console.error('Request failed:', err);
      setResponse('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const disabledBuy = !budget || Number(budget) <= 0 || loading;

  const actions = [
    {
      key: 'buy',
      title: 'Best Stocks to Buy',
      description: 'AI suggests top stocks for your budget',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
      ),
      disabled: disabledBuy,
    },
    {
      key: 'sell',
      title: 'Stocks to Sell',
      description: 'Review portfolio for sell opportunities',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
      ),
      disabled: loading,
    },
    {
      key: 'sectors',
      title: 'Top Sectors',
      description: 'Discover the best sectors to invest in',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
      ),
      disabled: loading,
    },
  ];

  return (
    <div className="sv-ai" id="ai-page">
      <header className="sv-ai__header">
        <h1 className="sv-ai__title">AI Insights</h1>
        <p className="sv-ai__subtitle">Get AI-powered trading suggestions for your portfolio</p>
      </header>

      {/* Budget Input */}
      <div className="sv-ai__budget-card">
        <div className="sv-ai__budget-label">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
            <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          Investment Amount
        </div>
        <div className="sv-ai__budget-input-wrap">
          <span className="sv-ai__budget-prefix">₹</span>
          <input
            type="number"
            value={budget}
            min="0"
            onChange={(e) => setBudget(e.target.value)}
            placeholder="50,000"
            id="ai-budget-input"
          />
        </div>
        <p className="sv-ai__budget-hint">Required for "Best Stocks to Buy" suggestions</p>
      </div>

      {/* Action Cards */}
      <div className="sv-ai__actions">
        {actions.map(action => (
          <button
            key={action.key}
            className={`sv-ai__action-card ${activeAction === action.key && loading ? 'sv-ai__action-card--loading' : ''}`}
            onClick={() => handleRequest(action.key)}
            disabled={action.disabled}
          >
            <div className="sv-ai__action-icon">{action.icon}</div>
            <div className="sv-ai__action-text">
              <h3>{action.title}</h3>
              <p>{action.description}</p>
            </div>
            <svg className="sv-ai__action-arrow" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        ))}
      </div>

      {/* Response */}
      {loading && (
        <div className="sv-ai__response sv-ai__response--loading">
          <div className="sv-ai__skeleton">
            <div className="sv-ai__skeleton-line sv-ai__skeleton-line--full"></div>
            <div className="sv-ai__skeleton-line sv-ai__skeleton-line--3q"></div>
            <div className="sv-ai__skeleton-line sv-ai__skeleton-line--half"></div>
            <div className="sv-ai__skeleton-line sv-ai__skeleton-line--full"></div>
            <div className="sv-ai__skeleton-line sv-ai__skeleton-line--3q"></div>
          </div>
        </div>
      )}

      {!loading && response && (
        <div className="sv-ai__response">
          <div className="sv-ai__response-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            AI Suggestion
          </div>
          <pre className="sv-ai__response-content">{response}</pre>
          <div className="sv-ai__disclaimer">
            ⚠️ These are AI-generated suggestions. Always do your own research before making financial decisions.
          </div>
        </div>
      )}
    </div>
  );
};
