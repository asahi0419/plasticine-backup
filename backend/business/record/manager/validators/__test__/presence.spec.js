import presenceValidator from '../presence.js';

describe('Record: Validator', () => {
  describe('Presence:', () => {
    it('It should correctly run with required rule', async () => {
      let field = { required_when_script: 'p.currentUser.isAdmin()', model: 1 };
      let value = '';
      let result = await presenceValidator(value, field, sandbox);
      let expected = ['static.field_cannot_be_blank'];
      expect(result).toEqual(expected);

      field = { required_when_script: 'p.currentUser.isAdmin()', model: 1 };
      value = 'value';
      result = await presenceValidator(value, field, sandbox);
      expected = undefined;
      expect(result).toEqual(expected);

      field = { required_when_script: '!p.currentUser.isAdmin()' };
      value = '';
      result = await presenceValidator(value, field, sandbox);
      expected = ['static.field_cannot_be_blank'];
      expect(result).toEqual(expected);

      field = { required_when_script: '!p.currentUser.isAdmin()' };
      value = 'value';
      result = await presenceValidator(value, field, sandbox);
      expected = undefined;
      expect(result).toEqual(expected);
    });
  });
});
