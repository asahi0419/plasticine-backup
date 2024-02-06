const { manager } = h.record;

const CASES = {
  reference: {
    foreignModelDoesNotExist: {
      options: '{"foreign_model":"test","foreign_label":"test"}',
      error: { name: 'RecordNotValidError', description: 'static.foreign_model_does_not_exist' },
    },
    foreignModelIsNotSpecified: {
      options: '{"foreign_label":"test"}',
      error: { name: 'RecordNotValidError', description: 'static.should_provide_foreign_model\nstatic.foreign_model_does_not_exist' },
    },
    foreignLabelIsNotSpecified: {
      options: '{"foreign_model":"model"}',
      error: { name: 'RecordNotValidError', description: 'static.should_provide_foreign_label' },
    },
    dependsOnIsWrongFormat: {
      options: '{"foreign_model":"model","foreign_label":"test","depends_on":"wrong"}',
      error: { name: 'RecordNotValidError', description: 'static.depends_on_has_wrong_format' },
    },
    dependsOnIsNotPermitted: {
      options: '{"foreign_model":"model","foreign_label":"test","depends_on":"[\\\"not_permitted\\\"]"}',
      error: { name: 'RecordNotValidError', description: 'static.field_contains_not_permitted_value_by_depends_on' },
    },
  },

  primary_key: {
    impossibleCreateSecondaryPrimaryKey: {
      options: '',
      error: { name: 'RecordNotValidError', description: 'static.impossible_create_secondary_primary_key'},
    },
  },

  datetime: {
    hasWrongFormat: {
      options: '{"format":"DD-MM-YYsdsd"}',
      error: { name: 'RecordNotValidError', description: 'static.datetime_has_wrong_format' },
    },
    hasCorrectFormat: {
      options: '{"format":"DD/MM/YYYY HH:mm"}',
      success: true,
    },
  },

  array_string: {
    valuesIsEmpty1: {
      options: JSON.stringify({}),
      error: { name: 'RecordNotValidError', description: 'static.field_has_invalid_json_value' },
    },
    valuesIsEmpty2: {
      options: JSON.stringify({ values: null }),
      error: { name: 'RecordNotValidError', description: 'static.field_has_invalid_json_value' },
    },
    valuesIsEmpty3: {
      options: JSON.stringify({ values: '' }),
      error: { name: 'RecordNotValidError', description: 'static.field_has_invalid_json_value' },
    },
    valuesIsEmpty4: {
      options: JSON.stringify({ values: ' ' }),
      error: { name: 'RecordNotValidError', description: 'static.field_has_invalid_json_value' },
    },
    valuesIsEmpty5: {
      options: JSON.stringify({ values: {} }),
      error: { name: 'RecordNotValidError', description: 'static.field_has_invalid_json_value' },
    },
    valuesIsWrong: {
      options: JSON.stringify({ values: '{"one":"one"' }),
      error: { name: 'RecordNotValidError', description: 'static.field_has_invalid_json_value' },
    },
    valuesIsCorrect1: {
      options: JSON.stringify({ values: '{"one":"one"}' }),
      success: true,
    },
    valuesIsCorrect2: {
      options: JSON.stringify({ values: { one: 'one' } }),
      success: true,
    },
  },

  global_reference: {
    referencesIsEmpty1: {
      options: JSON.stringify({}),
      error: { name: 'RecordNotValidError', description: 'static.field_has_invalid_json_value' },
    },
    referencesIsEmpty2: {
      options: JSON.stringify({ references: null }),
      error: { name: 'RecordNotValidError', description: 'static.field_has_invalid_json_value' },
    },
    referencesIsEmpty3: {
      options: JSON.stringify({ references: '' }),
      error: { name: 'RecordNotValidError', description: 'static.field_has_invalid_json_value' },
    },
    referencesIsEmpty4: {
      options: JSON.stringify({ references: ' ' }),
      error: { name: 'RecordNotValidError', description: 'static.field_has_invalid_json_value' },
    },
    referencesIsEmpty5: {
      options: JSON.stringify({ references: [] }),
      error: { name: 'RecordNotValidError', description: 'static.field_has_invalid_json_value' },
    },
    referencesIsWrong: {
      options: JSON.stringify({ references: '[{' }),
      error: { name: 'RecordNotValidError', description: 'static.field_has_invalid_json_value' },
    },
    referencesIsCorrect1: {
      options: JSON.stringify({ references: '[{}]' }),
      success: true,
    },
    referencesIsCorrect2: {
      options: JSON.stringify({ references: [{}] }),
      success: true,
    },
  }
};

