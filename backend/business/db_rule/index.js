import Promise from 'bluebird';
import { omitBy, isEqual } from 'lodash-es';

import db from '../../data-layer/orm/index.js';
import * as coreRules from './core/index.js';
import * as recordRules from './record/index.js';
import { cleanupAttributes } from '../helpers/index.js';
import Flags from '../record/flags.js';

export const ACTIONS_MAP = {
  insert: 'insert',
  create: 'insert',
  update: 'update',
  delete: 'delete',
  destroy: 'delete',
};

export default class Performer {
  constructor(model, sandbox, flags, mode = 'secure') {
    this.model = model;
    this.sandbox = sandbox;
    this.flags = (flags || Flags.default()).flags;
    this.mode = mode;
  }

  async perform(whenPerform, action, operation) {
    if (!this.flags.ex_save.executeActions) return;

    const { attributes, previousAttributes } = this.sandbox.record;
    const record = { ...attributes, __previousAttributes: previousAttributes };

    const abortActions = (coreRules[this.model.alias] || {})['abort_actions'];
    if (abortActions && abortActions(record)) return;

    if(operation){
     return Promise.each([
        ...((coreRules[this.model.alias] || {})[`${whenPerform}_${action}_${operation}`] || []),
        ...((recordRules[this.model.type] || {})[`${whenPerform}_${action}_${operation}`] || [])
      ], (rule) => rule(record, this.sandbox, this.mode))
    }

    await Promise.each([
      ...((coreRules[this.model.alias] || {})[`${whenPerform}_${action}`] || []),
      ...((recordRules[this.model.type] || {})[`${whenPerform}_${action}`] || []),
    ], (rule) => rule(record, this.sandbox, this.mode));

    const changedAttributes = omitBy(cleanupAttributes(record), (v, k) => isEqual(attributes[k], v));
    await this.sandbox.record.assignAttributes(changedAttributes);

    let dbRules = await db.model('db_rule')
      .where({ __inserted: true, model: this.model.id, when_perform: whenPerform, [`on_${action}`]: true, active: true })
      .orderBy('order', 'asc');

    if (this.sandbox.mode === 'seeding') {
      const accountId = await db.model('account').pluck('id').where({ email: process.env.APP_ADMIN_USER }).getOne();
      if (accountId) {
        const userId = await db.model('user').pluck('id').where({ account: accountId }).getOne();
        dbRules = dbRules.filter((r) => r.created_by === userId);
      } else {
        dbRules = [];
      }
    }

    return Promise.mapSeries(dbRules, ({ id, condition_script, script }) => {
      if (this.sandbox.executeScript(condition_script, `db_rule/${id}/condition_script`, { modelId: this.model.id })) {
        return this.sandbox.executeScript(script, `db_rule/${id}/script`, { modelId: this.model.id });
      }
    });
  }
}
