import { find, reduce, isArray } from 'lodash-es';

import { parseOptions } from '../../../helpers/index.js';

const PROCESSORS = {
  defaultProcessor,
  array_string: arrayStringProcessor,
  string:stringProcessor,
};

export default (schemaAttributes, service) => {
  return reduce(schemaAttributes, (result, value, key) => {
    const field = find(service.modelFields, { alias: key }) || {};
    const processor = PROCESSORS[field.type] ? PROCESSORS[field.type] : PROCESSORS.defaultProcessor;

    return { ...result, [key]: processor(value, field) };
  }, {});
};

function arrayStringProcessor(value, field) {
  const { multi_select: multi } = parseOptions(field.options);

  if (multi) {
    if (isArray(value)) {
      if (!value.length) return null;
      return value.map(v => `'${v.trim().replace(/\'(.*)\'/,'$1')}'`).sort().join(',');
    }
  }

  return value;
}

function stringProcessor(value) {
   if(isArray(value))
     return JSON.stringify(value);
   return value;
}

function defaultProcessor(value) {
  return value;
}
