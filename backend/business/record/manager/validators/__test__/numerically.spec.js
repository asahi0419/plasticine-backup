import { validateRanges } from '../numericality.js';


describe('Record: Validator', () => {
  describe('Numerically:', () => {
    describe('validateRanges(value, field, sandbox):', () => {
      it('It should return nothing if min or max is not specified', () => {
        const field = { name: 'Test', options: '{}' };
        expect(validateRanges(1, field, sandbox)).toEqual(undefined);
      });
      it('It should return nothing if min and max are specified [value exists]', () => {
        const field = { name: 'Test', options: '{"min":0,"max":10}' };
        expect(validateRanges(0, field, sandbox)).toEqual(undefined);
      });
      it('It should return nothing if min and max are specified and not required [value does not exist]', () => {
        const field = { name: 'Test', options: '{"min":0,"max":10}' };
        expect(validateRanges(null, field, sandbox)).toEqual(undefined);
      });
    })
  });
});
