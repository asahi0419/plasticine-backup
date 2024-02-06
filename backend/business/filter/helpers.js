import { uniq, each, map, isString, isObject, isArray } from 'lodash-es';

export const compileFilter = (filter = '', record = {}) => {
  if (!isString(filter)) return '';
  if (!isObject(record)) return '';

  each((filter.match(/\b\w+\(([^()]*|\([^()]*\))*\)/g) || []), (func) => {
    const patterns = uniq(func.match(/\{\w+\}/g) || []);
    const arrayPatterns = patterns.filter((p) => isArray(record[p.slice(1, -1)]));

    each(arrayPatterns, (pattern) => {
      const newFunc = func.replace(new RegExp(pattern, 'g'), '[$&]');
      filter = filter.replace(func, newFunc);
      func = newFunc;
    });
  });

  const fields = (filter.match(/\{\w+\}/g) || []).map(part => part.slice(1, -1));
  const fieldsExtra = (filter.match(/\{\w+\.\w+\}/g) || []).map(part => part.slice(1, -1));

  filter = compile(filter, fields, record);
  filter = compile(filter, fieldsExtra, record.__extraAttributes);

  return filter;
};

const compile = (filter, fields = [], attributes) => {
  if (!isArray(fields)) return filter;

  each(fields, (field) => {
    const value = attributes[field];
    let replace = value;

    if (isArray(value)) {
      replace = map(value, (v) => isString(v) ? `"${v}"` : v).join(',');
    }
    if (isString(value) && value) {
      replace = `"${value}"`;
    }

    filter = filter.replace(`{${field}}`, replace || null);
  });

  return filter;
}
