import * as CONSTANTS from '../../constants/index.js';

const processStatus = (record, sandbox) => {
  if (record.status === 'timeout_error') {
    record.timeout_counter += 1;

    if (record.timeout_counter >= CONSTANTS.PLANNED_TASK_TIMEOUT_COUNTER_LIMIT) {
      record.status = 'error';
    }
  }

  return record
}

export default {
  before_update: [processStatus],
};
