import lodash from 'lodash';
import moment from 'moment';
import commonProcessor from './common.js';
import { DATE_INTERVALS } from '../../../../../constants/index.js';

export default (field, operator, value, context) => {
  if (lodash.isString(value) && DATE_INTERVALS.includes(value)) return value;
  
  return commonProcessor(field, operator, value, context);
};
