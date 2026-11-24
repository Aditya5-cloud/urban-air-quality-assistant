# Security Architecture & OWASP Defense Blueprint — Urban Air Quality Assistant

> **Standard:** Zero-Trust Defense-in-Depth  
> **Evaluation Pillar:** Pillar 2 (Security)  
> **Repository:** Urban Air Quality Assistant  

---

## 1. Zero-Trust Architecture Principles

1. **Server-Side AI Model Execution Only:**
   The Google Gemini API key (`GEMINI_API_KEY`) is stored exclusively in server environment variables. It is never bundled into client JavaScript, never exposed via client prefixes, and never committed to version control.
2. **Environment Variable Segregation:**
   - `.env` is listed in `.gitignore` to prevent secret leakage.
   - `.env.example` provides sanitized dummy template values.
3. **Zero PII Collection:**
   The application intentionally avoids collecting personal identifiers, names, phone numbers, or street addresses. Profiles only contain high-level anonymous demographic categories (`householdType`, `householdSize`, `city`).

---

## 2. Defensive Express Middleware Pipeline

Every incoming HTTP request traverses a multi-layered defensive middleware chain:

```text
[Incoming HTTP Request]
          │
          ▼
┌───────────────────────────────────────────────┐
│ 1. Helmet Security Middleware                 │
│    • Content-Security-Policy (CSP)            │
│    • Referrer-Policy: strict-origin           │
│    • X-Content-Type-Options: nosniff          │
│    • X-Frame-Options: SAMEORIGIN              │
└───────────────────────────────────────────────┘
          │
          ▼
┌───────────────────────────────────────────────┐
│ 2. Dynamic CORS Origin Allowlist              │
│    • Localhost & verified domains only        │
│    • Blocks unauthorized cross-origin calls   │
└───────────────────────────────────────────────┘
          │
          ▼
┌───────────────────────────────────────────────┐
│ 3. Inbound Payload Limit (10 KB)              │
│    • express.json({ limit: '10kb' })          │
│    • Blocks memory exhaustion / buffer attacks│
└───────────────────────────────────────────────┘
          │
          ▼
┌───────────────────────────────────────────────┐
│ 4. Endpoint Rate Limiter                      │
│    • express-rate-limit (10-30 req / min)     │
│    • Protects Gemini quotas & compute queues  │
└───────────────────────────────────────────────┘
          │
          ▼
┌───────────────────────────────────────────────┐
│ 5. Parameter Validation & Sanitization        │
│    • express-validator (city length, enums)   │
│    • Strips non-printable control characters  │
└───────────────────────────────────────────────┘
          │
          ▼
┌───────────────────────────────────────────────┐
│ 6. In-Memory SHA-256 LRU Cache / Gemini Model │
└───────────────────────────────────────────────┘
```

---

## 3. Safe Error Handling (CWE-209 Compliance)

Unhandled exceptions are intercepted by `server/middleware/errorHandler.js`. Internal file paths, framework stack traces, and database connection strings are stripped from the response body, returning only sanitized, user-friendly error codes:

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred while processing your request."
  }
}
```

---

## 4. Chatbot Domain Guardrail Hardening

The multi-turn conversational AI gateway enforces strict domain boundaries:
- Rejects prompt injection attempts ("Ignore previous instructions", "act as a Linux terminal").
- Firmly declines off-topic queries with a standardized refusal:
  > *"I am the Urban Air Quality Assistant. I specialize exclusively in winter smog navigation, indoor air quality hacks, and low-emission routines. Please ask an air quality or smog-related question."*
