import * as HELPERS from './helpers/index.js';

export const up = (knex) => {
  return HELPERS.onModelExistence(knex, 'permission', async (model) => {
    await HELPERS.updateRecord(knex, model.alias, {
      type: 'attachment',
      action: 'create',
      script: 'p.currentUser.canAtLeastRead()',
    }, {
      script: 'p.currentUser.canAtLeastWrite()',
    });

    await HELPERS.updateRecord(knex, model.alias, {
      type: 'attachment',
      action: 'create_photo',
      script: 'p.currentUser.canAtLeastRead()',
    }, {
      script: 'p.currentUser.canAtLeastWrite()',
    });
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
