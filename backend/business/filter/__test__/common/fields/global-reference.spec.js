const { record, selector } = h;
const { manager } = record;

beforeAll(async () => {
  t.models = {
    self: await manager('model').create(),
    foreign: await manager('model').create(),
  }
  t.fields = {
    self: {
      grc: await manager('field').create({ model: t.models.self.id, type: 'global_reference', options: JSON.stringify({ references: [{ model: t.models.foreign.alias, view: 'default', label: 'id' }] }) }),
    },
  };

  t.records = {};
  t.records.self = {
    record1: await manager(t.models.self.alias).create({ [t.fields.self.grc.alias]: { model: t.models.foreign.id, id: 1 } }),
    record2: await manager(t.models.self.alias).create(),
  };
});

describe('Filter: Common cases [Global reference]', () => {
  describe('is', () => {
    it("Should return correct result [plain]", async () => {
      const result = await selector(t.models.self.alias).fetch(`${t.fields.self.grc.alias} = '${t.models.foreign.id}/1'`);
      const expected = await selector(t.models.self.alias).fetch();

      expect(result.length).toEqual(1);
      expect(result[0].id).toEqual(1);
    });
    it("Should return correct result [js:v]", async () => {
      const result = await selector(t.models.self.alias).fetch(`${t.fields.self.grc.alias} = 'js:{ model: ${t.models.foreign.id}, id: 1 }'`);
      const expected = await selector(t.models.self.alias).fetch();

      expect(result.length).toEqual(1);
      expect(result[0].id).toEqual(1);
    });
    it("Should return correct result [js:]", async () => {
      const result = await selector(t.models.self.alias).fetch(`${t.fields.self.grc.alias} = 'js:'`);

      expect(result.length).toEqual(0);
    });
    it("Should return correct result [js:null]", async () => {
      const result = await selector(t.models.self.alias).fetch(`${t.fields.self.grc.alias} = 'js:null'`);

      expect(result.length).toEqual(1);
      expect(result[0].id).toEqual(2);
    });
  });

  describe('is not', () => {
    it("Should return correct result [plain]", async () => {
      const result = await selector(t.models.self.alias).fetch(`${t.fields.self.grc.alias} != '${t.models.foreign.id}/1'`);
      const expected = await selector(t.models.self.alias).fetch();

      expect(result.length).toEqual(1);
      expect(result[0].id).toEqual(2);
    });
    it("Should return correct result [js:v]", async () => {
      const result = await selector(t.models.self.alias).fetch(`${t.fields.self.grc.alias} != 'js:{ model: ${t.models.foreign.id}, id: 1 }'`);
      const expected = await selector(t.models.self.alias).fetch();

      expect(result.length).toEqual(1);
      expect(result[0].id).toEqual(2);
    });
    it("Should return correct result [js:]", async () => {
      const result = await selector(t.models.self.alias).fetch(`${t.fields.self.grc.alias} != 'js:'`);

      expect(result.length).toEqual(2);
    });
    it("Should return correct result [js:null]", async () => {
      const result = await selector(t.models.self.alias).fetch(`${t.fields.self.grc.alias} != 'js:null'`);

      expect(result.length).toEqual(1);
      expect(result[0].id).toEqual(1);
    });
  });
});
