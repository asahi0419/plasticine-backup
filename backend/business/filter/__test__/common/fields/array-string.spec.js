const { record, selector } = h;
const { manager } = record;

beforeAll(async () => {
  t.models = {
    self: await manager('model').create(),
    foreign: await manager('model').create(),
  }
  t.fields = {
    self: {
      array_string: await manager('field').create({ model: t.models.self.id, type: 'array_string', options: '{"values":{"abc":"abc","ABC":"ABC","abcd":"abcd","aba":"aba","empty1":"","empty2":"   "},"length":2048}' }),
      reference: await manager('field').create({ model: t.models.self.id, type: 'reference', options: JSON.stringify({ foreign_model: t.models.foreign.alias, view: 'default', foreign_label: 'id' }) }),
      reference_self: await manager('field').create({ model: t.models.self.id, type: 'reference', options: JSON.stringify({ foreign_model: t.models.self.alias, view: 'default', foreign_label: 'id' }) }),
    },
    foreign: {
      array_string: await manager('field').create({ model: t.models.foreign.id, type: 'array_string', options: '{"values":{"abc":"abc","ABC":"ABC","abcd":"abcd","aba":"aba","empty1":"","empty2":"   "},"length":2048}' }),
    },
  };

  t.records = {};
  t.records.foreign = {
    record1: await manager(t.models.foreign.alias).create({ [t.fields.foreign.array_string.alias]: 'abc' }),
    record2: await manager(t.models.foreign.alias).create(),
  };
  t.records.self = {
    record1: await manager(t.models.self.alias).create({ [t.fields.self.array_string.alias]: null }),
    record2: await manager(t.models.self.alias).create({ [t.fields.self.array_string.alias]: 'empty1' }),
    record3: await manager(t.models.self.alias).create({ [t.fields.self.array_string.alias]: 'empty2' }),
    record4: await manager(t.models.self.alias).create({ [t.fields.self.array_string.alias]: 'abc' }),
    record5: await manager(t.models.self.alias).create({ [t.fields.self.array_string.alias]: 'ABC' }),
    record6: await manager(t.models.self.alias).create({ [t.fields.self.array_string.alias]: 'abcd' }),
    record7: await manager(t.models.self.alias).create({ [t.fields.self.array_string.alias]: 'aba' }),
    record8: await manager(t.models.self.alias).create({ [t.fields.self.array_string.alias]: '' }),

    record9: await manager(t.models.self.alias).create({ [t.fields.self.reference.alias]: t.records.foreign.record1.id }),
    record10: await manager(t.models.self.alias).create({ [t.fields.self.reference.alias]: t.records.foreign.record2.id }),
  };
  t.records.self_referenced = {
    record1: await manager(t.models.self.alias).create({ [t.fields.self.reference_self.alias]: t.records.self.record4.id }),
  }
});

