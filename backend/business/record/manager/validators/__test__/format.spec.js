import { validateDatetimeFormat } from '../format.js';

const datetimeCorrect = '22-12-2018';
const datetimeIncorrect = '22-12-2018-incorrect';

const field = { name: 'Test', options: '{"format":"DD-MM-YYYY"}' };

describe('Record: Validator', () => {
  describe('validateDatetimeFormat(format, field, sandbox):', () => {
    it('It should return nothing if datetime format is correct', () => {
      expect(validateDatetimeFormat(datetimeCorrect, field, sandbox)).toEqual(undefined);
    });
    it('It should return an error message if datetime format is incorrect', () => {
      expect(validateDatetimeFormat(datetimeIncorrect, field, sandbox)).toEqual('static.field_has_wrong_format');
    });
  });
});
