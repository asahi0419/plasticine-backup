import { map } from 'lodash/collection';

import * as HELPERS from '../helpers';
import * as CONSTANTS from '../constants';

describe('Helpers', () => {
  describe('parseDateFormat(options)', () => {
    it('Should parse datetime format', () => {
      let result, expected, format, date_only;

      result = HELPERS.parseDateFormat();
      expected = CONSTANTS.DEFAULT_DATE_FORMAT;

      result = HELPERS.parseDateFormat({ format: '' });
      expected = CONSTANTS.DEFAULT_DATE_FORMAT;

      result = HELPERS.parseDateFormat({ format: 'YYYY-MM-DD' });
      expected = 'YYYY-MM-DD';

      result = HELPERS.parseDateFormat({ format: 'YYYY-MM-DD HH:mm:ss' });
      expected = 'YYYY-MM-DD HH:mm:ss';

      result = HELPERS.parseDateFormat({ format: 'YYYY-MM-DD HH:mm:ss', date_only: true });
      expected = 'YYYY-MM-DD';

      expect(result).toEqual(expected);
    });
  });

  describe('parseNumber(value)', () => {
    it('Should return correct result', () => {
      let result, expected, value;

      value = '1.1'
      result = HELPERS.parseNumber(value);
      expected = 1.1;
      expect(result).toEqual(expected);

      value = 'string1.1'
      result = HELPERS.parseNumber(value);
      expected = 1.1;
      expect(result).toEqual(expected);

      value = '1.1string'
      result = HELPERS.parseNumber(value);
      expected = 1.1;
      expect(result).toEqual(expected);

      value = 'string1.1string'
      result = HELPERS.parseNumber(value);
      expected = 1.1;
      expect(result).toEqual(expected);

      value = '-1.1'
      result = HELPERS.parseNumber(value);
      expected = -1.1;
      expect(result).toEqual(expected);

      value = 'string-1.1'
      result = HELPERS.parseNumber(value);
      expected = -1.1;
      expect(result).toEqual(expected);

      value = '-1.1string'
      result = HELPERS.parseNumber(value);
      expected = -1.1;
      expect(result).toEqual(expected);

      value = 'string-1.1string'
      result = HELPERS.parseNumber(value);
      expected = -1.1;
      expect(result).toEqual(expected);
    });
  });
});
