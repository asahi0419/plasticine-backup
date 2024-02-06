import { compact, filter, isArray, isUndefined, isString } from 'lodash-es';

import logger from '../../../logger/index.js';
import typecast from '../../../field/value/typecast/index.js';
import { parseOptions, isJSValue } from '../../../helpers/index.js';

export default (field, sandbox, attributes) => {
  const options = parseOptions(field.options);

  if (isUndefined(options.default)) {
    switch (field.type) {
      case 'boolean':
        options.default = false;
        break;
      case 'integer':
      case 'reference':
      case 'primary_key':
      case 'datetime':
        // TODO
        break;
      case 'autonumber':
        options.default = getDefaultAutonumber(options, attributes.id);
        break;
      default:
        // logger.error(`Default value for ${field.type} is undefined.`);
    }
  } else {
    if (field.type === 'array_string') {
      const { values = {}, multi_select: multi } = options;

      if (multi) {
        try {
          const parsedDefaultValue = parseOptions(options.default);
          if (isString(parsedDefaultValue) || isArray(parsedDefaultValue)) options.default = parsedDefaultValue;
        } catch (e) {}
      }

      if (isArray(options.default)) {
        const defaults = compact(filter(options.default, (v) => values[v]));
        options.default = defaults.length ? (multi ? defaults.map(v => `'${v}'`).join(',') : defaults[0]) : null;
      } else {
        const defValue = (options.default || '').replace(/\'(.*)\'/,'$1');
        options.default = values[defValue] ? (multi ? `'${defValue}'` : options.default) : null;
      }
    }

    if (['string', 'color', 'condition', 'fa_icon', 'file', 'filter', 'reference_to_list'].includes(field.type)) {
      options.default = typecast(field, options.default) || null;
    }
  }

  return deJSify(field, options.default, sandbox);
};

export function getDefaultAutonumber(options, id) {
  const {prefix, postfix, width} = options;
  const prefixValue = prefix ? prefix : '';
  const postfixValue = postfix ? postfix : '';
  const zeroPad = (num, places) => String(num).padStart(places, '0')
  return `${prefixValue}${zeroPad(id, width)}${postfixValue}`;
}

function deJSify(field, value, sandbox) {
  try {
    return isJSValue(value)
      ? sandbox.executeScript(value.replace(/^js:/, ''), `field/${field.id}/default`, { modelId: field.model })
      : value;
  } catch (error) {
    logger.error(error);
    return value;
  }
}