describe('Filter: Common cases [Array string]', () => {
  describe('Parent', () => {
    describe('is', () => {
      describe('plain', () => {
        it("Should return correct records", async () => {
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} = 'abc'`);
          expect(result.length).toEqual(1);
        });
      });
      describe('js:', () => {
        it("Should not return records", async () => {
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} = 'js:'`);
          expect(result.length).toEqual(0);
        });
      });
      describe('js:null', () => {
        it("Should return correct records", async () => {
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} = 'js:null'`);
          expect(result.length).toEqual(5);
        });
      });
      describe('js:true', () => {
        it("Should return correct records", async () => {
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} = 'js:true'`);
          const expected = await selector(t.models.self.alias).fetch();
          expect(result.length).toEqual(0);
        });
      });
      describe('js:false', () => {
        it("Should return correct records", async () => {
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} = 'js:false'`);
          expect(result.length).toEqual(0);
        });
      });
      describe('js:v', () => {
        it("Should return correct records", async () => {
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} = 'js:"abc"'`);
          expect(result.length).toEqual(1);
        });
      });
    });

    describe('is not', () => {
      describe('plain', () => {
        it("Should return correct records", async () => {
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} != 'abc'`);
          const expected = await selector(t.models.self.alias).fetch();
          expect(result.length).toEqual(expected.length - 1);
        });
      });
      describe('js:', () => {
        it("Should return correct records", async () => {
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} != 'js:'`);
          const expected = await selector(t.models.self.alias).fetch();
          expect(result.length).toEqual(expected.length);
        });
      });
      describe('js:null', () => {
        it("Should return correct records", async () => {
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} != 'js:null'`);
          const expected = await selector(t.models.self.alias).fetch();
          expect(result.length).toEqual(expected.length - 5);
        });
      });
      describe('js:true', () => {
        it("Should return correct records", async () => {
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} != 'js:true'`);
          const expected = await selector(t.models.self.alias).fetch();
          expect(result.length).toEqual(expected.length);
        });
      });
      describe('js:false', () => {
        it("Should return correct records", async () => {
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} != 'js:false'`);
          const expected = await selector(t.models.self.alias).fetch();
          expect(result.length).toEqual(expected.length);
        });
      });
      describe('js:v', () => {
        it("Should return correct records", async () => {
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} != 'js:"abc"'`);
          const expected = await selector(t.models.self.alias).fetch();
          expect(result.length).toEqual(expected.length - 1);
        });
      });
    });

    describe('contains', () => {
      it("Should return all records ['']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} LIKE '%%'`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length);
      });
      it("Should return records with value ['   ']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} LIKE '%   %'`);

        expect(result.length).toEqual(1);
      });
      it("Should return records with value (case insensitive) ['abc']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} LIKE '%abc%'`);

        expect(result.length).toEqual(3);
      });
      it("Should not return records ['js:']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} LIKE '%js:%'`);

        expect(result.length).toEqual(0);
      });
      it("Should not return records ['js:null']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} LIKE '%js:null%'`);

        expect(result.length).toEqual(0);
      });
    });

    describe('does not contain', () => {
      it("Should return all records ['']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} NOT LIKE '%%'`);

        expect(result.length).toEqual(0);
      });
      it("Should return records with value ['   ']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} NOT LIKE '%   %'`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length - 1);
      });
      it("Should return records with value (case insensitive) ['abc']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} NOT LIKE '%abc%'`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length - 3);
      });
      it("Should return all records ['js:']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} NOT LIKE '%js:%'`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length);
      });
      it("Should return all records ['js:null']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} NOT LIKE '%js:null%'`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length);
      });
    });

    describe('starts with', () => {
      it("Should return all records ['']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} LIKE '%'`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length);
      });
      it("Should return records with value ['   ']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} LIKE '   %'`);

        expect(result.length).toEqual(1);
      });
      it("Should return records with value (case insensitive) ['abc']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} LIKE 'abc%'`);

        expect(result.length).toEqual(3);
      });
      it("Should not return records ['js:']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} LIKE 'js:%'`);

        expect(result.length).toEqual(0);
      });
      it("Should not return records ['js:null']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} LIKE 'js:null%'`);

        expect(result.length).toEqual(0);
      });
      it("Should return correct result ['js:v']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} LIKE 'js:"abc"%'`);

        expect(result.length).toEqual(3);
      });
    });

    describe('does not start with', () => {
      it("Should return all records ['']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} NOT LIKE '%'`);

        expect(result.length).toEqual(0);
      });
      it("Should return records with value ['   ']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} NOT LIKE '   %'`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length - 1);
      });
      it("Should return records with value (case insensitive) ['abc']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} NOT LIKE 'abc%'`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length - 3);
      });
      it("Should return all records ['js:']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} NOT LIKE 'js:%'`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length);
      });
      it("Should return all records ['js:null']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} NOT LIKE 'js:null%'`);

        expect(result.length).toEqual(11);
      });
      it("Should return correct result ['js:v']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} NOT LIKE 'js:"abc"%'`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length - 3);
      });
    });

    describe('ends with', () => {
      it("Should return all records ['']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} LIKE '%'`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length);
      });
      it("Should return records with value ['   ']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} LIKE '%   '`);

        expect(result.length).toEqual(1);
      });
      it("Should return records with value (case insensitive) ['abc']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} LIKE '%abc'`);

        expect(result.length).toEqual(2);
      });
      it("Should not return records ['js:']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} LIKE '%js:'`);

        expect(result.length).toEqual(0);
      });
      it("Should not return records ['js:null']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} LIKE '%js:null'`);

        expect(result.length).toEqual(0);
      });
      it("Should return correct result ['js:']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} LIKE '%js:"abc"'`);

        expect(result.length).toEqual(2);
      });
    });

    describe('does not end with', () => {
      it("Should return all records ['']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} NOT LIKE '%'`);

        expect(result.length).toEqual(0);
      });
      it("Should return records with value ['   ']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} NOT LIKE '%   '`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length - 1);
      });
      it("Should return records with value (case insensitive) ['abc']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} NOT LIKE '%abc'`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length - 2);
      });
      it("Should return all records ['js:']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} NOT LIKE '%js:'`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length);
      });
      it("Should return all records ['js:null']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} NOT LIKE '%js:null'`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length);
      });
      it("Should return correct result ['js:']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.array_string.alias} NOT LIKE '%js:"abc"'`);
        const expected = await selector(t.models.self.alias).fetch();

        expect(result.length).toEqual(expected.length - 2);
      });
    });
  });

  describe('Child', () => {
    describe('is', () => {
      describe('plain', () => {
        it("Should not return records", async () => {
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string.alias} = 'abc'`);
          expect(result.length).toEqual(1);
        });
      });
      describe('self referenced', () => {
        it("Should return correct records", async () => {
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference_self.alias}.${t.fields.self.array_string.alias} = 'abc'`);
          expect(result.length).toEqual(1);
          expect(result[0].id).toEqual(t.records.self_referenced.record1.id);
        });
      });
      describe('js:', () => {
        it("Should not return records", async () => {
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string.alias} = 'js:'`);
          expect(result.length).toEqual(0);
        });
      });
      describe('js:null', () => {
        it("Should return correct records", async () => {
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string.alias} = 'js:null'`);
          expect(result.length).toEqual(1);
        });
      });
      describe('js:v', () => {
        it("Should not return records", async () => {
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string.alias} = 'js:"abc"'`);
          expect(result.length).toEqual(1);
        });
      });
    });

    describe('is not', () => {
      describe('plain', () => {
        it("Should return correct records", async () => {
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string.alias} != 'abc'`);
          expect(result.length).toEqual(1);
        });
      });
      describe('js:', () => {
        it("Should return correct records", async () => {
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string.alias} != 'js:'`);
          expect(result.length).toEqual(2);
        });
      });
      describe('js:null', () => {
        it("Should return correct records", async () => {
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string.alias} != 'js:null'`);
          expect(result.length).toEqual(1);
        });
      });
      describe('js:v', () => {
        it("Should return correct records", async () => {
          const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string.alias} != 'js:"abc"'`);
          expect(result.length).toEqual(1);
        });
      });
    });

    describe('contains', () => {
      it("Should return records with value (case insensitive) ['abc']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string.alias} LIKE '%abc%'`);

        expect(result.length).toEqual(1);
      });

      it("Should return records with value (case insensitive) ['non-existent value']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string.alias} LIKE '%non-existent value%'`);

        expect(result.length).toEqual(0);
      });
      it("Should not return records ['js:']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string.alias} = '%js:%'`);

        expect(result.length).toEqual(0);
      });
      it("Should return correct records ['js:null']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string.alias} = '%js:null%'`);

        expect(result.length).toEqual(1);
      });
    });

    describe('does not contain', () => {
      it("Should return correct records ['js:']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string.alias} != '%js:%'`);

        expect(result.length).toEqual(2);
      });
      it("Should return correct records ['js:null']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string.alias} != '%js:null%'`);

        expect(result.length).toEqual(1);
      });
    });

    describe('starts with', () => {
      it("Should not return records ['js:']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string.alias} = 'js:%'`);

        expect(result.length).toEqual(0);
      });
      it("Should return correct records ['js:null']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string.alias} = 'js:null%'`);

        expect(result.length).toEqual(1);
      });
    });

    describe('does not start with', () => {
      it("Should return correct records ['js:']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string.alias} != 'js:%'`);

        expect(result.length).toEqual(2);
      });
      it("Should return correct records ['js:null']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string.alias} != 'js:null%'`);

        expect(result.length).toEqual(1);
      });
    });

    describe('ends with', () => {
      it("Should not return records ['js:']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string.alias} = '%js:'`);

        expect(result.length).toEqual(0);
      });
      it("Should return correct records ['js:null']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string.alias} = '%js:null'`);

        expect(result.length).toEqual(1);
      });
    });

    describe('does not end with', () => {
      it("Should return correct records ['js:']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string.alias} != '%js:'`);

        expect(result.length).toEqual(2);
      });
      it("Should return correct records ['js:null']", async () => {
        const result = await selector(t.models.self.alias).fetch(`${t.fields.self.reference.alias}.${t.fields.foreign.array_string.alias} != '%js:null'`);

        expect(result.length).toEqual(1);
      });
    });
  });
});
