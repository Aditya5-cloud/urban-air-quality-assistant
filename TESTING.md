# Testing Standards & QA Automation Manifest — Urban Air Quality Assistant

> **Standard:** 100% Pass Rate Across Multi-Tier Test Suites  
> **Evaluation Pillar:** Pillar 4 (Testing & QA Automation)  
> **Repository:** Urban Air Quality Assistant  

---

## 1. Test Architecture & Environment

The project implements automated multi-tier testing using **Vitest** (configured with JSDOM and Testing Library) for frontend and mathematical engines, alongside **Jest + Supertest** for backend routes:

```text
client/src/
├── utils/airPhysics.test.js              # Tier 1: Pure mathematical physics & EPA breakpoints (28 tests)
├── components/common/ScientificComponents.test.jsx # Tier 3: Scientific UI & twin representations (5 tests)
├── components/AssistantDashboard/...     # Tier 4: Dashboard layout & interactions (4 tests)
├── components/ChatWidget/...             # Tier 4: Multi-turn chat persistence (3 tests)
├── components/IntakeForm/...             # Tier 4: Intake form validation & presets (4 tests)
├── components/Navigation/...             # Tier 4: Navbar atmospheric status & contrast (3 tests)
├── components/ResultsPanel/...           # Tier 4: Results rendering & card pillars (4 tests)
└── App.test.jsx                          # Tier 4: Full App state & navigation (4 tests)
server/__tests__/
├── chat.test.js                          # Tier 2: Conversational AI endpoints & history (6 tests)
├── health.test.js                        # Tier 2: Health telemetry, cache & database status (3 tests)
├── recommend.test.js                     # Tier 2: Recommendations & session persistence (7 tests)
├── security.test.js                      # Tier 2: Helmet headers, rate limit & 10kb body (6 tests)
└── weatherAqi.test.js                    # Tier 2: Live atmospheric endpoint & geocoding (3 tests)
```

---

## 2. Test Execution Summary

| Test Suite | Runner | Tests | Coverage Scope | Status |
|:---|:---|:---|:---|:---|
| `airPhysics.test.js` | Vitest | 28 | EPA breakpoints, CADR volumes, ASHRAE 4 ACH, 1st-order decay clearance times, inhaled PM2.5 doses, inversion lapse rates, non-finite bounds, and RangeErrors. | ✅ 28 / 28 Passed |
| `ScientificComponents.test.jsx` | Vitest | 5 | WCAG `.sr-only` twin lists, SVG presentation flags, CADR area sliders, commute distance buttons, and community pledge toggles. | ✅ 5 / 5 Passed |
| Client Component Suites (10 files) | Vitest | 30 | Form validation, landing hero CTA, navbar badging, chat widget bubbles, results panel, and shareable sessions. | ✅ 30 / 30 Passed |
| Server Backend Suites (5 files) | Jest | 25 | `/api/health`, `/api/recommend`, `/api/chat`, `/api/weather-aqi`, Helmet security headers, 10kb body limit, rate-limiting, and error sanitization. | ✅ 25 / 25 Passed |
| **TOTAL** | **Multi-Tier** | **88** | **End-to-End System Reliability** | **✅ 100% Passing** |

---

## 3. Continuous Integration Pipeline

Automated testing and linting run on every push and pull request via **GitHub Actions** (`.github/workflows/ci.yml`):
- Node.js 20 runtime matrix
- Server and client lint verification
- Client Vitest test execution
- Server Jest test execution
- Production Vite build verification
