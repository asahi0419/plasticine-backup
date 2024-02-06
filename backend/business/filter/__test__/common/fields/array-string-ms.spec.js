const { record, selector } = h;
const { manager } = record;

beforeAll(async () => {
  t.models = {
    self: await manager('model').create(),
    foreign: await manager('model').create(),
  }
  t.fields = {
    self: {
      array_string_ms: await manager('field').create({ model: t.models.self.id, type: 'array_string', options: JSON.stringify({ values: { first: 'First', second: 'Second', third: 'Third', 'true': 'true' }, multi_select: true, length: 2048 }) }),
      reference: await manager('field').create({ model: t.models.self.id, type: 'reference', options: JSON.stringify({ foreign_model: t.models.foreign.alias, view: 'default', foreign_label: 'id' }) }),
    },
    foreign: {
      array_string_ms: await manager('field').create({ model: t.models.foreign.id, type: 'array_string', options: '{"values":{"first":"First","second":"Second","third":"Third"},"multi_select":true,"length":2048}' }),
    },
  };

  t.records = {};
  t.records.foreign = {
    record1: await manager(t.models.foreign.alias).create({ [t.fields.foreign.array_string_ms.alias]: ['second', 'first'] }),
    record2: await manager(t.models.foreign.alias).create(),
  };
  t.records.self = {
    record9: await manager(t.models.self.alias).create({ [t.fields.self.array_string_ms.alias]: ['second', 'first'] }),
    record10: await manager(t.models.self.alias).create({ [t.fields.self.array_string_ms.alias]: ['third'] }),
    record11: await manager(t.models.self.alias).create({ [t.fields.self.array_string_ms.alias]: ['second', 'third'] }),
    record12: await manager(t.models.self.alias).create({ [t.fields.self.array_string_ms.alias]: ['true'] }),

    record13: await manager(t.models.self.alias).create({ [t.fields.self.reference.alias]: t.records.foreign.record1.id }),
    record14: await manager(t.models.self.alias).create({ [t.fields.self.reference.alias]: t.records.foreign.record2.id }),
  };
});

