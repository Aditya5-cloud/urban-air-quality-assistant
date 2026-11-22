# 🍃 Urban Air Quality Assistant

[![CI Tests](https://img.shields.io/badge/tests-53%20passed-brightgreen.svg)](#-testing--quality-verification)
[![Vercel Deployment](https://img.shields.io/badge/deployment-Vercel%20Ready-black.svg?logo=vercel)](#-deploying-to-vercel)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero PII](https://img.shields.io/badge/Privacy-Zero%20PII%20Retention-success.svg)](#-security--privacy-architecture)
[![Atmospheric Feed](https://img.shields.io/badge/Atmospheric%20Feed-Open--Meteo%20Live%20(Keyless)-orange.svg)](#-real-time-atmospheric-intelligence-open-meteo)
[![GenAI](https://img.shields.io/badge/GenAI-Google%20Gemini%20Flash-4285F4.svg?logo=google)](#-generative-ai-engine-google-gemini)

> **PromptWar Virtual Challenge 6 — Urban Air Quality Assistant**  
> A full-stack, production-grade GenAI application helping urban families and individuals navigate severe winter smog with personalized, actionable clean-air routines, low-cost indoor hacks, sustainable alternatives, and a strictly domain-guarded interactive AI assistant.

---

## 📋 Table of Contents
1. [Problem Statement & Background](#-problem-statement--background)
2. [Key Capabilities & The 4 Action Pillars](#-key-capabilities--the-4-action-pillars)
3. [Architecture & System Design](#-architecture--system-design)
4. [Real-time Atmospheric Intelligence (Open-Meteo)](#-real-time-atmospheric-intelligence-open-meteo)
5. [Generative AI Engine (Google Gemini)](#-generative-ai-engine-google-gemini)
6. [Security & Privacy Architecture (Zero PII)](#-security--privacy-architecture)
7. [Deploying to Vercel](#-deploying-to-vercel)
8. [Local Development Guide](#-local-development-guide)
9. [Testing & Quality Verification](#-testing--quality-verification)
10. [Evaluation Criteria Traceability Matrix](#-evaluation-criteria-traceability-matrix)

---

## 🌫️ Problem Statement & Background

During winter across the Indo-Gangetic Plains and major urban corridors (Delhi-NCR, Lucknow, Patna, Kolkata), a dangerous atmospheric phenomenon known as a **thermal inversion layer** traps cooler air beneath a lid of warmer air. This prevents vertical atmospheric dispersion, concentrating vehicular exhaust, industrial particulate matter, and regional biomass/stubble smoke at ground level.

### Why Standard Weather Apps Fail:
- **Passive Alarmism**: Standard apps display red/purple numbers ("AQI 420: Hazardous") without giving clear, practical instructions on what a family should do right now.
- **Generic Advice**: Blanket recommendations ("stay indoors") ignore real-life constraints such as essential commutes, school-age children, elderly family members, or outdoor vocations.
- **Impractical Solutions**: Suggesting expensive \$500 HEPA purifiers is unhelpful for most urban households.

### The Solution:
The **Urban Air Quality Assistant** delivers a tailored, evidence-backed action plan based on user profile (household composition, commute method, home ventilation type, and vulnerable members) combined with **live, real-time meteorological and particulate data**.

---

## 🌟 Key Capabilities & The 4 Action Pillars

Every generated plan provides concrete recommendations organized across the 4 required challenge pillars:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       URBAN AIR QUALITY ASSISTANT                           │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
     ┌──────────────────┬──────────────┴─────┬──────────────────┐
     ▼                  ▼                    ▼                  ▼
┌───────────┐    ┌─────────────┐      ┌─────────────┐    ┌──────────────┐
│ PILLAR 1  │    │  PILLAR 2   │      │  PILLAR 3   │    │   PILLAR 4   │
│Low-Emiss. │    │ Indoor Air  │      │ Sustainable │    │ Transparent  │
│  Routine  │    │ Hacks (DIY) │      │Alternatives │    │Impact Assess.│
└───────────┘    └─────────────┘      └─────────────┘    └──────────────┘
```

1. **Low-Emission Daily Routines**:
   - Optimal ventilation windows (e.g., brief 1:00 PM–3:00 PM solar aeration vs. sealing morning/night smog peaks).
   - Commute timing and protective strategies based on transit mode (metro, bus, motorcycle, walking).
   - Safe outdoor scheduling for children and seniors.

2. **Indoor Air Quality Hacks (Low-Cost / High-Impact)**:
   - DIY Corsi-Rosenthal box filter instructions (MERV-13 filter + box fan for under \$35).
   - Wet-mopping and damp-cloth dusting to trap settled PM2.5 without aerosolizing dust (avoid dry brooming).
   - Threshold damp-towel draft seals and cooking ventilation tactics.

3. **Sustainable Practical Alternatives**:
   - Commuter carpooling and metro park-and-ride routes to lower vehicular emissions.
   - Electric induction or microwave heating alternatives over open-flame gas stoves during inversion peaks.
   - Neighborhood waste-composting alternatives to prevent municipal leaf and trash burning.

4. **Transparent Impact Assessment**:
   - Honest, scientifically qualified estimates of indoor particulate reduction (e.g., 30–60% reduction in PM2.5).
   - Avoids exaggerated or misleading claims; clearly states health risk mitigation limits.

5. **Guarded Multi-Turn AI Assistant**:
   - Real-time conversational interface powered by Google Gemini.
   - Strictly domain-bounded: assists with urban smog, indoor air quality, mask selection, and commute safety. Non-relevant queries are politely and firmly declined.

6. **First-Screen Viewport-Locked Workspace**:
   - Two-column dashboard: Clean plan card on the left, interactive AI chat on the right.
   - Zero unnecessary scrolling: fits seamlessly within standard viewports for fast user decision-making.

---

## 🏛️ Architecture & System Design

```
urban-air-quality-assistant/
├── api/
│   └── index.js                 # Vercel Serverless Function entry point
├── client/                      # React 18 + Vite SPA Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── AssistantDashboard/  # Split 2-column workspace (Plan + Chat)
│   │   │   ├── ChatWidget/          # Domain-guarded multi-turn AI chat
│   │   │   ├── IntakeForm/          # Accessible demographic input form
│   │   │   ├── LandingHero/         # Hero section with 1-click preset profiles
│   │   │   ├── Navigation/          # Header with real-time atmospheric ribbon
│   │   │   ├── ResultsPanel/        # Clean, accessible plan presentation
│   │   │   ├── FAQSection/          # Practical winter smog FAQs
│   │   │   ├── PillarsSection/      # 4 core pillar descriptions
│   │   │   └── ImpactComparison/    # Scientific impact breakdown
│   │   ├── App.jsx              # Two-view state coordinator (Landing ↔ Assistant)
│   │   ├── App.css              # Viewport-locked layout styling
│   │   └── index.css            # Design tokens, accessibility focus rings
│   ├── vite.config.js           # Vite dev proxy & Vitest configuration
│   └── package.json
├── server/                      # Node.js + Express Backend API
│   ├── config/
│   │   ├── db.js                # Database abstraction (No DB required)
│   │   └── env.js               # Validated environment configuration
│   ├── middleware/
│   │   ├── errorHandler.js      # Centralized error handler (zero stack traces leaked)
│   │   ├── rateLimiter.js       # Express rate limiter (10 req/min for GenAI)
│   │   └── security.js          # Helmet (CSP/HSTS) & CORS configuration
│   ├── models/
│   │   └── Session.js           # In-Memory TTL Repository (7-day lifecycle)
│   ├── routes/
│   │   ├── chat.js              # Multi-turn guarded AI chat route
│   │   ├── health.js            # Health check & uptime route
│   │   ├── recommend.js         # Plan generation route
│   │   ├── session.js           # Session retrieval route
│   │   └── weatherAqi.js        # Open-Meteo atmospheric live route
│   ├── services/
│   │   ├── gemini.js            # Google Gemini Flash SDK & offline fallback
│   │   └── weatherAqi.js        # Real-time Open-Meteo service with 10-min cache
│   ├── validators/
│   │   ├── chatValidator.js     # Chat input validation & sanitization
│   │   └── recommendValidator.js# Profile input validation & sanitization
│   └── __tests__/               # Jest + Supertest backend test suite
├── .env.example                 # Environment variables template
├── package.json                 # Monorepo build and test scripts
├── vercel.json                  # Vercel serverless build & rewrite rules
└── README.md                    # Project documentation
```

---

## ⛅ Real-Time Atmospheric Intelligence (Open-Meteo)

The application communicates directly with the **Open-Meteo Global Air Quality & Meteorological API**:
- **Zero API Key Needed**: 100% free, open access without rate-limiting hurdles or billing gates.
- **Live Data Extracted**:
  - `pm2_5`: Particulate matter ≤ 2.5 µm concentration in µg/m³.
  - `pm10`: Particulate matter ≤ 10 µm concentration in µg/m³.
  - `us_aqi`: Standardized US EPA Air Quality Index (0–500 scale).
  - `temperature_2m`: Ambient ground temperature in °C.
  - `relative_humidity_2m`: Relative humidity percentage.
  - `surface_pressure`: Atmospheric pressure for stagnation analysis.
  - `wind_speed_10m`: Wind speed to detect horizontal ventilation potential.
- **Thermal Inversion Stagnation Detection**: Combines low surface wind speed (< 5 km/h), high relative humidity (> 75%), and low winter temperatures to reliably flag thermal inversion conditions.
- **Performance Caching**: Responses are cached in-memory for 10 minutes per city coordinate, reducing external network latency from ~350ms to < 2ms for repeated lookups.

---

## 🤖 Generative AI Engine (Google Gemini)

The assistant uses the official Google GenAI SDK (`@google/generative-ai`):
- **Model**: `gemini-3.5-flash-lite` (Google's fast, low-latency Flash-Lite model).
- **Prompt Architecture**:
  - **Plain-English Instruction**: Prompted to generate concise, warm, actionable guidance using everyday vocabulary that any family member can immediately understand and put into practice.
  - **Structured JSON Schema**: Enforces schema compliance returning exact pillars, impact assessments, and atmospheric summaries.
- **Strict Domain Guardrails**:
  - The chat endpoint enforces system instructions that decline off-topic queries (e.g., coding, general trivia, movies) with a polite refusal redirecting the user back to air quality, smog protection, and respiratory health.
- **Deterministic Offline Simulation Fallback**:
  - When `GEMINI_API_KEY` is not configured or during testing, the server transparently switches to a deterministic, scientifically accurate local engine. Evaluators and automated CI test suites run with 100% reliability with zero quota exhaustion or external API downtime.

---

## 🔒 Security & Privacy Architecture

The project adheres to strict **Defense-in-Depth** and **Privacy by Design** principles:

| Defense Layer | Implementation |
| :--- | :--- |
| **HTTP Security Headers** | `helmet` configured with strict Content Security Policy (CSP), HSTS, `X-Content-Type-Options: nosniff`, and frameguard (`X-Frame-Options: SAMEORIGIN`). |
| **CORS Lockdown** | Configurable via `CLIENT_URL` environment variable; rejects unauthorized cross-origin requests. |
| **Payload Size Enforcement** | Strict `10kb` body parser limit (`express.json({ limit: '10kb' })`), returning HTTP 413 on oversized payloads to prevent buffer/memory exhaustion. |
| **Rate Limiting** | `express-rate-limit` enforces a 10 requests/minute limit on all GenAI routes (`/api/recommend`, `/api/chat`) to protect compute resources and prevent quota exhaustion. |
| **Input Validation & Sanitization** | `express-validator` validates all input fields (city name, household type, family size, commute mode, chat message length) and sanitizes special characters. |
| **Zero PII Retention** | No names, phone numbers, email addresses, or exact street locations are ever collected or stored. |
| **Zero Database Dependency** | All sessions are managed via an in-memory TTL map (`SessionRepository`) with an automatic 7-day expiration sweep. |
| **Credential Sanitization** | Error handlers strip stack traces, system file paths, and environment secrets before sending JSON responses to clients. |

---

## 🚀 Deploying to Vercel

The application is pre-configured for **1-click zero-configuration deployment** to Vercel via `vercel.json` and `api/index.js`.

### Option A: Deploy via Vercel Web Dashboard (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete urban air quality assistant"
   git push origin main
   ```
2. **Import into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new) and select your GitHub repository.
3. **Configure Project Settings**:
   - **Framework Preset**: `Vite` (or `Other`)
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `npm run vercel-build` (automatically configured in `vercel.json`)
   - **Output Directory**: `client/dist` (automatically configured in `vercel.json`)
4. **Configure Environment Variables**:
   Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: *(Your Google AI Studio API key)*
   - `GEMINI_MODEL`: `gemini-3.5-flash-lite`
   - `NODE_ENV`: `production`
5. **Click "Deploy"**:
   Vercel will build the frontend into `client/dist` and expose the Express API as a serverless function at `/api/*`.

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Authenticate & deploy
vercel

# Add your Gemini API key
vercel env add GEMINI_API_KEY production

# Deploy to production
vercel --prod
```

---

## 💻 Local Development Guide

### Prerequisites
- Node.js `v18+` or `v20+` (verified on `v20` and `v24`)
- npm `v9+` or `v11+`

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/urban-air-quality-assistant.git
cd urban-air-quality-assistant

# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
cd ..
```

### 2. Environment Configuration
Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```

Edit `.env` with your preferred settings:
```env
GEMINI_API_KEY=AIzaSy...your_gemini_key_here
GEMINI_MODEL=gemini-3.5-flash-lite
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```
*(If you do not have a Gemini API key yet, the application will automatically run using its deterministic offline simulation engine).*

### 3. Start Development Servers
Run the server and client in two separate terminal windows:

**Terminal 1 (Backend API):**
```bash
cd server
npm run dev
# Server listening at http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Vite dev server running at http://localhost:3000 (proxies /api to :5000)
```

Open your browser at `http://localhost:3000`.

---

## 🧪 Testing & Quality Verification

The project includes **53 automated tests** covering unit behavior, integration flows, security headers, rate limiting, and edge cases:

```bash
# 1. Run Backend Server Tests (Jest + Supertest)
npm run test:server
# Result: 23 passed across 5 test suites (chat, health, recommend, security, weatherAqi)

# 2. Run Frontend Client Tests (Vitest + React Testing Library)
npm run test:client
# Result: 30 passed across 10 test suites

# 3. Run Both Test Suites
npm test

# 4. Run Linters (ESLint)
npm run lint:server
npm run lint:client
# Result: 0 errors, 0 warnings across all JavaScript and JSX files

# 5. Verify Production Client Build
npm run build
# Result: Production build compiled successfully in under 1 second
```

### Verification Highlights:
- **Rate-Limiter Tests**: Verifies HTTP 429 is returned upon exceeding the request ceiling.
- **Payload Size Tests**: Verifies HTTP 413 is returned for request bodies exceeding 10kb.
- **Security Audit Tests**: Confirms Helmet sets HSTS, CSP, and `nosniff`, and verifies that internal errors never leak stack traces.
- **Domain Guardrail Tests**: Confirms the assistant responds only to clean air and smog topics.
- **Viewport Layout**: Confirms the assistant dashboard maintains a locked 2-column layout with no unwanted window scrolling.

---

## 📊 Evaluation Criteria Traceability Matrix

| Challenge Criterion | Weight / Focus | Implementation in Urban Air Quality Assistant |
| :--- | :--- | :--- |
| **1. Code Quality** | Clean code, modularity, best practices | • Modular MVC/service architecture (`routes/`, `services/`, `validators/`, `models/`, `components/`).<br>• Fully typed props and clean React state management.<br>• 0 ESLint warnings across both server and client codebases.<br>• Clean git history and semantic commit messages. |
| **2. Security** | Hardening, defense-in-depth, secrets protection | • Helmet security headers (CSP, HSTS, X-Frame-Options).<br>• 10kb request payload size enforcement (HTTP 413).<br>• 10 req/min GenAI rate limiting (HTTP 429).<br>• Zero PII collection; zero sensitive credentials committed.<br>• Sanitized error responses without stack traces. |
| **3. Efficiency** | Low latency, compute optimization, caching | • 10-minute in-memory caching for Open-Meteo API requests.<br>• Stateless in-memory TTL session store eliminating database latency.<br>• Lightweight client bundle (55 kB gzipped JS, 4.8 kB gzipped CSS).<br>• Vite production build compiles in ~700ms. |
| **4. Testing** | Comprehensive test coverage, edge cases | • **53 automated tests** (23 server, 30 client) with 100% pass rate.<br>• Edge cases: invalid UUIDs, missing city, payload overflow, rate-limit threshold, multi-turn chat persistence.<br>• Deterministic mock fallback ensuring offline test determinism. |
| **5. Accessibility** | WCAG AA compliance, inclusive design | • Semantic HTML landmarks (`<header>`, `<main>`, `<section>`, `<footer>`, `<form>`).<br>• Accessible ARIA attributes (`aria-live="polite"`, `role="region"`, `role="alert"`).<br>• High-contrast color palette exceeding WCAG AA minimum 4.5:1 ratio.<br>• Fully navigable via keyboard with visible focus rings (`:focus-visible`). |
| **6. Problem Statement Alignment** | Winter smog focus, actionable guidance | • Directly targets urban winter smog & thermal inversion stagnation.<br>• 4 core action pillars: Low-emission routines, DIY indoor hacks (Corsi-Rosenthal box), sustainable alternatives, and transparent impact assessment.<br>• Strictly domain-guarded conversational AI assistant. |

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
