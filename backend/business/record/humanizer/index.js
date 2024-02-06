import arrayStringHumanizer from './types/array-string.js';
import datetimeHumanizer from './types/datetime.js';
import referenceHumanizer from './types/reference.js';
import globalReferenceHumanizer from './types/global-reference.js';
import referenceToListHumanizer from './types/reference.js';
import booleanHumanizer from './types/boolean.js';
import dataVisualHumanizer from './types/data-visual.js';

const defaultHumanizer = (field) => (value) => value;

const TYPES = {
  array_string: arrayStringHumanizer,
  datetime: datetimeHumanizer,
  reference: referenceHumanizer,
  global_reference: globalReferenceHumanizer,
  reference_to_list: referenceToListHumanizer,
  boolean: booleanHumanizer,
  data_visual: dataVisualHumanizer,
  default: defaultHumanizer,
};

export default (field, sandbox, params) => (TYPES[field.type] || TYPES.default)(field, sandbox, params);
