/* eslint-disable */

import getTableName from './helpers/table-name.js';

const modelTableName = getTableName({ id: 1, type: 'core' });
const fieldTableName = getTableName({ id: 2, type: 'core' });
const pageTableName = getTableName({ id: 6, type: 'core' });

export const up = async (knex, Promise) => {
  const [actionsField] = await knex(fieldTableName).where({ model: 6, alias: 'actions' }).limit(1);
  const [rtlModel] = await knex(modelTableName).where({ alias: 'rtl' }).limit(1);

  const findViewManagerScope = knex(pageTableName).where({ alias: 'view_manager' });
  const [viewManagerPage] = await findViewManagerScope.limit(1);

  if (rtlModel && actionsField && viewManagerPage) {
    await knex(getTableName({ id: rtlModel.id, type: 'core' }))
      .where({ source_field: actionsField.id, source_record_id: viewManagerPage.id })
      .del();
  }

  await findViewManagerScope.del();
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
