const redis = require('redis');

let redisClient = null;

const connectRedis = async () => {
  // Redis is optional in development - skip if not configured
  if (!process.env.REDIS_URL || process.env.NODE_ENV === 'development') {
    console.log('⚠️  Redis disabled (not needed for development)');
    return null;
  }

  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL,
      password: process.env.REDIS_PASSWORD || undefined,
    });

    redisClient.on('error', (err) => {
      console.error('Redis error:', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('✗ Redis connection failed:', error.message);
    return null;
  }
};

const getRedisClient = () => redisClient;

module.exports = { connectRedis, getRedisClient };
