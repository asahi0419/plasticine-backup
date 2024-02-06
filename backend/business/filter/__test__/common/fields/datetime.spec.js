import moment from 'moment';
import { map } from 'lodash-es';

import * as CONSTANTS from '../../../../constants/index.js';

const { record, selector } = h;
const { manager } = record;

const NOW_1 = moment().format(CONSTANTS.DEFAULT_DATE_FORMAT);
const NOW_2 = moment(NOW_1).add(1, 'day').format(CONSTANTS.DEFAULT_DATE_FORMAT);
const NOW_3 = moment(NOW_2).add(1, 'day').format(CONSTANTS.DEFAULT_DATE_FORMAT);

beforeAll(async () => {
  t.models = {
    self: await manager('model').create(),
    foreign: await manager('model').create(),
  }
  t.fields = {
    self: {
      reference: await manager('field').create({ model: t.models.self.id, type: 'reference', options: JSON.stringify({ foreign_model: t.models.foreign.alias, view: 'default', foreign_label: 'id' }) }),
      datetime: await manager('field').create({ model: t.models.self.id, type: 'datetime' }),
    },
    foreign: {
      datetime: await manager('field').create({ model: t.models.foreign.id, type: 'datetime' }),
    },
  };

  t.records = {};
  t.records.foreign = {
    record1: await manager(t.models.foreign.alias).create({ [t.fields.foreign.datetime.alias]: NOW_1 }),
    record2: await manager(t.models.foreign.alias).create({ created_by: 2 }),
  };
  t.records.self = {
    record1: await manager(t.models.self.alias).create({ [t.fields.self.reference.alias]: t.records.foreign.record1.id }),
    record2: await manager(t.models.self.alias).create({ [t.fields.self.datetime.alias]: NOW_1 }),
    record3: await manager(t.models.self.alias).create({ [t.fields.self.datetime.alias]: NOW_2 }),
    record4: await manager(t.models.self.alias).create({ [t.fields.self.datetime.alias]: NOW_3 }),
  };
});

describe('Filter: Common cases [Datetime]', () => {
  describe('Parent', () => {
    describe('on', () => {
      it("Should return correct result [plain]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.datetime.alias} = '${NOW_1}'`);

        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(2);
      });
      it("Should return correct result [js:]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.datetime.alias} = 'js:'`);

        expect(result.length).toEqual(0);
      });
      it("Should return correct result [js:null]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.datetime.alias} = 'js:null'`);

        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(1);
      });
      it("Should return correct result [js:v]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.datetime.alias} = 'js:"${NOW_1}"'`);

        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(2);
      });
    });

    describe('not on', () => {
      it("Should return correct result [plain]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.datetime.alias} != '${NOW_1}'`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length - 1);
      });
      it("Should return correct result [js:]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.datetime.alias} != 'js:'`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length);
      });
      it("Should return correct result [js:null]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.datetime.alias} != 'js:null'`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length - 1);
      });
      it("Should return correct result [js:v]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.datetime.alias} != 'js:"${NOW_1}"'`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length - 1);
      });
    });

    describe('before', () => {
      it("Should return correct result [plain]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.datetime.alias} < '${NOW_3}'`);

        expect(result.length).toEqual(2);
        expect(map(result, 'id').sort()).toEqual([2, 3]);
      });
      it("Should return correct result [js:]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.datetime.alias} < 'js:'`);

        expect(result.length).toEqual(0);
      });
      it("Should return correct result [js:null]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.datetime.alias} < 'js:null'`);

        expect(result.length).toEqual(0);
      });
      it("Should return correct result [js:v]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.datetime.alias} < 'js:"${NOW_3}"'`);

        expect(result.length).toEqual(2);
        expect(map(result, 'id').sort()).toEqual([2, 3]);
      });
    });

    describe('before on', () => {
      it("Should return correct result [plain]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.datetime.alias} <= '${NOW_3}'`);

        expect(result.length).toEqual(3);
        expect(map(result, 'id').sort()).toEqual([2, 3, 4]);
      });
      it("Should return correct result [js:]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.datetime.alias} <= 'js:'`);

        expect(result.length).toEqual(0);
      });
      it("Should return correct result [js:null]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.datetime.alias} <= 'js:null'`);

        expect(result.length).toEqual(0);
      });
      it("Should return correct result [js:v]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.datetime.alias} <= 'js:"${NOW_3}"'`);

        expect(result.length).toEqual(3);
        expect(map(result, 'id').sort()).toEqual([2, 3, 4]);
      });
    });

    describe('after', () => {
      it("Should return correct result [plain]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.datetime.alias} > '${NOW_1}'`);

        expect(result.length).toEqual(2);
        expect(map(result, 'id').sort()).toEqual([3, 4]);
      });
      it("Should return correct result [js:]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.datetime.alias} > 'js:'`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length);
      });
      it("Should return correct result [js:null]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.datetime.alias} > 'js:null'`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length);
      });
      it("Should return correct result [js:v]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.datetime.alias} > 'js:"${NOW_1}"'`);

        expect(result.length).toEqual(2);
        expect(map(result, 'id').sort()).toEqual([3, 4]);
      });
    });

    describe('after on', () => {
      it("Should return correct result [plain]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.datetime.alias} >= '${NOW_1}'`);

        expect(result.length).toEqual(3);
        expect(map(result, 'id').sort()).toEqual([2, 3, 4]);
      });
      it("Should return correct result [js:]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.datetime.alias} >= 'js:'`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length);
      });
      it("Should return correct result [js:null]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.datetime.alias} >= 'js:null'`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length);
      });
      it("Should return correct result [js:v]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.datetime.alias} >= 'js:"${NOW_1}"'`);

        expect(result.length).toEqual(3);
        expect(map(result, 'id').sort()).toEqual([2, 3, 4]);
      });
    });

    describe('between', () => {
      it("Should return correct result [plain]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.datetime.alias} BETWEEN '${NOW_1}' AND '${NOW_3}'`);

        expect(result.length).toEqual(3);
        expect(map(result, 'id').sort()).toEqual([2, 3, 4]);
      });
      it("Should return correct result [js:]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.datetime.alias} BETWEEN 'js:' AND 'js:'`);

        expect(result.length).toEqual(0);
      });
      it("Should return correct result [js:null]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.datetime.alias} BETWEEN 'js:null' AND 'js:null'`);

        expect(result.length).toEqual(0);
      });
      it("Should return correct result [js:v]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.datetime.alias} BETWEEN 'js:"${NOW_1}"' AND 'js:"${NOW_3}"'`);

        expect(result.length).toEqual(3);
        expect(map(result, 'id').sort()).toEqual([2, 3, 4]);
      });
    });

    describe('is empty', () => {
      it("Should return correct result [plain]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.datetime.alias} IS NULL`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length - 3);
      });
      it("Should return correct result [js:v]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.datetime.alias} = 'js:null'`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length - 3);
      });
    });

    describe('is not empty', () => {
      it("Should return correct result [plain]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.datetime.alias} IS NOT NULL`);

        expect(result.length).toEqual(3);
      });
      it("Should return correct result [js:v]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.datetime.alias} != 'js:null'`);

        expect(result.length).toEqual(3);
      });
    });
  });

  describe('Child', () => {
    describe('on', () => {
      it("Should return correct result [plain]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.datetime.alias} = '${NOW_1}'`);

        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(1);
      });
      it("Should return correct result [js:]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.datetime.alias} = 'js:'`);

        expect(result.length).toEqual(0);
      });
      it("Should return correct result [js:v]", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.datetime.alias} = 'js:"${NOW_1}"'`);

        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(1);
      });
    });
  });
});
