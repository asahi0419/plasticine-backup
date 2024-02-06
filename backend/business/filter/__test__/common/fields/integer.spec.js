const { record, selector } = h;
const { manager } = record;

beforeAll(async () => {
  t.models = {
    self: await manager('model').create(),
    foreign: await manager('model').create(),
  }
  t.fields = {
    self: {
      integer: await manager('field').create({ model: t.models.self.id, type: 'integer' }),
    },
  };

  t.records = {};
  t.records.self = {
    record1: await manager(t.models.self.alias).create({ [t.fields.self.integer.alias]: 1 }),
    record2: await manager(t.models.self.alias).create({ [t.fields.self.integer.alias]: 2 }),
    record3: await manager(t.models.self.alias).create(),
  };
});

describe('Filter: Common cases [Integer]', () => {
  describe('Parent', () => {
    describe('is', () => {
      it("Should return correct result [plain]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.integer.alias} = 1`);

        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(1);
      });
      it("Should return correct result [js:]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.integer.alias} = 'js:'`);

        expect(result.length).toEqual(0);
      });
      it("Should return correct result [js:null]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.integer.alias} = 'js:null'`);

        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(3);
      });
      it("Should return correct result [js:v]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.integer.alias} = 'js:1'`);

        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(1);
      });
    });

    describe('is not', () => {
      it("Should return correct result [plain]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.integer.alias} != 1`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length - 1);
        expect(result[0].id).toEqual(2);
        expect(result[1].id).toEqual(3);
      });
      it("Should return correct result [js:]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.integer.alias} != 'js:'`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length);
      });
      it("Should return correct result [js:null]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.integer.alias} != 'js:null'`);

        expect(result.length).toEqual(2);
        expect(result[0].id).toEqual(1);
        expect(result[1].id).toEqual(2);
      });
      it("Should return correct result [js:v]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.integer.alias} != 'js:1'`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length - 1);
        expect(result[0].id).toEqual(2);
        expect(result[1].id).toEqual(3);
      });
    });

    describe('is empty', () => {
      it("Should return correct result [plain]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.integer.alias} IS NULL`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length - 2);
        expect(result[0].id).toEqual(3);
      });
    });

    describe('is not empty', () => {
      it("Should return correct result [plain]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.integer.alias} IS NOT NULL`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length - 1);
        expect(result[0].id).toEqual(1);
        expect(result[1].id).toEqual(2);
      });
    });

    describe('between', () => {
      it("Should return correct result [plain]", async () => {
        let result;

        result = await selector(t.models.self.alias).fetch(`${t.fields.self.integer.alias} between 1 and 1`);
        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(1);

        result = await selector(t.models.self.alias).fetch(`${t.fields.self.integer.alias} between 1 and 2`);
        expect(result.length).toEqual(2);
        expect(result[0].id).toEqual(1);
        expect(result[1].id).toEqual(2);
      });
      it("Should return correct result [js:]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.integer.alias} between 'js:' and 'js:'`);

        expect(result.length).toEqual(0);
      });
      it("Should return correct result [js:null]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.integer.alias}  between 'js:null' and 'js:null'`);

        expect(result.length).toEqual(0);
      });
      it("Should return correct result [js:v]", async () => {
        let result;

        result = await selector(t.models.self.alias).fetch(`${t.fields.self.integer.alias} between 'js:1' and 'js:1'`);
        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(1);

        result = await selector(t.models.self.alias).fetch(`${t.fields.self.integer.alias} between 'js:1' and 'js:2'`);
        expect(result.length).toEqual(2);
        expect(result[0].id).toEqual(1);
        expect(result[1].id).toEqual(2);
      });
    });

    describe('in', () => {
      it("Should return correct result [plain]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.integer.alias} IN (1)`);

        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(1);
      });
      it("Should return correct result [js:]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.integer.alias} IN 'js:'`);

        expect(result.length).toEqual(0);
      });
      it("Should return correct result [js:null]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.integer.alias} IN 'js:null'`);

        expect(result.length).toEqual(0);
      });
      it("Should return correct result [js:[null]]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.integer.alias} IN 'js:[null]'`);

        expect(result.length).toEqual(0);
      });
      it("Should return correct result [js:v]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.integer.alias} IN 'js:1'`);

        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(1);
      });
    });

    describe('not in', () => {
      it("Should return correct result [plain]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.integer.alias} NOT IN (1)`);

        expect(result.length).toEqual(2);
      });
      it("Should return correct result [js:]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.integer.alias} NOT IN 'js:'`);

        expect(result.length).toEqual(0);
      });
      it("Should return correct result [js:null]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.integer.alias} NOT IN 'js:null'`);

        expect(result.length).toEqual(0);
      });
      it("Should return correct result [js:[null]]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.integer.alias} NOT IN 'js:[null]'`);

        expect(result.length).toEqual(0);
      });
      it("Should return correct result [js:v]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.integer.alias} NOT IN 'js:1'`);

        expect(result.length).toEqual(2);
      });
    });
  });
});
