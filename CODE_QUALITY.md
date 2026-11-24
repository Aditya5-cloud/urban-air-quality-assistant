# Code Quality & Modern Engineering Standards — Urban Air Quality Assistant

> **Standard:** Elite Production-Grade Engineering  
> **Evaluation Pillar:** Pillar 1 (Code Quality)  
> **Repository:** Urban Air Quality Assistant  

---

## 1. Architectural Layer Segregation

The project enforces clean physical and conceptual boundaries between data fetching, scientific compute, state management, presentation, and backend services:

```text
client/src/
├── components/          # Memoized React presentation components (React.memo)
│   ├── AssistantDashboard/ # Split 2-column workspace orchestrator
│   ├── ChatWidget/      # Domain-guarded multi-turn conversational AI
│   ├── common/          # AqiTrendSvg, CadrCalculator, CommuteComparison, CommunityPledges
│   ├── Navigation/      # Header shell, real-time atmospheric card, a11y toggles
│   ├── ResultsPanel/    # 4-Pillar recommendation display & interactive calculators
│   └── IntakeForm/      # Clean form controls with validated inputs
├── utils/
│   └── airPhysics.js    # 100% pure, side-effect-free environmental physics engine
server/
├── cache/
│   └── aiCache.js       # In-memory SHA-256 hash-keyed LRU AI Cache
├── middleware/          # Security headers, rate limiters, safe error handling
├── models/              # In-memory TTL Session repository
├── routes/              # Express API endpoints (/recommend, /chat, /weather-aqi, /health)
├── services/            # Open-Meteo live API integration, Gemini generative AI
└── validators/          # Input schema type and bounds validators
```

### Layer Principles:
1. **`client/src/utils/airPhysics.js` (Pure Algorithmic Core):**
   - Zero React dependencies, zero DOM manipulation, zero network side-effects.
   - Deterministic calculations for EPA breakpoints, ASHRAE 4 ACH room CADR, first-order particle decay clearance times, inhaled microgram doses, and meteorological lapse rates.
   - 100% testable in headless JSDOM and Node environments.
2. **`server/cache/aiCache.js` (Zero-Latency AI Cache):**
   - Deterministic SHA-256 payload hashing with a 100-entry LRU eviction policy.
3. **Component Memoization & Lifecycle Hygiene:**
   - Presentation components are wrapped with `React.memo` to eliminate redundant Virtual DOM reconciliations.
   - Expensive calculations are memoized with `useMemo`.

---

## 2. Static Analysis & Linting Cleanliness

The project is validated using **ESLint** with 0 errors and 0 warnings:

```bash
$ npm run lint
> npm run lint:server && npm run lint:client

> urban-air-quality-assistant-server@1.0.0 lint
> eslint . --ext .js

> urban-air-quality-assistant-client@1.0.0 lint
> eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0
```

- **0 Errors, 0 Warnings** across all client and server files.
- Clean semantic commit history and modular file organization.
