import generator from '../true-stub';

let field, operator, value, result, expected;
const generate = (field, operator, value) => generator(field, operator, value);

describe('Filter', () => {
  describe('Expression generator', () => {
    describe('True Stub', () => {
      it('Should return correct result', () => {
        value = '';
        expected = `TRUE = 'js:'`;
        result = generate(field, operator, value);
        expect(result).toEqual(expected);
        value = 'value';
        expected = `TRUE = '${value}'`;
        result = generate(field, operator, value);
        expect(result).toEqual(expected);
      });
    });
  });
});
