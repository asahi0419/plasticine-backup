/* eslint-disable */

import { onModelExistence } from './helpers/index.js';

const SCRIPT = `const { each, reduce, keys, find, filter, pick, map } = lodash;
const { parseOptions } = utils;

function initOptions() {
  const optionsParsed = parseOptions(this.attributes.options);
  const options = this.options[this.attributes.type] || [];
  const optionsAttributes = reduce(options, (result, option) => {
    let value = optionsParsed[option.alias];
    if (!value && !p.record.isPersisted()) value = parseOptions(option.options).default;
    return { ...result, [option.alias]: value };
  }, {});

  const actualFields = filter(this.metadata.fields, (field) => parseOptions(field.options).subtype !== 'option');
  const actualAttributes = pick(this.originalAttributes, map(actualFields, 'alias'));

  this.attributes = { ...actualAttributes, ...optionsAttributes };
  this.attributes.options = JSON.stringify(optionsAttributes);

  this.metadata.options = options;
  this.metadata.fields = [ ...(this.metadata.fields || []), ...options ];
}

p.record.declare('initOptions', initOptions);
p.record.record.init();`;

const migrate = (knex) => async (model, table) => {
  await knex(table).where({ name: 'Options: Initialize' }).update({ script: SCRIPT });
}

export const up = (knex) => {
  return onModelExistence(knex, 'ui_rule', migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
