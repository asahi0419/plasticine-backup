const { manager } = h.record;

beforeAll(async () => {
  t.model = await manager('model').create();
  t.fields = {
    condition: await manager('field').create({ model: t.model.id, type: 'condition' }),
    filter: await manager('field').create({ model: t.model.id, type: 'filter' }),
    boolean_default_false: await manager('field').create({ model: t.model.id, type: 'boolean', options: JSON.stringify({ default: false }) }),
    boolean_default_true: await manager('field').create({ model: t.model.id, type: 'boolean', options: JSON.stringify({ default: true }) }),
    boolean_default_null: await manager('field').create({ model: t.model.id, type: 'boolean', options: JSON.stringify({ default: null }) }),
  };
});

describe('createConditionField', () => {
  it('Condition field should be text', async () => {
    const value = 'p.record.getValue(\'id\')';
    const record = await manager(t.model.alias, 'seeding').create({ [t.fields.condition.alias]: value });

    expect(record[t.fields.condition.alias]).toEqual(value)
  });
});

describe('createFilterField', () => {
  it('Filter field should be text', async () => {
    const value = 'id = 1';
    const record = await manager(t.model.alias, 'seeding').create({ [t.fields.filter.alias]: value });

    expect(record[t.fields.filter.alias]).toEqual(value);
  });
});

describe('createBooleanField', () => {
  it('Should correctly set default values', async () => {
    const record = await manager(t.model.alias, 'seeding').create();

    expect(record[t.fields.boolean_default_false.alias]).toEqual(false);
    expect(record[t.fields.boolean_default_true.alias]).toEqual(true);
    expect(record[t.fields.boolean_default_null.alias]).toEqual(null);
  });
});
