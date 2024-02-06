import Promise from 'bluebird';
import { keys, values, assign, reduce, map, uniq, difference, differenceBy } from 'lodash-es';

import db from '../data-layer/orm/index.js';
import cache from '../presentation/shared/cache/index.js';

class Cleaner {
  async init() {
    this.records = await this.getRecords();
    this.tables = await db.client.getTableNames();
    this.originalDB = reduce({
      model: db.model,
      getModel: db.getModel,
    }, (result, value, key) => ({ ...result, [key]: value }), {});
  }

  async clear() {
    assign(db, this.originalDB);

    const records = await this.getRecords();
    const tables = await db.client.getTableNames();

    const newRecords = reduce(records, (result, curr, key) => {
      const prev = this.records[key];
      result[key] = result[key] || [];
      result[key] = differenceBy(curr, prev, 'id');
      return result;
    }, {});

    const newTables = difference(tables, this.tables);

    await this.removeRecords(newRecords);
    await this.removeTables(newTables);
  }

  getRecords() {
    return Promise.reduce(uniq(values(cache.namespaces.core.models)), async (result, { alias }) => {
      try {
        result[alias] = await db.model(alias).select('id');
        return result;
      } catch (error) {
        console.log(error);
      } finally {
        return result;
      }
    }, {});
  }

  removeRecords(records) {
    return Promise.each(keys(records), (alias) =>
      db.model(alias).whereIn('id', map(records[alias], 'id')).delete());
  }

  removeTables(tables) {
    return Promise.each(tables, (table) => db.client.raw(`DROP TABLE ${table}`));
  }
}

export default new Cleaner();
