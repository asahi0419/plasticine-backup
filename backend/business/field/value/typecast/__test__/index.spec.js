import typecast from '../index.js';

describe('Field', () => {
  describe('Values', () => {
    describe('typecast(field, value, options)', () => {
      it('Should return correct result', () => {
        const field = { type: 'string' };
        let result, expected, value;

        // from null
        value = null;
        expected = value;
        result = typecast(field, value);
        expect(result).toEqual(expected);

        // from undefined
        value = undefined;
        expected = value;
        result = typecast(field, value);
        expect(result).toEqual(expected);

        // from NaN
        value = NaN;
        expected = undefined;
        result = typecast(field, value);
        expect(result).toEqual(expected);

        // from error
        value = new Error();
        expected = undefined;
        result = typecast(field, value);
        expect(result).toEqual(expected);

        // from function
        value = new Function();
        expected = undefined;
        result = typecast(field, value);
        expect(result).toEqual(expected);

        // from regexp
        value = new RegExp();
        expected = undefined;
        result = typecast(field, value);
        expect(result).toEqual(expected);
      });
    });
  });
});
