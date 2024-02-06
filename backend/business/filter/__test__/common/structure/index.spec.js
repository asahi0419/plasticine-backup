const { record, selector } = h;
const { manager } = record;

beforeAll(async () => {
  t.m = {
    s: await manager('model').create(),
  }
  t.f = {
    s: {
      integer: await manager('field').create({ model: t.m.s.id, type: 'integer' }),
      string: await manager('field').create({ model: t.m.s.id, type: 'string' }),
    },
  };

  t.records = {};
  t.records.s = {
    record1: await manager(t.m.s.alias).create({ [t.f.s.integer.alias]: 1, [t.f.s.string.alias]: '1' }),
    record2: await manager(t.m.s.alias).create({ [t.f.s.integer.alias]: 2, [t.f.s.string.alias]: '2' }),
    record3: await manager(t.m.s.alias).create({ [t.f.s.integer.alias]: 3, [t.f.s.string.alias]: '3' }),
    record4: await manager(t.m.s.alias).create({ [t.f.s.integer.alias]: 4, [t.f.s.string.alias]: '4' }),
    record5: await manager(t.m.s.alias).create({ [t.f.s.integer.alias]: 5, [t.f.s.string.alias]: '5' }),
    record6: await manager(t.m.s.alias).create({ [t.f.s.integer.alias]: 6, [t.f.s.string.alias]: '6' }),
    record7: await manager(t.m.s.alias).create(),
  };
});

describe('Filter: Common cases [Structure]', () => {
  it("Should return correct result [plain]", async () => {
    let query, result;

    query = `
      ${t.f.s.integer.alias} = 1 AND
      ${t.f.s.string.alias} = '1' OR
      ${t.f.s.integer.alias} = 2 AND
      ${t.f.s.string.alias} = '2' OR
      ${t.f.s.integer.alias} = 3 AND
      ${t.f.s.string.alias} = '3'
    `;
    result = await selector(t.m.s.alias).fetch(query);
    expect(result.length).toEqual(3);

    query = `
      ${t.f.s.integer.alias} = 1 AND
      ${t.f.s.integer.alias} = 1 AND
      ${t.f.s.string.alias} = '1' OR
      ${t.f.s.string.alias} = '1' OR
      ${t.f.s.integer.alias} = 2 AND
      ${t.f.s.integer.alias} = 2 AND
      ${t.f.s.string.alias} = '2' OR
      ${t.f.s.string.alias} = '2' OR
      ${t.f.s.integer.alias} = 3 AND
      ${t.f.s.integer.alias} = 3 AND
      ${t.f.s.string.alias} = '3'
    `;
    result = await selector(t.m.s.alias).fetch(query);
    expect(result.length).toEqual(3);

    query = `(
      ${t.f.s.integer.alias} = 1 AND
      ${t.f.s.string.alias} = '1' OR
      ${t.f.s.integer.alias} = 2 AND
      ${t.f.s.string.alias} = '2' OR
      ${t.f.s.integer.alias} = 3 AND
      ${t.f.s.string.alias} = '3'
    ) OR (
      ${t.f.s.integer.alias} = 4 AND
      ${t.f.s.string.alias} = '4' OR
      ${t.f.s.integer.alias} = 5 AND
      ${t.f.s.string.alias} = '5' OR
      ${t.f.s.integer.alias} = 6 AND
      ${t.f.s.string.alias} = '6'
    )`;
    result = await selector(t.m.s.alias).fetch(query);
    expect(result.length).toEqual(6);

    query = `(
      ${t.f.s.integer.alias} = 1 AND
      ${t.f.s.integer.alias} = 1 AND
      ${t.f.s.string.alias} = '1' OR
      ${t.f.s.string.alias} = '1' OR
      ${t.f.s.integer.alias} = 2 AND
      ${t.f.s.integer.alias} = 2 AND
      ${t.f.s.string.alias} = '2' OR
      ${t.f.s.string.alias} = '2' OR
      ${t.f.s.integer.alias} = 3 AND
      ${t.f.s.integer.alias} = 3 AND
      ${t.f.s.string.alias} = '3'
    ) OR (
      ${t.f.s.integer.alias} = 4 AND
      ${t.f.s.integer.alias} = 4 AND
      ${t.f.s.string.alias} = '4' OR
      ${t.f.s.string.alias} = '4' OR
      ${t.f.s.integer.alias} = 5 AND
      ${t.f.s.integer.alias} = 5 AND
      ${t.f.s.string.alias} = '5' OR
      ${t.f.s.string.alias} = '5' OR
      ${t.f.s.integer.alias} = 6 AND
      ${t.f.s.integer.alias} = 6 AND
      ${t.f.s.string.alias} = '6'
    )`;
    result = await selector(t.m.s.alias).fetch(query);
    expect(result.length).toEqual(6);
  });
});
