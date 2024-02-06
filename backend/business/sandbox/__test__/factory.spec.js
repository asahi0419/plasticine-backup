import Sandbox from '../index.js';
import { sandboxFactory } from '../factory.js';
import * as USER from '../../user/index.js';

beforeEach(async () => {
  jest.clearAllMocks();
});

describe('Sandbox', () => {
  describe('Factory', () => {
    it('Should correctly run', async () => {
      jest.spyOn(USER, 'extendUser');

      let result, input, user, email;

      user = {
        ...await db.model('user').where({ id: 1 }).getOne(),
        account: await db.model('account').where({ id: 1 }).getOne(),
      }
      result = await sandboxFactory(user);
      expect(result).toBeInstanceOf(Sandbox);
      expect(result.vm.p.currentUser.getAccount().getValue('id')).toEqual(user.account.id);
      expect(result.vm.p.currentUser.getAccount().getValue('email')).toEqual(user.account.email);

      email = process.env.APP_ADMIN_USER;
      result = await sandboxFactory(email);
      expect(result).toBeInstanceOf(Sandbox);
      expect(result.vm.p.currentUser.getAccount().getValue('id')).toEqual(user.account.id);
      expect(result.vm.p.currentUser.getAccount().getValue('email')).toEqual(user.account.email);

      expect(USER.extendUser).toBeCalledWith(user);
    });
  });
});
