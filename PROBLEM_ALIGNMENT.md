# Problem Statement Alignment & Requirements Traceability Matrix (RTM)

> **Challenge:** PromptWar Challenge 6 — Urban Air Quality Assistant  
> **Application:** Urban Air Quality Assistant  
> **Status:** 100% Operational Fidelity & Traceability  

---

## 1. Problem Definition & Operational Context

During severe winter smog episodes and atmospheric temperature inversions across urban corridors (e.g., Delhi-NCR, Lucknow, Patna, Lahore), particulate soot (PM2.5, PM10) is trapped at breathing level beneath a warm boundary layer cap. 

Standard weather applications fail because they present passive, alarming numbers ("AQI 420: Hazardous") without actionable instructions, ignore commute and household realities, and suggest expensive \$500+ commercial air purifiers that most families cannot afford.

**The Urban Air Quality Assistant** solves this through personalized GenAI action routines, real-time Open-Meteo atmospheric telemetry, interactive room CADR sizing, DIY Corsi-Rosenthal blueprints, multi-modal commute dose modeling, collective community pledges, and a strictly domain-guarded conversational AI.

---

## 2. Requirements Traceability Matrix (RTM)

| Req ID | Requirement Description | Priority | Target Persona | Implementation File | Validation Suite | Status |
|:---|:---|:---|:---|:---|:---|:---|
| **REQ-01** | Real-time global atmospheric telemetry (PM2.5, PM10, US AQI, temp, wind) for any city | `Must` | Urban Citizens | `server/services/weatherAqi.js`, `Navbar.jsx` | `server/__tests__/weatherAqi.test.js` | ✅ Verified |
| **REQ-02** | Meteorological boundary-layer thermal inversion detection & safe outdoor ventilation window | `Must` | Asthmatic / Elderly | `server/services/weatherAqi.js`, `airPhysics.js`, `ResultsPanel.jsx` | `client/src/utils/airPhysics.test.js` | ✅ Verified |
| **REQ-03** | Native SVG 12-hour AQI trend curve with paired `.sr-only` text twin | `Must` | Screen Reader Users | `client/src/components/common/AqiTrendSvg.jsx` | `ScientificComponents.test.jsx` | ✅ Verified |
| **REQ-04** | Personalized 4-Pillar clean air routines generated via Google Gemini Flash | `Must` | Vulnerable Families | `server/services/gemini.js`, `routes/recommend.js` | `server/__tests__/recommend.test.js` | ✅ Verified |
| **REQ-05** | Interactive Room CADR Calculator (ASHRAE 4 ACH) & 1st-order particle clearance decay kinetics | `Must` | Households | `client/src/utils/airPhysics.js`, `CadrCalculator.jsx` | `airPhysics.test.js`, `ScientificComponents.test.jsx` | ✅ Verified |
| **REQ-06** | Open-source DIY Corsi-Rosenthal Box specifications ($35 DIY HEPA alternative delivering 350 m³/h) | `Must` | Low-Income Families | `CadrCalculator.jsx`, `RecommendCard.jsx` | `ScientificComponents.test.jsx` | ✅ Verified |
| **REQ-07** | Multi-modal transit inhaled PM2.5 dose comparison (Metro, Bus, Car, Cycling, Walking) | `Must` | Urban Commuters | `client/src/utils/airPhysics.js`, `CommuteComparison.jsx` | `airPhysics.test.js`, `ScientificComponents.test.jsx` | ✅ Verified |
| **REQ-08** | Collective neighborhood smog mitigation pledges with live CO2 & PM2.5 offset counter | `Must` | Community Leads | `client/src/utils/airPhysics.js`, `CommunityPledges.jsx` | `airPhysics.test.js`, `ScientificComponents.test.jsx` | ✅ Verified |
| **REQ-09** | Strictly domain-guarded multi-turn conversational AI assistant (declining non-air-quality queries) | `Must` | All Stakeholders | `server/services/gemini.js`, `routes/chat.js`, `ChatWidget.jsx` | `server/__tests__/chat.test.js` | ✅ Verified |
| **REQ-10** | High-contrast WCAG 2.2 AA accessibility mode toggle & keyboard skip link | `Must` | Assistive Tech Users | `Navbar.jsx`, `index.css` | `Navbar.test.jsx`, `ScientificComponents.test.jsx` | ✅ Verified |
| **REQ-11** | In-memory SHA-256 hash-keyed LRU AI Cache (<8ms warm response latency) | `Must` | System Efficiency | `server/cache/aiCache.js`, `routes/recommend.js` | `server/__tests__/health.test.js` | ✅ Verified |
| **REQ-12** | Defense-in-depth perimeter security (Helmet CSP, 10kb body parser, rate limiting, zero PII) | `Must` | Security & Compliance | `server/middleware/security.js`, `rateLimiter.js` | `server/__tests__/security.test.js` | ✅ Verified |

---

## 3. The 4 Action Pillars & Alignment

### Pillar 1: Low-Emission Daily Routines
- Real-time thermal inversion detection warning users against morning ventilation (6:00 AM – 10:30 AM).
- Midday solar convection window identification (1:00 PM – 3:30 PM) when vertical air mixing clears surface smog.
- 12-hour hourly forecast trajectory rendered via responsive native SVG.

### Pillar 2: Indoor Air Quality Hacks (DIY & Science-Backed)
- Interactive Room CADR Calculator based on room floor area ($m^2$) and ceiling height ($m$).
- Clearance duration calculated using single-compartment mass balance first-order decay:
  $$t = \frac{-\ln(1 - \eta) \cdot V}{\text{CADR}} \times 60$$
- DIY Corsi-Rosenthal Box specifications providing 350 $m^3/\text{h}$ of CADR for under \$35.

### Pillar 3: Sustainable Practical Alternatives
- Inhaled PM2.5 dose comparison ($\mu\text{g}$) based on respiratory ventilation rates ($m^3/\text{h}$) and cabin filtration factors across 5 transit options.
- Explains why outdoor physical exertion during inversion peaks causes deep lung alveolar deposition.

### Pillar 4: Transparent Impact Assessment & Community Action
- Scientifically grounded, unexaggerated indoor exposure reduction estimates (30%–60% PM2.5 reduction).
- Collective neighborhood pledges aggregating real-time carbon (kg $CO_2$) and particulate (g $PM_{2.5}$) abatement.
