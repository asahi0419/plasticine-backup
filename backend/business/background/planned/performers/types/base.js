import Promise from 'bluebird';
import { map, find } from 'lodash-es';

import Flags from '../../../../record/flags.js';
import db from '../../../../../data-layer/orm/index.js';

import * as EXECUTE from '../helpers/execute.js';
import * as HELPERS from '../helpers/helpers.js';
import * as CALCULATE from '../helpers/calculate.js';

export default class BasePerformer {
  constructor(model, sandbox, flags = Flags.default(), mode) {
    this.model = model;
    this.sandbox = sandbox;
    this.flags = flags;
    this.mode = mode;
  }

  create(record) {
    return this.__operationFlow('create', () => {
      return Promise.each(this.rules, async (rule) => {
        const attributes = { model: this.model.id, record: record.id, escalation_rule: rule.id };
        if (rule.run_by_user) await HELPERS.executeByUser(attributes, record, rule.run_by_user);

        if (!EXECUTE.executeRuleCondition(rule, this.sandbox, this.model)) return;

        const field = find(this.fields, { id: rule.target_field });
        if (!record[field.alias]) return;

        const scheduled_on = await CALCULATE.calculateRuleScheduleTime(record, rule);
        if (!scheduled_on) return;

        return this.manager.create({ ...attributes, scheduled_on });
      });
    });
  };

  update(record) {
    return this.__operationFlow('update', () => {
      return Promise.each(this.rules, async (rule) => {
        const attributes = { model: this.model.id, record: record.id, escalation_rule: rule.id, status: 'new' };
        if (rule.run_by_user) await HELPERS.executeByUser(attributes, record, rule.run_by_user);

        if (!EXECUTE.executeRuleCondition(rule, this.sandbox, this.model)) return;

        const field = find(this.fields, { id: rule.target_field });
        const oldValue = record.__previousAttributes[field.alias];
        const newValue = record[field.alias];

        if (!newValue) return;
        if (oldValue && (oldValue.getTime() === newValue.getTime())) return;

        const scheduled_on = await CALCULATE.calculateRuleScheduleTime(record, rule);
        if (!scheduled_on) return;

        const task = await db.model('planned_task').where(attributes).getOne();
        if ((task || {}).status === 'cancelled') return;

        return task
          ? this.manager.update(task, { scheduled_on })
          : this.manager.create({ ...attributes, scheduled_on });
      });
    });
  };

  delete(record) {
    return this.__operationFlow('delete', async () => {
      const tasks = await db.model('planned_task').where({ model: this.model.id, record: record.id });
      await Promise.each(tasks, (task) => this.manager.destroy(task));
    })
  };

  async __operationFlow(action, callback) {
    const allowed = await this.__allowOperation(action);
    if (!allowed) return;

    await this.__beforeAction(action);
    await callback();
    await this.__afterAction(action);
  }

  async __beforeAction(action) {
    await this.__setRecordManager();

    if (!['create', 'update'].includes(action)) return;

    await this.__setFields(action);
    await this.__setRules(action);
  }

  async __afterAction(action) {}

  async __allowOperation(action, task) {
    const { flags } = this.flags || {};
    if (!flags.ex_save.recalcEscalTimes) return false;
    return true;
  }

  async __setRecordManager() {
    this.manager = await HELPERS.createRecordManager();
  }

  async __setFields() {
    this.fields = db.getFields({ model: this.model.id, type: 'datetime' });
  }

  async __setRules() {
    this.rules = await db.model('escalation_rule').where({ active: true }).whereIn('target_field', map(this.fields, 'id'));
  }
}
