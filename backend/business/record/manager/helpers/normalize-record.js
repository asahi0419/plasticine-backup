import lodash from 'lodash-es';

import * as Helpers from '../../../helpers/index.js';

const PROCESSORS = {
  defaultProcessor,
  array_string: arrayStringProcessor,
};

export default (record, service) => {
  return lodash.reduce(record, (result, value, alias) => {
    const field = lodash.find(service.modelFields, { alias });
    
    if (field) {
      const processor = PROCESSORS[field.type] || PROCESSORS.defaultProcessor;
      result[alias] = processor(value, field);
    }

    return result;
  }, {});
};

export function arrayStringProcessor(value, field) {
  const { multi_select: multi } = Helpers.parseOptions(field.options);

  if (multi) {
    if (lodash.isString(value)) {
      value = value.split(',').map(v => v.trim().replace(/\'(.*)\'/, '$1'));
    }
  }

  return value || null;
}

function defaultProcessor(value) {
  return value;
}