describe('Filter: Common cases [Array string (MS)]', () => {
  describe('Parent', () => {
    describe('is', () => {
      describe('plain', () => {
        it('Should return records with values', async () => {
          let result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string_ms.alias} = 'second,first'`);
          expect(result.length).toEqual(1);
          expect(result[0].id).toEqual(t.records.self.record9.id);

          result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string_ms.alias} = 'first,second'`);
          expect(result.length).toEqual(1);
          expect(result[0].id).toEqual(t.records.self.record9.id);
        });
      });
      describe('js:', () => {
        it('Should not return records', async () => {
          const all = await selector(t.models.self.alias).fetch();
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string_ms.alias} = 'js:'`);

          expect(result.length).toEqual(0);
        });
      });
      describe('js:null', () => {
        it('Should return records with empty value', async () => {
          const all = await selector(t.models.self.alias).fetch();
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string_ms.alias} = 'js:null'`);

          expect(result.length).toEqual(all.length - 4);
        });
      });
      describe('js:true', () => {
        it('Should not return records', async () => {
          const all = await selector(t.models.self.alias).fetch();
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string_ms.alias} = 'js:true'`);

          expect(result.length).toEqual(1);
          expect(result[0].id).toEqual(t.records.self.record12.id);
        });
      });
      describe('js:false', () => {
        it('Should not return records', async () => {
          const all = await selector(t.models.self.alias).fetch();
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string_ms.alias} = 'js:false'`);

          expect(result.length).toEqual(0);
        });
      });
      describe('js:[null]', () => {
        it('Should not return records', async () => {
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string_ms.alias} = 'js:[null]'`);

          expect(result.length).toEqual(0);
        });
      });
      describe('js:[v]', () => {
        it('Should return correct records', async () => {
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string_ms.alias} = 'js:["second","first"]'`);

          expect(result.length).toEqual(1);
          expect(result[0].id).toEqual(t.records.self.record9.id);
        });
      });
    });
    describe('is not', () => {
      describe('plain', () => {
        it('Should return records with values', async () => {
          const all = await selector(t.models.self.alias).fetch();

          let result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string_ms.alias} != 'second,first'`);
          expect(result.length).toEqual(all.length - 1);

          result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string_ms.alias} != 'first,second'`);
          expect(result.length).toEqual(all.length - 1);
        });
      });
      describe('js:', () => {
        it('Should not return records', async () => {
          const all = await selector(t.models.self.alias).fetch();
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string_ms.alias} != 'js:'`);
          expect(result.length).toEqual(all.length);
        });
      });
      describe('js:null', () => {
        it('Should return records with empty value', async () => {
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string_ms.alias} != 'js:null'`);
          expect(result.length).toEqual(4);
        });
      });
      describe('js:true', () => {
        it('Should not return records', async () => {
          const all = await selector(t.models.self.alias).fetch();
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string_ms.alias} != 'js:true'`);

          expect(result.length).toEqual(all.length - 1);
        });
      });
      describe('js:false', () => {
        it('Should not return records', async () => {
          const all = await selector(t.models.self.alias).fetch();
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string_ms.alias} != 'js:false'`);

          expect(result.length).toEqual(all.length);
        });
      });
      describe('js:[null]', () => {
        it('Should not return records', async () => {
          const all = await selector(t.models.self.alias).fetch();
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string_ms.alias} != 'js:[null]'`);

          expect(result.length).toEqual(all.length);
        });
      });
      describe('js:[v]', () => {
        it('Should return correct records', async () => {
          const all = await selector(t.models.self.alias).fetch();
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string_ms.alias} != 'js:["second","first"]'`);

          expect(result.length).toEqual(all.length - 1);
        });
      });
    });
    describe('is empty', () => {
      it('Should return records with empty value', async () => {
        const all = await selector(t.models.self.alias).fetch();
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string_ms.alias} IS NULL`);

        expect(result.length).toEqual(all.length - 4);
      });
    });
    describe('is not empty', () => {
      it('Should return records with not empty value', async () => {
        const all = await selector(t.models.self.alias).fetch();
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string_ms.alias} IS NOT NULL`);

        expect(result.length).toEqual(4);
      });
    });
    describe('contains one of', () => {
      describe('plain', () => {
        it('Should return records having value', async () => {
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string_ms.alias} IN ('second')`);

          expect(result.length).toEqual(2);
          expect(result[0].id).toEqual(t.records.self.record9.id);
          expect(result[1].id).toEqual(t.records.self.record11.id);
        });
      });
      describe('js:', () => {
        it('Should not return records', async () => {
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string_ms.alias} IN 'js:'`);

          expect(result.length).toEqual(0);
        });
      });
      describe('js:null', () => {
        it('Should not return records', async () => {
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string_ms.alias} IN 'js:null'`);

          expect(result.length).toEqual(0);
        });
      });
      describe('js:true', () => {
        it('Should not return records', async () => {
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string_ms.alias} IN 'js:true'`);

          expect(result.length).toEqual(1);
          expect(result[0].id).toEqual(t.records.self.record12.id);
        });
      });
      describe('js:false', () => {
        it('Should not return records', async () => {
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string_ms.alias} IN 'js:false'`);

          expect(result.length).toEqual(0);
        });
      });
      describe('js:[null]', () => {
        it('Should not return records', async () => {
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string_ms.alias} IN 'js:[null]'`);

          expect(result.length).toEqual(0);
        });
      });
      describe('js:[v]', () => {
        it('Should return correct records', async () => {
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string_ms.alias} IN 'js:["second"]'`);

          expect(result.length).toEqual(2);
          expect(result[0].id).toEqual(t.records.self.record9.id);
          expect(result[1].id).toEqual(t.records.self.record11.id);
        });
      });
    });
    describe('in (strict)', () => {
      describe('plain', () => {
        it('Should return records having value', async () => {
          const result = await selector(t.models.self.alias).fetch(`__strict__${t.fields.self.array_string_ms.alias} IN ('first', 'second')`);

          expect(result.length).toEqual(1);
          expect(result[0].id).toEqual(t.records.self.record9.id);
        });
      });
      describe('js:', () => {
        it('Should not return records', async () => {
          const result = await selector(t.models.self.alias).fetch(`__strict__${t.fields.self.array_string_ms.alias} IN 'js:'`);

          expect(result.length).toEqual(0);
        });
      });
      describe('js:null', () => {
        it('Should not return records', async () => {
          const result = await selector(t.models.self.alias).fetch(`__strict__${t.fields.self.array_string_ms.alias} IN 'js:null'`);

          expect(result.length).toEqual(0);
        });
      });
      describe('js:true', () => {
        it('Should not return records', async () => {
          const result = await selector(t.models.self.alias).fetch(`__strict__${t.fields.self.array_string_ms.alias} IN 'js:true'`);

          expect(result.length).toEqual(1);
          expect(result[0].id).toEqual(t.records.self.record12.id);
        });
      });
      describe('js:false', () => {
        it('Should not return records', async () => {
          const result = await selector(t.models.self.alias).fetch(`__strict__${t.fields.self.array_string_ms.alias} IN 'js:false'`);

          expect(result.length).toEqual(0);
        });
      });
      describe('js:[null]', () => {
        it('Should not return records', async () => {
          const result = await selector(t.models.self.alias).fetch(`__strict__${t.fields.self.array_string_ms.alias} IN 'js:[null]'`);

          expect(result.length).toEqual(0);
        });
      });
      describe('js:[v]', () => {
        it('Should return correct records', async () => {
          const result = await selector(t.models.self.alias).fetch(`__strict__${t.fields.self.array_string_ms.alias} IN 'js:["first","second"]'`);

          expect(result.length).toEqual(1);
          expect(result[0].id).toEqual(t.records.self.record9.id);
        });
      });
    });
    describe('not in (strict)', () => {
      describe('plain', () => {
        it('Should return records not having value', async () => {
          const all = await selector(t.models.self.alias).fetch();
          const result = await selector(t.models.self.alias).fetch(`__strict__${t.fields.self.array_string_ms.alias} NOT IN ('first', 'second')`);

          expect(result.length).toEqual(all.length - 1);
        });
      });
      describe('js:', () => {
        it('Should return all records', async () => {
          const all = await selector(t.models.self.alias).fetch();
          const result = await selector(t.models.self.alias).fetch(`__strict__${t.fields.self.array_string_ms.alias} NOT IN 'js:'`);

          expect(result.length).toEqual(all.length);
        });
      });
      describe('js:null', () => {
        it('Should return all records', async () => {
          const all = await selector(t.models.self.alias).fetch();
          const result = await selector(t.models.self.alias).fetch(`__strict__${t.fields.self.array_string_ms.alias} NOT IN 'js:null'`);

          expect(result.length).toEqual(all.length);
        });
      });
      describe('js:true', () => {
        it('Should not return records', async () => {
          const all = await selector(t.models.self.alias).fetch();
          const result = await selector(t.models.self.alias).fetch(`__strict__${t.fields.self.array_string_ms.alias} NOT IN 'js:true'`);

          expect(result.length).toEqual(all.length - 1);
        });
      });
      describe('js:false', () => {
        it('Should not return records', async () => {
          const all = await selector(t.models.self.alias).fetch();
          const result = await selector(t.models.self.alias).fetch(`__strict__${t.fields.self.array_string_ms.alias} NOT IN 'js:false'`);

          expect(result.length).toEqual(all.length);
        });
      });
      describe('js:[null]', () => {
        it('Should return all records', async () => {
          const all = await selector(t.models.self.alias).fetch();
          const result = await selector(t.models.self.alias).fetch(`__strict__${t.fields.self.array_string_ms.alias} NOT IN 'js:[null]'`);

          expect(result.length).toEqual(all.length);
        });
      });
      describe('js:[v]', () => {
        it('Should return correct records', async () => {
          const all = await selector(t.models.self.alias).fetch();
          const result = await selector(t.models.self.alias).fetch(`__strict__${t.fields.self.array_string_ms.alias} NOT IN 'js:["first","second"]'`);

          expect(result.length).toEqual(all.length - 1);
        });
      });
    });
    describe('contains', () => {
      describe('plain', () => {
        it('Should return records contains values', async () => {
          const result = await selector(t.models.self.alias).fetch(`__having__${t.fields.self.array_string_ms.alias} IN ('first', 'second')`);

          expect(result.length).toEqual(1);
          expect(result[0].id).toEqual(t.records.self.record9.id);
        });
      });
      describe('js:', () => {
        it('Should not return records', async () => {
          const result = await selector(t.models.self.alias).fetch(`__having__${t.fields.self.array_string_ms.alias} IN 'js:'`);

          expect(result.length).toEqual(0);
        });
      });
      describe('js:null', () => {
        it('Should not return records', async () => {
          const result = await selector(t.models.self.alias).fetch(`__having__${t.fields.self.array_string_ms.alias} IN 'js:null'`);

          expect(result.length).toEqual(0);
        });
      });
      describe('js:true', () => {
        it('Should not return records', async () => {
          const result = await selector(t.models.self.alias).fetch(`__having__${t.fields.self.array_string_ms.alias} IN 'js:true'`);

          expect(result.length).toEqual(1);
          expect(result[0].id).toEqual(t.records.self.record12.id);
        });
      });
      describe('js:false', () => {
        it('Should not return records', async () => {
          const result = await selector(t.models.self.alias).fetch(`__having__${t.fields.self.array_string_ms.alias} IN 'js:false'`);

          expect(result.length).toEqual(0);
        });
      });
      describe('js:[null]', () => {
        it('Should not return records', async () => {
          const result = await selector(t.models.self.alias).fetch(`__having__${t.fields.self.array_string_ms.alias} IN 'js:[null]'`);

          expect(result.length).toEqual(0);
        });
      });
      describe('js:[v]', () => {
        it('Should return records contains values', async () => {
          const result = await selector(t.models.self.alias).fetch(`__having__${t.fields.self.array_string_ms.alias} IN 'js:["first","second"]'`);

          expect(result.length).toEqual(1);
          expect(result[0].id).toEqual(t.records.self.record9.id);
        });
      });
    });
    describe('does not contain', () => {
      describe('plain', () => {
        it('Should return records not contain values', async () => {
          const all = await selector(t.models.self.alias).fetch();
          const result = await selector(t.models.self.alias).fetch(`__having__${t.fields.self.array_string_ms.alias} NOT IN ('first', 'second')`);

          expect(result.length).toEqual(all.length - 1);
        });
      });
      describe('js:', () => {
        it('Should return all records', async () => {
          const all = await selector(t.models.self.alias).fetch();
          const result = await selector(t.models.self.alias).fetch(`__having__${t.fields.self.array_string_ms.alias} NOT IN 'js:'`);

          expect(result.length).toEqual(all.length);
        });
      });
      describe('js:null', () => {
        it('Should return all records', async () => {
          const all = await selector(t.models.self.alias).fetch();
          const result = await selector(t.models.self.alias).fetch(`__having__${t.fields.self.array_string_ms.alias} NOT IN 'js:null'`);

          expect(result.length).toEqual(all.length);
        });
      });
      describe('js:true', () => {
        it('Should not return records', async () => {
          const all = await selector(t.models.self.alias).fetch();
          const result = await selector(t.models.self.alias).fetch(`__having__${t.fields.self.array_string_ms.alias} NOT IN 'js:true'`);

          expect(result.length).toEqual(all.length - 1);
        });
      });
      describe('js:false', () => {
        it('Should not return records', async () => {
          const all = await selector(t.models.self.alias).fetch();
          const result = await selector(t.models.self.alias).fetch(`__having__${t.fields.self.array_string_ms.alias} NOT IN 'js:false'`);

          expect(result.length).toEqual(all.length);
        });
      });
      describe('js:[null]', () => {
        it('Should return all records', async () => {
          const all = await selector(t.models.self.alias).fetch();
          const result = await selector(t.models.self.alias).fetch(`__having__${t.fields.self.array_string_ms.alias} NOT IN 'js:[null]'`);

          expect(result.length).toEqual(all.length);
        });
      });
      describe('js:[v]', () => {
        it('Should return correct records', async () => {
          const all = await selector(t.models.self.alias).fetch();
          const result = await selector(t.models.self.alias).fetch(`__having__${t.fields.self.array_string_ms.alias} NOT IN 'js:["first","second"]'`);

          expect(result.length).toEqual(all.length - 1);
        });
      });
    });
  });
});

describe('Child', () => {
  describe('is', () => {
    describe('plain', () => {
      it('Should return records with child values', async () => {
        let result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string_ms.alias} = 'second,first'`);
        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(t.records.self.record13.id);

        result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string_ms.alias} = 'first,second'`);
        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(t.records.self.record13.id);
      });
    });
    describe('js:', () => {
      it('Should not return records', async () => {
        const all = await selector(t.models.self.alias).fetch();
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string_ms.alias} = 'js:'`);

        expect(result.length).toEqual(0);
      });
    });
    describe('js:null', () => {
      it('Should return records with empty child value', async () => {
        const all = await selector(t.models.self.alias).fetch();
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string_ms.alias} = 'js:null'`);

        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(t.records.self.record14.id);
      });
    });
    describe('js:[null]', () => {
      it('Should not return records', async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string_ms.alias} = 'js:[null]'`);

        expect(result.length).toEqual(0);
      });
    });
    describe('js:[v]', () => {
      it('Should not return records', async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string_ms.alias} = 'js:["second","first"]'`);

        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(t.records.self.record13.id);
      });
    });
  });
  describe('is not', () => {
    describe('plain', () => {
      it('Should return records with child values', async () => {
        let result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string_ms.alias} != 'second,first'`);
        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(t.records.self.record14.id);

        result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string_ms.alias} != 'first,second'`);
        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(t.records.self.record14.id);
      });
    });
    describe('js:', () => {
      it('Should not return records', async () => {
        const all = await selector(t.models.foreign.alias).fetch();
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string_ms.alias} != 'js:'`);

        expect(result.length).toEqual(all.length);
      });
    });
    describe('js:null', () => {
      it('Should return records with empty child value', async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string_ms.alias} != 'js:null'`);

        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(t.records.self.record13.id);
      });
    });
    describe('js:[null]', () => {
      it('Should not return records', async () => {
        const all = await selector(t.models.foreign.alias).fetch();
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string_ms.alias} != 'js:[null]'`);

        expect(result.length).toEqual(all.length);
      });
    });
    describe('js:[v]', () => {
      it('Should not return records', async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string_ms.alias} != 'js:["second","first"]'`);

        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(t.records.self.record14.id);
      });
    });
  });
  describe('is empty', () => {
    it('Should return records with empty child value', async () => {
      const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string_ms.alias} IS NULL`);

      expect(result.length).toEqual(1);
      expect(result[0].id).toEqual(t.records.self.record14.id);
    });
  });
  describe('is not empty', () => {
    it('Should return records with not empty child value', async () => {
      const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string_ms.alias} IS NOT NULL`);

      expect(result.length).toEqual(1);
      expect(result[0].id).toEqual(t.records.self.record13.id);
    });
  });
  describe('contains one of', () => {
    describe('plain', () => {
      it('Should return records having child value', async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string_ms.alias} IN ('second')`);

        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(t.records.self.record13.id);
      });
    });
    describe('js:', () => {
      it('Should not return records', async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string_ms.alias} IN 'js:'`);

        expect(result.length).toEqual(0);
      });
    });
    describe('js:null', () => {
      it('Should not return records', async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string_ms.alias} IN 'js:null'`);

        expect(result.length).toEqual(0);
      });
    });
    describe('js:[null]', () => {
      it('Should not return records', async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string_ms.alias} IN 'js:[null]'`);

        expect(result.length).toEqual(0);
      });
    });
    describe('js:[v]', () => {
      it('Should not return records', async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string_ms.alias} IN 'js:["second"]'`);

        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(t.records.self.record13.id);
      });
    });
  });
  describe('in (strict)', () => {
    describe('plain', () => {
      it('Should return records having child value', async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.__strict__${t.fields.foreign.array_string_ms.alias} IN ('first', 'second')`);

        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(t.records.self.record13.id);
      });
    });
    describe('js:', () => {
      it('Should not return records', async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.__strict__${t.fields.foreign.array_string_ms.alias} IN 'js:'`);

        expect(result.length).toEqual(0);
      });
    });
    describe('js:null', () => {
      it('Should not return records', async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.__strict__${t.fields.foreign.array_string_ms.alias} IN 'js:null'`);

        expect(result.length).toEqual(0);
      });
    });
    describe('js:[null]', () => {
      it('Should not return records', async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.__strict__${t.fields.foreign.array_string_ms.alias} IN 'js:[null]'`);

        expect(result.length).toEqual(0);
      });
    });
    describe('js:[v]', () => {
      it('Should not return records', async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.__strict__${t.fields.foreign.array_string_ms.alias} IN 'js:["first","second"]'`);

        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(t.records.self.record13.id);
      });
    });
  });
  describe('not in (strict)', () => {
    describe('plain', () => {
      it('Should return records not having child value', async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.__strict__${t.fields.foreign.array_string_ms.alias} NOT IN ('first', 'second')`);

        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(t.records.self.record14.id);
      });
    });
    describe('js:', () => {
      it('Should return records with not empty child values', async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.__strict__${t.fields.foreign.array_string_ms.alias} NOT IN 'js:'`);

        expect(result.length).toEqual(2);
      });
    });
    describe('js:null', () => {
      it('Should return records with not empty child values', async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.__strict__${t.fields.foreign.array_string_ms.alias} NOT IN 'js:null'`);

        expect(result.length).toEqual(2);
      });
    });
    describe('js:[null]', () => {
      it('Should return records with not empty child values', async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.__strict__${t.fields.foreign.array_string_ms.alias} NOT IN 'js:[null]'`);

        expect(result.length).toEqual(2);
      });
    });
    describe('js:[v]', () => {
      it('Should return records with not empty child values', async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.__strict__${t.fields.foreign.array_string_ms.alias} NOT IN 'js:["first","second"]'`);

        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(t.records.self.record14.id);
      });
    });
  });
  describe('contains', () => {
    describe('plain', () => {
      it('Should return records having child value', async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.__having__${t.fields.foreign.array_string_ms.alias} IN ('first', 'second')`);

        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(t.records.self.record13.id);
      });
    });
    describe('js:', () => {
      it('Should not return records', async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.__having__${t.fields.foreign.array_string_ms.alias} IN 'js:'`);

        expect(result.length).toEqual(0);
      });
    });
    describe('js:null', () => {
      it('Should not return records', async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.__having__${t.fields.foreign.array_string_ms.alias} IN 'js:null'`);

        expect(result.length).toEqual(0);
      });
    });
    describe('js:[null]', () => {
      it('Should not return records', async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.__having__${t.fields.foreign.array_string_ms.alias} IN 'js:[null]'`);

        expect(result.length).toEqual(0);
      });
    });
    describe('js:[v]', () => {
      it('Should not return records', async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.__having__${t.fields.foreign.array_string_ms.alias} IN 'js:["first","second"]'`);

        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(t.records.self.record13.id);
      });
    });
    it("Should return records with value (case insensitive) ['abc']", async () => {
      let result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.__having__${t.fields.foreign.array_string_ms.alias} IN ('first', 'second')`);
      expect(result.length).toEqual(1);
      expect(result[0].id).toEqual(t.records.self.record13.id);

      result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.__having__${t.fields.foreign.array_string_ms.alias} IN ('three')`);
      expect(result.length).toEqual(0);
    });
  });
  describe('does not contain', () => {
    describe('plain', () => {
      it('Should return records not having child value', async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.__having__${t.fields.foreign.array_string_ms.alias} NOT IN ('first', 'second')`);

        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(t.records.self.record14.id);
      });
    });
    describe('js:', () => {
      it('Should return record with not empty child values', async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.__having__${t.fields.foreign.array_string_ms.alias} NOT IN 'js:'`);

        expect(result.length).toEqual(2);
      });
    });
    describe('js:null', () => {
      it('Should return record with not empty child values', async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.__having__${t.fields.foreign.array_string_ms.alias} NOT IN 'js:null'`);

        expect(result.length).toEqual(2);
      });
    });
    describe('js:[null]', () => {
      it('Should return record with not empty child values', async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.__having__${t.fields.foreign.array_string_ms.alias} NOT IN 'js:[null]'`);

        expect(result.length).toEqual(2);
      });
    });
    describe('js:[v]', () => {
      it('Should return record with not empty child values', async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.__having__${t.fields.foreign.array_string_ms.alias} NOT IN 'js:["first","second"]'`);

        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual(t.records.self.record14.id);
      });
    });
  });
});
