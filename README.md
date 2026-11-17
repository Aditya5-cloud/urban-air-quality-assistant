# Urban Air Quality Assistant

> GenAI-powered assistant helping families and communities navigate severe winter smog and urban air pollution with personalized low-emission routines, indoor air quality hacks, and sustainable alternatives.

Built for **PromptWar Virtual Challenge 6: Urban Air Quality Assistant**.

---

## 🍃 Overview

Severe winter smog in dense metropolitan areas traps pollutants close to the ground, triggering respiratory illness and hazardous living conditions. Most generic weather apps provide static AQI numbers without actionable, lifestyle-tailored guidance.

The **Urban Air Quality Assistant** solves this through a personalized Generative AI pipeline:
1. **Low-Emission Daily Routines**: Tailored transport, ventilation, and timing choices based on household composition and commute patterns.
2. **Indoor Air Quality Hacks**: High-impact, low-cost steps to improve indoor air (cooking ventilation, sealing, natural filtration).
3. **Sustainable Alternatives**: Practical lifestyle substitutions tailored to the user's specific context.
4. **Transparent Impact Explanation**: Every recommendation explicitly explains the direct environmental and health rationale behind it.
5. **Interactive Follow-up Chat**: Refine and adapt routines conversational multi-turn AI advice.
6. **Session Continuity**: Anonymous MongoDB-backed shareable sessions with 7-day auto-expiration (privacy by design).

---

## 🏗️ Architecture (MERN Stack)

- **M (MongoDB)**: Anonymous session store keyed by UUID with automatic 7-day TTL index for zero PII retention.
- **E (Express.js)**: REST API, input validation via `express-validator`, security headers via `helmet`, rate limiting via `express-rate-limit`, and Gemini AI service integration.
- **R (React.js)**: Modern responsive Single Page Application with full WCAG AA accessibility, keyboard navigation, and live screen-reader regions.
- **N (Node.js)**: High-performance runtime across server and build pipeline.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js >= 18 (Tested on Node.js v24)
- npm >= 9
- MongoDB (local or Atlas connection string)
- Google Gemini API Key ([Get one free from Google AI Studio](https://aistudio.google.com))

### 2. Configuration
Copy `.env.example` to `.env` and supply your Gemini API key:
```bash
cp .env.example .env
```

### 3. Installation & Run
```bash
# Server
cd server
npm install
npm run dev

# Client (in a separate terminal)
cd ../client
npm install
npm run dev
```

The application client runs at `http://localhost:3000` with automated proxying to the API server at `http://localhost:5000`.

---

## 🧪 Testing

```bash
# Run backend tests
npm run test:server

# Run frontend tests
npm run test:client
```

---

## 🔒 Security & Accessibility Highlights
- **Zero Client-Side Secrets**: All Gemini AI calls are strictly brokered through the backend.
- **Strict Input Validation**: Express-validator strips script injections, bounds inputs, and enforces strict schema types.
- **Rate Limiting**: Protects against model exhaustion and DDoS.
- **WCAG AA Compliance**: High-contrast ratios, visible focus indicators, screen-reader live regions, and semantic HTML5 hierarchy.
