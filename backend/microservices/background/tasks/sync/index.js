import logger from '../../../../business/logger/index.js';
import plannedTasks from './planned-tasks.js';

export default async () => {
  try {
    await plannedTasks();

    logger.info('Sync completed');
  } catch (error) {
    logger.error(error);
  }
};
