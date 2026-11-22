const env = require('../config/env');

/**
 * In-Memory Session Repository with TTL (Time-To-Live) management.
 * Provides high-speed, zero-dependency persistence tailored for serverless/Vercel environments.
 */
class SessionRepository {
  static store = new Map();

  static async save(sessionData) {
    const ttlMs = (env.SESSION_TTL_DAYS || 7) * 24 * 60 * 60 * 1000;
    const expiresAt = sessionData.expiresAt || new Date(Date.now() + ttlMs);

    const record = {
      ...sessionData,
      _id: sessionData._id,
      createdAt: sessionData.createdAt || new Date(),
      expiresAt,
    };

    SessionRepository.store.set(sessionData._id, record);
    return record;
  }

  static async findById(id) {
    if (!id || typeof id !== 'string') return null;

    const record = SessionRepository.store.get(id);
    if (!record) return null;

    // Check if session has expired
    if (record.expiresAt && new Date(record.expiresAt).getTime() < Date.now()) {
      SessionRepository.store.delete(id);
      return null;
    }

    return record;
  }

  static async appendChat(id, messagePair) {
    const session = await SessionRepository.findById(id);
    if (!session) return null;

    if (!Array.isArray(session.chatHistory)) {
      session.chatHistory = [];
    }

    session.chatHistory.push(...messagePair);
    SessionRepository.store.set(id, session);
    return session;
  }

  static clearMemory() {
    SessionRepository.store.clear();
  }

  /**
   * Periodic sweep to purge expired sessions and prevent memory growth
   */
  static purgeExpired() {
    const now = Date.now();
    for (const [id, record] of SessionRepository.store.entries()) {
      if (record.expiresAt && new Date(record.expiresAt).getTime() < now) {
        SessionRepository.store.delete(id);
      }
    }
  }
}

module.exports = {
  SessionRepository,
};
