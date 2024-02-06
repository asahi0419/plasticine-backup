import { each, values } from 'lodash-es';

const { record, selector } = h;
const { manager } = record;

beforeAll(async () => {
  t.models = {
    self: await manager('model').create(),
    foreign: await manager('model').create(),
  }
  t.fields = {
    self: {
      string: await manager('field').create({ model: t.models.self.id, type: 'string' }),
    },
  };

  t.records = {};
  t.records.self = {
    record1: await manager(t.models.self.alias).create({ [t.fields.self.string.alias]: null }),
    record2: await manager(t.models.self.alias).create({ [t.fields.self.string.alias]: '' }),
    record3: await manager(t.models.self.alias).create({ [t.fields.self.string.alias]: '   ' }),
    record4: await manager(t.models.self.alias).create({ [t.fields.self.string.alias]: 'abc' }),
    record5: await manager(t.models.self.alias).create({ [t.fields.self.string.alias]: 'ABC' }),
    record6: await manager(t.models.self.alias).create({ [t.fields.self.string.alias]: 'abcd' }),
    record7: await manager(t.models.self.alias).create({ [t.fields.self.string.alias]: 'aba' }),
    record8: await manager(t.models.self.alias).create({ [t.fields.self.string.alias]: "'quoted'" }),
    record9: await manager(t.models.self.alias).create({ [t.fields.self.string.alias]: "\\sq'" }),
  };
  t.records.foreign = {
    record1: await manager(t.models.foreign.alias).create(),
    record2: await manager(t.models.foreign.alias).create({ created_by: 2 }),
  };
});

describe('Filter: Common cases [String]', () => {
  describe('Exceptions', () => {
    describe('contains', () => {
      it("Should return records with slash and quoted value", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.string.alias} LIKE '%\\\\sq\\'%'`);

        expect(result.length).toEqual(1);
        expect(result[0][t.fields.self.string.alias]).toEqual("\\sq'");
      });
    });
    describe('starts with', () => {
      it("Should return records with slash and quoted value", async () => {
        const filter = `${t.fields.self.string.alias} LIKE '\\\\sq%'`;
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.string.alias} LIKE '\\\\sq%'`);

        expect(result.length).toEqual(1);
        expect(result[0][t.fields.self.string.alias]).toEqual("\\sq'");
      });
    });
  });

  describe('Parent', () => {
    describe('is', () => {
      it("Should return correct result [plain]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.string.alias} = 'abc'`);

        expect(result.length).toEqual(1);
        expect(result[0][t.fields.self.string.alias]).toEqual("abc");
      });
      it("Should return correct result [js:]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.string.alias} = 'js:'`);

        expect(result.length).toEqual(0);
      });
      it("Should return correct result [js:null]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.string.alias} = 'js:null'`);

        expect(result.length).toEqual(2);
        expect(result[0].id).toEqual(1);
        expect(result[1].id).toEqual(2);
      });
      it("Should return correct result [js:v]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.string.alias} = 'js:"abc"'`);

        expect(result.length).toEqual(1);
        expect(result[0][t.fields.self.string.alias]).toEqual("abc");
      });
    });

    describe('is not', () => {
      it("Should return correct result [plain]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.string.alias} != 'abc'`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length - 1);
      });
      it("Should return correct result [js:]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.string.alias} != 'js:'`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length);
      });
      it("Should return correct result [js:null]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.string.alias} != 'js:null'`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length - 2);
      });
      it("Should return correct result [js:v]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.string.alias} != 'js:"abc"'`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length - 1);
      });
    });

    describe('contains', () => {
      it("Should return records with quoted value", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.string.alias} LIKE '%\\'quoted\\'%'`);

        expect(result.length).toEqual(1);
        expect(result[0][t.fields.self.string.alias]).toEqual("'quoted'");
      });
      it("Should return all records ['']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.string.alias} LIKE '%%'`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length);
      });
      it("Should return records with value ['   ']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.string.alias} LIKE '%   %'`);

        expect(result.length).toEqual(1);
      });
    });

    describe('does not contain', () => {
      it("Should return records except with quoted value", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.string.alias} NOT LIKE '%\\'quoted\\'%'`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length - 1);
        each(result, (r) => expect(r[t.fields.self.string.alias]).not.toEqual("'qouted'"));
      });
      it("Should return all records ['']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.string.alias} NOT LIKE '%%'`);

        expect(result.length).toEqual(0);
      });
      it("Should return records with value ['   ']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.string.alias} NOT LIKE '%   %'`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length - 1);
      });
      it("Should return records with value (case insensitive) ['abc']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.string.alias} NOT LIKE '%abc%'`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length - 3);
      });
    });
  });

  describe('Child', () => {
    describe('contains', () => {
      it("Should return correct result", async () => {
        const result = await selector(t.models.foreign.alias).fetch(`created_by.name LIKE '%System%'`);

        expect(result.length).toEqual(values(t.records.foreign).length - 1);
      });
    });
  });
});
