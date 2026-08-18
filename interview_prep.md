# StarkVest - Deep Dive Interview Preparation Guide

This is your comprehensive technical cheat sheet for StarkVest. Interviewers will want to know exactly **how** things work under the hood and **why** you made the engineering decisions you did. Memorize these concepts, and you will sound like a senior engineer.

---

## 1. System Architecture Overview

StarkVest is a decoupled, full-stack Single Page Application (SPA) designed to simulate real-time stock trading and portfolio management.

*   **Frontend (Client):** React.js (v19) using Hooks for local state management, React Router for navigation, and Axios for HTTP requests. Styling is handled via custom CSS modules for pixel-perfect dark mode control.
*   **Backend (Server):** Node.js with Express.js. Acts as a RESTful API layer.
*   **Database:** MongoDB managed via Mongoose ODM.
*   **External APIs:** 
    *   **TradingView Advanced Charts API** (Market Data / Visualization)
    *   **OpenRouter API / Gemini 2.5 Flash** (AI Sentiment & Analysis)
*   **Deployment:** Render (both frontend and backend), requiring strict CORS and cookie configurations for cross-origin communication.

---

## 2. Detailed Functionality Breakdown & APIs Used

### A. The Trading Engine (Logic & Math)
**How it works:**
The trading logic lives entirely in the backend to prevent client-side manipulation (e.g., a user altering their funds via browser dev tools).
*   **The Buy Route (`/orderbuy`):** 
    1. Validates the request (checks if `parsedPrice * quantity` > user's `current_funds`).
    2. Deducts the total cost from the user's funds.
    3. Checks the `Portfolio` collection. If the user already owns the stock, it calculates a **new moving average cost basis**: 
       `New Average = ((Old Average * Old Qty) + Total Cost of New Trade) / (Old Qty + New Qty)`
    4. Updates the user's total `netInvestment` metric.
*   **The Sell Route (`/ordersell`):**
    1. Validates that the user holds the stock and has sufficient quantity.
    2. Calculates `realisedProfit` by subtracting the stored `average_price` from the current sell `price`, multiplied by the quantity sold.
    3. Credits the user's `current_funds` and adds the profit/loss to their global `realisedPL` tracker. If the quantity hits zero, the stock object is popped from the array.

### B. The AI Stock Analyst (OpenRouter API)
**How it works:**
Users input a stock ticker, and the app generates a personalized BUY/HOLD/SELL recommendation.
*   **API Used:** OpenRouter API routing to Google's `gemini-2.5-flash` model.
*   **Prompt Engineering:** The backend constructs a zero-shot prompt instructing the LLM to analyze the stock based on 3 factors: Fundamentals, News Sentiment, and Technicals.
*   **Structured Output Constraint:** The prompt explicitly forces the LLM to return data in a strict 10-point JSON schema (e.g., `companyName`, `action`, `confidenceScore`, `bullCase`, `bearCase`).
*   **Parsing:** The backend strips any markdown formatting (e.g., ````json ````), parses the JSON securely, and sends it to the frontend to render the AI Dashboard.

### C. Real-Time Market Data (TradingView Widget API)
**How it works:**
Instead of polling a paid financial API (like Alpha Vantage or Polygon) which has strict rate limits, you injected the TradingView Advanced Chart script dynamically into the React DOM.
*   **Implementation:** The `TradingViewWidget.jsx` component uses a `useEffect` hook to dynamically append a `<script>` tag pointing to `s3.tradingview.com`. 
*   **Configuration:** You pass a configuration object directly into the script's `innerHTML` containing the exact symbol (e.g., `BSE:SENSEX`, `BINANCE:BTCUSDT`), theme (`dark`), and `autosize: false` (to manually control responsiveness via CSS wrappers).

### D. Authentication & Security (JWT)
**How it works:**
*   **Sign In:** User submits email/name. The backend creates/fetches the user, generates a JSON Web Token (JWT) signing their `_id` and `email` using a secret key, and attaches it to the HTTP response as a cookie.
*   **Authorization (`isloggedin` middleware):** For protected routes (like `/orderbuy`), the Express middleware checks `req.cookies.token`, decodes it using `jwt.verify()`, fetches the user from MongoDB, and attaches the user object to `req.user` for the next controller function.

---

## 3. Database Design (MongoDB / Mongoose)

You chose a **referenced, two-collection schema design** which is highly efficient for this specific use case.

1.  **User Schema:** Stores global state.
    *   `name`, `email`
    *   `current_funds` (default 100,000)
    *   `realisedPL` (Lifetime profit/loss)
    *   `netInvestment` (Total capital currently deployed)
    *   `stocks` (An ObjectId reference to a `Portfolio` document)
2.  **Portfolio Schema:** Stores asset inventory.
    *   `user` (Reference back to the User)
    *   `stocks` (An array of sub-documents containing `company`, `average_price`, `quantity`). Note: `_id: false` is used on these sub-documents to save database space since they don't need independent querying.

---

## 4. Key Engineering Decisions & Trade-Offs (The "Why")

Interviewers love asking about trade-offs. Here is exactly how you defend your architecture:

### Why HTTP-Only Cookies over LocalStorage for JWTs?
> **Your Answer:** "Storing JWTs in LocalStorage makes them accessible via JavaScript, which opens the app up to Cross-Site Scripting (XSS) attacks. If a malicious script runs on the client, it can easily steal the token. By using HTTP-Only cookies, the browser handles the token automatically, and client-side scripts cannot read it. The trade-off is that it makes CORS configuration harder—I had to explicitly set `sameSite: 'none'` and `secure: true` on the backend so Render would allow cross-origin cookie sharing with my frontend."

### Why Gemini 2.5 Flash instead of GPT-4?
> **Your Answer:** "Speed and cost. GPT-4 is an incredibly smart model, but it is slow and expensive. For a stock recommendation engine, users expect near-instant feedback. Gemini 2.5 Flash offers sub-3-second latency and is exceptionally good at adhering to strict JSON output formats, which was the most critical requirement for my frontend to render the UI without crashing."

### Why MongoDB instead of PostgreSQL?
> **Your Answer:** "For an MVP, MongoDB's flexible, document-oriented schema allowed me to iterate quickly on the Portfolio array structure without dealing with strict database migrations. However, I acknowledge the trade-off: in a real-world, production financial app, ACID compliance and strict relational integrity (like a ledger recording every single historical transaction, rather than just updating a moving average in an array) are critical. If I were to scale this, I would migrate the trading ledger to a PostgreSQL database."

### Why React Context/Hooks instead of Redux?
> **Your Answer:** "StarkVest's global state isn't overwhelmingly complex. The main things the frontend needs to track are the user's auth status and their current funds. Setting up Redux would have introduced unnecessary boilerplate (actions, reducers, store configuration). I opted for React Hooks (`useState`, `useEffect`) and lifting state up where necessary, which kept the bundle size smaller and the codebase easier to maintain."

### How do you handle JavaScript floating-point errors in trading math?
> **Your Answer:** "JavaScript represents numbers as double-precision floats, which can cause weird math errors (like `0.1 + 0.2 = 0.30000000000000004`). In my backend, I mitigate this by using `parseFloat()` combined with `.toFixed(2)` when calculating the new average cost basis and P&L. However, if this were handling real money in production, I would use a library like `Decimal.js` or store all financial values as integers (e.g., storing cents instead of dollars) to completely eliminate floating-point inaccuracies."
