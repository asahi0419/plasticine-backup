import { map } from 'lodash-es';

const { record, selector } = h;
const { manager } = record;

beforeAll(async () => {
  t.m = {
    s: await manager('model').create(),
    f: await manager('model').create(),
  }
  t.f = {
    s: {
      b: await manager('field').create({
        model: t.m.s.id,
        type: 'boolean',
        options: JSON.stringify({ default: null }),
      }),
      r: await manager('field').create({
        model: t.m.s.id,
        type: 'reference',
        options: JSON.stringify({
          foreign_model: t.m.f.alias,
          view: 'default',
          foreign_label: 'id',
        }),
      }),
    },
    f: {
      b: await manager('field').create({
        model: t.m.f.id,
        type: 'boolean',
        options: JSON.stringify({ default: null }),
      }),
    },
  };

  t.r = {};

  t.r.f = {
    r1: await manager(t.m.f.alias).create({ [t.f.f.b.alias]: null }),
    r2: await manager(t.m.f.alias).create({ [t.f.f.b.alias]: false }),
    r3: await manager(t.m.f.alias).create({ [t.f.f.b.alias]: true }),
  };
  t.r.s = {
    r1: await manager(t.m.s.alias).create({ [t.f.s.b.alias]: null }),
    r2: await manager(t.m.s.alias).create({ [t.f.s.b.alias]: false }),
    r3: await manager(t.m.s.alias).create({ [t.f.s.b.alias]: true }),
    r4: await manager(t.m.s.alias).create({ [t.f.s.r.alias]: t.r.f.r1.id }),
    r5: await manager(t.m.s.alias).create({ [t.f.s.r.alias]: t.r.f.r2.id }),
    r6: await manager(t.m.s.alias).create({ [t.f.s.r.alias]: t.r.f.r3.id }),
  };

  global.r = null;
});

