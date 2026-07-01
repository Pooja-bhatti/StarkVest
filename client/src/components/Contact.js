import React, { useState } from 'react'
import './Contact.css';

export const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="sv-contact" id="contact-page">
      <header className="sv-contact__header">
        <span className="sv-contact__tag">Get in Touch</span>
        <h1 className="sv-contact__title">Contact Us</h1>
        <p className="sv-contact__subtitle">Have questions or feedback? We'd love to hear from you.</p>
      </header>

      <div className="sv-contact__body">
        {/* Contact Form */}
        <div className="sv-contact__form-card">
          <h2>Send a Message</h2>
          {submitted && (
            <div className="sv-contact__success">
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              Message sent successfully!
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="sv-contact__field">
              <label htmlFor="contact-name">Name</label>
              <input
                type="text"
                id="contact-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                required
              />
            </div>
            <div className="sv-contact__field">
              <label htmlFor="contact-email">Email</label>
              <input
                type="email"
                id="contact-email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="sv-contact__field">
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us what's on your mind..."
                rows="5"
                required
              />
            </div>
            <button type="submit" className="sv-contact__submit" id="contact-submit">
              Send Message
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
              </svg>
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="sv-contact__info">
          <div className="sv-contact__info-card">
            <div className="sv-contact__info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <h3>Email</h3>
            <p>support@starkvest.com</p>
          </div>

          <div className="sv-contact__info-card">
            <div className="sv-contact__info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <h3>Location</h3>
            <p>Mumbai, India</p>
          </div>

          <div className="sv-contact__info-card">
            <div className="sv-contact__info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <h3>Response Time</h3>
            <p>Within 24 hours</p>
          </div>
        </div>
      </div>
    </div>
  )
}
