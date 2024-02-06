import { values } from 'lodash-es';

const { record, selector } = h;
const { manager } = record;

beforeAll(async () => {
  t.models = {
    self: await manager('model').create(),
    foreign: await manager('model').create(),
  }
  t.fields = {
    self: {
      reference: await manager('field').create({ model: t.models.self.id, type: 'reference', options: JSON.stringify({ foreign_model: t.models.foreign.alias, view: 'default', foreign_label: 'id' }) }),
    },
    foreign: {
      datetime: await manager('field').create({ model: t.models.foreign.id, type: 'datetime' }),
    },
  };

  t.records = {};
  t.records.foreign = {
    record1: await manager(t.models.foreign.alias).create(),
    record2: await manager(t.models.foreign.alias).create({ created_by: 2 }),
  };
  t.records.self = {
    record1: await manager(t.models.self.alias).create({ [t.fields.self.reference.alias]: t.records.foreign.record1.id }),
    record2: await manager(t.models.self.alias).create({ [t.fields.self.reference.alias]: t.records.foreign.record2.id }),
    record3: await manager(t.models.self.alias).create(),
  };
});

describe('Filter: Common cases [Reference]', () => {
  describe('Parent', () => {
    describe('is', () => {
      it("Should return correct result [plain]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias} = 1`);

        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(1);
      });
      it("Should return correct result [js:]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias} = 'js:'`);

        expect(result.length).toEqual(0);
      });
      it("Should return correct result [js:null]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias} = 'js:null'`);

        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(3);
      });
      it("Should return correct result [js:v]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias} = 'js:1'`);

        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(1);
      });
    });

    describe('is not', () => {
      it("Should return correct result [plain]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias} != 1`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length - 1);
        expect(result[0].id).toEqual(2);
        expect(result[1].id).toEqual(3);
      });
      it("Should return correct result [js:]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias} != 'js:'`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length);
      });
      it("Should return correct result [js:null]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias} != 'js:null'`);

        expect(result.length).toEqual(2);
        expect(result[0].id).toEqual(1);
        expect(result[1].id).toEqual(2);
      });
      it("Should return correct result [js:v]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias} != 'js:1'`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length - 1);
        expect(result[0].id).toEqual(2);
        expect(result[1].id).toEqual(3);
      });
    });

    describe('contains', () => {
      it("Should return correct result", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias} NOT IN (1)`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length - 1);
      });
    });
  });
  describe('Child', () => {
    describe('is', () => {
      it("Should return correct result", async () => {
        const result = await selector(t.models.foreign.alias).fetch(`created_by.created_by = 1`);

        expect(result.length).toEqual(values(t.records.foreign).length);
      });
    });
  });
});
