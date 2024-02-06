import { mergeWith, isArray, cloneDeep, uniqBy, pick } from 'lodash-es';

import templates from '../model/templates.js';

export const UNIQUE_KEYS_FOR_EXTENDING = {
  models: 'alias',
  fields: 'alias',
  db_rules: 'name',
  views: 'alias',
  layouts: 'name',
  filters: 'name',
  forms: 'alias',
  actions: 'alias',
  permissions: ['type', 'action'],
  privileges: 'level',
  user_groups: 'name',
  users: ['name', 'surname'],
  pages: 'alias',
  settings: 'name',
  languages: 'alias',
  static_translations: 'key',
};

export const extendModelWithTemplate = (model = {}) => {
  const { template = 'base' } = model;
  return mergeWith(cloneDeep(templates[model.template] || {}), model, mergeStrategy);
};

const mergeStrategy = (objValue, srcValue, key, _, source) => {
  if (!isArray(objValue)) return srcValue || objValue;
  if (isArray(srcValue) && !srcValue.length) return [];

  const keyName = key === 'records' ? source.alias : key;
  const uniqueKey = UNIQUE_KEYS_FOR_EXTENDING[keyName] || 'alias';
  const iteratee = isArray(uniqueKey)
    ? (value) => Object.values(pick(value, uniqueKey)).join('-')
    : uniqueKey;

  return uniqBy(srcValue.concat(objValue), iteratee);
};
