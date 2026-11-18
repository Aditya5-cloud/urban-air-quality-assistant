const request = require('supertest');
const app = require('../app');
const { SessionRepository } = require('../models/Session');

describe('Recommendation & Session Endpoints', () => {
  beforeEach(() => {
    SessionRepository.clearMemory();
  });

  const validPayload = {
    city: 'New Delhi',
    householdType: 'family',
    householdSize: 4,
    commute: 'car',
    healthConcern: true,
    seasonContext: 'winter_smog',
    notes: 'Two young children and an elderly parent with mild asthma.',
  };

  describe('POST /api/recommend', () => {
    it('generates structured recommendations for valid profile', async () => {
      const res = await request(app)
        .post('/api/recommend')
        .send(validPayload);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('sessionId');
      expect(res.body).toHaveProperty('profile');
      expect(res.body.profile.city).toBe('New Delhi');

      expect(res.body).toHaveProperty('recommendations');
      const { recommendations } = res.body;
      expect(Array.isArray(recommendations.routines)).toBe(true);
      expect(recommendations.routines.length).toBeGreaterThan(0);
      expect(Array.isArray(recommendations.indoorHacks)).toBe(true);
      expect(recommendations.indoorHacks.length).toBeGreaterThan(0);
      expect(Array.isArray(recommendations.alternatives)).toBe(true);
      expect(recommendations.alternatives.length).toBeGreaterThan(0);
      expect(Array.isArray(recommendations.impacts)).toBe(true);
      expect(recommendations.impacts.length).toBeGreaterThan(0);

      // Verify metadata indicates whether mock or real API
      expect(res.body).toHaveProperty('metadata');
      expect(res.body.metadata).toHaveProperty('source');
    });

    it('returns 422 error when city is missing or too short', async () => {
      const res = await request(app)
        .post('/api/recommend')
        .send({
          ...validPayload,
          city: 'A',
        });

      expect(res.statusCode).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      const cityError = res.body.error.details.find((d) => d.field === 'city');
      expect(cityError).toBeDefined();
    });

    it('returns 422 error when householdType is invalid', async () => {
      const res = await request(app)
        .post('/api/recommend')
        .send({
          ...validPayload,
          householdType: 'corporate_office',
        });

      expect(res.statusCode).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      const err = res.body.error.details.find((d) => d.field === 'householdType');
      expect(err).toBeDefined();
    });

    it('returns 422 error when householdSize is out of bounds', async () => {
      const res = await request(app)
        .post('/api/recommend')
        .send({
          ...validPayload,
          householdSize: 50,
        });

      expect(res.statusCode).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      const err = res.body.error.details.find((d) => d.field === 'householdSize');
      expect(err).toBeDefined();
    });

    it('returns 422 error when commute is invalid', async () => {
      const res = await request(app)
        .post('/api/recommend')
        .send({
          ...validPayload,
          commute: 'helicopter',
        });

      expect(res.statusCode).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      const err = res.body.error.details.find((d) => d.field === 'commute');
      expect(err).toBeDefined();
    });
  });

  describe('GET /api/session/:id', () => {
    it('retrieves an existing session by ID', async () => {
      // First create a session
      const createRes = await request(app)
        .post('/api/recommend')
        .send(validPayload);

      const { sessionId } = createRes.body;
      expect(sessionId).toBeDefined();

      // Retrieve the session
      const fetchRes = await request(app).get(`/api/session/${sessionId}`);

      expect(fetchRes.statusCode).toBe(200);
      expect(fetchRes.body.success).toBe(true);
      expect(fetchRes.body.session.id).toBe(sessionId);
      expect(fetchRes.body.session.profile.city).toBe('New Delhi');
      expect(fetchRes.body.session.recommendations.routines.length).toBeGreaterThan(0);
    });

    it('returns 404 when session does not exist', async () => {
      const fetchRes = await request(app).get('/api/session/non-existent-uuid-1234');

      expect(fetchRes.statusCode).toBe(404);
      expect(fetchRes.body.success).toBe(false);
      expect(fetchRes.body.error.code).toBe('SESSION_NOT_FOUND');
    });
  });
});
