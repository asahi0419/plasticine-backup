import generator from '../integer';

let value, result, expected, operator;
const field = { alias: 'field', name: 'Field', type: 'integer' };
const generate = (operator, value) => generator(field, operator, value);

describe('Filter', () => {
  describe('Expression generator', () => {
    describe('Integer', () => {
      describe('Operators', () => {
        describe('is', () => {
          it('string', () => {
            operator = 'is';
            value = '';
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is';
            value = 'test';
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is';
            value = '0';
            expected = "`field` = 0";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is';
            value = '1';
            expected = "`field` = 1";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is';
            value = '-1';
            expected = "`field` = -1";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'is';
            value = 'js:';
            expected = "`field` = 'js:'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:"value"';
            expected = "`field` = 'js:\"value\"'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
        });

        describe('in', () => {
          it('string', () => {
            operator = 'in';
            value = '';
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'in';
            value = 'test';
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'in';
            value = '0';
            expected = "`field` IN (0)";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'in';
            value = '1';
            expected = "`field` IN (1)";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            expect(result).toEqual(expected);
            operator = 'in';
            value = '0,1';
            expected = "`field` IN (0,1)";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'in';
            value = 'js:';
            expected = "`field` IN 'js:'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:"value"';
            expected = "`field` IN 'js:\"value\"'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
        });

        describe('between', () => {
          it('pass', () => {
            operator = 'between';
            value = [];
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'between';
            value = [1];
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'between';
            value = [0, 1];
            expected = "`field` BETWEEN 0 AND 1";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
        });

        describe('is empty', () => {
          it('pass', () => {
            operator = 'is_empty';
            expected = "`field` IS NULL";
            result = generate(operator);
            expect(result).toEqual(expected);
          });
        });

        describe('is not empty', () => {
          it('pass', () => {
            operator = 'is_not_empty';
            expected = "`field` IS NOT NULL";
            result = generate(operator);
            expect(result).toEqual(expected);
          });
        });
      });
    });
  });
});
