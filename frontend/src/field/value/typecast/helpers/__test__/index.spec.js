import * as HELPERS from '../';

describe('Field', () => {
  describe('Values', () => {
    describe('typecast(field, value)', () => {
      describe('Helpers', () => {
        describe('shouldReturnUndefined(value)', () => {
          it('Should return correct result', () => {
            let result, expected, value;

            value = new Function();
            result = HELPERS.shouldReturnUndefined(value);
            expected = true;
            expect(result).toEqual(expected);

            value = new Error();
            result = HELPERS.shouldReturnUndefined(value);
            expected = true;
            expect(result).toEqual(expected);

            value = undefined;
            result = HELPERS.shouldReturnUndefined(value);
            expected = true;
            expect(result).toEqual(expected);

            value = new RegExp();
            result = HELPERS.shouldReturnUndefined(value);
            expected = true;
            expect(result).toEqual(expected);

            value = +'s0';
            result = HELPERS.shouldReturnUndefined(value);
            expected = true;
            expect(result).toEqual(expected);
          });
        });

        describe('shouldReturnAsIs(value)', () => {
          it('Should return correct result', () => {
            let result, expected, value;

            value = null;
            result = HELPERS.shouldReturnAsIs(value);
            expected = true;
            expect(result).toEqual(expected);
          });
        });
      });
    });
  });
});
