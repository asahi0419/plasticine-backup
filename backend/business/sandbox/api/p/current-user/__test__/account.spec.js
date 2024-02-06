import { createRequire } from "module";
const require = createRequire(import.meta.url)

import RecordProxy from '../../../model/record/index.js';
import AccountProxy from '../account';
import { UserProxy } from '../index.js';

const DEFAULT_REQUEST = { translate: jest.fn(), __headers: { 'x-real-ip': '0.0.0.0' } };
const DEFAULT_RESPONSE = { json: jest.fn() };

const { record, email } = h;
const { manager } = record;

const currentPassword = '1234567890';
const invalidPassword = '1234567890_invalid';
const newPassword = '1234567890_new';

beforeAll(async () => {
  t.user = await manager('user').create({
    password: currentPassword,
    account: { email: email(), password: currentPassword, status: 'active' },
  });
  t.user.account = await db.model('account').where({ id: t.user.account }).getOne();

  global.userProxy = new UserProxy(t.user, sandbox);
  global.account = new AccountProxy(t.user, sandbox);
});

describe('Sandbox', () => {
  describe('Api', () => {
    describe('AccountProxy', () => {
      describe('update(attributes)', () => {
        it('Should return session record proxy instance with correct data', async () => {
          const attributes = { status: 'waiting_confirmation' };
          await account.update(attributes);

          expect(account.getValue('status')).toEqual(attributes.status);
        });
      });

      describe('getValue(fieldAlias)', () => {
        it('Should return user value', async () => {
          const result = account.getValue('id');
          const expected = account.user.account.id;

          expect(result).toEqual(expected);
        });
      });

      describe('closeActiveSessions(options)', () => {
        it('Should return user value', async () => {
          const session = require('../../../../../user/session.js');
          const options = {};

          jest.spyOn(session, 'closeAllActiveSessions');
          const result = account.closeActiveSessions(options);
          expect(session.closeAllActiveSessions).toBeCalledWith(account.user, options, account.sandbox);
        });
      });

      describe('closeCurrentSession(options)', () => {
        it('Should return user value', async () => {
          const session = require('../../../../../user/session.js');
          const options = {};

          let result = await account.closeCurrentSession(options);
          expect(result).not.toBeDefined();

          jest.spyOn(session, 'closeSession');
          account.user.__session = { id: 1 };
          result = account.closeCurrentSession(options);
          expect(session.closeSession).toBeCalledWith(account.user.__session, options, account.user, account.sandbox);
        });
      });

      describe('createSession(request)', () => {
        it('Should return session record proxy instance with correct data', async () => {
          const session = await account.createSession(DEFAULT_REQUEST);

          expect(session).toBeInstanceOf(RecordProxy);
          expect(session.getValue('ip_address')).toEqual(DEFAULT_REQUEST.__headers['x-real-ip']);
        });
      });

      describe('resetStaticToken()', () => {
        it('Should reset security code', async () => {
          const record = await db.model('account').where({ id: account.user.account.id }).getOne();

          expect(record.static_token).toBeDefined();
          expect(record.static_token).toEqual(account.getValue('static_token'));

          await account.resetStaticToken();

          expect(record.static_token).toBeDefined();
          expect(record.static_token).not.toEqual(account.getValue('static_token'));
        });
      });

      describe('resetSecurityCode()', () => {
        it('Should reset security code', async () => {
          const record = await db.model('account').where({ id: account.user.account.id }).getOne();

          expect(record.security_code).toBeDefined();
          expect(record.security_code).toEqual(account.getValue('security_code'));

          await account.resetSecurityCode();

          expect(record.security_code).toBeDefined();
          expect(record.security_code).not.toEqual(account.getValue('security_code'));
        });
      });

      describe('sendSecurityCode(subject)', () => {
        it('Should send security code', async () => {
          const subject = `test`;
          await account.sendSecurityCode(subject);
          const result = await db.model('email').getOne();
          const grc = await db.model('global_references_cross').where({
            target_model: db.getModel('account').id,
            target_record_id: account.getValue('id'),
          }).getOne();

          expect(result).toBeDefined();
          expect(result).toMatchObject({
            body: `Dear customer,

To verify your identity, please use the following code:
${account.getValue('security_code')}

Best regards,
Streamline team`,
            subject: `Streamline ${subject}`,
            target_record: grc.id,
            to: account.user.account.email,
          });
        });
      });

      describe('validateSecurityCode(code, request)', () => {
        it('Should validate security code', async () => {
          let result;

          await account.validateSecurityCode(account.getValue('security_code'), DEFAULT_REQUEST, { ip_ban: { type: 'password_recovery_security_code_protection' } });
          result = await db.model('ip_ban').getOne();

          expect(result).not.toBeDefined();

          await account.validateSecurityCode('test', DEFAULT_REQUEST, { ip_ban: { type: 'password_recovery_security_code_protection' } });
          result = await db.model('ip_ban').getOne();

          expect(result.ip).toEqual(DEFAULT_REQUEST.__headers['x-real-ip']);
        });
      });

      describe('changePassword', () => {
        it('Should throw an exception if current password is not valid', async () => {
          const result = account.changePassword(invalidPassword, newPassword);
          const object = { name: 'WrongUserCredentialsError', description: 'static.current_password_is_not_valid' };

          await expect(result).rejects.toMatchObject(object);
        });

        it('Should throw an exception if current password is used recently', async () => {
          const result = account.changePassword(currentPassword, currentPassword);
          const object = { name: 'WrongUserCredentialsError', description: 'static.password_used_recently' };

          await expect(result).rejects.toMatchObject(object);
        });

        it('Should generate new encrypted password for account', async () => {
          const currentPasswordEncrypted = account.getValue('password');
          await account.changePassword(currentPassword, newPassword);
          const newPasswordEncrypted = account.getValue('password');

          expect(!!newPasswordEncrypted.length).toEqual(true);
          expect(newPasswordEncrypted).not.toEqual(currentPassword);
          expect(newPasswordEncrypted).not.toEqual(currentPasswordEncrypted);
        });
      });
    });
  });
});
