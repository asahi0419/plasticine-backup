/* eslint-disable */

import Promise from 'bluebird';

import * as HELPERS from './helpers/index.js';

const migrate = (knex) => async (models) => {
  await Promise.each(await HELPERS.getRecords(knex, 'model', { __inserted: true }), async (model) => {
    const permissionAttributes = {
      script: 'p.currentUser.canAtLeastRead()',
      created_at: new Date(),
      created_by: 1,
      __inserted: true,
    };
    const coreLockAttributes = {
      model: models.permission.id,
      delete: true,
      created_at: new Date(),
      created_by: 1,
      __inserted: true,
    };

    const defineLayoutClause = { model: model.id, type: 'model', action: 'define_layout' };
    const defineFilterClause = { model: model.id, type: 'model', action: 'define_filter' };

    const defineLayoutPermission = await HELPERS.getRecord(knex, 'permission', defineLayoutClause);
    if (!defineLayoutPermission) {
      const record = await HELPERS.createRecord(knex, 'permission', { ...defineLayoutClause, ...permissionAttributes });
      (model.type === 'core') && await HELPERS.createRecord(knex, 'core_lock', { ...coreLockAttributes, record_id: record.id });
    }

    const defineFilterPermission = await HELPERS.getRecord(knex, 'permission', defineFilterClause);
    if (!defineFilterPermission) {
      const record = await HELPERS.createRecord(knex, 'permission', { ...defineFilterClause, ...permissionAttributes });
      (model.type === 'core') && await HELPERS.createRecord(knex, 'core_lock', { ...coreLockAttributes, record_id: record.id });
    }
  });
};

export const up = (knex) => {
  const models = ['model', 'permission', 'core_lock'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
