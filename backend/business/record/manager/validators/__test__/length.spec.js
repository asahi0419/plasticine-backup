import { validateLength, validateRTLSelectCount } from '../length.js';

const field = { name: 'Test', options: '{"length":255}' };

describe('Record: Validator', () => {
  describe('Length:', () => {
    describe('validateLength(value, field, sandbox):', () => {
      it('It should return nothing if value is less than specified limit specified in field options', () => {
        expect(validateLength('#'.repeat(255), field, sandbox)).toEqual(undefined);
      });
      it('It should return an error message if value is greater than limit specified in field options', () => {
        expect(validateLength('#'.repeat(256), field, sandbox)).toEqual('static.field_cannot_be_longer_than_length');
      });
    })
    describe('validateRTLSelectCount(value, field, sandbox):', () => {
      it('It should return nothing if value is less than limit specified in settings', async () => {
        expect(validateRTLSelectCount('#'.repeat(99), field, sandbox)).toEqual(undefined);
      });
      it('It should return an error message if value is greater than limit specified in settings', async () => {
        expect(validateRTLSelectCount('#'.repeat(101), field, sandbox)).toEqual('static.field_rtl_select_limit');
      });
    });
  });
});
