import Promise from 'bluebird';

import db from '../../data-layer/orm/index.js';
import cache from '../../presentation/shared/cache/index.js';
import { createPerformer } from './utils/helpers.js';
import { reloadCache } from '../db_rule/core/permission.js';

export default class IntegrityManager {
  constructor(record, sandbox) {
    this.model = db.getModel(record.__type);
    this.sandbox = sandbox;
    this.performer = createPerformer(this.model.alias, record, sandbox);
  }

  async perform(action, attributes) {
    return this[action](attributes);
  }

  async validate(attributes) {
    await this.performer.validate(this.model);
  }

  async update(attributes) {
    const commands = await this.performer.update(attributes);

    await Promise.each(commands, async ({ model, record, attributes }) => {
      return db.model(model).where({ id: record.id }).update(attributes);
    });
  }

  async delete() {
    const commands = await this.performer.delete(this.model);

    await Promise.each(commands, async ({ model, record, type }) => {
      if (type === 'update') {
        await db.model(model).where({ id: record.id }).update(record);
      }

      if (type === 'delete') {
        const [ payload ] = await db.model('core_lock').where({ model: db.getModel(model).id, record_id: record.id }).delete(['id']);
        if (payload) cache.namespaces.core.messageBus.publish('service:reload_cache', { target: 'core_locks', params: { action: 'delete', payload } });

        await db.model(model).where({ id: record.id }).delete();
      }
    });

    await Promise.each(commands, async ({ model, record, type }) => {
      if (type === 'delete') {
        if (model === 'model') await db.schema.table.delete(record.alias);
        if (model === 'field') !db.schema.VIRTUAL_FIELDS.includes(record.type) && (await db.schema.column.delete(record));
        if (model === 'permission') {
          await reloadCache('delete')(record, this.sandbox);
        }
      }
    });
  }
}
