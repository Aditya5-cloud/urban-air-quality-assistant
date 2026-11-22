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

  it('accepts multi-turn requests with realistic long assistant replies in history', async () => {
    // Simulate a second and third turn where history contains prior long assistant reply (>500 chars)
    const longReply = 'During severe smog episodes, make sure to keep your vehicle windows closed at all times. Turn on the internal air recirculation mode on your car air conditioning so dirty exhaust fumes are not pulled into your cabin. If you must travel with your children during morning peak hours, having them wear a properly-fitted child N95 or KN95 mask will filter out the vast majority of toxic particulate matter and soot from street-level emissions.'.repeat(2);

    const turn2Res = await request(app)
      .post('/api/chat')
      .send({
        sessionId: activeSessionId,
        message: 'What about indoor air filters for the bedroom?',
        history: [
          { role: 'user', text: 'How to protect kids in cars?' },
          { role: 'assistant', text: longReply },
        ],
      });

    expect(turn2Res.statusCode).toBe(200);
    expect(turn2Res.body.success).toBe(true);
    expect(turn2Res.body).toHaveProperty('reply');
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

  it('rejects history exceeding maximum limit', async () => {
    const fakeHistory = Array.from({ length: 31 }, (_, i) => ({
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
