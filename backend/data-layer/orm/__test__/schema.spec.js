describe('Data Layer', () => {
  describe('ORM', () => {
    describe('Schema', () => {
      describe('table', () => {
        describe('create', () => {
          it('Should create table', async () => {
            const model = { alias: 'test_model' };
            await db.schema.table.create(model);

            const tableName = db.model(model).tableName;
            const hasTable = await db.schema.table.connection.schema.hasTable(tableName);

            expect(hasTable).toEqual(true);
          });

          it('Should create primary table columns', async () => {
            const model = { alias: 'test_model' };
            await db.schema.table.create(model);

            const tableName = db.model(model).tableName;

            const hasColumnInserted = await db.schema.table.connection.schema.hasColumn(tableName, '__inserted');
            expect(hasColumnInserted).toEqual(true);
            const hasColumnHash = await db.schema.table.connection.schema.hasColumn(tableName, '__hash');
            expect(hasColumnHash).toEqual(true);
          });
        });
      });
    });
  });
})
