import moment from 'moment';
import { compact } from 'lodash-es';

import db from '../../../../../data-layer/orm/index.js';
import * as ERRORS from '../../../../error/index.js';
import * as HELPERS from './helpers.js';
import * as CONSTANTS from '../../../../constants/index.js';
import { OFFSET_REGEXP } from './constants.js';

export const validateRuleUniqueness = async (task) => {
  const { id, escalation_rule, model, record } = task;
  const attributes = { status: 'new', escalation_rule, model, record };
  const existing = await db.model('planned_task').where(attributes).count();

  return !existing;
}

export const validateTaskUniqueness = async (task) => {
  const existing = await db.model('planned_task')
    .where({ scheduled_task: task.id })
    .whereIn('status', ['new', 'in_progress', 'enqueued'])
    .count();

  return !existing;
}

export const validateRuleNextExecution = (rule) => {
  if (rule.re_enable_after) return parseInt(rule.re_enable_after);
}

export const validateTaskNextExecution = (rule = {}, task = {}) => {
  const { reenable_type, reenable_end, end_by_count, end_by_date, run_counter, start_at } = rule;
  const { status, timeout_counter } = task;
  const now = moment();

  if (reenable_type === 'no_reenable' && parseInt(run_counter) > 0) return false;
  if (reenable_type === 'no_reenable' && now.isAfter(start_at)) return false;
  if (reenable_end === 'end_by_date' && now.isAfter(moment(end_by_date))) return false;
  if (reenable_end === 'end_by_count' && parseInt(end_by_count) <= parseInt(run_counter)) return false;
  if (timeout_counter >= CONSTANTS.PLANNED_TASK_TIMEOUT_COUNTER_LIMIT) return false

  return true;
};

export const validateRuleOffsets = async (rule, sandbox) => {
  const errors = [];

  const offsetResult = await validateRuleOffset(rule, sandbox, rule.offset);
  if (offsetResult) errors.push(generateErrorMessage('offset', offsetResult, sandbox));

  const reEnableAfterResult = await validateRuleOffset(rule, sandbox, rule.re_enable_after);
  if (reEnableAfterResult) errors.push(generateErrorMessage('re_enable_after', offsetResult, sandbox));

  if (errors.length) throw new ERRORS.WrongTimeOffsetError(errors.join('\n'));
};

async function validateRuleOffset(rule, sandbox, offset) {
  if (!offset) return;

  if (HELPERS.isFieldAlias(offset)) {
    const field = db.getField({ model: rule.model, alias: offset });
    if (!field) return sandbox.translate('static.owner_model_has_no_field_with_alias', { field: offset });
  }

  if (offset.match(new RegExp(OFFSET_REGEXP, 'g'))) return;

  return sandbox.translate('static.it_has_wrong_format');
}

function generateErrorMessage(fieldAlias, validationResult, sandbox) {
  return compact([sandbox.translate(`static.${fieldAlias}_is_wrong`), validationResult]).join('. ');
}
