const request = require('supertest');
const app = require('../app');

describe('Security Hardening Suite', () => {
  describe('HTTP Security Headers (Helmet)', () => {
    it('sets essential defense-in-depth security headers', async () => {
      const res = await request(app).get('/api/health');

      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
      expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(res.headers['strict-transport-security']).toContain('max-age=31536000');
      expect(res.headers).toHaveProperty('content-security-policy');
      expect(res.headers['content-security-policy']).toContain("default-src 'self'");
    });
  });

  describe('Payload Size Enforcer (10kb Limit)', () => {
    it('rejects oversized JSON bodies with HTTP 413 Payload Too Large', async () => {
      // Create a payload exceeding 10kb (approx 12kb of padding)
      const oversizedPayload = {
        city: 'New Delhi',
        householdType: 'family',
        householdSize: 4,
        commute: 'car',
        healthConcern: false,
        seasonContext: 'winter_smog',
        notes: 'A'.repeat(12 * 1024),
      };

      const res = await request(app)
        .post('/api/recommend')
        .send(oversizedPayload);

      expect(res.statusCode).toBe(413);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('PAYLOAD_TOO_LARGE');
    });
  });

  describe('AI Rate Limiting Protection (HTTP 429)', () => {
    it('limits excessive calls to GenAI endpoints to protect quota and compute', async () => {
      const payload = {
        city: 'Delhi',
        householdType: 'family',
        householdSize: 4,
        commute: 'car',
        healthConcern: false,
        seasonContext: 'winter_smog',
        notes: 'Testing rate limiter',
      };

      // Trigger requests with x-test-rate-limit header to activate rate limiter in test mode
      const responses = [];
      for (let i = 0; i < 11; i++) {
        const res = await request(app)
          .post('/api/recommend')
          .set('x-test-rate-limit', 'true')
          .send(payload);
        responses.push(res);
      }

      // The 11th request must be rate limited to HTTP 429
      const rateLimitedResponse = responses[responses.length - 1];
      expect(rateLimitedResponse.statusCode).toBe(429);
      expect(rateLimitedResponse.body.success).toBe(false);
      expect(rateLimitedResponse.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(rateLimitedResponse.body.error).toHaveProperty('retryAfterSeconds');
    });
  });

  describe('Secret & Credential Sanitization Audit', () => {
    it('never leaks API keys, system paths, or raw stack traces in error responses', async () => {
      // Trigger a 404 or bad request
      const res = await request(app)
        .post('/api/recommend')
        .send({ city: '' });

      const bodyStr = JSON.stringify(res.body);
      expect(bodyStr).not.toContain('GEMINI_API_KEY');
      expect(bodyStr).not.toContain('AIzaSy'); // Google API key prefix pattern
      expect(bodyStr).not.toContain('password');
      expect(bodyStr).not.toContain('mongodb://');
    });
  });
});
