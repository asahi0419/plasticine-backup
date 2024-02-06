import db from '../../../../../data-layer/orm/index.js';
import logger from '../../../../logger/index.js';

import * as EXECUTE from '../helpers/execute.js';
import * as HELPERS from '../helpers/helpers.js';
import * as VALIDATE from '../helpers/validate.js';
import * as CALCULATE from '../helpers/calculate.js';

export default class RulePerformer {
  constructor(rule, sandbox) {
    this.rule = rule;
    this.sandbox = sandbox;
  }

  validate() {
    return VALIDATE.validateRuleOffsets(this.rule, this.sandbox);
  }

  process(task) {
    this.task = task;

    return this.__operationFlow('process', async () => {
      try {
        await HELPERS.changeStatus(task, 'in_progress');
        await EXECUTE.executeRuleScript(task, this.rule, this.sandbox);
        await HELPERS.changeStatus(task, 'completed');

        await this.reenable();
      } catch (error) {
        logger.error(error);

        const status = error.name === 'ScriptTimeoutError' ? 'timeout_error' : 'error';
        this.task = await HELPERS.changeStatus(task, status);
        await this.reenable();
      }
    });
  }

  reenable(task) {
    if (task) this.task = task;

    return this.__operationFlow('reenable', () => {
      return this.manager.create({
        scheduled_on: this.scheduledOn,
        escalation_rule: this.rule.id,
        model: this.rule.model,
        record: this.task.record,
      });
    });
  };

  async __operationFlow(action, callback) {
    const allowed = await this.__allowOperation(action);
    if (!allowed) return;

    await this.__beforeAction(action);
    await callback();
    await this.__afterAction(action);
  }

  async __beforeAction(action) {
    this.manager = await HELPERS.createRecordManager();
  }

  async __afterAction(action) {}

  async __allowOperation(action) {
    if (!this.rule.active) return false;

    if (['reenable'].includes(action)) {
      this.uniq = await VALIDATE.validateRuleUniqueness(this.task);
      if (!this.uniq) return false;

      this.execute = VALIDATE.validateRuleNextExecution(this.rule, this.task);
      if (!this.execute) return false;

      this.scheduledOn = await CALCULATE.calculateRuleReEnableTime(this.rule, this.task);
      if (!this.scheduledOn) return false;
    }

    if (['process'].includes(action)) {
      const model = db.getModel(this.task.model);
      const record = await db.model(model).where({ id: this.task.record }).getOne();

      await this.sandbox.assignRecord(record, model);
      if (!(await EXECUTE.executeRuleCondition(this.rule, this.sandbox, model))) return false;
    }

    return true;
  }
}
