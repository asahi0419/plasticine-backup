import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodeGzip from 'node-gzip';
import objectSizeof from 'object-sizeof';
import {
  omitBy,
  values,
  compact,
  filter,
  keyBy,
  some,
  reduce,
  each,
  map,
  isNil,
  isString,
  isArray,
  isObject,
  isEmpty,
  isUndefined,
  isNaN,
  isNumber,
  isFunction
} from 'lodash-es';

import db from '../../data-layer/orm/index.js';
import logger, { useProductionLogs } from '../logger/index.js';
import * as CONSTANTS from '../constants/index.js';
import * as SETTING from '../setting/index.js';

export const sizeof = objectSizeof;

export const md5 = (data) => crypto.createHash('md5').update(data).digest('hex');

export const gzip = async (input, options) => {
  if (!isString(input)) input = JSON.stringify(input);
  const result = await nodeGzip.gzip(input, options);

  return isObject(options) && options.encoding
    ? result.toString(options.encoding)
    : result;
};

export const ungzip = async (input, options) => {
  if (isString(input)) input = new Buffer(input, isObject(options) && options.encoding);
  const result = await nodeGzip.ungzip(input, options);

  return isObject(options) && options.encoding
    ? JSON.parse(result.toString())
    : result;
};

export const makeUniqueID = () => Math.random().toString(36).substr(2, 5);

export const makeUniqueHEX = (length) => crypto.randomBytes(20).toString('hex').slice(0, length);

export const measureTime = async (name, callback, args = []) => {
  if (!useProductionLogs()) return callback(...args);

  const context = {};

  let start = () => {
    context.start = +new Date();
    console.log('\x1b[33m%s\x1b[0m', `>>>>> ${name}`);
  };

  let end = () => {
    context.end = +new Date();
    console.log('\x1b[33m%s\x1b[0m', `<<<<< ${name} [${context.end - context.start} ms]`);
  }

  each(args, (arg, i) => {
    if (isFunction(arg) && (arg.name === 'next')) {
      args[i] = () => {
        end();
        arg();
        end = () => null
      }
    }
  });

  start();
  await callback(...args);
  end();
}

export const measureTimeSimple = async (cb, message = '') => {
  const start = new Date();
  const result = await cb()
  const end = new Date();
  logger.info(`${message} (${end - start}ms)`);
  return result;
}

export const parseOptions = (options, params = {}) => {
  if (isNil(options)) return {};
  if (isString(options)) {
    if (options === 'undefined') {
      return {};
    }
    if (options === '[object Object]') {
      logger.info(`Problem with parsing options - ${options}`);
      return {};
    }
  }
  if (isPlainObject(options)) return options;
  if (isArray(options)) return options;

  try {
    return JSON.parse(options) || {};
  } catch (err) {
    if (params.silent) {
      return {};
    } else {
      logger.error(new Error(`Problem with parsing options - ${options}`));
      return {};
    }
  }
};

export const parseNumber = (value) => {
  if (isString(value)) return parseFloat((value.match(/-?(\d+(\.\d+)?)/g) || []).join());
  if (isNumber(value)) return value;
};

export const parseDateFormat = (options = {}) => {
  let { format, date_only } = options;
  if (!CONSTANTS.DATE_FORMATS.includes(format)) format = CONSTANTS.GLOBAL_DATE_FORMAT;

  if (format === CONSTANTS.GLOBAL_DATE_FORMAT) {
    const { field_date_notime, field_date_time } = SETTING.getSetting('format');

    return date_only ? field_date_notime : field_date_time;
  }
  return date_only ? format.split(' HH')[0] : format;
};

export const cleanupAttributes = (attributes) => {
  return omitBy(attributes, (_, key) => key.startsWith('__') && !['__type', '__inserted', '__hash'].includes(key));
};

// own implemantation of lodash's isPlainObject, because of problem with nested objects
export const isPlainObject = (object) => object && object.toString() === '[object Object]';

export const isPatternMode = (value) => /\{\w+\}/.test(value);

export const isFloat = (value) => {
  if (isNaN(parseFloat(value))) return false;
  return parseFloat(value) % 1 !== 0;
}

export const extractConcatenatedFields = (value) => {
  if (!value) return [];
  return isPatternMode(value)
    ? (value.match(/\{\w+\}/g) || []).map(part => part.slice(1, -1))
    : [value]
};

