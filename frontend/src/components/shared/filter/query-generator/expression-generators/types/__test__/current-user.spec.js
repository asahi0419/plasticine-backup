import generator from '../current-user';

let field, operator, value, result, expected;
const generate = (field, operator, value) => generator(field, operator, value);

describe('Filter', () => {
  describe('Expression generator', () => {
    describe('Current user', () => {
      it('Should return correct result', () => {
        operator = 'belongs_to_group';
        value = 'value';
        expected = undefined;
        result = generate(field, operator, value);
        expect(result).toEqual(expected);
      });
    });
  });
});
