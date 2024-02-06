import winston from 'winston';
import stringify from 'json-stringify-safe';
import { compact, isObject, isPlainObject, isNumber, isError, isString } from 'lodash-es';

import db from '../../data-layer/orm/index.js';
import * as Errors from '../error/index.js';
import cache from '../../presentation/shared/cache/index.js';

export class CustomTransport extends winston.Transport {
  async log(info = {}, callback) {
    const { level, message, meta, stack } = info;
    // ignore records from express
    if (isPlainObject(meta) && meta.req && meta.res) return callback(null, true);

    // ignore traces
    if (level === 'trace') return callback(null, true);

    try {
      const { admin_user } = cache.namespaces.core.get('services_meta') || {};
      const { id } = admin_user || {};
      const userId = id || 1;

      const payload = {
        timestamp: (meta && isNumber(meta.timestamp) && meta.timestamp) || +new Date(),
        tag: (meta && meta.tag) || null,
        domain: process.env.DOMAIN,
        level,
        message: isError(message) ? message.stack : isObject(message) ? stringify(message) : message,
        created_at: new Date(),
        created_by: (meta && meta.user) || userId,
        __inserted: true,
      };
      if (meta) {
        const { target_model, target_record, context = {} } = meta;
        payload.target_model = target_model || context.modelId;
        payload.target_record = target_record || context.recordId;
      }

      const eStack = (new Error().stack || '').split('\n');
      const mStack = ((meta || {}).stack || '').split('\n');

      const scriptPath = extractScriptPath(eStack) ||
        extractScriptPath(mStack);

      if (scriptPath) {
        const triggerPath = scriptPath.replace(/^.*SCRIPT_PATH:/, '').replace(/:.*$/, '').split('/');
        payload.trigger_type = triggerPath[0];
        payload.trigger_id = triggerPath[1];
      }

      if (level === 'error') {
        const error = Errors[info.name] ? info : extractError(message, meta, stack);

        if (error) {
          payload.uuid = error.id || +new Date();
          payload.message = compact([error.name, error.description]).join('\n');
          payload.meta = error.stack;

          if (error.user) payload.created_by = error.user;
        }
      }

      if (db.getModel('log', { silent: true })) {
        await db.model('log').insert(payload);
      }

      callback(null, true);
    } catch (error) {
      console.log(error);
      callback(null, true);
    }
  }
}

function extractScriptPath(stack) {
  return stack.filter(line => line.match(/SCRIPT_PATH:/)).pop();
}

function extractError(msg, meta, stack) {
  if (isError(msg)) {
    return msg;
  }

  if (((meta instanceof Error) || isPlainObject(meta)) && meta.stack) {
    return meta;
  }

  if (typeof(msg) === 'string') {
    if (isErrorStack(stack)) {
      return new Errors.SystemError(msg, stack);
    }

    if (isErrorStack(msg)) {
      const [ message ] = msg.split('\n');
      return new Errors.SystemError(message, msg);
    }

    return new Errors.SystemError(msg);
  }
}

function isErrorStack(string) {
  return isString(string) && (string.split('\n')[1] || '').trim().startsWith('at ');
}
