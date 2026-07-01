import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { jwtDecode } from "jwt-decode";
import { useUser } from '../context/UserContext';
import './Profile.css';

export const Profile = () => {
  const [data, setData] = useState({ investment: 0, PL: 0 });
  const [displayName, setDisplayName] = useState('');
  const { fund, setFund } = useUser();
  const [fundInput, setFundInput] = useState('');

  useEffect(() => {
    const userData = async () => {
      try {
        const response = await axios.get('/userdata');
        if (response.status === 200) {
          setData({ investment: response.data.investment || 0, PL: response.data.PL || 0 });
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    }

    const userName = () => {
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
    }
    userName();
    userData();
  }, [])

  const handleFundUpdate = async (e) => {
    e.preventDefault();
    let cleanFund = parseInt(fundInput, 10);
    if (isNaN(cleanFund) || cleanFund < 0) {
      window.alert("Invalid amount. Please enter a non-negative number.");
      return;
    }
    try {
      const response = await axios.post('editfunds', { fund: cleanFund });
      if (response.status === 200) setFund(cleanFund);
      setFundInput('');
    } catch (err) {
      console.log(err);
    }
  };

  const totalPortfolioValue = Number(fund) + Number(data.investment);
  const initial = displayName ? displayName.charAt(0).toUpperCase() : '?';

  return (
    <div className="sv-profile" id="profile-page">
      {/* Profile Card */}
      <div className="sv-profile__card">
        <div className="sv-profile__avatar">{initial}</div>
        <h1 className="sv-profile__name">{displayName || 'Trader'}</h1>
        <span className="sv-profile__badge">Paper Trading Account</span>
      </div>

      {/* Stats Grid */}
      <div className="sv-profile__stats">
        <div className="sv-profile__stat">
          <span className="sv-profile__stat-label">Available Funds</span>
          <span className="sv-profile__stat-value">₹{Number(fund).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="sv-profile__stat">
          <span className="sv-profile__stat-label">Total Investment</span>
          <span className="sv-profile__stat-value">₹{Number(data.investment).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="sv-profile__stat">
          <span className="sv-profile__stat-label">Realised P/L</span>
          <span className={`sv-profile__stat-value ${data.PL >= 0 ? 'sv-profile__stat-value--profit' : 'sv-profile__stat-value--loss'}`}>
            {data.PL >= 0 ? '+' : ''}₹{Number(data.PL).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="sv-profile__stat">
          <span className="sv-profile__stat-label">Portfolio Value</span>
          <span className="sv-profile__stat-value">₹{totalPortfolioValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Fund Management */}
      <div className="sv-profile__fund-section">
        <h2>Manage Funds</h2>
        <p>Set your available trading funds to any amount</p>
        <form onSubmit={handleFundUpdate} className="sv-profile__fund-form">
          <div className="sv-profile__fund-input-wrap">
            <span className="sv-profile__fund-prefix">₹</span>
            <input
              type="number"
              value={fundInput}
              onChange={(e) => setFundInput(e.target.value)}
              placeholder="Enter amount"
              min="0"
              id="profile-fund-input"
            />
          </div>
          <button type="submit" id="profile-fund-submit">Update Funds</button>
        </form>
      </div>
    </div>
  )
}
