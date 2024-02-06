import { loadAccount } from '../index.js';

describe('User', () => {
  describe('loadAccount(params)', () => {
    it('Should return correct result', async () => {
      let params, expected, result;

      params = { email: undefined };
      result = await loadAccount(params);
      expect(result).not.toBeDefined();

      params = { email: process.env.APP_ADMIN_USER };
      result = await loadAccount(params);
      expect(result.id).toEqual(1);

      params = { email: 'ADMIN@FREE.MAN' };
      result = await loadAccount(params);
      expect(result.id).toEqual(1);

      params = { email: 'dmin@free.man' };
      result = await loadAccount(params);
      expect(result).not.toBeDefined();

      params = { email: 'DMIN@FREE.MAN' };
      result = await loadAccount(params);
      expect(result).not.toBeDefined();
    });
  });
});
