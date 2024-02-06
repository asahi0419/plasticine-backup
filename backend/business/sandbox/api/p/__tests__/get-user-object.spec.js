import getUserObjectFunction from '../get-user-object';
import UserProxy from '../current-user/index.js';

const getUserObject = getUserObjectFunction(sandbox);

describe('Sandbox', () => {
  describe('Api', () => {
    describe('p', () => {
      describe('getUserObject(record)', () => {
        it('Should return user proxy instance', async () => {
          const record = { id: 1, account: 1 };
          const result = await getUserObject(record);

          expect(result.user.id).toEqual(record.id);
          expect(result.user.account.id).toEqual(record.account);
          expect(result.constructor.name).toEqual('UserProxy');
        });
        it('Should throw error if params are not valid', async () => {
          await expect(getUserObject()).rejects.toMatchObject({ name: 'ParamsNotValidError' });
          await expect(getUserObject({ id: 1 })).rejects.toMatchObject({ name: 'ParamsNotValidError' });
          await expect(getUserObject({ account: 1 })).rejects.toMatchObject({ name: 'ParamsNotValidError' });
          await expect(getUserObject({ __type: 'user' })).rejects.not.toMatchObject({ name: 'ParamsNotValidError' });
        });
      });
    });
  });
});
