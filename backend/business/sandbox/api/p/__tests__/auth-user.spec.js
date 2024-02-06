import IpBan from '../../../../user/ip-ban/index.js';
import authUserFunction from '../auth-user/index.js';

const request = {};
const context = { request };

const authUser = authUserFunction(context, sandbox);

describe('Sandbox', () => {
  describe('Api', () => {
    describe('p', () => {
      describe('authUser(email, password)', () => {
        it('Should return user proxy instance', async () => {
          const email = process.env.APP_ADMIN_USER;
          const password = 'password';

          jest.spyOn(IpBan.prototype, 'process');

          const result = await authUser(email, password);

          expect(result.constructor.name).toEqual('UserProxy');
          expect(result.user.account.email).toEqual(email);
          expect(IpBan.prototype.process).toBeCalledWith('validate', 'login', 'email_is_not_registered');
          expect(IpBan.prototype.process).toBeCalledWith('validate', 'login', 'password', result.user.account);
        });
        it('Should process ip ban creation if user does not exist', async () => {
          const email = 'anonymoys@free.man';
          const password = 'password';

          jest.spyOn(IpBan.prototype, 'process');
          const result = await authUser(email, password);
          expect(IpBan.prototype.process).toBeCalledWith('create', 'login', 'email_is_not_registered');
        });
        it('Should process ip ban creation if wrong password', async () => {
          const email = process.env.APP_ADMIN_USER;
          const password = 'wrong_password';

          jest.spyOn(IpBan.prototype, 'process');

          const result = await authUser(email, password);

          expect(IpBan.prototype.process).toBeCalledWith('create', 'login', 'email_is_not_registered');
          expect(IpBan.prototype.process).toBeCalledWith('create', 'login', 'password', undefined);
        });
        it('Should throw error if some credential miss', async () => {
          const email = process.env.APP_ADMIN_USER;
          const password = 'password';

          let result = authUser(email, undefined);
          await expect(result).rejects.toMatchObject({ name: 'WrongUserCredentialsError' });

          result = authUser(undefined, password);
          await expect(result).rejects.toMatchObject({ name: 'WrongUserCredentialsError' });
        });
      });
    });
  });
});
