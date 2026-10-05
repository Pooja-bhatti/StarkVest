# StarkVest

### Virtual Stock Market Simulation Platform

**StarkVest** is a full-stack virtual stock market simulation platform designed to provide a realistic environment for practicing equity trading without financial risk.

The platform provides users with **₹100,000 in virtual capital**, live Indian stock market data, realistic Buy/Sell execution, portfolio tracking, market-hours enforcement, global market visualization, and an AI-powered financial assistant.

> **Note:** StarkVest is a simulation and educational platform. It does not execute real financial transactions or provide regulated financial advice.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Core Business Logic](#core-business-logic)
  - [Buy Order Flow](#buy-order-flow)
  - [Sell Order Flow](#sell-order-flow)
  - [Weighted Average Price](#weighted-average-price)
  - [Realized Profit and Loss](#realized-profit-and-loss)
- [Market Validation Middleware](#market-validation-middleware)
- [AI Financial Assistant](#ai-financial-assistant)
- [API Reference](#api-reference)
- [Database Design](#database-design)
- [Authentication and Security](#authentication-and-security)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Application Workflow](#application-workflow)
- [Future Enhancements](#future-enhancements)
- [Disclaimer](#disclaimer)

---

## Overview

StarkVest follows a **client-server architecture** in which the React frontend communicates with a Node.js/Express backend through RESTful APIs.

The backend is responsible for authentication, portfolio management, order validation, trade execution, P&L calculations, database operations, and AI integration.

The frontend provides an interactive trading interface for viewing market data, placing orders, monitoring portfolio performance, and interacting with the AI financial assistant.

### Core Objective

The system is designed to replicate important aspects of a real-world trading workflow:

```text
Market Data
    |
    v
Trading Interface
    |
    v
Authentication
    |
    v
Market Validation Middleware
    |
    v
Trade Execution Engine
    |
    v
MongoDB Portfolio
    |
    v
Portfolio & P&L Dashboard
```

---

# Key Features

## Real-Time Indian Market Data

- Integrates with `stock.indianapi.in` to retrieve current Indian equity market data.
- Supports market information from the **NSE/BSE ecosystem**.
- Displays current stock prices for simulated trading.
- Enables users to make trading decisions using current market information.

## Virtual Trading Engine

- Every user receives **₹100,000 virtual starting capital**.
- Supports realistic Buy and Sell operations.
- Maintains virtual cash balances independently for each user.
- Prevents users from spending more virtual capital than they possess.
- Prevents users from selling stocks they do not own.
- Maintains individual portfolio holdings and investment values.

## Portfolio Management

- Tracks individual stock holdings.
- Maintains stock quantity and average purchase price.
- Calculates portfolio investment values.
- Tracks realized profit and loss.
- Automatically updates portfolio state after successful transactions.

## Realistic Market-Hours Enforcement

StarkVest implements a dedicated Express middleware layer that mirrors important Indian equity-market restrictions.

The trading engine automatically rejects orders when:

- The market is closed.
- The request occurs on Saturday or Sunday.
- The request occurs outside `09:15 AM - 03:30 PM IST`.
- The requested trading date is an official NSE market holiday.

This ensures that the simulation follows realistic trading constraints instead of allowing unrestricted 24/7 transactions.

## Global Market Visualization

TradingView widgets provide interactive visualization for major global financial instruments, including:

- Sensex
- Nasdaq 100
- Bitcoin
- Gold
- Other supported global market instruments

This gives users broader market context beyond individual Indian equities.

## AI Financial Assistant

StarkVest integrates **Google Gemini 2.0 Flash** to provide an AI-powered financial assistant.

The assistant supports multiple workflows:

### Stock Recommendations

Users can provide a budget and request stock suggestions based on their requirements.

### Sector Insights

Users can ask for currently trending sectors and receive AI-generated insights.

### Portfolio Analysis

The assistant can analyze the user's active portfolio and provide suggestions regarding potential holdings to review, sell, or hold.

> AI-generated responses are intended for simulation and educational purposes and should not be treated as professional financial advice.

## Secure Authentication

- Auth0 handles identity management.
- The backend verifies authenticated users.
- Custom HTTP-only JWT sessions provide stateless backend authentication.
- Protected API routes require valid authentication.
- Portfolio data is associated with the authenticated user.

---

# System Architecture

```text
+---------------------------+
|       React Frontend      |
|                           |
| React 19                  |
| React Router v7           |
| Context API               |
| Tailwind CSS              |
+-------------+-------------+
              |
              | REST API
              v
+-------------+-------------+
|      Express Backend      |
|                           |
| Authentication            |
| Order Middleware          |
| Trading Engine            |
| Portfolio Logic           |
| AI Integration            |
+------+------+-------------+
       |      |
       |      +--------------------+
       |                           |
       v                           v
+------+---------+       +---------+----------+
|    MongoDB     |       | External Services  |
|                |       |                    |
| Users          |       | Indian Stock API   |
| Portfolios     |       | TradingView        |
+----------------+       | Gemini API         |
                         | Auth0              |
                         +--------------------+
```

---

# Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 19 | Component-based user interface |
| Routing | React Router v7 | Client-side navigation |
| State Management | Context API | Global application state |
| Styling | Tailwind CSS | Responsive and glassmorphic UI |
| Backend | Node.js | Server-side JavaScript runtime |
| API Framework | Express 5 | RESTful API and middleware |
| Database | MongoDB | Persistent application data |
| ODM | Mongoose | MongoDB schema and data management |
| Authentication | Auth0 | Identity management |
| Session Security | JWT | Stateless backend authentication |
| Market Data | Indian Stock API | Indian equity market data |
| Charts | TradingView Widgets | Interactive financial charts |
| AI | Google Gemini 2.0 Flash | Financial assistant |
| Development | npm / Node.js | Dependency and application management |

---

# Core Business Logic

The trade execution engine is the central component of StarkVest.

A transaction does not directly modify the portfolio. Every order passes through authentication and market validation before reaching the trading logic.

```text
Client
  |
  v
Authentication
  |
  v
Market Validation Middleware
  |
  +---- Invalid ---> Reject Order
  |
  v
Order Validation
  |
  +---- Invalid ---> Reject Order
  |
  v
Trade Execution
  |
  v
MongoDB Update
  |
  v
Updated Portfolio
```

---

## Buy Order Flow

When a user submits a Buy order, the backend performs the following operations:

### 1. Authenticate User

The backend identifies the authenticated user through the JWT session.

### 2. Validate Market Conditions

The order passes through the market validation middleware.

### 3. Validate Available Funds

The system calculates:

```text
Total Cost = Stock Price × Quantity
```

The order is rejected if:

```text
Total Cost > Available Virtual Funds
```

### 4. Deduct Virtual Funds

After successful validation:

```text
New Balance = Current Balance - Total Cost
```

### 5. Update Portfolio

If the user already owns the stock, the existing position is updated.

If the stock is not already present, a new holding is created.

### 6. Recalculate Average Purchase Price

For an existing holding:

```text
New Average Price =
    (Existing Quantity × Existing Average Price
     + New Quantity × New Purchase Price)
    /
    (Existing Quantity + New Quantity)
```

### 7. Persist Changes

The updated balance and portfolio are stored in MongoDB.

---

## Sell Order Flow

When a user submits a Sell order:

### 1. Authenticate User

The request must contain a valid authenticated session.

### 2. Validate Market Conditions

The order is checked against market hours, weekends, and NSE holidays.

### 3. Verify Ownership

The system checks whether the requested stock exists in the user's portfolio.

### 4. Verify Quantity

The requested quantity must not exceed the quantity owned.

```text
Requested Quantity <= Owned Quantity
```

Otherwise, the order is rejected.

### 5. Calculate Sale Value

```text
Sale Value = Current Stock Price × Quantity Sold
```

### 6. Calculate Realized P&L

The system compares the selling price with the average purchase price.

```text
Realized P&L =
    (Selling Price - Average Purchase Price)
    × Quantity Sold
```

### 7. Credit Virtual Funds

```text
New Balance = Current Balance + Sale Value
```

### 8. Update Portfolio

The sold quantity is removed from the holding.

If:

```text
Remaining Quantity = 0
```

the stock position is removed from the portfolio.

---

# Weighted Average Purchase Price

StarkVest uses a weighted average price when users purchase the same stock multiple times.

For example:

```text
Purchase 1:
10 shares × ₹100 = ₹1,000

Purchase 2:
20 shares × ₹120 = ₹2,400
```

The resulting average purchase price is:

```text
(1,000 + 2,400) / 30
= ₹113.33
```

This average price is then used as the cost basis for calculating realized profit or loss when shares are sold.

---

# Realized Profit and Loss

When shares are sold, StarkVest calculates realized P&L using the average purchase price.

```text
Realized P&L =
(Selling Price - Average Purchase Price) × Quantity Sold
```

### Example

```text
Average Purchase Price = ₹100
Selling Price          = ₹125
Quantity Sold          = 10

Realized P&L =
(125 - 100) × 10

= ₹250 Profit
```

For a loss:

```text
Average Purchase Price = ₹125
Selling Price          = ₹100
Quantity Sold          = 10

Realized P&L =
(100 - 125) × 10

= -₹250 Loss
```

---

# Market Validation Middleware

One of StarkVest's key architectural components is its custom Express order middleware.

The middleware acts as a gateway between API requests and the trade execution engine.

The implementation is designed to prevent trades from being executed when the real Indian equity market would normally be closed.

## Validation Pipeline

```text
Incoming Order
      |
      v
Convert Server Time to IST
      |
      v
Check Weekend
      |
      +---- Yes ---> Reject
      |
      v
Check NSE Holiday
      |
      +---- Yes ---> Reject
      |
      v
Check Market Hours
      |
      +---- Outside ---> Reject
      |
      v
Allow Order
      |
      v
Trade Execution Engine
```

## IST Conversion

The server timestamp is converted to **Indian Standard Time (IST)** before performing trading validation.

This prevents differences between server timezone and Indian market time from affecting order execution.

## Weekend Validation

Trading is blocked on:

```text
Saturday
Sunday
```

This prevents users from executing simulated equity orders during regular market weekends.

## Market Hours

Orders are permitted only during:

```text
09:15 AM - 03:30 PM IST
```

Requests outside this window are rejected by the middleware.

## NSE Holiday Validation

The middleware also cross-references an NSE holiday calendar.

If the current date is present in the configured holiday calendar, the order is rejected even if the current time falls within normal market hours.

This provides a more realistic simulation of the Indian equity market.

---

# AI Financial Assistant

StarkVest integrates **Google Gemini 2.0 Flash** as an AI financial assistant.

The AI layer provides three primary workflows.

## Budget-Based Stock Recommendations

Users can specify an investment budget and request potential stock ideas.

```text
User Budget
     |
     v
AI Request
     |
     v
Gemini API
     |
     v
Generated Recommendation
```

## Sector Analysis

Users can request information about trending or potentially relevant sectors.

## Portfolio Analysis

The backend can provide the user's active portfolio context to the AI assistant.

The assistant can then generate suggestions such as:

- Potential holdings to review
- Positions that may warrant consideration for selling
- Holdings that may be worth monitoring
- Portfolio-level observations

The AI functionality is designed as an educational and simulation feature rather than a replacement for professional financial research.

---

# API Reference

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| `POST` | `/signin` | Authenticates user and initializes portfolio | Auth0 |
| `GET` | `/userdata` | Retrieves investment and realized P&L information | JWT |
| `POST` | `/orderbuy` | Executes a virtual Buy order | JWT + Market Middleware |
| `POST` | `/ordersell` | Executes a virtual Sell order | JWT + Market Middleware |
| `GET` | `/getstocks` | Retrieves current portfolio holdings | JWT |
| `POST` | `/aisuggest` | Sends financial-analysis requests to Gemini | JWT |

## `POST /signin`

Authenticates an Auth0 user and establishes the application's backend session.

Responsibilities include:

- Verifying user identity
- Generating the backend JWT
- Initializing the user's virtual portfolio
- Assigning the initial virtual capital

Initial virtual balance:

```text
₹100,000
```

---

## `GET /userdata`

Retrieves user-level trading statistics such as:

- Net investment
- Realized profit/loss
- Portfolio-related financial information

---

## `POST /orderbuy`

Executes a virtual stock purchase.

The endpoint is protected by:

```text
Authentication
      +
Market Validation Middleware
```

The trading engine validates funds before modifying the portfolio.

---

## `POST /ordersell`

Executes a virtual stock sale.

The endpoint validates:

- Authentication
- Market status
- Stock ownership
- Available quantity

The system then calculates realized P&L and updates the virtual wallet.

---

## `GET /getstocks`

Returns the authenticated user's active portfolio holdings.

Typical information includes:

- Stock
- Quantity
- Average purchase price
- Investment information

---

## `POST /aisuggest`

Sends a user request to the Gemini AI service.

Possible requests include:

```text
Stock recommendations
Sector analysis
Portfolio analysis
```

---

# Database Design

StarkVest uses **MongoDB** with **Mongoose ODM**.

The database primarily maintains user and portfolio information.

### User

The user model stores authentication-related and account-level information.

Conceptually:

```text
User
├── Identity Information
├── Virtual Balance
├── Investment Information
└── Realized P&L
```

### Portfolio

The portfolio model maintains active trading positions.

Conceptually:

```text
Portfolio
├── User Reference
├── Stock Symbol
├── Quantity
├── Average Purchase Price
└── Investment Information
```

MongoDB provides flexible document-based storage while Mongoose provides schema definitions, validation, and structured database interaction.

---

# Authentication and Security

StarkVest uses a layered authentication architecture.

```text
User
 |
 v
Auth0
 |
 v
Backend Authentication
 |
 v
HTTP-Only JWT
 |
 v
Protected REST APIs
```

## Auth0

Auth0 is responsible for identity management and authentication.

## JWT

After authentication, the backend issues a custom JWT for stateless API authentication.

The JWT is used to identify the authenticated user when accessing protected endpoints.

## HTTP-Only Sessions

The JWT is stored using an HTTP-only mechanism to reduce exposure to client-side JavaScript and provide a stronger session-security model.

## Protected Trading APIs

Critical operations such as Buy and Sell require authentication before any portfolio or wallet modification can occur.

---

# Project Structure

A typical project organization follows the client-server architecture:

```text
StarkVest/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   └── App.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   │   └── order.js
│   ├── routes/
│   ├── services/
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── README.md
```

The exact directory structure may vary depending on the implementation.

---

# Getting Started

## Prerequisites

Ensure the following are installed:

- Node.js
- npm
- MongoDB database
- Auth0 application
- Google Gemini API key

Verify Node.js and npm:

```bash
node --version
npm --version
```

---

# Installation

## 1. Clone the Repository

```bash
git clone <your-repository-url>
cd StarkVest
```

---

## 2. Install Frontend Dependencies

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

---

## 3. Install Backend Dependencies

Open another terminal and navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

---

# Environment Variables

The backend requires environment variables for authentication, database connectivity, and AI services.

Create a `.env` file inside the backend directory:

```env
MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

AUTH0_DOMAIN=your_auth0_domain
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret

GEMINI_API_KEY=your_gemini_api_key
```

### Environment Variable Reference

| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used for signing backend JWTs |
| `AUTH0_DOMAIN` | Auth0 tenant domain |
| `AUTH0_CLIENT_ID` | Auth0 application client ID |
| `AUTH0_CLIENT_SECRET` | Auth0 application client secret |
| `GEMINI_API_KEY` | Google Gemini API authentication key |

Do not commit `.env` files or API credentials to source control.

Add the following to `.gitignore`:

```gitignore
.env
node_modules/
```

---

# Running the Application

StarkVest requires both the frontend and backend servers to be running.

## Start the Backend

From the backend directory:

```bash
node server.js
```

The Express server will start on the configured backend port.

---

## Start the Frontend

From the frontend directory:

```bash
npm start
```

The React development server will start and provide the StarkVest web interface.

---

# Application Workflow

The complete user journey can be summarized as:

```text
                    +----------------+
                    |      User      |
                    +-------+--------+
                            |
                            v
                    +---------------+
                    |    Auth0      |
                    +-------+-------+
                            |
                            v
                    +---------------+
                    |      JWT      |
                    +-------+-------+
                            |
                            v
              +-------------+-------------+
              |                           |
              v                           v
       Market Dashboard             Portfolio
              |                           |
              v                           |
       Live Stock Data                    |
              |                           |
              +-------------+-------------+
                            |
                            v
                    Buy / Sell Order
                            |
                            v
                  Authentication Check
                            |
                            v
                 Market Validation
                            |
                  +---------+---------+
                  |                   |
                Invalid              Valid
                  |                   |
                  v                   v
                Reject          Trade Engine
                                      |
                                      v
                                  MongoDB
                                      |
                                      v
                              Updated Portfolio
                                      |
                                      v
                              P&L Dashboard
```

---

# Design Principles

StarkVest is built around several engineering principles:

### Separation of Concerns

Frontend presentation, backend business logic, database operations, authentication, and external integrations are separated into appropriate application layers.

### Server-Side Validation

Critical financial operations are validated on the backend rather than relying exclusively on frontend checks.

### Stateful Portfolio, Stateless Authentication

Portfolio information is persisted in MongoDB while backend authentication uses stateless JWT-based sessions.

### Realistic Trading Constraints

The system intentionally enforces market hours, weekends, and holidays to provide a more realistic trading simulation.

### External Service Integration

Market data, global market visualization, authentication, and AI capabilities are provided through specialized external services.

---

# Future Enhancements

Potential improvements to the platform include:

- Real-time WebSocket-based market price updates
- Advanced technical indicators
- Stop-loss and target orders
- Limit orders
- Order history and transaction ledger
- Detailed portfolio performance analytics
- Historical P&L charts
- Watchlists and price alerts
- Advanced risk metrics
- Backtesting functionality
- Expanded market holiday management
- Redis-based caching for high-frequency market data
- Rate limiting and API abuse protection
- Automated portfolio performance reports
- Enhanced AI-powered market analysis
- Docker-based production deployment
- Comprehensive automated testing and CI/CD

---

# Disclaimer

StarkVest is a **virtual stock market simulation platform** created for educational and demonstration purposes.

All funds within the application are virtual. StarkVest does not execute real stock market transactions, manage real investment accounts, or guarantee financial returns.

AI-generated recommendations and market insights are provided solely for simulation and educational purposes and should not be considered professional investment or financial advice.


---

## StarkVest

**Practice. Analyze. Trade. Learn.**

A full-stack trading simulation platform combining real-time market data, realistic order execution, portfolio management, strict market validation, and AI-assisted financial analysis.
