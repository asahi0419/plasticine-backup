/* eslint-disable */

import Promise from 'bluebird';

import getTableName from './helpers/table-name.js';
import { onModelExistence } from './helpers/index.js';
import { parseOptions } from '../../../business/helpers/index.js';

const SCRIPT = `const { find } = lodash;
const { parseOptions } = utils;

function updateOptions(alias) {
  if (alias === 'type') return this.init();

  const option = find(this.metadata.options, { alias });
  if (!option) return;

  const options = { ...parseOptions(this.get('options')), [alias]: this.get(alias) };

  if (alias === 'foreign_model') {
    delete this.attributes.foreign_label;
    delete this.attributes.view;
    delete this.attributes.extra_fields;
    delete this.attributes.default;

    const fieldView = p.record.getField('view');
    const fieldExtraFields = p.record.getField('extra_fields');

    const fieldOptionsView = fieldView.getOptions();
    const fieldOptionsExtraFields = fieldExtraFields.getOptions();

    fieldView.setOptions({ ...fieldOptionsView, filter: \`\\\`model\\\` = \${this.attributes.foreign_model}\` });
    fieldExtraFields.setOptions({ ...fieldOptionsExtraFields, filter: \`\\\`model\\\` = \${this.attributes.foreign_model}\` });
  }

  this.update({ options: JSON.stringify(options) });
}

p.record.declare('updateOptions', updateOptions);`;

const migrate = (knex) => async (model, table) => {
  await knex(table).where({ name: 'Options: Update' }).update({ script: SCRIPT });
}

export const up = (knex) => {
  return onModelExistence(knex, 'ui_rule', migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
