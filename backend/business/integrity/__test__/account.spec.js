import IntegrityManager from '../index.js';

const { manager } = h.record;

describe('IntegrityManager: Account', () => {
  describe('.perform(\'validate\')', () => {
    it('It should throw an exception if dependent users found', async () => {
      const user = await manager('user').create();
      const account = await db.model('account').where({ id: user.account }).getOne();
      const result = new IntegrityManager({ ...account, __type: 'account' }, sandbox).perform('validate');

      await expect(result).rejects.toMatchObject({ name: 'IntegrityError', stack: { models: ['user'] }});
    });
  });
});
