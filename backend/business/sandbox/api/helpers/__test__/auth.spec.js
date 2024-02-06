import AccountProxy from '../../p/current-user/account.js';
import authNamespace from '../auth.js';
import { getJWTToken } from '../../../../helpers/index.js';

const DEFAULT_REQUEST = {
  translate: jest.fn(),
  headers: {
    'x-real-ip': '0.0.0.0'
  },
};
const DEFAULT_RESPONSE = {
  json: jest.fn(),
};

const getAuthHelpers = (request = DEFAULT_REQUEST, response = DEFAULT_RESPONSE) => {
  return authNamespace({ request, response }, sandbox);
};

describe('Sandbox', () => {
  describe('Api', () => {
    describe('Helpers: Auth', () => {
      describe('isAuthorized(email)', () => {
        it('Should return correct result', async () => {
          const email = 'test@mail.com';

          let result = await getAuthHelpers().isAuthorized(email);
          let expected = false;
          expect(result).toEqual(expected);

          result = await getAuthHelpers({ headers: { authorization: `JWT invalid_token` } }).isAuthorized(email);
          expected = false;
          expect(result).toEqual(expected);

          result = await getAuthHelpers({ headers: { authorization: `JWT ${getJWTToken({ account: { email } })}` } }).isAuthorized(email);
          expected = true;
          expect(result).toEqual(expected);
        });
      });

      describe('authenticate(account)', () => {
        it('Should send json response', async () => {
          const account = await getAuthHelpers().createAccount('test1@mail.com', 'password');
          const result = await getAuthHelpers().authenticate(account);

          jest.spyOn(DEFAULT_RESPONSE, 'json');

          expect(DEFAULT_RESPONSE.json).toBeCalledWith(expect.any(Object));
        });
      });

      describe('createAccount(email, password)', () => {
        it('Should return account proxy with correct data', async () => {
          const email = 'test2@mail.com';
          const account = await getAuthHelpers().createAccount(email, 'password');

          expect(account).toBeInstanceOf(AccountProxy);

          expect(account.getValue('password')).toBeDefined();
          expect(account.getValue('security_code')).toEqual(null);
          expect(account.getValue('email')).toEqual(email);
        });
        it('Should throw registration error if account with email already exists', async () => {
          const email = 'test2@mail.com';
          const account = getAuthHelpers().createAccount(email, 'password');
          await expect(account).rejects.toMatchObject({ description: 'static.email_is_already_registered' });
        });
      });

      describe('findAccountByEmail(email)', () => {
        it('Should return account proxy by email', async () => {
          const email = 'test2@mail.com';
          const account = await getAuthHelpers().findAccountByEmail(email);

          expect(account).toBeInstanceOf(AccountProxy);
          expect(account.getValue('email')).toEqual(email);
        });
        it('Should throw authentication error if account with email does not exists', async () => {
          const email = 'test3@mail.com';
          const user = getAuthHelpers().findAccountByEmail(email, { ip_ban: { type: 'login' } });
          // adjusted after https://gitlab.nasc.space/co2/plasticine/commit/f69c65392f5aba14afa37375bd073cf0b1ba87a6
          // correct errors throws is disabled for test environment business/user/ip-ban.js
          await expect(user).rejects.toMatchObject({ name: 'TypeError' });
        });
      });
    });
  });
});
