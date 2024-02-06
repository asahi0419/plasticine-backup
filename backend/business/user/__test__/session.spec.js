import { getSetting } from '../../setting/index.js';

import * as SESSION from '../session.js';

const getRequest = (ip = '0.0.0.0') => ({ translate: jest.fn(), __headers: { 'x-real-ip': ip } });

describe('User', () => {
  describe('Session', () => {
    describe('createSession(user, request, sandbox)', () => {
      it('Should create session with correct attributes', async () => {
        const user = sandbox.context.user;
        const request = getRequest();

        const result = await SESSION.createSession(user, request, sandbox);

        expect(result).toMatchObject({
          "created_by": user.id,
          "details": "{}",
          "ip_address": "0.0.0.0",
        });
      });
    });

    describe('findSessionByUserId(id)', () => {
      it('Should create session with correct attributes', async () => {
        const result = await SESSION.findSessionByUserId(sandbox.context.user.id);

        expect(result).toMatchObject({
          "created_by": user.id,
          "details": "{}",
          "ip_address": "0.0.0.0",
        });
      });
    });

    describe('checkMultisession(account)', () => {
      it('Should create session with correct attributes', async () => {
        const account = await db.model('account').where({ id: sandbox.context.user.account }).getOne();
        expect(account.multisession).toEqual('global');

        let result = SESSION.checkMultisession();
        expect(result).toEqual(getSetting('session.multisession'));

        result = SESSION.checkMultisession(account);
        expect(result).toEqual(false);
      });
    });
  });
});
