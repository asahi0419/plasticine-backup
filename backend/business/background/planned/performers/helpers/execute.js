import { pick } from 'lodash-es';

import db from '../../../../../data-layer/orm/index.js';
import { processError } from './helpers.js';
import { EscalationConditionError, EscalationScriptError, ScheduledTaskScriptError } from '../../../../error/index.js';

export const executeRuleCondition = async (rule, sandbox, model) => {
  try {
    const result = sandbox.executeScript(rule.condition_script, `escalation_rule/${rule.id}/condition_script`, { modelId: model.id });
    return result && typeof (result.then) === 'function' ? await result : result;
  } catch (error) {
    processError(error, EscalationConditionError);
  }
};

export const executeRuleScript = async (task, rule, sandbox) => {
  try {
    const result = sandbox.executeScript(rule.script, `escalation_rule/${rule.id}/script`);
    return result && typeof (result.then) === 'function' ? await result : result;
  } catch (error) {
    error.target_model = rule.model;
    error.target_record = task.record;
    processError(error, EscalationScriptError);
  }
}

export const executeTaskScript = async (task, sandbox) => {
  const startTime = new Date();

  try {
    const result = sandbox.executeScript(task.script, `scheduled_task/${task.id}/script`);
    if (result && typeof (result.then) === 'function') await result;

    const endTime = new Date() - startTime;
    await updateTaskTiming(task, startTime, endTime);
  } catch (error) {
    const endTime = new Date() - startTime;
    await updateTaskTiming(task, startTime, endTime);

    processError(error, ScheduledTaskScriptError);
  }
}

export const updateTaskTiming = async (task, last_run_at, last_run_duration) => {
  task.last_run_at = last_run_at;
  task.last_run_duration = last_run_duration;
  task.run_counter = parseInt(task.run_counter || 0) + 1;

  await db.model('scheduled_task').where({ id: task.id })
    .update(pick(task, ['last_run_at', 'last_run_duration', 'run_counter']));
};
