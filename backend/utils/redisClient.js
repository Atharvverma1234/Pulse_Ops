// backend/utils/redisClient.js
const { createClient } = require('redis');

let client;

const getRedisClient = async () => {
  if (client) return client;

  client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });

  client.on('error', (err) => console.error('Redis error:', err));
  client.on('connect', () => console.log('Redis connected'));

  await client.connect();
  return client;
};

module.exports = { getRedisClient };