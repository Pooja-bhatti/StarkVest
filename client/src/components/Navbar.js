import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useUser } from '../context/UserContext';
import "./Navbar.css";

const API_KEY = process.env.REACT_APP_STOCK_API_KEY;

export const Navbar = () => {
  const { loginWithRedirect, logout, user, isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();

  const [displayname, setdisplayname] = useState("");
  const { fund, setFund } = useUser();

  const [formdata, setformdata] = useState({ funds: 0, company: "" });
  const [suggestions, setSuggestions] = useState([]);
  const [companyList, setCompanyList] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  const cleanCompanyName = (name) => {
    let cleaned = name.toLowerCase();
    const patternsToRemove = [
      /\s+ltd\.?$/,
      /\s+limited$/,
      /\s+pvt\.? ltd\.?$/,
      /\s+private limited$/,
      /\s+limited liability company$/,
      /\s+llc$/,
      /\s+inc\.?$/,
      /\s+corporation$/,
      /\s+corp\.?$/,
      /\s+plc$/,
      /\s+co\.?$/,
      /\s+company$/,
    ];
    patternsToRemove.forEach((pattern) => {
      cleaned = cleaned.replace(pattern, '');
    });
    return cleaned.trim();
  };

  const getDisplayName = () => {
    if (!user) return '';
    const isSocial = user["https://your-app.com/isSocial"];
    return isSocial
      ? user.name
      : user["https://your-app.com/username"] || user.nickname || user.name;
  };

  useEffect(() => {
    const sendToBackend = async () => {
      if (isAuthenticated && user) {
        try {
          const response = await axios.post('/signin', {
            email: user.email,
            name: getDisplayName(),
          }, { withCredentials: true });
          setdisplayname(response.data.name);
          setFund(response.data.fund);
        } catch (err) {
          console.error("Signin failed", err);
        }
      }
    };
    sendToBackend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  useEffect(() => {
    const loadCompanyList = async () => {
      try {
        const res = await fetch('/companyList.json');
        const data = await res.json();
        setCompanyList(data);
      } catch (err) {
        console.error('Failed to load company list:', err);
      }
    };
    loadCompanyList();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSuggestions([]);
        setSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await axios.get('/logout', { withCredentials: true });
    } catch (err) {
      console.error('Backend logout failed or server unreachable:', err);
    } finally {
      logout({ logoutParams: { returnTo: window.location.origin } });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setformdata(prev => ({ ...prev, [name]: value }));
    if (name === "company") {
      const input = value.toLowerCase();
      const filtered = companyList.filter(c =>
        c.name.toLowerCase().startsWith(input) ||
        c.symbol.toLowerCase().startsWith(input)
      ).slice(0, 5);
      setSuggestions(filtered);
    }
  };

  const handleSuggestionClick = (name) => {
    setformdata(prev => ({ ...prev, company: name }));
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let cleanFund = parseInt(formdata.funds, 10);
    if (isNaN(cleanFund) || cleanFund < 0) {
      window.alert("Invalid amount. Please enter a non-negative number.");
      return;
    }
    try {
      const response = await axios.post('editfunds', { fund: cleanFund });
      if (response.status === 200) setFund(cleanFund);
      setformdata(prev => ({ ...prev, funds: 0 }));
    } catch (err) {
      console.log(err);
    }
  };

  const searchCompany = async (e) => {
    e.preventDefault();
    const cleanedCompany = cleanCompanyName(formdata.company);
    if (!cleanedCompany) {
      window.alert("Please enter a valid company name.");
      return;
    }
    try {
      const response = await axios.get(`https://stock.indianapi.in/stock?name=${encodeURIComponent(cleanedCompany)}`, {
        headers: { 'x-api-key': API_KEY},
        withCredentials: false
      });
      if (response.data.error) {
        window.alert(response.data.error);
      } else {
        navigate("/stock-details", { state: { stockData: response.data } });
        setSearchOpen(false);
        setformdata(prev => ({ ...prev, company: "" }));
      }
    } catch (err) {
      console.error('API error:', err);
      window.alert("Failed to fetch stock data. Please try again later.");
    }
  };

  const isActive = (path) => location.pathname === path;

  const getUserInitial = () => {
    return displayname ? displayname.charAt(0).toUpperCase() : '?';
  };

  return (
    <nav className="sv-navbar" id="main-navbar">
      <div className="sv-navbar__inner">
        {/* Logo */}
        <Link to="/" className="sv-navbar__logo" id="nav-logo">
          <svg className="sv-navbar__logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 17L9 11L13 15L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17 7H21V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>StarkVest</span>
        </Link>

        {/* Mobile hamburger */}
        <button
          className={`sv-navbar__hamburger ${mobileMenuOpen ? 'is-active' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          id="nav-hamburger"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation links */}
        <div className={`sv-navbar__center ${mobileMenuOpen ? 'is-open' : ''}`}>
          {isAuthenticated ? (
            <>
              <Link to="/" className={`sv-navbar__link ${isActive('/') ? 'is-active' : ''}`}>
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>
                Dashboard
              </Link>
              <Link to="/markets" className={`sv-navbar__link ${isActive('/markets') ? 'is-active' : ''}`}>
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg>
                Markets
              </Link>
              <Link to="/portfolio" className={`sv-navbar__link ${isActive('/portfolio') ? 'is-active' : ''}`}>
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/></svg>
                Portfolio
              </Link>
              <Link to="/ai" className={`sv-navbar__link ${isActive('/ai') ? 'is-active' : ''}`}>
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/></svg>
                AI Insights
              </Link>
              <Link to="/about" className={`sv-navbar__link ${isActive('/about') ? 'is-active' : ''} sv-navbar__link--mobile`}>About</Link>
              <Link to="/contact" className={`sv-navbar__link ${isActive('/contact') ? 'is-active' : ''} sv-navbar__link--mobile`}>Contact</Link>
            </>
          ) : (
            <>
              <Link to="/" className={`sv-navbar__link ${isActive('/') ? 'is-active' : ''}`}>Home</Link>
              <Link to="/about" className={`sv-navbar__link ${isActive('/about') ? 'is-active' : ''}`}>About</Link>
              <Link to="/markets" className={`sv-navbar__link ${isActive('/markets') ? 'is-active' : ''}`}>Markets</Link>
              <Link to="/contact" className={`sv-navbar__link ${isActive('/contact') ? 'is-active' : ''}`}>Contact</Link>
            </>
          )}
        </div>

        {/* Right section */}
        <div className={`sv-navbar__right ${mobileMenuOpen ? 'is-open' : ''}`}>
          {isAuthenticated ? (
            <>
              {/* Search */}
              <div className={`sv-navbar__search ${searchOpen ? 'is-open' : ''}`} ref={searchRef}>
                <button
                  className="sv-navbar__search-toggle"
                  onClick={() => setSearchOpen(!searchOpen)}
                  aria-label="Search stocks"
                  id="nav-search-toggle"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                  </svg>
                </button>
                {searchOpen && (
                  <form onSubmit={searchCompany} className="sv-navbar__search-form" autoComplete="off">
                    <input
                      name='company'
                      value={formdata.company}
                      type='text'
                      onChange={handleChange}
                      placeholder="Search company..."
                      autoComplete="off"
                      autoFocus
                      id="nav-search-input"
                    />
                    <button type='submit' id="nav-search-submit">
                      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                      </svg>
                    </button>
                    {suggestions.length > 0 && (
                      <ul className="sv-navbar__suggestions">
                        {suggestions.map((item, index) => (
                          <li
                            key={index}
                            onClick={() => handleSuggestionClick(item.name)}
                            tabIndex={0}
                            onKeyDown={e => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                handleSuggestionClick(item.name);
                              }
                            }}
                          >
                            <span className="sv-navbar__suggestion-name">{item.name}</span>
                            <span className="sv-navbar__suggestion-symbol">{item.symbol}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </form>
                )}
              </div>

              {/* Wallet */}
              <div className="sv-navbar__wallet" id="nav-wallet">
                <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
                </svg>
                <span>₹{Number(fund).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              {/* User menu */}
              <div className="sv-navbar__user" ref={userMenuRef}>
                <button
                  className="sv-navbar__avatar"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-label="User menu"
                  id="nav-user-menu"
                >
                  {getUserInitial()}
                </button>
                {userMenuOpen && (
                  <div className="sv-navbar__dropdown">
                    <div className="sv-navbar__dropdown-header">
                      <div className="sv-navbar__dropdown-avatar">{getUserInitial()}</div>
                      <div>
                        <div className="sv-navbar__dropdown-name">{displayname}</div>
                        <div className="sv-navbar__dropdown-balance">₹{Number(fund).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                      </div>
                    </div>
                    <div className="sv-navbar__dropdown-divider"></div>
                    <Link to="/profile" className="sv-navbar__dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/></svg>
                      Profile
                    </Link>
                    <Link to="/about" className="sv-navbar__dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
                      About
                    </Link>
                    <Link to="/contact" className="sv-navbar__dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>
                      Contact
                    </Link>
                    <div className="sv-navbar__dropdown-divider"></div>
                    <form onSubmit={handleSubmit} className="sv-navbar__dropdown-fund-form">
                      <label>Edit Funds</label>
                      <div className="sv-navbar__dropdown-fund-row">
                        <input
                          name="funds"
                          type="number"
                          value={formdata.funds}
                          onChange={handleChange}
                          placeholder='Amount'
                          id="nav-fund-input"
                        />
                        <button type="submit" id="nav-fund-submit">Update</button>
                      </div>
                    </form>
                    <div className="sv-navbar__dropdown-divider"></div>
                    <button className="sv-navbar__dropdown-item sv-navbar__dropdown-item--logout" onClick={handleLogout} id="nav-logout">
                      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/></svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button onClick={loginWithRedirect} className="sv-navbar__login-btn" id="nav-login">
              Log In
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
