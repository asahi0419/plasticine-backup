import { deleteRecord, getModel, updateRecord } from './helpers/index.js';

export const up = async (knex) => {
  const { id } = await getModel(knex, { alias: 'email' }) || {};
  if (!id) return;

  await deleteRecord(knex, 'view', { model: id, alias: 'default' });
  await updateRecord(knex, 'view', { model: id, alias: 'outcoming' }, { alias: 'outgoing', name: 'Outgoing' });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
