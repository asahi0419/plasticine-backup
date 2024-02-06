import winston from 'winston';
import lodash from 'lodash-es';
import stringify from 'json-stringify-safe';
import * as bottleneck from 'bottleneck';

import { getSetting } from '../setting/index.js';
import { CustomTransport } from './custom-transport.js';

const LOG_LEVELS = {
  levels: {
    error: 0,
    trace: 1,
    warning: 2,
    info: 3,
    debug: 4,
  },
  colors: {
    error: 'red',
    trace: 'blue',
    warning: 'yellow',
    info: 'green',
    debug: 'gray',
  },
};

winston.addColors(LOG_LEVELS.colors);

const transports = [];

if (process.env.NODE_ENV === 'production') {
  transports.push(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    )
  }));
} else {
  transports.push(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.colorize(),
      winston.format.printf((info = {}) => {
        let message = info.message || info.description;
        if (lodash.isError(info.message)) message = info.message.stack;
        if (lodash.isObject(info.message)) message = stringify(info.message);

        let meta;
        if (lodash.isError(info.meta)) meta = info.meta.stack;
        if (lodash.isObject(info.meta)) meta = stringify(info.meta);

        let text = `${info.timestamp} ${info.level}: ${message}`;
        if (meta) text = `${text} ${meta}`;
        if (info.stack) text = `${text}\n${info.stack}`;

        return text;
      }),
    ),
  }));
}

if (process.env.NODE_ENV !== 'test') {
  transports.push(new CustomTransport());
}

export const loggerTransports = transports;
const loggerMain = new winston.createLogger({
  format: winston.format.errors({ stack: true }),
  transports,
  levels: LOG_LEVELS.levels,
});

export const useProductionLogs = () => {
  const env = +process.env.DEBUG;
  const setting = getSetting('logs').use_production_logs;

  if (lodash.isBoolean(setting)) return setting
  if (lodash.isBoolean(env)) return env
};

const bottleneckLimiter = new bottleneck.default({
  maxConcurrent: 1,
  minTime: 5
});

const logger = new Proxy(loggerMain, {
  get(target, level) {
    if (typeof level === 'string' && level in LOG_LEVELS.levels) {
      return (message, ...rest) => {
        return bottleneckLimiter.schedule({}, () => {
          return loggerMain.log(level, message , ...rest);
        });
      };
    }

    return target[level];
  },
});

export default logger;
