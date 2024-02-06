import { map } from 'lodash-es';

const { record, selector } = h;
const { manager } = record;

beforeAll(async () => {
  t.models = {
    self: await manager('model').create(),
    foreign1: await manager('model').create(),
    foreign2: await manager('model').create(),
  }
  t.fields = {
    self: {
      rtl1: await manager('field').create({ model: t.models.self.id, type: 'reference_to_list', options: JSON.stringify({ foreign_model: t.models.foreign1.alias, foreign_label: 'id' }) }),
      rtl2: await manager('field').create({ model: t.models.self.id, type: 'reference_to_list', options: JSON.stringify({ foreign_model: t.models.foreign2.alias, foreign_label: 'id' }) }),
    },
  };

  t.records = {};
  t.records.foreign1 = {
    record1: await manager(t.models.foreign1.alias).create(),
    record2: await manager(t.models.foreign1.alias).create({ created_by: 2 }),
    record3: await manager(t.models.foreign1.alias).create(),
    record4: await manager(t.models.foreign1.alias).create(),
  };
  t.records.foreign2 = {
    record1: await manager(t.models.foreign2.alias).create(),
  };
  t.records.self = {
    record1: await manager(t.models.self.alias).create({ [t.fields.self.rtl1.alias]: [t.records.foreign1.record1.id], [t.fields.self.rtl2.alias]: [t.records.foreign2.record1.id] }),
    record2: await manager(t.models.self.alias).create({ [t.fields.self.rtl1.alias]: [t.records.foreign1.record1.id, t.records.foreign1.record2.id] }),
    record3: await manager(t.models.self.alias).create({ [t.fields.self.rtl1.alias]: [t.records.foreign1.record1.id, t.records.foreign1.record2.id, t.records.foreign1.record3.id] }),
    record4: await manager(t.models.self.alias).create({ [t.fields.self.rtl1.alias]: [t.records.foreign1.record2.id, t.records.foreign1.record3.id, t.records.foreign1.record4.id] }),
  };
});

