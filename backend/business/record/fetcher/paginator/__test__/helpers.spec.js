import * as HELPERS from '../helpers.js';

describe('Record', () => {
  describe('Fetcher', () => {
    describe('Paginator', () => {
      describe('Helpers', () => {
        describe('getPageNumber(value)', () => {
          it('Should return correct result', () => {
            let result, expected;

            result = HELPERS.getPageNumber(1);
            expected = 1;
            expect(result).toEqual(expected);

            result = HELPERS.getPageNumber(-1);
            expected = 1;
            expect(result).toEqual(expected);
          });
        });

        describe('getPageSize(value)', () => {
          it('Should return correct result', () => {
            let result, expected;

            result = HELPERS.getPageSize(1);
            expected = 1;
            expect(result).toEqual(expected);

            result = HELPERS.getPageSize(-1);
            expected = 0;
            expect(result).toEqual(expected);
          });
        });
      });
    });
  });
})
