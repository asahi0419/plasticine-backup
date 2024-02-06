import { pick, keyBy, reduce, each, map, isEmpty, isEqual, isNull, isString, isUndefined } from 'lodash-es';

import { parseOptions } from '../../../helpers/index.js';

export default (record, attributes, fields) => {
  if (!fields.length) return attributes;

  const fieldsMap = keyBy(fields, 'alias');
  const changedAttributes = reduce(pick(attributes, map(fields, 'alias')), (result, value, key) => {
    if (isUndefined(value)) return result;

    const field = fieldsMap[key] || {};
    const options = parseOptions(field.options);

    let changed = false;
    if (field.type) {
      switch (field.type) {
        case 'datetime':
          changed = new Date(value).getTime() !== new Date(record[key]).getTime();
          break;
        case 'reference_to_list':
          changed = !isEqual(value || [], record[key] || []);
          break;
        case 'array_string':
          if (options.multi_select && isString(value)) {
            changed = !isEqual(value.split(',').map((v) => v.replace(/\'(.*)\'/,'$1')), record[key]);
            break;
          } else if (options.multi_select && isString(record[key])) {
            changed = !isEqual(value, record[key].split(',').map((v) => v.replace(/\'(.*)\'/,'$1')));
            break;
          } else {
            if (isEmpty(value) && isNull(record[key])) break;
            changed = !isEqual(value, record[key]);
            break;
          }
        default:
          changed = !isEqual(value, record[key]);
      }
    }

    const persistent = ['data_template'].includes(field.type);
    (changed || persistent) && (result[key] = value);

    return result;
  }, {});

  extractServiceAttributes('__extraAttributes',     attributes, changedAttributes);
  extractServiceAttributes('__humanizedAttributes', attributes, changedAttributes);

  return changedAttributes;
};

function extractServiceAttributes(section, attributes, changedAttributes) {
  if (!isEmpty(attributes[section])) {
    each(attributes[section], (value, key) => {
      if (!isEmpty(value) || isNull(value)) {
        changedAttributes[section] = changedAttributes[section] || {};
        changedAttributes[section][key] = value;
      }
    });
  }
}
