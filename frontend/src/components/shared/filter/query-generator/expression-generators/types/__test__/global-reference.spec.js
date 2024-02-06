import generator from '../global-reference';

let value, result, expected, operator;
const field = { alias: 'field', name: 'Field', type: 'global_reference' };
const generate = (operator, value) => generator(field, operator, value);

describe('Filter', () => {
  describe('Expression generator', () => {
    describe('Global reference', () => {
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
            expected = "`field` = 'test'";
            result = generate(operator, value);
            expect(result).toEqual(expected);
          });
          it('object', () => {
            operator = 'is';
            value = {};
            expected = undefined;
            result = generate(operator, value);
            expect(result).toEqual(expected);
            operator = 'is';
            value = { model: 'model', id: 'id' };
            expected = "`field` = 'model/id'";
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
      });
    });
  });
});