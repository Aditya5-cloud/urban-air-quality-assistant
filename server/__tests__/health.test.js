const request = require('supertest');
const app = require('../app');

describe('Health and Foundation Checks', () => {
  it('GET /api/health should return 200 with service health details', async () => {
    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('status', 'healthy');
    expect(res.body).toHaveProperty('services');
    expect(res.body.services).toHaveProperty('database');
    expect(res.body.services).toHaveProperty('geminiConfigured');
  });

  it('GET /api/nonexistent should return structured 404 response', async () => {
    const res = await request(app).get('/api/nonexistent');

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.error).toHaveProperty('code', 'NOT_FOUND');
    expect(res.body.error.message).toContain('Endpoint not found');
  });

  it('should accept valid requests and provide security headers', async () => {
    const res = await request(app).get('/api/health');

    // Helmet security headers
    expect(res.headers).toHaveProperty('x-dns-prefetch-control');
    expect(res.headers).toHaveProperty('x-content-type-options', 'nosniff');
    expect(res.headers).toHaveProperty('x-frame-options', 'SAMEORIGIN');
  });
});
