import { isPlainObject } from 'lodash-es';

import logger from '../../../../logger/index.js';

export class LoggerProxy {
  constructor(user) {
    this.user = user;
  }

  log(level, message, tag) {
    const meta = getMeta(this.user, tag);

    logger.log({
      meta,
      level,
      message,
    });

    return message;
  }

  info(input, tag) {
    return this.log('info', input, tag);
  }

  error(input, tag) {
    return this.log('error', input, tag);
  }

  memoryUsage(tag) {
    const mu = process.memoryUsage();

    return this.log('trace', {
      heapUsedKb: mu.heapUsed / 1024,
      heapTotalKb: mu.heapTotal / 1024,
      rss: mu.rss / 1024,
    }, tag);
  }
}

export function getMeta(user = {}, tag) {
  return {
    tag,
    user: user.id,
    timestamp: +new Date()
  };
};


export default ({ user }) => new LoggerProxy(user);
