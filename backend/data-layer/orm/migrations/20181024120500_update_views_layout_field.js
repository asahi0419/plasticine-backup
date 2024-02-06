/* eslint-disable */

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });
const fieldsTableName = getTableName({ id: 2, type: 'core' });

export const up = async (knex) => {
  const [viewModel] = await knex(modelsTableName).where({ alias: 'view' });
  if (!viewModel) return;

  await knex(fieldsTableName)
    .where({ model: viewModel.id, alias: 'layout' })
    .update({
      required_when_script: `['grid', 'card'].includes(p.record.getValue('type'));`,
    });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
