const { record, selector } = h;
const { manager } = record;

beforeAll(async () => {
  t.models = {
    self: await manager('model').create(),
  }

  t.records = {};
  t.records.self = {
    record1: await manager(t.models.self.alias).create(),
    record2: await manager(t.models.self.alias).create(),
  };
});

describe('Filter: Common cases [True stub]', () => {
  describe('is', () => {
    it("Should return correct result [js:]", async () => {
      const result = await selector(t.models.self.alias).fetch(`TRUE = 'js:'`);

      expect(result.length).toEqual(0);
    });
    it("Should return correct result [js:null]", async () => {
      const result = await selector(t.models.self.alias).fetch(`TRUE = 'js:null'`);

      expect(result.length).toEqual(0);
    });
    it("Should return correct result [js:true]", async () => {
      const result = await selector(t.models.self.alias).fetch(`TRUE = 'js:true'`);

      expect(result.length).toEqual(2);
    });
    it("Should return correct result [js:false]", async () => {
      const result = await selector(t.models.self.alias).fetch(`TRUE = 'js:false'`);

      expect(result.length).toEqual(0);
    });
    it("Should return correct result [js + v]", async () => {
      const result = await selector(t.models.self.alias).fetch(`TRUE = 'js:true' AND id = 1`);

      expect(result.length).toEqual(1);
      expect(result[0].id).toEqual(1);
    });
    it("Should return correct result [v + js]", async () => {
      const result = await selector(t.models.self.alias).fetch(`id = 1 AND TRUE = 'js:true'`);

      expect(result.length).toEqual(1);
      expect(result[0].id).toEqual(1);
    });
  });
});
