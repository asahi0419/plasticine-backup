import cache from '../../../../presentation/shared/cache/index.js';
import createServer from './server.js';
import initExtensions from '../../../../extensions/init.js';

import logger from '../../../../business/logger/index.js';
import Messenger from '../../../../business/messenger/index.js';
import { getSetting } from '../../../../business/setting/index.js';
import { sandboxFactory } from '../../../../business/sandbox/factory.js';
import timestampSaver from '../../utils/timestamp-saver.js';

export let READ_INTERVAL_MS = 6000;

export default async () => {
  process.env.DOMAIN = 'background_mails';
  process.env.APP_NAME = process.env.APP_NAME || 'common';

  await cache.start();
  await initExtensions();

  createServer().then(async () => {
    const sandbox = await sandboxFactory(process.env.APP_ADMIN_USER);

    retrieve(sandbox);
  });
}

async function retrieve(sandbox) {
  const settings = getSetting('mailer.incoming') || {};
  READ_INTERVAL_MS = settings.read_interval_ms || READ_INTERVAL_MS;

  await timestampSaver(process.env.SERVICE_NAME);

  if (settings.enabled) {
    try {
      logger.info(`Retrieve emails with #${settings.type}`);
      await new Messenger('email', sandbox).retrieve(settings);
    } catch (error) {
      logger.error(error);
    }
  }

  await new Promise((resolve) => setTimeout(resolve, settings.read_interval_ms));
  await retrieve(sandbox);
}
