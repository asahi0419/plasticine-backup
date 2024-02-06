import cache from '../../../presentation/shared/cache/index.js';
import createServer from './server.js';
import initExtensions from '../../../extensions/init.js';

import sync from './sync/index.js';
import logger from '../../../business/logger/index.js';
import startQueues from './queues.js';
import { sandboxFactory } from '../../../business/sandbox/factory.js';

export default async () => {
  process.env.DOMAIN = 'background_tasks';
  process.env.APP_NAME = process.env.APP_NAME || 'common';

  process.on('uncaughtException', (error) => {
    logger.error(error);
  });

  process.on('unhandledRejection', (error) => {
    logger.error(error);
  });

  await cache.start();
  await initExtensions();

  createServer().then(async () => {
    await sync();

    const sandbox = await sandboxFactory(process.env.APP_ADMIN_USER);
    const queueManager = await startQueues(sandbox);
  
    process.on('SIGTERM', () => queueManager.stop());
    process.on('SIGINT', () => queueManager.stop());
  });
}
