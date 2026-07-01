import React from 'react'
import './About.css';

export const About = () => {
  return (
    <main className="sv-about" id="about-page">
      <section className="sv-about__hero">
        <span className="sv-about__tag">About StarkVest</span>
        <h1 className="sv-about__hero-title">Unleash Your Trading Potential, Risk-Free.</h1>
        <p className="sv-about__hero-intro">
          Welcome to StarkVest, your premier destination for mastering the dynamic world of stock market trading.
          Designed for both aspiring and seasoned traders, StarkVest provides a cutting-edge, risk-free simulation
          environment where knowledge meets innovation.
        </p>
      </section>

      <section className="sv-about__section">
        <h2 className="sv-about__section-heading">Our Vision & Mission</h2>
        <p className="sv-about__section-text">
          We envision a world where anyone, regardless of their financial background, can understand and confidently
          navigate the complexities of the stock market. Our mission is to provide an accessible, intelligent,
          and engaging platform that transforms theoretical learning into practical trading expertise.
        </p>
      </section>

      <section className="sv-about__section">
        <h2 className="sv-about__section-heading">The StarkVest Advantage</h2>
        <div className="sv-about__grid">
          <div className="sv-about__card">
            <div className="sv-about__card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <h3>Real-Time Data</h3>
            <p>Practice with live market prices and execute trades in an environment that mirrors real-world conditions.</p>
          </div>
          <div className="sv-about__card">
            <div className="sv-about__card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <h3>AI-Powered Insights</h3>
            <p>Leverage advanced AI to identify market trends, predict movements, and discover optimal entry and exit points.</p>
          </div>
          <div className="sv-about__card">
            <div className="sv-about__card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
            <h3>Automated Strategies</h3>
            <p>Design, test, and deploy custom trading bots to automate your investment decisions and streamline your approach.</p>
          </div>
          <div className="sv-about__card">
            <div className="sv-about__card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            </div>
            <h3>Performance Analytics</h3>
            <p>Track your portfolio's performance with detailed reports, gaining deep insights into your strengths and areas for improvement.</p>
          </div>
          <div className="sv-about__card">
            <div className="sv-about__card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3>Risk-Free Learning</h3>
            <p>Experiment with diverse strategies and learn from mistakes without any real financial exposure. Your ₹1,00,000 virtual funds are your playground.</p>
          </div>
          <div className="sv-about__card">
            <div className="sv-about__card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </div>
            <h3>Global Market Access</h3>
            <p>Simulate trading across a wide range of international stock exchanges, expanding your understanding of global markets.</p>
          </div>
        </div>
      </section>

      <section className="sv-about__section sv-about__commitment">
        <h2 className="sv-about__section-heading">Our Commitment</h2>
        <p className="sv-about__section-text">
          At StarkVest, we are committed to providing a secure, reliable, and continuously evolving platform.
          We believe in fostering a community of learners and innovators, dedicated to helping each other grow.
          Join us, and embark on a transformative journey towards becoming a confident and successful trader.
        </p>
      </section>
    </main>
  )
}
