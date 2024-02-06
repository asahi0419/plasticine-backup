import arrayStringHumanizer from './array-string.js';
import datetimeHumanizer from './datetime.js';
import referenceHumanizer from './reference.js';
import globalReferenceHumanizer from './global-reference.js';
import referenceToListHumanizer from './reference.js';
import booleanHumanizer from './boolean.js';
import noAccessHumanizer from './no-access.js';

const defaultHumanizer = field => records => undefined;

const TYPES = {
  array_string: arrayStringHumanizer,
  datetime: datetimeHumanizer,
  reference: referenceHumanizer,
  global_reference: globalReferenceHumanizer,
  reference_to_list: referenceToListHumanizer,
  boolean: booleanHumanizer,
  default: defaultHumanizer,
  no_access: noAccessHumanizer,
};

export default (field, sandbox, params = {}) => {
  if (params.currentDepthReferenceObjSearch <= 0 && (field.type == 'global_reference' || field.type == 'reference_to_list')){
    return noAccessHumanizer(field, sandbox);
  }

  if (field.hasOwnProperty('__access') && !field.__access) {
    return TYPES.no_access(field, sandbox);
  } else {
    return (TYPES[field.type] || TYPES.default)(field, sandbox, params);
  }
}
