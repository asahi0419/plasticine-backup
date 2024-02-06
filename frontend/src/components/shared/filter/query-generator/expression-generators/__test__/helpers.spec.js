import * as HELPERS from '../helpers';

describe('Filter', () => {
  describe('Expression generator', () => {
    describe('Helpers', () => {
      describe('prepareValue(field, operator, value, humanize)', () => {
        describe('Primary key', () => {
          it('Should return correct result', () => {
            let result, expected, operator, value, humanize;
            const field = { type: 'primary_key' };

            operator = 'in';
            value = '1,2';
            result = HELPERS.prepareValue(field, operator, value, humanize);
            expected = [1, 2];
            expect(result).toEqual(expected);

            operator = 'not_in';
            value = '1,2';
            result = HELPERS.prepareValue(field, operator, value, humanize);
            expected = [1, 2];
            expect(result).toEqual(expected);
          });
        });
      });
    });
  });
});
