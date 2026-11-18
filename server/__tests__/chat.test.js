const request = require('supertest');
const app = require('../app');
const { SessionRepository } = require('../models/Session');

describe('Chat Endpoint (POST /api/chat)', () => {
  let activeSessionId;

  beforeEach(async () => {
    SessionRepository.clearMemory();

    // Create a valid session first
    const res = await request(app)
      .post('/api/recommend')
      .send({
        city: 'Lahore',
        householdType: 'family',
        householdSize: 5,
        commute: 'car',
        healthConcern: true,
        seasonContext: 'winter_smog',
        notes: 'Young children in home.',
      });

    activeSessionId = res.body.sessionId;
  });

  it('generates a follow-up reply and persists message history', async () => {
    const chatRes = await request(app)
      .post('/api/chat')
      .send({
        sessionId: activeSessionId,
        message: 'What should we do if we cannot avoid driving to school during peak morning smog?',
        history: [],
      });

    expect(chatRes.statusCode).toBe(200);
    expect(chatRes.body.success).toBe(true);
    expect(chatRes.body).toHaveProperty('reply');
    expect(typeof chatRes.body.reply).toBe('string');
    expect(chatRes.body.reply.length).toBeGreaterThan(10);

    // Verify session in repository now includes the conversation turns
    const sessionRes = await request(app).get(`/api/session/${activeSessionId}`);
    expect(sessionRes.statusCode).toBe(200);
    expect(sessionRes.body.session.chatHistory.length).toBe(2);
    expect(sessionRes.body.session.chatHistory[0].role).toBe('user');
    expect(sessionRes.body.session.chatHistory[1].role).toBe('assistant');
  });

  it('rejects requests with invalid UUID format', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({
        sessionId: 'not-a-uuid',
        message: 'Hello',
      });

    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 404 when valid UUID does not match any session', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({
        sessionId: '12345678-1234-4234-8234-123456789abc',
        message: 'Hello',
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('SESSION_NOT_FOUND');
  });

  it('rejects empty messages', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({
        sessionId: activeSessionId,
        message: '   ',
      });

    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('rejects history exceeding 10 turns', async () => {
    const fakeHistory = Array.from({ length: 11 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      text: `Message ${i}`,
    }));

    const res = await request(app)
      .post('/api/chat')
      .send({
        sessionId: activeSessionId,
        message: 'Question after long history',
        history: fakeHistory,
      });

    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
    const historyError = res.body.error.details.find((d) => d.field === 'history');
    expect(historyError).toBeDefined();
  });
});