describe('Filter: Common cases [Reference to list]', () => {
  describe('Parent', () => {
    describe('is', () => {
      it("Should return correct result", async () => {
        let result = await selector(t.models.self.alias).fetch(`${t.fields.self.rtl1.alias} = '1'`);
        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(t.records.self.record1.id);

        result = await selector(t.models.self.alias).fetch(`${t.fields.self.rtl1.alias} = '1,2'`);
        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(t.records.self.record2.id);

        result = await selector(t.models.self.alias).fetch(`${t.fields.self.rtl1.alias} = '2,1'`);
        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(t.records.self.record2.id);
      });

      it("Should return correct result (js:)", async () => {
        let result = await selector(t.models.self.alias).fetch(`${t.fields.self.rtl1.alias} = 'js:'`);
        expect(result.length).toEqual(0);
      });

      it("Should return correct result (js:null)", async () => {
        let result = await selector(t.models.self.alias).fetch(`${t.fields.self.rtl1.alias} = 'js:null'`);
        expect(result.length).toEqual(0);
      });

      it("Should return correct result (js:true)", async () => {
        let result = await selector(t.models.self.alias).fetch(`${t.fields.self.rtl1.alias} = 'js:true'`);
        expect(result.length).toEqual(0);
      });

      it("Should return correct result (js:false)", async () => {
        let result = await selector(t.models.self.alias).fetch(`${t.fields.self.rtl1.alias} = 'js:false'`);
        expect(result.length).toEqual(0);
      });

      it("Should return correct result (js:[null])", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.rtl1.alias} = 'js:[null]'`);
        expect(result.length).toEqual(0);
      });
    });

    describe('is not', () => {
      it("Should return correct result", async () => {
        const all = await selector(t.models.self.alias).fetch();

        let result = await selector(t.models.self.alias).fetch(`${t.fields.self.rtl1.alias} != '1'`);
        expect(result.length).toEqual(all.length - 1);
        result = await selector(t.models.self.alias).fetch(`${t.fields.self.rtl1.alias} != '1,2'`);
        expect(result.length).toEqual(all.length - 1);
        result = await selector(t.models.self.alias).fetch(`${t.fields.self.rtl1.alias} != '2,1'`);
        expect(result.length).toEqual(all.length - 1);
      });

      it("Should return correct result (js:)", async () => {
        const all = await selector(t.models.self.alias).fetch();
        let result = await selector(t.models.self.alias).fetch(`${t.fields.self.rtl1.alias} != 'js:'`);
        expect(result.length).toEqual(all.length);
      });

      it("Should return correct result (js:null)", async () => {
        const all = await selector(t.models.self.alias).fetch();
        let result = await selector(t.models.self.alias).fetch(`${t.fields.self.rtl1.alias} != 'js:null'`);
        expect(result.length).toEqual(all.length);
      });

      it("Should return correct result (js:true)", async () => {
        const all = await selector(t.models.self.alias).fetch();
        let result = await selector(t.models.self.alias).fetch(`${t.fields.self.rtl1.alias} != 'js:true'`);
        expect(result.length).toEqual(all.length);
      });

      it("Should return correct result (js:false)", async () => {
        const all = await selector(t.models.self.alias).fetch();
        let result = await selector(t.models.self.alias).fetch(`${t.fields.self.rtl1.alias} != 'js:false'`);
        expect(result.length).toEqual(all.length);
      });

      it("Should return correct result (js:[null])", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.rtl1.alias} != 'js:[null]'`);
        expect(result.length).toEqual(0);
      });
    });

    describe('is empty', () => {
      it("Should return correct result", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.rtl1.alias} IS NULL`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length - 4);
      });
    });

    describe('is not empty', () => {
      it("Should return correct result", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.rtl1.alias} IS NOT NULL`);

        expect(result.length).toEqual(4);
      });
    });

    describe('contains one of', () => {
      it("Should return correct result", async () => {
        let result = await selector(t.models.self.alias).fetch(`${t.fields.self.rtl1.alias} IN (1,2)`);
        expect(result.length).toEqual(4);

        result = await selector(t.models.self.alias).fetch(`${t.fields.self.rtl1.alias} IN (2,3)`);
        expect(result.length).toEqual(3);

        result = await selector(t.models.self.alias).fetch(`${t.fields.self.rtl1.alias} IN (4,5)`);
        expect(result.length).toEqual(1);
      });

      it("Should return correct result [js]", async () => {
        let result = await selector(t.models.self.alias).fetch(`${t.fields.self.rtl1.alias} IN ('js:[1,2]')`);
        expect(result.length).toEqual(4);

        result = await selector(t.models.self.alias).fetch(`${t.fields.self.rtl1.alias} IN ('js:[2,3]')`);
        expect(result.length).toEqual(3);

        result = await selector(t.models.self.alias).fetch(`${t.fields.self.rtl1.alias} IN ('js:[4,5]')`);
        expect(result.length).toEqual(1);
      });

      it("Should be able to process multiple rtls", async () => {
        let result = await selector(t.models.self.alias).fetch(`(${t.fields.self.rtl1.alias} IN (1)) OR (${t.fields.self.rtl2.alias} IN (1))`);

        expect(result.length).toEqual(3);
        expect(map(result, 'id').sort()).toEqual([1, 2, 3])
      });

      it("Should return correct result (js:)", async () => {
        let result = await selector(t.models.self.alias).fetch(`${t.fields.self.rtl1.alias} IN 'js:'`);
        expect(result.length).toEqual(0);
      });

      it("Should return correct result (js:null)", async () => {
        let result = await selector(t.models.self.alias).fetch(`${t.fields.self.rtl1.alias} IN 'js:null'`);
        expect(result.length).toEqual(0);
      });

      it("Should return correct result (js:[null])", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.rtl1.alias} IN 'js:[null]'`);
        expect(result.length).toEqual(0);
      });

      it("Should return correct result (js: mixed)", async () => {
        let result = await selector(t.models.self.alias).fetch(`(TRUE = 'js:false') OR (TRUE = 'js:true' AND ${t.fields.self.rtl1.alias} IN (1))`);
        expect(result.length).toEqual(3);
      });
    });

    describe('contains', () => {
      it("Should return correct result", async () => {
        let result = await selector(t.models.self.alias).fetch(`__having__${t.fields.self.rtl1.alias} IN (1,2)`);

        expect(result.length).toEqual(2);
        expect(result[0].id).toEqual(t.records.self.record2.id);
        expect(result[1].id).toEqual(t.records.self.record3.id);
      });

      it("Should return correct result [js]", async () => {
        let result = await selector(t.models.self.alias).fetch(`__having__${t.fields.self.rtl1.alias} IN ('js:[1,2]')`);

        expect(result.length).toEqual(2);
        expect(result[0].id).toEqual(t.records.self.record2.id);
        expect(result[1].id).toEqual(t.records.self.record3.id);
      });

      it("Should return correct result (js:)", async () => {
        let result = await selector(t.models.self.alias).fetch(`__having__${t.fields.self.rtl1.alias} IN 'js:'`);
        expect(result.length).toEqual(0);
      });

      it("Should return correct result (js:null)", async () => {
        let result = await selector(t.models.self.alias).fetch(`__having__${t.fields.self.rtl1.alias} IN 'js:null'`);
        expect(result.length).toEqual(0);
      });

      it("Should return correct result (js:[null])", async () => {
        const result = await selector(t.models.self.alias).fetch(`__having__${t.fields.self.rtl1.alias} IN 'js:[null]'`);
        expect(result.length).toEqual(0);
      });

      it("Should be able to process multiple rtls", async () => {
        let result = await selector(t.models.self.alias).fetch(`(__having__${t.fields.self.rtl1.alias} IN (1)) OR (__having__${t.fields.self.rtl2.alias} IN (1))`);

        expect(result.length).toEqual(3);
        expect(result[0].id).toEqual(t.records.self.record1.id);
        expect(result[1].id).toEqual(t.records.self.record2.id);
        expect(result[2].id).toEqual(t.records.self.record3.id);
      });
    });

    describe('does not contain', () => {
      it("Should return correct result", async () => {
        let result = await selector(t.models.self.alias).fetch(`__having__${t.fields.self.rtl1.alias} NOT IN (1,2)`);
        let expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length - 2);
      });

      it("Should return correct result [js]", async () => {
        let result = await selector(t.models.self.alias).fetch(`__having__${t.fields.self.rtl1.alias} NOT IN ('js:[1,2]')`);
        let expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length - 2);
      });

      it("Should return correct result (js:)", async () => {
        let result = await selector(t.models.self.alias).fetch(`__having__${t.fields.self.rtl1.alias} NOT IN 'js:'`);
        let expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length);
      });

      it("Should return correct result (js:null)", async () => {
        let result = await selector(t.models.self.alias).fetch(`__having__${t.fields.self.rtl1.alias} NOT IN 'js:null'`);
        let expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length);
      });

      it("Should return correct result (js:[null])", async () => {
        let result = await selector(t.models.self.alias).fetch(`__having__${t.fields.self.rtl1.alias} NOT IN 'js:[null]'`);
        let expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length);
      });

      it("Should be able to process multiple rtls", async () => {
        let result = await selector(t.models.self.alias).fetch(`(__having__${t.fields.self.rtl1.alias} NOT IN (1)) OR (__having__${t.fields.self.rtl2.alias} NOT IN (1))`);
        let expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length - 1);
      });
    });

    describe('in (strict)', () => {
      it("Should return correct result", async () => {
        let result = await selector(t.models.self.alias).fetch(`__strict__${t.fields.self.rtl1.alias} IN (1,2)`);

        expect(result.length).toEqual(2);
        expect(result[0].id).toEqual(t.records.self.record1.id);
        expect(result[1].id).toEqual(t.records.self.record2.id);
      });

      it("Should return correct result [js]", async () => {
        let result = await selector(t.models.self.alias).fetch(`__strict__${t.fields.self.rtl1.alias} IN ('js:[1,2]')`);

        expect(result.length).toEqual(2);
        expect(result[0].id).toEqual(t.records.self.record1.id);
        expect(result[1].id).toEqual(t.records.self.record2.id);
      });

      it("Should return correct result (js:)", async () => {
        let result = await selector(t.models.self.alias).fetch(`__strict__${t.fields.self.rtl1.alias} IN 'js:'`);
        expect(result.length).toEqual(0);
      });

      it("Should return correct result (js:null)", async () => {
        let result = await selector(t.models.self.alias).fetch(`__strict__${t.fields.self.rtl1.alias} IN 'js:null'`);
        expect(result.length).toEqual(0);
      });

      it("Should return correct result (js:[null])", async () => {
        const result = await selector(t.models.self.alias).fetch(`__strict__${t.fields.self.rtl1.alias} IN 'js:[null]'`);
        expect(result.length).toEqual(0);
      });

      it("Should be able to process multiple rtls", async () => {
        let result = await selector(t.models.self.alias).fetch(`(__strict__${t.fields.self.rtl1.alias} IN (1)) OR (__strict__${t.fields.self.rtl2.alias} IN (1))`);

        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(t.records.self.record1.id);
      });
    });

    describe('not in (strict)', () => {
      it("Should return correct result", async () => {
        let result = await selector(t.models.self.alias).fetch(`__strict__${t.fields.self.rtl1.alias} NOT IN (1,2)`);
        let expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length - 2);
      });

      it("Should return correct result [js]", async () => {
        let result = await selector(t.models.self.alias).fetch(`__strict__${t.fields.self.rtl1.alias} NOT IN ('js:[1,2]')`);
        let expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length - 2);
      });

      it("Should return correct result (js:null)", async () => {
        let result = await selector(t.models.self.alias).fetch(`__strict__${t.fields.self.rtl1.alias} NOT IN 'js:null'`);
        let expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length);
      });

      it("Should return correct result (js:)", async () => {
        let result = await selector(t.models.self.alias).fetch(`__strict__${t.fields.self.rtl1.alias} NOT IN 'js:'`);
        let expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length);
      });

      it("Should return correct result (js:[null])", async () => {
        let result = await selector(t.models.self.alias).fetch(`__strict__${t.fields.self.rtl1.alias} NOT IN 'js:[null]'`);
        let expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length);
      });

      it("Should be able to process multiple rtls", async () => {
        let result = await selector(t.models.self.alias).fetch(`(__strict__${t.fields.self.rtl1.alias} NOT IN (1)) OR (__strict__${t.fields.self.rtl2.alias} NOT IN (1))`);
        let expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length - 1);
      });
    });
  });

  describe('Child', () => {
    describe('contains', () => {
      it("Should return correct result", async () => {
        let result = await selector('model').fetch(`created_by.__having__user_groups IN (1)`);
        expect(result.length).toEqual(await db.model('model').count());
        result = await selector('model').fetch(`created_by.__having__user_groups IN (1,2)`);
        expect(result.length).toEqual(0);
      });

      it("Should return correct result [js]", async () => {
        let result = await selector('model').fetch(`created_by.__having__user_groups IN ('js:[1]')`);
        expect(result.length).toEqual(await db.model('model').count());
        result = await selector('model').fetch(`created_by.__having__user_groups IN ('js:[1,2]')`);
        expect(result.length).toEqual(0);
      });

      it("Should be able to process multiple rtls", async () => {
        let result = await selector('model').fetch(`(created_by.__having__user_groups IN (1)) OR (updated_by.__having__user_groups IN (1))`);
        expect(result.length).toEqual(await db.model('model').count());
      });
    });
  });
});