const checkCase = async (type, c) => {
  const result = manager('field', 'secure').create({ type, model: t.m.s.id, options: c.options });

  return c.success
    ? expect(result).resolves.toHaveProperty('id')
    : expect(result).rejects.toMatchObject(c.error);
}

beforeAll(async () => {
  t.m = {
    s: await manager('model').create(),
    f: await manager('model').create(),
  };
});

describe('DB Rule: Field', () => {
  describe('validateOptions', () => {
    describe('reference', () => {
      it('Should return correct result', async () => {
        await checkCase('reference', CASES.reference.foreignModelDoesNotExist);
        await checkCase('reference', CASES.reference.foreignModelIsNotSpecified);
        await checkCase('reference', CASES.reference.foreignLabelIsNotSpecified);
        await checkCase('reference', CASES.reference.dependsOnIsWrongFormat);
        await checkCase('reference', CASES.reference.dependsOnIsNotPermitted);
      });
    });

    describe('reference_to_list', () => {
      it('Should return correct result', async () => {
        await checkCase('reference_to_list', CASES.reference.foreignModelDoesNotExist);
        await checkCase('reference_to_list', CASES.reference.foreignModelIsNotSpecified);
        await checkCase('reference_to_list', CASES.reference.foreignLabelIsNotSpecified);
      });
    });

    describe('datetime', () => {
      it('Should return correct result', async () => {
        await checkCase('datetime', CASES.datetime.hasWrongFormat);
        await checkCase('datetime', CASES.datetime.hasCorrectFormat);
      });
    });

    describe('array_string', () => {
      it('return correct result', async () => {
        await checkCase('array_string', CASES.array_string.valuesIsEmpty1);
        await checkCase('array_string', CASES.array_string.valuesIsEmpty2);
        await checkCase('array_string', CASES.array_string.valuesIsEmpty3);
        await checkCase('array_string', CASES.array_string.valuesIsEmpty4);
        await checkCase('array_string', CASES.array_string.valuesIsEmpty5);
        await checkCase('array_string', CASES.array_string.valuesIsWrong);
        await checkCase('array_string', CASES.array_string.valuesIsCorrect1);
        await checkCase('array_string', CASES.array_string.valuesIsCorrect2);
      });
    });

    describe('global_reference', () => {
      it('return correct result', async () => {
        await checkCase('global_reference', CASES.global_reference.referencesIsEmpty1);
        await checkCase('global_reference', CASES.global_reference.referencesIsEmpty2);
        await checkCase('global_reference', CASES.global_reference.referencesIsEmpty3);
        await checkCase('global_reference', CASES.global_reference.referencesIsEmpty4);
        await checkCase('global_reference', CASES.global_reference.referencesIsEmpty5);
        await checkCase('global_reference', CASES.global_reference.referencesIsWrong);
        await checkCase('global_reference', CASES.global_reference.referencesIsCorrect1);
        await checkCase('global_reference', CASES.global_reference.referencesIsCorrect2);
      });
    });
  });

  describe('validateDuplicate', () => {
    describe('primary_key', () => {
      it('Should return correct result', async () => {
        await checkCase('primary_key', CASES.primary_key.impossibleCreateSecondaryPrimaryKey);
      });
    });
  });

  describe('validateVirtual', () => {
    describe('string', () => {
      it('Should return correct result', async () => {
        const field = await manager('field').create({ model: t.m.s.id, type: 'string' });
        const result = manager('field').update(field, { virtual: true });
        await expect(result).rejects.toMatchObject({
          name: 'IntegrityError',
          description: 'static.field_virtual_cannot_be_changed'
        });
      });
    });
  });

  describe('processOptions', () => {
    describe('array_string', () => {
      it('Should return correct result', async () => {
        let field;
        field = await manager('field').create({ model: t.m.s.id, type: 'array_string', options: JSON.stringify({ multi_select: true, values: { one: 'one' } }) });
        expect(field.options).toEqual(JSON.stringify({ multi_select: true, values: { one: 'one' }, length: 2048 }));
        field = await manager('field').update(field, { options: JSON.stringify({ multi_select: false, values: { one: 'one' }, default: 'one' }) });
        expect(field.options).toEqual(JSON.stringify({ multi_select: true, values: { one: 'one' }, default: 'one', length: 2048 }));
        field = await manager('field').update(field, { options: JSON.stringify({ multi_select: false, values: { one: 'one' }, default: ' ' }) });
        expect(field.options).toEqual(JSON.stringify({ multi_select: true, values: { one: 'one' }, default: null, length: 2048 }));
      });
    });

    describe('datetime', () => {
      it('Should return correct result', async () => {
        const datetime = new Date();
        let field;
        field = await manager('field').create({ model: t.m.s.id, type: 'datetime' });
        expect(field.options).toEqual(JSON.stringify({ default: null }));
        field = await manager('field').update(field, { options: JSON.stringify({ default: 'default' }) });
        expect(field.options).toEqual(JSON.stringify({ default: null }));
        field = await manager('field').update(field, { options: JSON.stringify({ default: datetime }) });
        expect(field.options).toEqual(JSON.stringify({ default: datetime }));
        field = await manager('field').update(field, { options: JSON.stringify({ default: '' }) });
        expect(field.options).toEqual(JSON.stringify({ default: null }));
      });
    });

    describe('string', () => {
      it('Should return correct result', async () => {
        let field;
        field = await manager('field').create({ model: t.m.s.id, type: 'string', options: JSON.stringify({ default: null }) });
        expect(field.options).toEqual(JSON.stringify({ default: null, length: 255, format: null }));
        field = await manager('field').create({ model: t.m.s.id, type: 'string', options: JSON.stringify({ default: '' }) });
        expect(field.options).toEqual(JSON.stringify({ default: null, length: 255, format: null }));
        field = await manager('field').create({ model: t.m.s.id, type: 'string', options: JSON.stringify({ default: 'string' }) });
        expect(field.options).toEqual(JSON.stringify({ default: 'string', length: 255, format: null }));
      });
    });

    describe('condition', () => {
      it('Should return correct result', async () => {
        let field;
        field = await manager('field').create({ model: t.m.s.id, type: 'condition' });
        expect(field.options).toEqual(JSON.stringify({ ref_model: null, default: null }));
      });
    });

    describe('integer', () => {
      it('Should return correct result', async () => {
        let field;
        field = await manager('field').create({ model: t.m.s.id, type: 'integer', options: '{"default":"string"}' });
        expect(field.options).toEqual('{}');
        field = await manager('field').create({ model: t.m.s.id, type: 'integer', options: '{"default":""}' });
        expect(field.options).toEqual('{}');
        field = await manager('field').create({ model: t.m.s.id, type: 'integer', options: '{"default":"1","min":"-10","max":"10","step":"1"}' });
        expect(field.options).toEqual('{"default":1,"min":-10,"max":10,"step":1}');
      });
    });

    describe('float', () => {
      it('Should return correct result', async () => {
        let field;
        field = await manager('field').create({ model: t.m.s.id, type: 'float', options: '{"default":"string"}' });
        expect(field.options).toEqual('{}');
        field = await manager('field').create({ model: t.m.s.id, type: 'float', options: '{"default":""}' });
        expect(field.options).toEqual('{}');
        field = await manager('field').create({ model: t.m.s.id, type: 'float', options: '{"default":"1","min":"-10","max":"10","step":"1"}' });
        expect(field.options).toEqual('{"default":1,"min":-10,"max":10,"step":1}');
      });
    });

    describe('filter', () => {
      it('Should return correct result', async () => {
        let field;
        field = await manager('field').create({ model: t.m.s.id, type: 'filter' });
        expect(field.options).toEqual(JSON.stringify({ length: 150000, ref_model: null, default: null }));
        field = await manager('field').create({ model: t.m.s.id, type: 'filter', options: JSON.stringify({ length: 100000 }) });
        expect(field.options).toEqual(JSON.stringify({ length: 100000, ref_model: null, default: null }));
      });
    });

    describe('reference', () => {
      it('Should convert extra fields aliases to ids', async () => {
        const idField = await db.model('field').where({ model: t.m.f.id, alias: 'id' }).getOne();
        const options = JSON.stringify({ foreign_model: t.m.f.alias, foreign_label: 'name', extra_fields: [ 'id' ] });
        const expected = JSON.stringify({ foreign_model: t.m.f.alias, foreign_label: 'name', extra_fields: [ idField.id ], depends_on: null, filter: null, default: null });
        const field = await manager('field').create({ model: t.m.s.id, type: 'reference', options });

        expect(field.options).toEqual(expected);
      });
      it('Should convert foreign model id to alias', async () => {
        const idField = await db.model('field').where({ model: t.m.s.id, alias: 'id' }).getOne();
        const options = JSON.stringify({ foreign_model: t.m.f.id, foreign_label: 'name' });
        const expected = JSON.stringify({ foreign_model: t.m.f.alias, foreign_label: 'name', depends_on: null, filter: null, default: null });
        const field = await manager('field').create({ model: t.m.s.id, type: 'reference', options });

        expect(field.options).toEqual(expected);
      });
      it('Should convert view id to alias', async () => {
        const view = await db.model('view').where({ model: t.m.s.id }).getOne();
        const idField = await db.model('field').where({ model: t.m.s.id, alias: 'id' }).getOne();
        const options = JSON.stringify({ foreign_model: t.m.f.alias, foreign_label: 'name', view: view.id });
        const expected = JSON.stringify({ foreign_model: t.m.f.alias, foreign_label: 'name', view: view.alias, depends_on: null, filter: null, default: null });
        const field = await manager('field').create({ model: t.m.s.id, type: 'reference', options });

        expect(field.options).toEqual(expected);
      });
      it('Should convert depends on', async () => {
        const options = JSON.stringify({ foreign_model: t.m.f.alias, foreign_label: 'name', depends_on: "['test']" });
        const expected = JSON.stringify({ foreign_model: t.m.f.alias, foreign_label: 'name', depends_on: ['test'], depends_on: null, filter: null, default: null });
        const field = await manager('field').create({ model: t.m.s.id, type: 'reference', options });

        expect(field.options).toEqual(expected);
      });
    });

    describe('reference_to_list', () => {
      it('Should convert foreign model id to alias', async () => {
        const idField = await db.model('field').where({ model: t.m.s.id, alias: 'id' }).getOne();
        const options = JSON.stringify({ foreign_model: t.m.f.id, foreign_label: 'name' });
        const expected = JSON.stringify({ foreign_model: t.m.f.alias, foreign_label: 'name', depends_on: null, filter: null, default: null });
        const field = await manager('field').create({ model: t.m.s.id, type: 'reference_to_list', options });

        expect(field.options).toEqual(expected);
      });
      it('Should convert view id to alias', async () => {
        const view = await db.model('view').where({ model: t.m.s.id }).getOne();
        const options = JSON.stringify({ foreign_model: t.m.f.alias, foreign_label: 'name', view: view.id });
        const expected = JSON.stringify({ foreign_model: t.m.f.alias, foreign_label: 'name', view: view.alias, depends_on: null, filter: null, default: null });
        const field = await manager('field').create({ model: t.m.s.id, type: 'reference_to_list', options });

        expect(field.options).toEqual(expected);
      });
    });
  });
});
