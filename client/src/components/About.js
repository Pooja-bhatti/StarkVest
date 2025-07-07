import React from 'react'
import './About.css';

export const About = () => {
  return (
    <main className="about-us-page">
      <section className="about-hero">
        <h1 className="about-hero-title">Unleash Your Trading Potential, Risk-Free.</h1>
        <p className="about-hero-intro">
          Welcome to StarkVest, your premier destination for mastering the dynamic world of stock market trading.
          Designed for both aspiring and seasoned traders, StarkVest provides a cutting-edge, risk-free simulation
          environment where knowledge meets innovation. Our mission is to democratize financial education, offering
          powerful tools and insights to help you build confidence and refine your trading strategies.
        </p>
      </section>

      <section className="about-section">
        <h2 className="section-heading">Our Vision & Mission</h2>
        <p className="section-intro">
          We envision a world where anyone, regardless of their financial background, can understand and confidently
          navigate the complexities of the stock market. Our mission is to provide an accessible, intelligent,
          and engaging platform that transforms theoretical learning into practical trading expertise.
        </p>
      </section>

      <section className="about-section">
        <h2 className="section-heading">The StarkVest Advantage: Innovation at Your Fingertips</h2>
        <div className="advantage-grid">
          <div className="advantage-item">
            <h3>Real-Time Data Simulation</h3>
            <p>Practice with live market prices and execute trades in an environment that mirrors real-world conditions.</p>
          </div>
          <div className="advantage-item">
            <h3>AI-Powered Insights</h3>
            <p>Leverage advanced artificial intelligence to identify market trends, predict movements, and discover optimal entry and exit points.</p>
          </div>
          <div className="advantage-item">
            <h3>Automated Strategies</h3>
            <p>Design, test, and deploy custom trading bots to automate your investment decisions and streamline your approach.</p>
          </div>
          <div className="advantage-item">
            <h3>Comprehensive Performance Analytics</h3>
            <p>Track your portfolio's performance with intuitive charts and detailed reports, gaining deep insights into your strengths and areas for improvement.</p>
          </div>
          <div className="advantage-item">
            <h3>Risk-Free Learning</h3>
            <p>Experiment with diverse strategies, make mistakes, and learn from them without any real financial exposure. Your ₹1,00,000 virtual funds are your playground.</p>
          </div>
          <div className="advantage-item">
            <h3>Global Market Access</h3>
            <p>Simulate trading across a wide range of international stock exchanges, expanding your understanding of global markets.</p>
          </div>
        </div>
      </section>

      <section className="about-section commitment-section">
        <h2 className="section-heading">Our Commitment to You</h2>
        <p className="section-intro">
          At StarkVest, we are committed to providing a secure, reliable, and continuously evolving platform.
          We believe in fostering a community of learners and innovators, dedicated to helping each other grow.
          Join us, and embark on a transformative journey towards becoming a confident and successful trader.
        </p>
      </section>
    </main>
  )
}
