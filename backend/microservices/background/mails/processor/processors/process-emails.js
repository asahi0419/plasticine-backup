import logger from '../../../../../business/logger/index.js';
import Messenger from '../../../../../business/messenger/index.js';

export default (sandbox) => async (job = {}) => {
  const { record } = job.data || {};

  try {
    await new Messenger('email', sandbox).process(record);
    logger.info(`Email #${record.id} was processed`);
  } catch (error) {
    logger.error(error);
  }
};