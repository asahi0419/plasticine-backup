import generator from '../integer';

let value, result, expected, operator;
const field = { alias: 'field', name: 'Field', type: 'integer' };
const generate = (operator, value) => generator(field, operator, value, true);

describe('Filter', () => {
  describe('Expression generator', () => {
    describe('Integer [humanized]', () => {
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
            expected = "Field = 0";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is';
            value = '1';
            expected = "Field = 1";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is';
            value = '-1';
            expected = "Field = -1";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'is';
            value = 'js:';
            expected = "Field = 'js:'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:"value"';
            expected = "Field = 'js:\"value\"'";
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
            expected = "Field in (0)";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'in';
            value = '1';
            expected = "Field in (1)";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            expect(result).toEqual(expected);
            operator = 'in';
            value = '0,1';
            expected = "Field in (0,1)";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('js', () => {
            operator = 'in';
            value = 'js:';
            expected = "Field in 'js:'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
            value = 'js:"value"';
            expected = "Field in 'js:\"value\"'";
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
            expected = "Field between 0 and on 1";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
        });

        describe('is empty', () => {
          it('pass', () => {
            operator = 'is_empty';
            expected = "Field is empty";
            result = generate(operator);
            expect(result).toEqual(expected);
          });
        });

        describe('is not empty', () => {
          it('pass', () => {
            operator = 'is_not_empty';
            expected = "Field is not empty";
            result = generate(operator);
            expect(result).toEqual(expected);
          });
        });
      });
    });
  });
});
