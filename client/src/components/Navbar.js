import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

export const Navbar = () => {
  const {
    loginWithRedirect,
    logout,
    user,
    isAuthenticated,
    isLoading,
  } = useAuth0();

  const navigate = useNavigate();

  const getDisplayName = () => {
    if (!user) return '';
    const isSocial = user["https://your-app.com/isSocial"];
    return isSocial
      ? user.name
      : user["https://your-app.com/username"] || user.nickname || user.name;
  };

  // ⬇️ Handle login request to your backend after Auth0 authentication
  useEffect(() => {
    const sendToBackend = async () => {
      if (isAuthenticated && user) {
        try {
          const name = getDisplayName();
          const response = await axios.post('/signin', {
  email: user.email,
  name: name,
}, {
  withCredentials: true // ✅ This sends cookies like 'token'
});
          console.log(response.status)
          if (response.status !== 200) {
            logout({ logoutParams: { returnTo: window.location.origin } });
            navigate('/');
          }
        } catch (err) {
          console.error("Signin failed", err);
        }
      }
    };

    sendToBackend();
  }, [isAuthenticated, user]); // ⬅️ Runs when Auth0 login is complete

  const logou = async () => {
    try {
      const response = await axios.get('/logout');
      if (response.status === 200) {
        logout({ logoutParams: { returnTo: window.location.origin } });
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const login = async () => {
    loginWithRedirect(); // ⬅️ Just trigger redirect, rest handled in useEffect
  };

  return (
    <div>
      <Link to="/">Logo Here</Link>
      <Link to="/about">About</Link>
      <Link to="/contact">Contact</Link>
      {!user ? (
        <button onClick={login}>Log In/SignUp</button>
      ) : (
        <button onClick={logou}>Logout</button>
      )}
    </div>
  );
};
