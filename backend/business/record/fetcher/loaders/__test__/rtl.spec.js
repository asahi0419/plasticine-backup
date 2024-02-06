import loadRTLs from '../rtl.js';

const { manager } = h.record;

beforeAll(async () => {
  t.models = {
    self: await manager('model').create(),
    foreign: await manager('model').create(),
  };
  t.fields = {
    rtl: await manager('field').create({
      type: 'reference_to_list',
      model: t.models.self.id,
      options: JSON.stringify({
        foreign_model: t.models.foreign.alias,
        foreign_label: 'id',
      }),
    }),
  };
});

describe('Record: Fetcher', () => {
  describe('loaders - loadRTLs', () => {
    it('Should enrich records with rtl values', async () => {
      const foreignRecord1 = await manager(t.models.foreign.alias).create();
      const foreignRecord2 = await manager(t.models.foreign.alias).create();

      const alias = t.fields.rtl.alias;
      const value = [1, 2];

      const { id } = await manager(t.models.self.alias).create({ [alias]: value });
      const record = await db.model(t.models.self.alias).where({ id }).getOne();
      expect(record[alias]).not.toBeDefined();

      const { records } = await loadRTLs([record], t.models.self, { sandbox, fieldset: `${alias}` });
      expect(records[0][alias]).toEqual(value);
    });
  });
});
