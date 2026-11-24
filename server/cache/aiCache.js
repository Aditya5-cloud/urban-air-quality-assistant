/**
 * @file aiCache.js
 * In-Memory SHA-256 Hash-Keyed LRU Cache for GenAI Recommendations.
 * Delivers sub-10ms warm response latencies and prevents redundant LLM quota consumption.
 */

const { createHash } = require('crypto');

class AiCache {
  /**
   * @param {number} [maxEntries=100] - Maximum number of entries before LRU eviction.
   * @param {number} [ttlMs=3600000] - Time to live in milliseconds (default 1 hour).
   */
  constructor(maxEntries = 100, ttlMs = 60 * 60 * 1000) {
    this.maxEntries = maxEntries;
    this.ttlMs = ttlMs;
    /** @type {Map<string, {data: any, cachedAt: number}>} */
    this.cache = new Map();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Computes a deterministic SHA-256 hash prefix for any payload.
   * @param {object} payload
   * @returns {string} 16-character hexadecimal hash.
   */
  hashKey(payload) {
    const serialized = JSON.stringify(payload, Object.keys(payload || {}).sort());
    return createHash('sha256').update(serialized).digest('hex').slice(0, 16);
  }

  /**
   * Retrieves an item from cache if present and unexpired.
   * Promotes the key for LRU ordering.
   * @param {string} key
   * @returns {any | null}
   */
  get(key) {
    if (!this.cache.has(key)) {
      this.misses += 1;
      return null;
    }

    const entry = this.cache.get(key);
    if (Date.now() - entry.cachedAt > this.ttlMs) {
      this.cache.delete(key);
      this.misses += 1;
      return null;
    }

    // Refresh LRU position (delete and re-insert at end of Map)
    this.cache.delete(key);
    this.cache.set(key, entry);
    this.hits += 1;
    return entry.data;
  }

  /**
   * Sets an item in cache, evicting the oldest entry if capacity is reached.
   * @param {string} key
   * @param {any} data
   */
  set(key, data) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxEntries) {
      // Evict oldest entry (first key in insertion-ordered Map)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      cachedAt: Date.now(),
    });
  }

  /**
   * Checks if a key exists and is unexpired.
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    if (!this.cache.has(key)) return false;
    const entry = this.cache.get(key);
    if (Date.now() - entry.cachedAt > this.ttlMs) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Clears the cache.
   */
  clear() {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Returns cache metrics.
   * @returns {{size: number, maxEntries: number, hits: number, misses: number}}
   */
  stats() {
    return {
      size: this.cache.size,
      maxEntries: this.maxEntries,
      hits: this.hits,
      misses: this.misses,
    };
  }
}

const aiCacheInstance = new AiCache(100);

module.exports = {
  AiCache,
  aiCache: aiCacheInstance,
};
