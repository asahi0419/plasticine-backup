import asyncRedis from 'async-redis';
import cache from '../../../presentation/shared/cache/index.js';

const redis = asyncRedis.createClient({
  prefix: (process.env.NODE_ENV === 'test')
    ? 'redis-core.mb'
    : 'redis-custom.mb',
  host: (process.env.NODE_ENV === 'test')
    ? process.env.REDIS_CORE_HOST || 'redis-core'
    : process.env.REDIS_CUSTOM_HOST || 'redis-custom',
});

Object.getOwnPropertyNames(redis).forEach((name) => {
  if (typeof redis[name] === 'function') {
    redis['_' + name] = redis[name];

    redis[name] = async function() {
      const customClient = (process.env.NODE_ENV === 'test')
        ? cache.namespaces.core.client
        : cache.namespaces.custom.client;

      const check = await customClient.get('123', (err, res) => {
        if (err) throw new Error(`The Redis service issue: ${err}`);
        return res;
      });

      if (check) {
        return await redis['_' + name](...arguments);
      } else {
        throw new Error(`The Redis service issue`);
      }
    };
  }
});

export default redis;
