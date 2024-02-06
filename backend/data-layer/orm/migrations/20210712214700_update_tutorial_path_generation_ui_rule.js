/* eslint-disable */

import { onModelExistence } from './helpers/index.js';

const SCRIPT = `if (p.record.isPersisted()) return;

const paths = [];

if (p.record.getModel && p.record.getModel().fetchRecords) {
  const params = {
    filter: \`\\\`id\\\` != \${p.record.getValue('id')}\`,
    fields: { [\`_\${p.record.getModel().getValue('path')}\`]: 'path' },
    page: { size: 999 }
  };
  p.record.getModel().fetchRecords(params).then((result) => {
    lodash.each(result.data.data, ({ attributes = {} }) => paths.push(attributes.path));
  });
}

p.record.getField('permalink').onChange((oldValue, newValue) => {
  const tutorial = p.record.getField('tutorial').getRefValue('permalink');
  const article = utils.parameterizeString(newValue, { length: 55, blackList: paths, isURL: true });
  p.record.setValue('path', \`/pages/tutorial/\${tutorial}/\${article}\`);
});

p.record.getField('tutorial').onChange((oldValue, newValue) => {
  const tutorial = p.record.getField('tutorial').getRefValue('permalink');
  const article = p.record.getValue('permalink');
  p.record.setValue('path', \`/pages/tutorial/\${tutorial}/\${article}\`);
});`;

const migrate = (knex) => async (model, table) => {
  await knex(table).where({ name: 'Autogeneration of path' }).update({ script: SCRIPT });
}

export const up = (knex) => {
  return onModelExistence(knex, 'ui_rule', migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
