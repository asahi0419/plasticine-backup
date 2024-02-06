import { get, set, isArray, isString, isPlainObject } from 'lodash-es';

import { parseOptions } from '../helpers/index.js';

export const fakeI18n = {
  t: (key, options) =>  options && options.defaultValue ? options.defaultValue : key,
  reloadResources: () => {},
};

function staticTranslator(i18n, key, params = {}) {
  const options = { ...params, interpolation: { escapeValue: false } };

  let result = i18n.t(key, options);
  if (key.startsWith('static.')) return result;

  if ((result === key) || (result === options.defaultValue)) {
    result = i18n.t(`static.${key}`, options);
    if (result.startsWith('static.')) return key;
  }

  return result;
}

function dynamicTranslator(i18n, resource, model, field) {
  return i18n.t(`dynamic.${model}.record_${resource.id}.${field}`, { defaultValue: resource[field] });
}

function jsonTranslator(i18n, resource, model, field) {
  const translations = i18n.t(`json.${model}.record_${resource.id}.${field}`, { returnObjects: true });

  if (isPlainObject(translations)) {
    const parsedValue = parseOptions(resource[field]);

    Object.keys(translations).forEach((key) => {
      const path = key.split('/');
      const translation = translations[key] || get(parsedValue, path);

      set(parsedValue, path, translation)
    });

    return JSON.stringify(parsedValue);
  }
}

function translate(i18n, resource = {}, model, fields = []) {
  if (!i18n) return resource;

  fields.forEach((field) => {
    if (resource[field]) {
      resource[field] = jsonTranslator(i18n, resource, model, field) || resource[field];
      resource[field] = dynamicTranslator(i18n, resource, model, field) || resource[field];
    }
  });

  return resource;
}

export default (i18n) => (...args) => {
  if (isString(args[0])) return staticTranslator(i18n, args[0], args[1]);

  return isArray(args[0])
    ? args[0].map(r => translate(i18n, r, args[1], args[2]))
    : translate(i18n, args[0], args[1], args[2]);
};
