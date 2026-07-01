import React, { useEffect, useState } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { jwtDecode } from "jwt-decode";
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import './Home.css';

export const Home = () => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const [displayName, setDisplayName] = useState('');
  const { fund } = useUser();
  const [dashboardData, setDashboardData] = useState({
    investment: 0,
    PL: 0,
    stockCount: 0,
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mockNews, setMockNews] = useState([]);

  useEffect(() => {
    const allNews = [
      { id: 1, title: 'RBI keeps repo rate unchanged at 6.5%', source: 'Financial Times' },
      { id: 2, title: 'Tech stocks surge amid AI optimism', source: 'Bloomberg' },
      { id: 3, title: 'Markets hit record highs in early trade', source: 'Reuters' },
      { id: 4, title: 'Inflation cools down, raises hopes for rate cuts', source: 'CNBC' },
      { id: 5, title: 'EV sector sees massive investments this quarter', source: 'Wall Street Journal' },
      { id: 6, title: 'Oil prices stabilize after recent supply shocks', source: 'Reuters' },
      { id: 7, title: 'New tech IPOs show strong debut performance', source: 'Bloomberg' },
      { id: 8, title: 'Banking sector reports better than expected Q2 earnings', source: 'Financial Times' },
      { id: 9, title: 'Renewable energy stocks gain momentum', source: 'CNBC' },
      { id: 10, title: 'Global supply chain issues ease up', source: 'Wall Street Journal' },
    ];
    const shuffled = allNews.sort(() => 0.5 - Math.random());
    setMockNews(shuffled.slice(0, 3));
  }, []);

  useEffect(() => {
    const loadNameFromToken = () => {
      try {
        const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
        if (!match) return;

        const token = decodeURIComponent(match[1]);
        const decoded = jwtDecode(token);
        if (decoded.name) {
          setDisplayName(decoded.name);
        } else {
          console.warn("Token decoded but name not found");
        }
      } catch (err) {
        console.error("Error decoding token:", err);
      }
    };

    if (isAuthenticated) {
      const timeout = setTimeout(() => {
        loadNameFromToken();
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [isAuthenticated]);

  // Fetch dashboard data when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchData = async () => {
      try {
        const [userData, stocksRes] = await Promise.all([
          axios.get('/userdata'),
          axios.get('/getstocks'),
        ]);
        setDashboardData({
          investment: userData.data.investment || 0,
          PL: userData.data.PL || 0,
          stockCount: stocksRes.data.stocks?.length || 0,
        });
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getGreeting = (date) => {
    const hours = date.getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Mock Data for new dashboard sections
  const mockActivity = [
    { id: 1, type: 'buy', ticker: 'RELIANCE', amount: '₹12,450', time: '2 hours ago' },
    { id: 2, type: 'deposit', ticker: 'FUNDS', amount: '+₹50,000', time: 'Yesterday' },
    { id: 3, type: 'sell', ticker: 'TCS', amount: '₹8,320', time: 'Yesterday' },
  ];

  // ===== AUTHENTICATED DASHBOARD VIEW =====
  if (isAuthenticated) {
    const totalValue = Number(fund) + dashboardData.investment;
    return (
      <main className="sv-dashboard" id="dashboard-page">
        {/* Welcome Header */}
        <header className="sv-dashboard__header">
          <div className="sv-dashboard__welcome">
            <h1 className="sv-dashboard__name">{getGreeting(currentTime)}, {displayName || 'Trader'}</h1>
            <p className="sv-dashboard__greeting">Here's your portfolio overview for {formatDate(currentTime)}.</p>
          </div>
          <div className="sv-dashboard__actions">
            <Link to="/portfolio" className="sv-btn sv-btn--primary">View Portfolio</Link>
          </div>
        </header>

        {/* KPI Grid */}
        <section className="sv-dashboard__kpi-grid">
          <div className="sv-kpi-card">
            <div className="sv-kpi-card__header">
              <span className="sv-kpi-card__label">Portfolio Value</span>
              <svg className="sv-kpi-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div className="sv-kpi-card__value">₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>

          <div className="sv-kpi-card">
            <div className="sv-kpi-card__header">
              <span className="sv-kpi-card__label">Total Investment</span>
              <svg className="sv-kpi-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            </div>
            <div className="sv-kpi-card__value">₹{Number(dashboardData.investment).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>

          <div className="sv-kpi-card">
            <div className="sv-kpi-card__header">
              <span className="sv-kpi-card__label">Realised P/L</span>
              <svg className={`sv-kpi-card__icon ${dashboardData.PL >= 0 ? 'color-success' : 'color-danger'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <div className={`sv-kpi-card__value ${dashboardData.PL >= 0 ? 'color-success' : 'color-danger'}`}>
              {dashboardData.PL >= 0 ? '+' : ''}₹{Number(dashboardData.PL).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="sv-kpi-card">
            <div className="sv-kpi-card__header">
              <span className="sv-kpi-card__label">Available Funds</span>
              <svg className="sv-kpi-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            </div>
            <div className="sv-kpi-card__value">₹{Number(fund).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </section>

        {/* Main Dashboard Layout (Grid) */}
        <div className="sv-dashboard__bento">
          {/* Left Column: Quick Actions & Market Overview */}
          <div className="sv-dashboard__bento-col sv-dashboard__bento-col--main">
            
            {/* Quick Actions Row */}
            <div className="sv-dashboard__actions-row">
              <Link to="/portfolio" className="sv-action-pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                Trade
              </Link>
              <Link to="/ai" className="sv-action-pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                AI Insights
              </Link>
              <Link to="/markets" className="sv-action-pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
                Markets
              </Link>
              <Link to="/profile" className="sv-action-pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Deposit
              </Link>
            </div>

            {/* Market Overview (Mocked Indices) */}
            <section className="sv-dashboard__card">
              <div className="sv-dashboard__card-header">
                <h2>Market Overview</h2>
                <Link to="/markets" className="sv-link">View Charts</Link>
              </div>
              <div className="sv-market-list">
                <div className="sv-market-item">
                  <div className="sv-market-item__name">NIFTY 50</div>
                  <div className="sv-market-item__chart"><svg viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0,20 L20,10 L40,15 L60,5 L80,10 L100,0" fill="none" stroke="#059669" strokeWidth="2"/></svg></div>
                  <div className="sv-market-item__price">
                    22,450.20 <span className="color-success">+0.45%</span>
                  </div>
                </div>
                <div className="sv-market-item">
                  <div className="sv-market-item__name">SENSEX</div>
                  <div className="sv-market-item__chart"><svg viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0,20 L20,5 L40,10 L60,0 L80,15 L100,5" fill="none" stroke="#059669" strokeWidth="2"/></svg></div>
                  <div className="sv-market-item__price">
                    74,120.40 <span className="color-success">+0.51%</span>
                  </div>
                </div>
                <div className="sv-market-item">
                  <div className="sv-market-item__name">BANK NIFTY</div>
                  <div className="sv-market-item__chart"><svg viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0,0 L20,15 L40,5 L60,20 L80,10 L100,20" fill="none" stroke="#DC2626" strokeWidth="2"/></svg></div>
                  <div className="sv-market-item__price">
                    47,560.10 <span className="color-danger">-0.12%</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Recent Activity */}
            <section className="sv-dashboard__card">
              <div className="sv-dashboard__card-header">
                <h2>Recent Activity</h2>
                <span className="sv-label">Simulated</span>
              </div>
              <div className="sv-activity-list">
                {mockActivity.map(item => (
                  <div key={item.id} className="sv-activity-item">
                    <div className={`sv-activity-icon sv-activity-icon--${item.type}`}>
                      {item.type === 'buy' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>}
                      {item.type === 'sell' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>}
                      {item.type === 'deposit' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}
                    </div>
                    <div className="sv-activity-details">
                      <div className="sv-activity-title">{item.type.charAt(0).toUpperCase() + item.type.slice(1)} {item.ticker}</div>
                      <div className="sv-activity-time">{item.time}</div>
                    </div>
                    <div className={`sv-activity-amount ${item.type === 'buy' ? 'color-danger' : 'color-success'}`}>
                      {item.type === 'buy' ? '-' : ''}{item.amount}
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Right Column: AI & News */}
          <div className="sv-dashboard__bento-col sv-dashboard__bento-col--side">
            
            {/* AI Insights Widget */}
            <section className="sv-dashboard__card sv-dashboard__card--ai">
              <div className="sv-dashboard__card-header">
                <h2 className="sv-ai-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                  AI Insights
                </h2>
              </div>
              <div className="sv-ai-widget">
                <p>Based on your current portfolio value (₹{totalValue.toLocaleString('en-IN')}), consider diversifying across sectors to manage volatility. Ask our AI for a tailored ₹50,000 portfolio strategy.</p>
                <Link to="/ai" className="sv-btn sv-btn--secondary sv-btn--full">Ask AI Assistant</Link>
              </div>
            </section>

            {/* Financial News Widget */}
            <section className="sv-dashboard__card">
              <div className="sv-dashboard__card-header">
                <h2>Top Stories</h2>
              </div>
              <div className="sv-news-list">
                {mockNews.map(news => (
                  <div key={news.id} className="sv-news-item">
                    <p className="sv-news-title">{news.title}</p>
                    <span className="sv-news-source">{news.source}</span>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>
      </main>
    );
  }

  // ===== UNAUTHENTICATED LANDING VIEW =====
  return (
    <main className="sv-landing" id="landing-page">
      <section className="sv-landing__hero">
        <div className="sv-landing__hero-bg"></div>
        <div className="sv-landing__hero-content">
          <span className="sv-landing__tag">StarkVest Paper Trading</span>
          <h1 className="sv-landing__title">
            Master the market.<br /><span>Zero risk involved.</span>
          </h1>
          <p className="sv-landing__subtitle">
            Experience real-time Indian stock market trading in a premium, risk-free environment. Build your portfolio, test strategies, and leverage AI insights.
          </p>
          <button onClick={() => loginWithRedirect()} className="sv-btn sv-btn--primary sv-btn--large">
            Start Trading Now
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </div>
      </section>

      <section className="sv-landing__features">
        <h2 className="sv-landing__section-title">Everything you need to trade smarter</h2>
        <div className="sv-landing__features-grid">
          <div className="sv-feature-card">
            <div className="sv-feature-card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <h3>Real-time Market Data</h3>
            <p>Access live pricing, charts, and market movements for NSE/BSE stocks just like a real brokerage.</p>
          </div>
          <div className="sv-feature-card">
            <div className="sv-feature-card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            </div>
            <h3>AI Portfolio Manager</h3>
            <p>Get personalized stock recommendations based on your budget using our advanced AI integration.</p>
          </div>
          <div className="sv-feature-card">
            <div className="sv-feature-card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <h3>Risk-Free Practice</h3>
            <p>Test your trading strategies with paper money before committing real capital to the market.</p>
          </div>
        </div>
      </section>
    </main>
  );
};
