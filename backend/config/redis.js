const redis = require('redis');

// Simple in-memory fallback for environments without Redis
const inMemoryCache = new Map();

const client = {
  get: async (key) => {
    try {
      // Mocking async behaviour
      return Promise.resolve(inMemoryCache.get(key) || null);
    } catch (e) {}
  },
  set: async (key, value, options) => {
    try {
      inMemoryCache.set(key, value);
      if (options && options.EX) {
        setTimeout(() => {
          inMemoryCache.delete(key);
        }, options.EX * 1000);
      }
      return Promise.resolve('OK');
    } catch (e) {}
  },
  del: async (key) => {
    inMemoryCache.delete(key);
    return Promise.resolve(1);
  },
  isOpen: true,
  connect: async () => Promise.resolve()
};

const connectRedis = async () => {
  console.log('Using In-Memory cache fallback instead of Redis for development');
};

module.exports = { client, connectRedis };
