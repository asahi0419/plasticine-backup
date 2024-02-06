/* eslint-disable */

import { onModelExistence } from './helpers/index.js';

const SCRIPT = `if (p.record.isPersisted()) return;

const permalinks = [];

if (p.record.getModel && p.record.getModel().fetchRecords) {
  const params = {
    filter: \`\\\`id\\\` != $\{p.record.getValue('id')\}\`,
    fields: { [\`_$\{p.record.getModel().getValue('permalink')\}\`]: 'permalink' },
    page: { size: 999 },
  };
  p.record.getModel().fetchRecords(params).then((result) => {
    lodash.each(result.data.data, ({ attributes = {} }) => permalinks.push(attributes.permalink));
  });
}

p.record.getField('name').onChange((oldValue, newValue) => {
  const permalinkValue = utils.parameterizeString(newValue, { length: 55, blackList: permalinks, isURL: true });
  p.record.setValue('permalink', permalinkValue);
});`;

const migrate = (knex) => async (model, table) => {
  await knex(table).where({ name: 'Autogeneration of permalink' }).update({ script: SCRIPT });
}

export const up = (knex) => {
  return onModelExistence(knex, 'ui_rule', migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
