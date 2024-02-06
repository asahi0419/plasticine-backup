import { isString } from 'lodash-es';

const MAX_RESULT_LENGTH = 100000;

const trimString = (string) => (string.length > MAX_RESULT_LENGTH)
  ? string.slice(0, MAX_RESULT_LENGTH)
  : string;

const processResult = (record, sandbox) => {
  if (isString(record.result)) record.result = trimString(record.result);
  if (isString(record.exp_result)) record.exp_result = trimString(record.exp_result);
};

export default {
  before_insert: [processResult],
  before_update: [processResult],
};
