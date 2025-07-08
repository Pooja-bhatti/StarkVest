import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

export const Navbar = () => {
  const { loginWithRedirect, logout, user, isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();

  // Minimal user display name logic
  const getDisplayName = () => {
    if (!user) return '';
    const isSocial = user["https://your-app.com/isSocial"];
    return isSocial
      ? user.name
      : user["https://your-app.com/username"] || user.nickname || user.name;
  };
  const[displayname,setdisplayname]=useState("");
  // Backend login (optional, keep if needed)
  useEffect(() => {
    const sendToBackend = async () => {
      if (isAuthenticated && user) {
        try {
          const response=await axios.post('/signin', {email: user.email,name: getDisplayName(),}, { withCredentials: true });
          setdisplayname(response.data.name);
          setfund(response.data.fund);
          console.log(displayname);
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
      // Only log out from Auth0 if backend logout succeeded
      logout({ logoutParams: { returnTo: window.location.origin } });
    } else {
      alert('Logout failed on server. Please try again.');
    }
  } catch (err) {
    alert('Logout failed on server. Please try again.');
    console.error('Backend logout failed:', err);
  }
};
const[formdata,setformdata]=useState({});
const handleChange = (e) => {
    const { name, value } = e.target;
    setformdata(prev => ({
      ...prev,
      [name]: value,
      // Clear doctor if specialization changes
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  let cleanFund = parseInt(formdata.funds, 10); // removes leading zeros automatically

  if (isNaN(cleanFund) || cleanFund < 0) {
    window.alert("Invalid amount. Please enter a non-negative number.");
    return;
  }

  try {
    const response = await axios.post('editfunds', { fund: cleanFund });

    if (response.status === 200) {
      setfund(cleanFund);
    } else {
      console.log("Something went wrong");
    }

    setformdata({ funds: 0 });
  } catch (err) {
    console.log(err);
  }
};

  // Helper for active link
  const isActive = (path) => location.pathname === path;
  const[fund,setfund]=useState(0)
  return (
    <nav className="bg-[#101010] border-b border-[#00ffcc] px-4 py-2 flex flex-wrap sm:flex-nowrap justify-between items-center shadow-md">
  {/* Logo */}
  <Link to="/" className="flex items-center gap-2 font-bold text-[#00ffcc] text-xl mb-2 sm:mb-0">
    <span className="text-2xl">💹</span>
    STARKVEST
  </Link>

  {/* Funds Section */}
  {isAuthenticated && (
    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-white mb-2 sm:mb-0">
      <span className="text-sm sm:text-base font-medium">
        💰 Current Funds: <span className="text-[#00ffcc] font-semibold">{fund}</span>
      </span>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          name="funds"
          type="number"
          value={formdata.funds}
          onChange={handleChange}
          placeholder="Edit Funds"
          className="px-2 py-1 rounded bg-[#1c1c1c] border border-[#00ffcc] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00ffcc]"
        />
        <button
          type="submit"
          className="px-3 py-1 bg-[#00ffcc] text-black font-semibold rounded hover:bg-[#00ddb3] transition"
        >
          Submit
        </button>
      </form>
    </div>
  )}

  {/* Navigation Links */}
  <div className="flex items-center gap-4">
    <Link
      to="/about"
      className={`px-2 py-1 rounded transition ${
        isActive('/about') ? 'text-[#00ffcc]' : 'text-white hover:text-[#00ffcc]'
      }`}
    >
      About
    </Link>
    <Link
      to="/contact"
      className={`px-2 py-1 rounded transition ${
        isActive('/contact') ? 'text-[#00ffcc]' : 'text-white hover:text-[#00ffcc]'
      }`}
    >
      Contact
    </Link>
    {!isAuthenticated ? (
      <button
        onClick={loginWithRedirect}
        className="ml-2 px-4 py-1 bg-[#00ffcc] text-black font-semibold rounded hover:bg-[#00ddb3] transition"
      >
        Log In
      </button>
    ) : (
      <>
        <Link to="/portfolio" className={`px-2 py-1 rounded transition ${
        isActive('/portfolio') ? 'text-[#00ffcc]' : 'text-white hover:text-[#00ffcc]'
      }`}>Portfolio</Link>
        <span className="ml-2 text-white hidden sm:inline">{displayname}</span>
        <button
          onClick={handleLogout}
          className="ml-2 px-4 py-1 bg-[#00ffcc] text-black font-semibold rounded hover:bg-[#00ddb3] transition"
        >
          Logout
        </button>
      </>
    )}
  </div>
</nav>

  );
};
