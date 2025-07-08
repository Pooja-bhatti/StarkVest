import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import "./Navbar.css"
export const Navbar = () => {
  const { loginWithRedirect, logout, user, isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();

  const [displayname, setdisplayname] = useState("");
  const [fund, setfund] = useState(0);
  const [formdata, setformdata] = useState({});

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
          setfund(response.data.fund);
        } catch (err) {
          console.error("Signin failed", err);
        }
      }
    };
    sendToBackend();
  }, [isAuthenticated, user]);

  const handleLogout = async () => {
    try {
      const response = await axios.get('/logout', { withCredentials: true });
      if (response.status === 200) {
        logout({ logoutParams: { returnTo: window.location.origin } });
      } else {
        alert('Logout failed on server. Please try again.');
      }
    } catch (err) {
      alert('Logout failed on server. Please try again.');
      console.error('Backend logout failed:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setformdata(prev => ({ ...prev, [name]: value }));
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
      if (response.status === 200) setfund(cleanFund);
      setformdata({ funds: 0 });
    } catch (err) {
      console.log(err);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="navbar-container">
      <Link to="/" className="navbar-logo">💹 STARKVEST</Link>


      <div className="nav-links">
        <Link to="/about" className={isActive('/about') ? 'active' : ''}>About</Link>
        <Link to="/contact" className={isActive('/contact') ? 'active' : ''}>Contact</Link>
        {isAuthenticated && (
          <Link to="/portfolio" className={isActive('/portfolio') ? 'active' : ''}>Portfolio</Link>
        )}
      </div>

      <div className="nav-auth">
        {isAuthenticated ? (
          <>
            <span className="username">👤 {displayname}</span>
            <span className="funds">💰 ₹{fund}</span>
            <form onSubmit={handleSubmit} className="fund-edit-form">
              <input
                name="funds"
                type="number"
                value={formdata.funds}
                onChange={handleChange}
                placeholder='Edit Funds'
              />
              <button type="submit">Edit Funds</button>
            </form>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <button onClick={loginWithRedirect}>Log In</button>
        )}
      </div>
    </div>
  );
};
