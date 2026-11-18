const mongoose = require('mongoose');
const env = require('../config/env');
const { isDbConnected } = require('../config/db');

// In-memory session store fallback when MongoDB is unavailable/disconnected
const memoryStore = new Map();

const sessionSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    profile: {
      city: { type: String, required: true },
      householdType: { type: String, required: true },
      householdSize: { type: Number, required: true },
      commute: { type: String, required: true },
      healthConcern: { type: Boolean, required: true },
      seasonContext: { type: String, required: true },
      notes: { type: String, default: '' },
    },
    recommendations: {
      routines: [{ type: String }],
      indoorHacks: [{ type: String }],
      alternatives: [{ type: String }],
      impacts: [{ type: String }],
    },
    chatHistory: [
      {
        role: { type: String, enum: ['user', 'assistant'], required: true },
        text: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + env.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000),
      index: { expires: 0 }, // MongoDB TTL auto-cleanup
    },
  },
  {
    _id: false, // We supply custom UUID string _id
    versionKey: false,
  }
);

let MongooseSession;
try {
  MongooseSession = mongoose.model('Session', sessionSchema);
} catch {
  MongooseSession = mongoose.model('Session');
}

/**
 * High-level Session Repository that transparently uses MongoDB when connected
 * and falls back to in-memory store if DB is offline.
 */
class SessionRepository {
  static async save(sessionData) {
    if (isDbConnected()) {
      try {
        const sessionDoc = new MongooseSession(sessionData);
        await sessionDoc.save();
        return sessionDoc.toObject();
      } catch (dbErr) {
        console.warn(`[Session Repo] DB save failed, storing in memory: ${dbErr.message}`);
      }
    }

    // In-memory fallback
    memoryStore.set(sessionData._id, {
      ...sessionData,
      createdAt: sessionData.createdAt || new Date(),
      expiresAt: sessionData.expiresAt || new Date(Date.now() + env.SESSION_TTL_DAYS * 86400000),
    });
    return sessionData;
  }

  static async findById(id) {
    if (isDbConnected()) {
      try {
        const doc = await MongooseSession.findById(id).lean();
        if (doc) return doc;
      } catch (dbErr) {
        console.warn(`[Session Repo] DB find failed: ${dbErr.message}`);
      }
    }

    return memoryStore.get(id) || null;
  }

  static async appendChat(id, messagePair) {
    if (isDbConnected()) {
      try {
        const updated = await MongooseSession.findByIdAndUpdate(
          id,
          { $push: { chatHistory: { $each: messagePair } } },
          { new: true }
        ).lean();
        if (updated) return updated;
      } catch (dbErr) {
        console.warn(`[Session Repo] DB chat append failed: ${dbErr.message}`);
      }
    }

    const session = memoryStore.get(id);
    if (session) {
      if (!session.chatHistory) session.chatHistory = [];
      session.chatHistory.push(...messagePair);
      memoryStore.set(id, session);
      return session;
    }
    return null;
  }

  static clearMemory() {
    memoryStore.clear();
  }
}

module.exports = {
  SessionModel: MongooseSession,
  SessionRepository,
};
