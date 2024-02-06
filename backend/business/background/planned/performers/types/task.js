import Promise from 'bluebird';

import db from '../../../../../data-layer/orm/index.js';
import logger from '../../../../logger/index.js';

import * as EXECUTE from '../helpers/execute.js';
import * as HELPERS from '../helpers/helpers.js';
import * as VALIDATE from '../helpers/validate.js';
import * as CALCULATE from '../helpers/calculate.js';

export default class TaskPerformer {
  constructor(rule, sandbox) {
    this.rule = rule;
    this.sandbox = sandbox;
  }

  create() {
    if (!this.rule.active) return;

    return this.__operationFlow('create', () => {
      return this.manager.create({
        scheduled_task: this.rule.id,
        scheduled_on: this.scheduledOn,
      });
    });
  }

  update() {
    if (!this.rule.active) return this.delete();

    return this.__operationFlow('update', async () => {
      const tasks = await db.model('planned_task').where({ scheduled_task: this.rule.id, status: 'new' });
      if (!tasks.length) return this.create();
      await Promise.each(tasks, (task) => this.manager.update(task, { scheduled_on: CALCULATE.calculateTaskScheduleTime(this.rule) || this.rule.start_at }));
    });
  }

  delete() {
    return this.__operationFlow('delete', async () => {
      const tasks = await db.model('planned_task').where({ scheduled_task: this.rule.id, status: 'new' });
      await Promise.each(tasks, (task) => this.manager.destroy(task));
    });
  }

  reenable(task) {
    if (!this.rule.active) return;
    if (task) this.task = task;

    return this.__operationFlow('reenable', () => {
      return this.manager.create({
        scheduled_task: this.rule.id,
        scheduled_on: this.scheduledOn,
        timeout_counter: this.task.timeout_counter,
      });
    });
  };

  process(task) {
    if (!this.rule.active) return;
    if (task) this.task = task;

    return this.__operationFlow('process', async () => {
      try {
        await HELPERS.changeStatus(task, 'in_progress');
        await EXECUTE.executeTaskScript(this.rule, this.sandbox);
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

  async __operationFlow(action, callback) {
    const allowed = await this.__allowOperation(action);
    if (!allowed) return;

    await this.__beforeAction(action);
    await callback();
    await this.__afterAction(action);
  }

  async __beforeAction(action) {
    await this.__setRecordManager();
  }

  async __afterAction(action) {}

  async __allowOperation(action) {
    if (['create', 'reenable'].includes(action)) {
      this.uniq = await VALIDATE.validateTaskUniqueness(this.rule);
      if (!this.uniq) return false;

      this.execute = VALIDATE.validateTaskNextExecution(this.rule, this.task);
      if (!this.execute) return false;
    }

    if (['create'].includes(action)) {
      this.scheduledOn = CALCULATE.calculateTaskScheduleTime(this.rule) || this.rule.start_at;
      if (!this.scheduledOn) return false;
    }

    if (['reenable'].includes(action)) {
      this.scheduledOn = CALCULATE.calculateTaskScheduleTime(this.rule);
      if (!this.scheduledOn) return false;
    }

    return true;
  }

  async __setRecordManager() {
    this.manager = await HELPERS.createRecordManager();
  }
}
