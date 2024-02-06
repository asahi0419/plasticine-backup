/* eslint-disable */

import getTableName from './helpers/table-name.js';
import { parseOptions } from '../../../business/helpers/index.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });
const fieldsTableName = getTableName({ id: 2, type: 'core' });

export const up = async (knex) => {
  await updateFormat('filter', 'query', knex, {}, convertFilterFormat);
  await updateFormat('permission', 'script', knex, { action: 'query' }, convertFilterFormat);
  await updateFormat('appearance', 'options', knex, { type: 'grid' }, convertAppearanceOptions);
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};

async function updateFormat(sourceModelAlias, sourceFieldAlias, knex, conditions = {}, converter) {
  const [sourceModel] = await knex(modelsTableName).where({ alias: sourceModelAlias }).limit(1);
  if (!sourceModel) return;

  const fields = await knex(fieldsTableName).select('model', 'alias');
  const fieldsMap = fields.reduce((result, field) => {
    if (!result[field.model]) result[field.model] = [];
    result[field.model].push(field.alias);
    return result;
  }, {});

  const records = await knex(getTableName(sourceModel)).where(conditions);

  let promise = Promise.resolve();

  records.forEach((record) => {
    if (record[sourceFieldAlias]) {
      promise = promise.then(() => knex(getTableName(sourceModel))
        .where({ id: record.id })
        .update({ [sourceFieldAlias]: converter(record[sourceFieldAlias], fieldsMap[record.model]) })
      );
    }
  });

  return promise;
}

function convertFilterFormat(query, modelFieldsAliases) {
  if (!query) return query;

  let newQuery = query;

  ['=', '!=', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL', 'LIKE', '<', '>', '<=', '>='].forEach((operator) => {
    modelFieldsAliases.forEach((fieldAlias) => {
      newQuery = newQuery.replace(`${fieldAlias} ${operator}`, `\`${fieldAlias}\` ${operator}`);
    });
  });

  return newQuery;
}

function convertAppearanceOptions(optionsJSON, modelFieldsAliases) {
  const options = parseOptions(optionsJSON);

  options.rules.forEach((rule) => {
    rule.query = convertFilterFormat(rule.query, modelFieldsAliases);
  });

  return JSON.stringify(options);
}
