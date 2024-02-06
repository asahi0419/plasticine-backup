import generator from '../current-user';

let field, operator, value, result, expected;
const generate = (field, operator, value) => generator(field, operator, value, true);

describe('Filter', () => {
  describe('Expression generator', () => {
    describe('Current user', () => {
      it('Should return correct result', () => {
        operator = 'belongs_to_group';
        value = 'value';
        expected = "Current user belongs to \"value\" workgroup";
        result = generate(field, operator, value);
        expect(result).toEqual(expected);
      });
    });
  });
});
