import { get, compact, filter, reduce, isString, isUndefined, castArray } from 'lodash-es';

import db from '../../data-layer/orm/index.js';
import cache from '../../presentation/shared/cache/index.js';
import { isPlainObject } from '../helpers/index.js';

export const getSetting = (input) => extractSetting(cache.namespaces.core.get('settings'), input);

export const getSettings = (list) => {
  return reduce(list, (result, alias) => ({ ...result, [alias]: getSetting(alias) }), {});
};

export const extractSetting = (settings = {}, input) => {
  const paths = filter(compact(castArray(input)), isString) || [];
  const result = {};

  paths.forEach((path) => {
    const [alias, ...restPath] = path.split('.');
    let value = prepareSettingValue(settings[alias]);

    if (isPlainObject(value) && restPath.length) {
      value = get(value, restPath);
    }

    result[path] = value;
  });

  const output = get(result, input);

  return isUndefined(output) ? {} : output;
};

export const getUserSetting = (user, model, record_id, exec_by = {}) => {
  const clause = { user: user.id, model: model.id, record_id, type: exec_by.type || 'main' };
  return db.model('user_setting').where(clause).getOne();
};

function prepareSettingValue(value) {
  switch (value) {
    case 'true':
      return true;
    case 'false':
      return false;
    default:
      return tryParseJSON(value);
  }
}

function tryParseJSON(value) {
  try {
    return JSON.parse(value);
  } catch (err) {
    return value;
  }
}