export const columnNameFromConcatenatedFields = (value, tableName, columnType, precision) => {
  if (isPatternMode(value)) {
    const concatenatedColumns = compact(value.replace(/{(\w+)}/g, `{}${tableName}.$1{}`).split('{}'))
      .map((item) => item.includes(tableName) ? item : `'${item}'`);
    return columnType ==='datetime'? `date_trunc('${precision}', ${concatenatedColumns.join(', ')})` : `concat(${concatenatedColumns.join(', ')})`;
  } else {
    return `${tableName}.${value}`;
  }
};

export const isJSValue = (value) => {
  const test = (v) => isString(v) && /(js:)/.test(v.trim());
  return isArray(value) ? some(value, (v) => test(v)) : test(value);
};

export const viewAliasToId = async (model, alias) => {
  const { id } = await db.model('view').where({ model: model.id, alias }).getOne() || {};
  return id;
};

export const getAliasFromURL = (url = '') => {
  if (!isString(url)) return;

  if (url.match(/:\/\/.[\S.]+\/pages\/.*/)) {
    const path = url.split('/').slice(4);
    if (path.length > 1) return;
    return path.join().split('?')[0];
  }
};

export const getRecord = async (modelAlias, attributes = {}) => {
  if (!isObject(attributes)) return;
  if (isEmpty(attributes)) return;
  if (some(values(attributes), isUndefined)) return;

  return db.model(modelAlias).where(attributes).getOne();
};

export const objectMatrix = (object) => {
  const keys = Object.keys(object);
  const keysMatrix = [];

  each(keys, (key, position) => {
    each(keys, () => {
      if (position > 0) {
        keysMatrix[position] = reduce(keysMatrix[position - 1], (result, p) => {
          each(keys, (k) => {
            if (!p.includes(k)) result.push(`${p},${k}`);
          });
          return result;
        }, []);
      } else {
        keysMatrix[position] = map(keys, (k) => `${k}`);
      }
    });
  });

  return reduce(keysMatrix, (result, keys) => {
    each(keys, (key) => {
      result[key] = map(key.split(','), (k) => object[k]).join(', ');
    });

    return result;
  }, {});
};

export const beautifyJSON = (json) => {
  const parsed = parseOptions(json);

  if (!isEmpty(parsed)) {
    const replacer = (key, value) => {
      if (!key) return value;
      if (isNil(value)) return value;
      if (typeof value === 'object') return parsed.hasOwnProperty(key) ? value : '[Object]';

      return value
    };

    json = JSON.stringify(parsed, replacer, 2);
  }

  return json;
};

export const getJWTToken = (user = {}, session = {}, auth) => {
  const context = {
    secret: process.env.APP_SECRET,
    options: {}
  };

  if (process.env.APP_SECRET_ALGORITHM) {
    context.secret = process.env.APP_SECRET_PRIVATE;
    context.options.algorithm = process.env.APP_SECRET_ALGORITHM;
  }

  return jwt.sign({
    id: user.id,
    auth: auth || 'jwt',
    name: user.name,
    email: (user.account || '').email,
    surname: user.surname,
    session_id: session.id,
  }, context.secret, context.options)
}

export const getMethodsList = (obj = {}) => {
  let methods = new Set();
  while (obj = Reflect.getPrototypeOf(obj)) {
    let keys = Reflect.ownKeys(obj)
    keys.forEach((k) => methods.add(k));
  }
  return methods;
};

export const validateSignature = (value='') => {
  let result = null;
  if (!isString(value)) {
    return result;
  }

  if (value.startsWith('data:') && value.includes(';base64,')) {
    result = value;
  }

  return result;
};

export const mergeActions = (actions, model) => {
  const mActions = filter(actions, { model: model.id });
  const iActions = map(filter(actions, { model: model.inherits_model }), (a = {}) => ({ ...a, model: model.id, inherited: true }));

  const mActionsByAlias = keyBy(mActions, 'alias');

  return reduce([...iActions, ...mActions], (result, a = {}) => {
    if (a.active) {
      if (a.inherited && mActionsByAlias[a.alias]) return result;

      result.push(a);
    }

    return result;
  }, []);
};
