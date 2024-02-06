import lodash from 'lodash-es';
import { default as schemaInspectorImport } from 'knex-schema-inspector';

import cache from '../../../presentation/shared/cache/index.js';
import { getClient } from '../index.js';
import { isPlainObject } from '../../../business/helpers/index.js';
import { ModelNotFoundError } from '../../../business/error/index.js';
import Schema from '../schema/index.js';
import TableBuilder from './builder/table.js';
import ModelBuilder from './builder/model.js';

export default class ORM {
  constructor(client) {
    this.client = client;
    this.schema = new Schema(this.client);
    this.inspector = (schemaInspectorImport.default || schemaInspectorImport)(client);
  }

  table(tableName) {
    return new TableBuilder(tableName, this.client);
  }

  model(input, sandbox = null) {
    const client = (sandbox && sandbox.trx && getClient(sandbox.trx)) || this.client;
    const model = this.getModel(input);

    return new ModelBuilder(model, sandbox, client);
  }

  isModelExists(input) {
    return !!this.getModel(input, { silent: true });
  }

  async getColumns(model) {
    const { tableName } = this.model(model);
    return this.inspector.columnInfo(tableName);
  }

  getFieldsAliases(model) {
    const fields = this.getFields({ model: this.getModel(model).id })
    const fieldsActual = lodash.filter(fields, (f) => {
      return !f.virtual && !this.schema.VIRTUAL_FIELDS.includes(f.type)
    })
    return lodash.map(fieldsActual, 'alias')
  }

  getCache(target, params) {
    return cache.namespaces.core.get(target, params);
  }

  getModel(input, params = {}) {
    const model = this.getCache('models', {
      find: lodash.isNumber(Number(input)) || isPlainObject(input) ? input : { alias: input }
    });

    if (model) return model;
    if (['model', 1].includes(input)) return { id: 1, type: 'core' }
    if (isPlainObject(input)) return input;
    if (params.silent) return;

    throw new ModelNotFoundError(`Invalid input - ${JSON.stringify(input)}`);
  }

  getModels(input) {
    return this.getCache('models', { filter: input, uniqBy: 'id' });
  }

  getField(input) {
    return this.getCache('fields', { find: input });
  }

  getFields(input) {
    return this.getCache('fields', { filter: input });
  }

  getCoreLock(input) {
    return this.getCache('core_locks', { find: input });
  }

  getCoreLocks(input) {
    return this.getCache('core_locks', { filter: input });
  }

  selectFromSubquery(query) {
    return this.client.select('*').from(query.__buildKnexQuery());
  }
}
