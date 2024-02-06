import * as TYPES from './types';

export default (field) => (TYPES[field.type] || TYPES.base)(field);
