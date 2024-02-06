import stringify from 'json-stringify-safe';

import logger from '../../../../../business/logger/index.js';
import Messenger from '../../../../../business/messenger/index.js';

export default (sandbox) => async (job) => {
  const { record } = job.data || {};

  try {
    const info = await new Messenger('email', sandbox).send(record);
    logger.info(`Email #${record.id} was sent with result (${stringify(info, null, 2)})`);
  } catch (error) {
    logger.error(error);
  }
};
