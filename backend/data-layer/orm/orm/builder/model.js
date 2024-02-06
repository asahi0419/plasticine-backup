import { isBoolean } from 'lodash-es';

import cache from '../../../../presentation/shared/cache/index.js';
import TableBuilder from './table.js';
import Flags from '../../../../business/record/flags.js';
import Selector from '../../../../business/record/fetcher/selector.js';
import { createManager } from '../../../../business/record/manager/factory.js';

export default class QueryBuilder extends TableBuilder {
  constructor(model, sandbox, client) {
    super();

    this.model = model;
    this.tableName = client.tableResolver.resolve(this.model)
    this.sandbox = sandbox;
    this.client = client;

    if (cache.namespaces.core.ready) {
      const fields = cache.namespaces.core.get('fields:model')
      this.fields = fields[model.id]
    }
  }

  clone() {
    return this.__cloneBuilder(new QueryBuilder(this.model, this.sandbox, this.client));
  }

  get(fieldAlias) {
    return this.model && this.model[fieldAlias];
  }

  async fetchRecords(filter) {
    const selector = this.getSelector();
    return selector.fetch(filter);
  }

  async buildRecord(params = {}, safetyOrFlags = true, persistent = false) {
    const { managerSafety, flags } = extractSafetyAndFlags(safetyOrFlags);
    return (await this.getManager(managerSafety)).build(params, persistent);
  }

  async createRecord(params, safetyOrFlags = true) {
    const { managerSafety, flags } = extractSafetyAndFlags(safetyOrFlags);
    return (await this.getManager(managerSafety)).create(params, flags);
  }

  async updateRecord(record, params, safetyOrFlags = true) {
    const { managerSafety, flags } = extractSafetyAndFlags(safetyOrFlags);
    return (await this.getManager(managerSafety)).update(record, params, flags);
  }

  async destroyRecord(record, safetyOrFlags = true) {
    const { managerSafety, flags } = extractSafetyAndFlags(safetyOrFlags);
    return (await this.getManager(managerSafety)).destroy(record, flags);
  }

  async getManager(safety = true) {
    if (!this.sandbox) throw new Error('Sandbox must be provided');
    const result = await createManager(this.model, this.sandbox, safety);

    return result;
  }

  getSelector() {
    if (!this.sandbox) throw new Error('Sandbox must be provided');
    return new Selector(this.model, this.sandbox);
  }
}

function extractSafetyAndFlags(safetyOrFlags) {
  if (isBoolean(safetyOrFlags)) {
    return { managerSafety: safetyOrFlags, flags: Flags.default() };
  } else if (safetyOrFlags && safetyOrFlags.constructor.name === 'Flags') {
    return { managerSafety: true, flags: safetyOrFlags };
  } else {
    return { managerSafety: true, flags: Flags.default() };
  }
}
