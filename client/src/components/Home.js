// src/components/Home.js
import React from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from 'react-router-dom';
import './Home.css';

export const Home = () => {
  const { user, isAuthenticated } = useAuth0();

  const getDisplayName = () => {
    if (!user) return '';

    const isSocial = user["https://your-app.com/isSocial"];
    console.log("Is social login?", isSocial);

    return isSocial
      ? user.name
      : user["https://your-app.com/username"] || user.nickname || user.name;
  };

  return (
    <main className="Home">
      <div className="Logo">StarkVest</div> {/* Changed class to className for React best practice */}

      <section className="hero">
        {isAuthenticated ? (
          <>
            <p className="hero-welcome">Welcome back, {getDisplayName()}!</p>
            <h1>Ready to trade again?</h1>
            {/* It's good practice to use Link for internal navigation */}
            <Link to="/dashboard" className="btn">Go to Dashboard</Link>
          </>
        ) : (
          <>
            <p className="hero-welcome">Welcome to StarkVest!</p>
            <h1>Play the game, Learn the market.</h1>
            <p>
              Trade faster and smarter with real-time insights and automation.
              Start simulating trades like a pro.
            </p>
            {/* It's good practice to use Link for internal navigation */}
            <Link to="/signup" className="btn">
              Start Trading – Get ₹1,00,000 Virtual Funds
            </Link>
          </>
        )}
      </section>

      {!isAuthenticated && (
        <section className="marketing-sections">
          <div
            style={{
              padding: '4rem 2rem',
              maxWidth: '900px',
              textAlign: 'center',
              color: '#bbbbbb', // Consider moving this to CSS file
              fontSize: '1.1rem',
              lineHeight: '1.6',
            }}
          >
            <h2
              style={{
                color: '#00ffcc', // Consider moving this to CSS file
                fontSize: '2.5rem',
                marginBottom: '1.5rem',
              }}
            >
              Unlock Your Trading Potential
            </h2>
            <p>
              StarkVest offers a comprehensive platform for both aspiring and
              experienced traders. Dive into real-time market simulations, learn
              from expert resources, and refine your strategies with zero risk.
              Our cutting-edge AI insights help you make informed decisions,
              while our vibrant community supports your growth every step of the
              way.
            </p>
            <p style={{ marginTop: '1.5rem' }}> {/* Consider moving this to CSS file */}
              Join us today and transform the way you interact with the stock
              market.
            </p>
          </div>
        </section>
      )}
    </main>
  );
};
