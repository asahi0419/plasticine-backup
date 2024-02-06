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

describe('Filter: Common cases [Primary key]', () => {
  describe('is', () => {
    it("Should return correct result [plain]", async () => {
      const result = await selector(t.models.self.alias).fetch(`id = 1`);

      expect(result.length).toEqual(1);
      expect(result[0].id).toEqual(1);
    });
    it("Should return correct result [js:]", async () => {
      const result = await selector(t.models.self.alias).fetch(`id = 'js:'`);

      expect(result.length).toEqual(0);
    });
    it("Should return correct result [js:null]", async () => {
      const result = await selector(t.models.self.alias).fetch(`id = 'js:null'`);

      expect(result.length).toEqual(0);
    });
  });

  describe('is not', () => {
    it("Should return correct result [plain]", async () => {
      const result = await selector(t.models.self.alias).fetch(`id != 1`);
      const expected = await selector(t.models.self.alias).fetch();

      expect(result.length).toEqual(expected.length - 1);
    });
    it("Should return correct result [js:]", async () => {
      const result = await selector(t.models.self.alias).fetch(`id != 'js:'`);
      const expected = await selector(t.models.self.alias).fetch();

      expect(result.length).toEqual(expected.length);
    });
    it("Should return correct result [js:null]", async () => {
      const result = await selector(t.models.self.alias).fetch(`id != 'js:null'`);
      const expected = await selector(t.models.self.alias).fetch();

      expect(result.length).toEqual(expected.length);
    });
  });

  describe('contains', () => {
    it("Should return correct results for string values", async () => {
      let result;

      result = await selector(t.models.self.alias).fetch(`id LIKE '%1string%'`);
      expect(result.length).toEqual(1);
      expect(result[0].id).toEqual(1);

      result = await selector(t.models.self.alias).fetch(`id LIKE '%string1%'`);
      expect(result.length).toEqual(1);
      expect(result[0].id).toEqual(1);

      result = await selector(t.models.self.alias).fetch(`id LIKE '%string%'`);
      expect(result.length).toEqual(0);
    });
  });
});
