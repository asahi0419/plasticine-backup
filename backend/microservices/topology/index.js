import cache from '../../presentation/shared/cache/index.js';
import createServer from './server.js';

export default async () => {
  process.env.DOMAIN = 'topology';
  process.env.APP_NAME = process.env.APP_NAME || 'common';
  process.env.ROOT_ENDPOINT = process.env.ROOT_ENDPOINT || '/api/v1';

  await cache.start();
  await createServer();
}