describe('Filter: Common cases [Boolean]', () => {
  describe('Parent', () => {
    describe('is', () => {
      it('Should return correct result', async () => {
        r = await selector(t.m.s.alias).fetch(`${t.f.s.b.alias} = null`);
        expect(r.length).toEqual(4);
        expect(map(r, 'id').sort()).toEqual([1, 4, 5, 6]);

        r = await selector(t.m.s.alias).fetch(`${t.f.s.b.alias} = false`);
        expect(r.length).toEqual(1);
        expect(r[0].id).toEqual(2);

        r = await selector(t.m.s.alias).fetch(`${t.f.s.b.alias} = true`);
        expect(r.length).toEqual(1);
        expect(r[0].id).toEqual(3);

        r = await selector(t.m.s.alias).fetch(`${t.f.s.b.alias} = 'js:null'`);
        expect(r.length).toEqual(4);
        expect(map(r, 'id').sort()).toEqual([1, 4, 5, 6]);

        r = await selector(t.m.s.alias).fetch(`${t.f.s.b.alias} = 'js:false'`);
        expect(r.length).toEqual(1);
        expect(r[0].id).toEqual(2);

        r = await selector(t.m.s.alias).fetch(`${t.f.s.b.alias} = 'js:true'`);
        expect(r.length).toEqual(1);
        expect(r[0].id).toEqual(3);

        r = await selector(t.m.s.alias).fetch(`${t.f.s.b.alias} = 'js:'`);
        expect(r.length).toEqual(0);
      });
    });

    describe('is not', () => {
      it('Should return correct result', async () => {
        r = await selector(t.m.s.alias).fetch(`${t.f.s.b.alias} != null`);
        expect(r.length).toEqual(2);
        expect(map(r, 'id').sort()).toEqual([2, 3]);

        r = await selector(t.m.s.alias).fetch(`${t.f.s.b.alias} != false`);
        expect(r.length).toEqual(5);
        expect(map(r, 'id').sort()).toEqual([1, 3, 4, 5, 6]);

        r = await selector(t.m.s.alias).fetch(`${t.f.s.b.alias} != true`);
        expect(r.length).toEqual(5);
        expect(map(r, 'id').sort()).toEqual([1, 2, 4, 5, 6]);

        r = await selector(t.m.s.alias).fetch(`${t.f.s.b.alias} != 'js:null'`);
        expect(r.length).toEqual(2);
        expect(map(r, 'id').sort()).toEqual([2, 3]);

        r = await selector(t.m.s.alias).fetch(`${t.f.s.b.alias} != 'js:false'`);
        expect(r.length).toEqual(5);
        expect(map(r, 'id').sort()).toEqual([1, 3, 4, 5, 6]);

        r = await selector(t.m.s.alias).fetch(`${t.f.s.b.alias} != 'js:true'`);
        expect(r.length).toEqual(5);
        expect(map(r, 'id').sort()).toEqual([1, 2, 4, 5, 6]);

        r = await selector(t.m.s.alias).fetch(`${t.f.s.b.alias} != 'js:'`);
        expect(r.length).toEqual(6);
      });
    });

    describe('is empty', () => {
      it('Should return correct result', async () => {
        r = await selector(t.m.s.alias).fetch(`${t.f.s.b.alias} is null`);
        expect(r.length).toEqual(4);
        expect(map(r, 'id').sort()).toEqual([1, 4, 5, 6]);
      });
    });

    describe('is not empty', () => {
      it('Should return correct result', async () => {
        r = await selector(t.m.s.alias).fetch(`${t.f.s.b.alias} is not null`);
        expect(r.length).toEqual(2);
        expect(map(r, 'id').sort()).toEqual([2, 3]);
      });
    });
  });

  describe('Child', () => {
    describe('is', () => {
      it('Should return correct result', async () => {
        r = await selector(t.m.s.alias).fetch(`${t.f.s.r.alias}.${t.f.f.b.alias} = null`);
        expect(r.length).toEqual(1);
        expect(r[0].id).toEqual(4);

        r = await selector(t.m.s.alias).fetch(`${t.f.s.r.alias}.${t.f.f.b.alias} = false`);
        expect(r.length).toEqual(1);
        expect(r[0].id).toEqual(5);

        r = await selector(t.m.s.alias).fetch(`${t.f.s.r.alias}.${t.f.f.b.alias} = true`);
        expect(r.length).toEqual(1);
        expect(r[0].id).toEqual(6);

        r = await selector(t.m.s.alias).fetch(`${t.f.s.r.alias}.${t.f.f.b.alias} = 'js:null'`);
        expect(r.length).toEqual(1);
        expect(r[0].id).toEqual(4);

        r = await selector(t.m.s.alias).fetch(`${t.f.s.r.alias}.${t.f.f.b.alias} = 'js:false'`);
        expect(r.length).toEqual(1);
        expect(r[0].id).toEqual(5);

        r = await selector(t.m.s.alias).fetch(`${t.f.s.r.alias}.${t.f.f.b.alias} = 'js:true'`);
        expect(r.length).toEqual(1);
        expect(r[0].id).toEqual(6);

        r = await selector(t.m.s.alias).fetch(`${t.f.s.r.alias}.${t.f.f.b.alias} = 'js:'`);
        expect(r.length).toEqual(0);
      });
    });

    describe('is not', () => {
      it('Should return correct result', async () => {
        r = await selector(t.m.s.alias).fetch(`${t.f.s.r.alias}.${t.f.f.b.alias} != null`);
        expect(r.length).toEqual(2);
        expect(map(r, 'id').sort()).toEqual([5, 6]);

        r = await selector(t.m.s.alias).fetch(`${t.f.s.r.alias}.${t.f.f.b.alias} != false`);
        expect(r.length).toEqual(2);
        expect(map(r, 'id').sort()).toEqual([4, 6]);

        r = await selector(t.m.s.alias).fetch(`${t.f.s.r.alias}.${t.f.f.b.alias} != true`);
        expect(r.length).toEqual(2);
        expect(map(r, 'id').sort()).toEqual([4, 5]);

        r = await selector(t.m.s.alias).fetch(`${t.f.s.r.alias}.${t.f.f.b.alias} != 'js:null'`);
        expect(r.length).toEqual(2);
        expect(map(r, 'id').sort()).toEqual([5, 6]);

        r = await selector(t.m.s.alias).fetch(`${t.f.s.r.alias}.${t.f.f.b.alias} != 'js:false'`);
        expect(r.length).toEqual(2);
        expect(map(r, 'id').sort()).toEqual([4, 6]);

        r = await selector(t.m.s.alias).fetch(`${t.f.s.r.alias}.${t.f.f.b.alias} != 'js:true'`);
        expect(r.length).toEqual(2);
        expect(map(r, 'id').sort()).toEqual([4, 5]);

        r = await selector(t.m.s.alias).fetch(`${t.f.s.r.alias}.${t.f.f.b.alias} != 'js:'`);
        expect(r.length).toEqual(3);
      });
    });

    describe('is empty', () => {
      it('Should return correct result', async () => {
        r = await selector(t.m.s.alias).fetch(`${t.f.s.r.alias}.${t.f.f.b.alias} is null`);
        expect(r.length).toEqual(1);
        expect(r[0].id).toEqual(4);
      });
    });

    describe('is not empty', () => {
      it('Should return correct result', async () => {
        r = await selector(t.m.s.alias).fetch(`${t.f.s.r.alias}.${t.f.f.b.alias} is not null`);
        expect(r.length).toEqual(2);
        expect(map(r, 'id').sort()).toEqual([5, 6]);
      });
    });
  });
});
