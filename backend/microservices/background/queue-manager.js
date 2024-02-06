import Promise from 'bluebird';
import Queue from 'bull';

import logger from '../../business/logger/index.js';

export default class QueueManager {
  constructor(config) {
    this.config = config;
    this.queues = [];
  }

  create(name, processor, jobOptions = {}) {
    const queue = new Queue(name, { redis: this.config });

    const concurrency = jobOptions.concurrency || 1;
    delete jobOptions.concurrency;

    queue.process(concurrency, processor);

    if (jobOptions.repeat) {
      queue.add({}, jobOptions);
    }

    logger.info(`Queue "${name}" is ready!`);

    this.queues.push(queue);

    return queue;
  }

  stop() {
    return Promise.map(this.queues, async (queue) => {
      logger.info(`Queue "${queue.name}" is stopped!`);
      await queue.close();
    });
  }
}
