import { validateSession } from '../account.js';
import * as SESSION from '../../../user/session.js';

const { record } = h;
const { manager } = record;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('DB Rule: Account', () => {
  describe('validateUserPresence', () => {
    it('Mode - Secure: should throw an exception if related user does not exist', async () => {
      const account = manager('account', 'secure').create();
      await expect(account).rejects.toMatchObject({ description: 'static.cannot_create_an_account' });
    });
    it('Mode - Seeding: should not throw an exception if related user does not exist', async () => {
      const account = await manager('account', 'seeding').create();
      expect(account).toMatchObject({ __inserted: true });
    });
  });

  describe('validateEmail', () => {
    describe('before_insert', () => {
      it('Should validate email uniqueness', async () => {
        const email = 'test@gmail.com';

        const account = await manager('account').create({ email });
        await expect(manager('account').create({ email })).rejects.toMatchObject({ description: 'static.field_must_be_unique' });
      });
    });

    describe('before_update', () => {
      it('Should not validate email uniqueness if email is not changed', async () => {
        const security_code = '00000';

        const account = await manager('account').create();
        expect(await manager('account').update(account, { security_code })).toMatchObject({ security_code });
      });
    });
  });

  describe('validatePassword', () => {
    it('Should validate min password length', async () => {
      const password = '1234';
      const account = manager('account').create({ password });

      await expect(account).rejects.toMatchObject({ description: 'static.min_password_length' });
    });
    it('Should validate max password length', async () => {
      const password = '123456789123456789123456789123456789';
      const account = manager('account').create({ password });

      await expect(account).rejects.toMatchObject({ description: 'static.max_password_length' });
    });
  });

  describe('generatePassword', () => {
    it('Should generate encrypted password and salt for account', async () => {
      const password = '1234567890';
      const account = await manager('account').create({ password });

      expect(account.password).not.toEqual(password);
      expect(account.salt).toHaveLength(20);
    });
  });

  describe('generateStaticToken', () => {
    it('Should generate static token for account', async () => {
      const password = '1234567890';
      const account = await manager('account').create({ password });

      expect(account.static_token).toHaveLength(32);
    });
  });
});

describe('validateSession', () => {
  it('Should close all active sessions if password changed', async () => {
    const record = { id: 1 };
    const sandbox = { record: { isChanged: (alias) => (alias === 'password') } };

    jest.spyOn(SESSION, 'closeAllActiveSessions');
    await validateSession(record, sandbox);
    expect(SESSION.closeAllActiveSessions).toBeCalledWith(expect.objectContaining(record), { reason_to_close: 'auto' }, sandbox);
  });

  it('Should close all active sessions multisession changed', async () => {
    const record = { id: 1 };
    const sandbox = {
      translate: () => 'translate',
      record: {
        isChanged: (alias) => (alias === 'multisession'),
        getValue: () => 'no',
        getPrevValue: () => 'yes',
      },
    };

    jest.spyOn(SESSION, 'closeAllActiveSessions');
    await validateSession(record, sandbox);
    expect(SESSION.closeAllActiveSessions).toBeCalledWith(expect.objectContaining(record), { message: 'translate', reason_to_close: 'auto' }, sandbox);
  });
});
