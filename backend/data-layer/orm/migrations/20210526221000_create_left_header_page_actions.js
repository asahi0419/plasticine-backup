/* eslint-disable */

import Promise from 'bluebird';

import getTableName from './helpers/table-name.js';

export const up = async (knex) => {
  const modelsTableName = getTableName({ id: 1, type: 'core' });

  const [ fieldModel ] = await knex(modelsTableName).where({ alias: 'field' });
  const [ actionModel ] = await knex(modelsTableName).where({ alias: 'action' });
  const [ pageModel ] = await knex(modelsTableName).where({ alias: 'page' });
  const [ rtlModel ] = await knex(modelsTableName).where({ alias: 'rtl' });

  const fieldTableName = getTableName({ id: fieldModel.id, type: 'core' });
  const actionsTableName = getTableName({ id: actionModel.id, type: 'core' });
  const pagesTableName = getTableName({ id: pageModel.id, type: 'core' });
  const rtlTableName = getTableName({ id: rtlModel.id, type: 'core' });

  const [ field ] = await knex(fieldTableName).where({ alias: 'actions', model: pageModel.id });
  if (!field) return;

  const [ page ] = await knex(pagesTableName).where({ alias: 'left_header' });
  if (!page) return;

  const actions = await knex(actionsTableName).whereIn('alias', ['show_sidebars', 'show_sidebar', 'show_content_only']);

  await Promise.each(actions, async (action) => {
    await knex(rtlTableName).insert({
      source_field: field.id,
      source_record_id: page.id,
      target_record_id: action.id
    });
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
