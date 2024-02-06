import db from '../../index.js';

export default class TableOperation {
  constructor(connection) {
    this.connection = connection;
  }

  async create(model) {
    const schema = this.connection.schema;
    const tableName = db.model(model).tableName;

    if (await schema.hasTable(tableName)) return;

    return schema.createTable(tableName, (table) => {
      table.boolean('__inserted').defaultTo(true);
      table.index(['__inserted']);
      table.string('__hash', 32);
      table.index(['__hash']);
    });
  }

  delete(model) {
    const tableName = db.model(model).tableName;
    return this.connection.schema.dropTableIfExists(tableName, () => {});
  }
}
