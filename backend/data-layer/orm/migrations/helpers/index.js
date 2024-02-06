import fs from 'fs';
import path from 'path';
import Promise from 'bluebird';
import { values, compact, cloneDeep, map, find, omit } from 'lodash-es';

import getTableName from './table-name.js';
import Templates from '../../../../business/model/templates.js'

const modelTableName = getTableName({ id: 1, type: 'core' });

export const onModelExistence = async (knex, alias, callback) => {
  const model = await getModel(knex, { alias });
  if (model) await callback(model, getTableName({ id: model.id, type: 'core' }));
}

export const onModelsExistence = async (knex, aliases, callback) => {
  const models = await Promise.reduce(aliases, async (result, alias) => {
    return { ...result, [alias]: await getModel(knex, { alias }) }
  }, {});

  if (aliases.length !== compact(values(models)).length) {
    if (+process.env.DEBUG) {
      console.log('\x1b[31m%s\x1b[0m', `[DB - Migrate] Some model does not exist`);
      console.log(`Checked: ${aliases.join(', ')}`);
      console.log(`Existed: ${map(models, 'alias').join(', ')}`);
    }

    return;
  }

  await callback(models);
}

export const getModel = async (knex, attributes) => {
  const [ model ] = await knex(modelTableName).where(attributes).limit(1);
  return model;
};

export const getModelTableName = async (knex, alias) => {
  const [ model ] = await knex(modelTableName).where({ alias }).limit(1);
  return getTableName({ id: model.id, type: 'core' }) ||
         getTableName({ id: model.id, type: 'custom' }) ||
         getTableName({ id: model.id, type: 'plugin' });
};

export const getRecord = async (knex, modelAlias, attributes) => {
  const model = await getModel(knex, { alias: modelAlias });
  if (!model) return;

  const modelTableName = getTableName({ id: model.id, type: 'core' });
  const [ record ] = await knex(modelTableName).where(attributes).limit(1);

  return record;
}

export const getRecords = async (knex, modelAlias, attributes = {}) => {
  const model = await getModel(knex, { alias: modelAlias });
  if (!model) return;

  const modelTableName = getTableName({ id: model.id, type: 'core' });
  return knex(modelTableName).where(attributes);
}

export const createRecord = async (knex, modelAlias, attributes) => {
  const model = await getModel(knex, { alias: modelAlias });
  if (!model) return;

  const a = await getRecord(knex, 'account', { email: process.env.APP_ADMIN_USER });
  const u = a ? await getRecord(knex, 'user', { account: a.id }) : { id: 1 };

  const [ record ] = await knex(getTableName({ id: model.id, type: 'core' })).insert({
    ...omit(attributes, ['__lock']),
    created_at: new Date(),
    created_by: u.id,
  }, ['id']);

  if (attributes.__lock) {
    await Promise.each(attributes.__lock, async (action) => {
      await createRecord(knex, 'core_lock', {
        [action]: true,
        model: model.id,
        record_id: record.id,
      });
    });
  }

  return record;
}

export const updateRecord = async (knex, modelAlias, whereClause, attributes) => {
  const model = await getModel(knex, { alias: modelAlias });
  if (!model) return;

  const modelTableName = getTableName({ id: model.id, type: 'core' });
  await knex(modelTableName).where(whereClause).update(attributes);
}

export const deleteRecord = async (knex, modelAlias, whereClause) => {
  const model = await getModel(knex, { alias: modelAlias });
  if (!model) return;

  const modelTableName = getTableName({ id: model.id, type: 'core' });
  await knex(modelTableName).where(whereClause).delete();
}

export const findSeed = async (query) => {
  const seeds = await new Promise((resolve) => {
    const dir = path.resolve(process.cwd(), 'data-layer/orm/seeds');

    fs.readdir(dir, async (_, data) => {
      const files = data.filter((path) => path.endsWith('.js'));
      const result = await Promise.map(files, async (file) => {
        const content = (await import(path.join(dir, file))).default;
        return cloneDeep(content)
      });

      resolve(result);
    });
  });

  return find(seeds, query);
}

export const findTemplate = async (alias) => {
  return Templates[alias]
}
