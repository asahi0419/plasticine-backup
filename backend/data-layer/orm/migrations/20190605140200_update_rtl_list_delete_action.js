/* eslint-disable */

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });
const client_script = `const ids = p.this.getSelectedRecords();
if (confirm(p.translate('rtl_list_delete_confirmation', { ids: ids }))) {
  const parentRecord = p.this.getParent().getRecord();
  const parentField = p.this.options.field.alias;
  const value = _.difference(parentRecord.getValue(parentField), ids);
  parentRecord.setValue(parentField, value);
  return true;
} else {
  return false;
}`;

export const up = async (knex, Promise) => {
  const [actionModel] = await knex(modelsTableName).where({ alias: 'action' }).limit(1);
  return actionModel && knex(getTableName(actionModel)).where({ alias: 'rtl_list_delete' }).update({ client_script });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
