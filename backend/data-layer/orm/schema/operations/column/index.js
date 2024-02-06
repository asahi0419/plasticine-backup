import { parseOptions } from '../../../../../business/helpers/index.js';

import db from '../../../index.js';
import createColumn from './create.js';
import { createIndex, updateIndex } from './indexing.js';

function equalKeyInOptions(oldOptions, newOptions, key) {
  return JSON.stringify(parseOptions(oldOptions)[key]) === JSON.stringify(parseOptions(newOptions)[key]);
}

export default class ColumnOperation {
  constructor(connection) {
    this.connection = connection;
  }

  async create(field) {
    if (field.virtual) return;

    const schema = this.connection.schema;
    const tableName = db.model(field.model).tableName;

    if (await schema.hasColumn(tableName, field.alias)) return;

    return schema.table(tableName, (table) => {
      createColumn(table, field);

      if (field.index) createIndex(table, field);
    });
  }

  async update(oldField, newField) {
    if (newField.virtual) return;

    const schema = this.connection.schema;
    const tableName = db.model(newField.model).tableName;

    if (newField.type === 'string' && !equalKeyInOptions(oldField.options, newField.options, 'length')) {
      const { length = 255 } = parseOptions(newField.options);

      const newType = (length <= 255) && (length != 'unlimited') ? `varchar(${length})` : 'text';

      await schema.raw(`ALTER TABLE "${tableName}" ALTER COLUMN "${oldField.alias}" TYPE ${newType}`);
    }

    if (newField.type === 'boolean') {
      const options = parseOptions(newField.options);

      await db.client.setBooleanDefault(tableName, oldField.alias, options.default);
    }

    return schema.table(tableName, (table) => {
      if (oldField.alias && oldField.alias !== newField.alias) {
        table.renameColumn(oldField.alias, newField.alias);
      }

      if (oldField.index !== newField.index ||
          oldField.alias !== newField.alias ||
          !equalKeyInOptions(oldField.options, newField.options, 'composite_index')) {
        updateIndex(table, oldField, newField);
      }
    });
  }

  async delete(field) {
    if (field.virtual) return;

    const schema = this.connection.schema;
    const tableName = db.model(field.model).tableName;

    if (!await schema.hasColumn(tableName, field.alias)) return;

    return schema.table(tableName, table => table.dropColumn(field.alias));
  }
}
