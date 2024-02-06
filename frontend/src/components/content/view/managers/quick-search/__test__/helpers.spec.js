import { filterExpression } from '../helpers';
import { DEFAULT_DATE_FORMAT } from '../../../../../../constants';

const FIELDS = {
  boolean: { alias: 'boolean', type: 'boolean' },
  array_string: { alias: 'array_string', type: 'array_string', options: `{"values":{"one":"One","two":"Two"}}` },
  integer: { alias: 'integer', type: 'integer' },
  float: { alias: 'float', type: 'float' },
  filter: { alias: 'filter', type: 'filter' },
  datetime: { alias: 'datetime', type: 'datetime', options: `{"format":"${DEFAULT_DATE_FORMAT}"}` },
  reference: { alias: 'reference', type: 'reference' },
  reference_display: { alias: 'reference', type: 'reference', options: `{"foreign_label":"name"}`, display: 'name' },
}

describe('Components', () => {
  describe('Content', () => {
    describe('View', () => {
      describe('Header', () => {
        describe('Quicksearch', () => {
          describe('Helpers', () => {
            describe('filterExpression(field, value)', () => {
              describe('Boolean', () => {
                it('Should return false for empty string', async () => {
                  const field = FIELDS.boolean;
                  const value = '';
                  const result = filterExpression(field, value);
                  const expected = `__qs__${field.alias} = false`;
                  expect(result).toEqual(expected);
                });
                it('Should return false for No', async () => {
                  const field = FIELDS.boolean;
                  const value = 'No';
                  const result = filterExpression(field, value);
                  const expected = `__qs__${field.alias} = false`;
                  expect(result).toEqual(expected);
                });
                it('Should return false for false', async () => {
                  const field = FIELDS.boolean;
                  const value = 'false';
                  const result = filterExpression(field, value);
                  const expected = `__qs__${field.alias} = false`;
                  expect(result).toEqual(expected);
                });
                it('Should return true for Yes', async () => {
                  const field = FIELDS.boolean;
                  const value = 'Yes';
                  const result = filterExpression(field, value);
                  const expected = `__qs__${field.alias} = true`;
                  expect(result).toEqual(expected);
                });
                it('Should return true for true', async () => {
                  const field = FIELDS.boolean;
                  const value = 'true';
                  const result = filterExpression(field, value);
                  const expected = `__qs__${field.alias} = true`;
                  expect(result).toEqual(expected);
                });
                it('Should return true for string', async () => {
                  const field = FIELDS.boolean;
                  const value = 'string';
                  const result = filterExpression(field, value);
                  const expected = `__qs__${field.alias} = true`;
                  expect(result).toEqual(expected);
                });
              });
              describe('Integer / Primary key', () => {
                it('Should return undefined for empty string', async () => {
                  const field = FIELDS.integer;
                  const value = '';
                  const result = filterExpression(field, value);
                  const expected = undefined;
                  expect(result).toEqual(expected);
                });
                it('Should return undefined for float "0.0"', async () => {
                  const field = FIELDS.integer;
                  const value = '0.0';
                  const result = filterExpression(field, value);
                  const expected = undefined;
                  expect(result).toEqual(expected);
                });
                it('Should return undefined for float "0,0"', async () => {
                  const field = FIELDS.integer;
                  const value = '0,0';
                  const result = filterExpression(field, value);
                  const expected = undefined;
                  expect(result).toEqual(expected);
                });
                it('Should return undefined for float', async () => {
                  const field = FIELDS.integer;
                  const value = '0.1';
                  const result = filterExpression(field, value);
                  const expected = undefined;
                  expect(result).toEqual(expected);
                });
                it('Should return correct result for "0"', async () => {
                  const field = FIELDS.integer;
                  const value = '0';
                  const result = filterExpression(field, value);
                  const expected = `__qs__${field.alias} = 0`;
                  expect(result).toEqual(expected);
                });
                it('Should return correct result for float 0.0', async () => {
                  const field = FIELDS.integer;
                  const value = 0.0;
                  const result = filterExpression(field, value);
                  const expected = `__qs__${field.alias} = 0`;
                  expect(result).toEqual(expected);
                });
                it('Should return correct result - Number', async () => {
                  const field = FIELDS.integer;
                  const value = 0;
                  const result = filterExpression(field, value);
                  const expected = `__qs__${field.alias} = 0`;
                  expect(result).toEqual(expected);
                });
              });
              describe('Float', () => {
                it('Should return undefined for empty string', async () => {
                  const field = FIELDS.float;
                  const value = '';
                  const result = filterExpression(field, value);
                  const expected = undefined;
                  expect(result).toEqual(expected);
                });
                it('Should return correct result for "0"', async () => {
                  const field = FIELDS.float;
                  const value = '0';
                  const result = filterExpression(field, value);
                  const expected = `__qs__${field.alias} = 0`;
                  expect(result).toEqual(expected);
                });
                it('Should return correct result for float "0.0"', async () => {
                  const field = FIELDS.float;
                  const value = '0.0';
                  const result = filterExpression(field, value);
                  const expected = `__qs__${field.alias} = 0`;
                  expect(result).toEqual(expected);
                });
                it('Should return correct result for float "0,0"', async () => {
                  const field = FIELDS.float;
                  const value = '0,0';
                  const result = filterExpression(field, value);
                  const expected = `__qs__${field.alias} = 0`;
                  expect(result).toEqual(expected);
                });
                it('Should return correct result for float', async () => {
                  const field = FIELDS.float;
                  const value = '0.1';
                  const result = filterExpression(field, value);
                  const expected = `__qs__${field.alias} = 0.1`;
                  expect(result).toEqual(expected);
                });
                it('Should return correct result for float 0.0', async () => {
                  const field = FIELDS.float;
                  const value = 0.0;
                  const result = filterExpression(field, value);
                  const expected = `__qs__${field.alias} = 0`;
                  expect(result).toEqual(expected);
                });
                it('Should return correct result - Number', async () => {
                  const field = FIELDS.float;
                  const value = 0;
                  const result = filterExpression(field, value);
                  const expected = `__qs__${field.alias} = 0`;
                  expect(result).toEqual(expected);
                });
              });
              describe('Filter', () => {
                it('Should return correct result', async () => {
                  const field = FIELDS.filter;
                  const value = 'test';
                  const result = filterExpression(field, value);
                  const expected = `__qs__${field.alias} LIKE '%${value}%'`;
                  expect(result).toEqual(expected);
                });
                it("Should return correct result with '", async () => {
                  const field = FIELDS.filter;
                  const value = "'test";
                  const result = filterExpression(field, value);
                  const expected = `__qs__${field.alias} LIKE '%\\${value}%'`;
                  expect(result).toEqual(expected);
                });
                it("Should return correct result with \w'", async () => {
                  const field = FIELDS.filter;
                  const value = "\\test'";
                  const result = filterExpression(field, value);
                  const expected = `__qs__${field.alias} LIKE '%\\${value.replace("'", "\\'")}%'`;
                  expect(result).toEqual(expected);
                });
              });
              describe('Array (string)', () => {
                it('Should return correct result', async () => {
                  const field = FIELDS.array_string;
                  const value = 'test';
                  const result = filterExpression(field, value);
                  const expected = `__qs__${field.alias} LIKE '%${value}%'`;
                  expect(result).toEqual(expected);
                });
                it("Should return correct result with '", async () => {
                  const field = FIELDS.array_string;
                  const value = "'test";
                  const result = filterExpression(field, value);
                  const expected = `__qs__${field.alias} LIKE '%\\${value}%'`;
                  expect(result).toEqual(expected);
                });
                it("Should return correct result with \w'", async () => {
                  const field = FIELDS.array_string;
                  const value = "\\test'";
                  const result = filterExpression(field, value);
                  const expected = `__qs__${field.alias} LIKE '%\\${value.replace("'", "\\'")}%'`;
                  expect(result).toEqual(expected);
                });
                it("Should return correct result as values key", async () => {
                  const field = FIELDS.array_string;
                  const value = "one";
                  const result = filterExpression(field, value);
                  const expected = `__qs__${field.alias} = '${value}'`;
                  expect(result).toEqual(expected);
                });
              });
              describe('Datetime', () => {
                it('Should return undefined for wrong result', async () => {
                  const field = FIELDS.datetime;
                  const value = 'wrong';
                  const result = filterExpression(field, value);
                  const expected = undefined;
                  expect(result).toEqual(expected);
                });
                it('Should return correct result', async () => {
                  const field = FIELDS.datetime;
                  const value = '2019-09-12 00:00:00';
                  const result = filterExpression(field, value);
                  const expected = `__qs__${field.alias} = '${value}'`;
                  expect(result).toEqual(expected);
                });
              });
              describe('Reference', () => {
                it('Should return correct result - String', async () => {
                  const field = FIELDS.reference_display;
                  const value = 'test';
                  const result = filterExpression(field, value);
                  const expected = `${field.alias}.__qs__${FIELDS.reference_display.display} LIKE '%${value}%'`;
                  expect(result).toEqual(expected);
                });
                it('Should return correct result - Number', async () => {
                  const field = FIELDS.reference;
                  const value = '1';
                  const result = filterExpression(field, value);
                  const expected = `__qs__${field.alias} = ${value}`;
                  expect(result).toEqual(expected);
                });
              });
            });
          });
        });
      });
    });
  });
});
