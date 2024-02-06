import generator from '../boolean-stub';

let field, operator, value, result, expected;
const generate = (field, operator, value) => generator(field, operator, value);

describe('Filter', () => {
  describe('Expression generator', () => {
    describe('Boolean Stub', () => {
      it('Should return correct result', () => {
        field = { alias: 'true' };
        expected = "TRUE";
        result = generate(field, operator, value);
        expect(result).toEqual(expected);
        field = { alias: 'false' };
        expected = "FALSE";
        result = generate(field, operator, value);
        expect(result).toEqual(expected);
      });
    });
  });
});
