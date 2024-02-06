/* eslint-disable */

import { onModelExistence } from './helpers/index.js';

const SCRIPT =  `if (p.record.isPersisted()) return;
let aliases = [];
if (p.record.getModel && p.record.getModel().fetchRecords) {
  const params = {
    filter: \`\\\`id\\\` != $\{p.record.getValue('id')\}\`,
    fields: { [\`_$\{p.record.getModel().getValue('alias')\}\`]: 'alias' },
    page: { size: 999 },
  };
  p.record.getModel().fetchRecords(params).then((result) => {
    aliases = result.data.data.map(({ attributes }) => attributes.alias);
  });
} 
p.record.getField('name').onChange((oldValue, newValue) => {
  const aliasValue = utils.parameterizeString(newValue, { length: 55, blackList: aliases });
	p.record.setValue('alias', aliasValue);
});`;

const migrate = (knex) => async (model, table) => {
  await knex(table).where({ name: 'Autogeneration of alias' }).update({ script: SCRIPT });
}

export const up = (knex) => {
  return onModelExistence(knex, 'ui_rule', migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
