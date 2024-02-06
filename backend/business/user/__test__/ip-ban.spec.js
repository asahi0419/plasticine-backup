import moment from 'moment';

import IpBan from '../ip-ban/index.js';
import RecordProxy from '../../sandbox/api/model/record/index.js';

const getRequest = (ip = '0.0.0.0') => ({ translate: jest.fn(), __headers: { 'x-real-ip': ip } });

const DEFAULT_TYPE = 'password_recovery_security_code_protection';
const DEFAULT_OPERATION = 'security_code';
const DEFAULT_ACCOUNT = { id: 1 };
const DEFAULT_SETTINGS = {
  account: {
    ban: false,
    attempts: 5,
    duration: 60,
    by_levels: false
  },
  ip: {
    ban: true,
    attempts: 3,
    duration: 60,
    by_levels: true
  },
};

// common cases data
// ----------------------------------------------------------------------------
const NOW_1 = moment();
const NOW_2 = moment(NOW_1).add(1, 'day');
const NOW_3 = moment(NOW_2).add(1, 'day');
const NOW_4 = moment(NOW_3).add(1, 'day');
const NOW_5 = moment(NOW_4).add(1, 'day');
const NOW_6 = moment(NOW_5).add(1, 'day');
const NOW_7 = moment(NOW_6).add(1, 'day');
// ============================================================================

afterEach(() => jest.clearAllMocks());

describe('User', () => {
  describe('IpBan', () => {
    describe('constructor(request, sandbox, settings)', () => {
      it('Should be properly initiated', async () => {
        const request = getRequest();
        let ipBan, settings;

        settings = undefined
        ipBan = new IpBan(request, sandbox, settings);

        expect(ipBan.settings.ip.ban).toEqual(DEFAULT_SETTINGS.ip.ban);
        expect(ipBan.settings.ip.attempts).toEqual(DEFAULT_SETTINGS.ip.attempts);
        expect(ipBan.settings.ip.duration).toEqual(DEFAULT_SETTINGS.ip.duration);
        expect(ipBan.settings.ip.by_levels).toEqual(DEFAULT_SETTINGS.ip.by_levels);
        expect(ipBan.settings.ip.ban_type).toEqual('ip');

        expect(ipBan.settings.account.ban).toEqual(DEFAULT_SETTINGS.account.ban);
        expect(ipBan.settings.account.attempts).toEqual(DEFAULT_SETTINGS.account.attempts);
        expect(ipBan.settings.account.duration).toEqual(DEFAULT_SETTINGS.account.duration);
        expect(ipBan.settings.account.by_levels).toEqual(DEFAULT_SETTINGS.account.by_levels);
        expect(ipBan.settings.account.ban_type).toEqual('account');

        settings = { ip: { ban: true, attempts: 2 }, account: { ban: true, attempts: 2 } }
        ipBan = new IpBan(request, sandbox, settings);

        expect(ipBan.settings.ip.ban).toEqual(settings.ip.ban);
        expect(ipBan.settings.ip.attempts).toEqual(settings.ip.attempts);

        expect(ipBan.settings.account.ban).toEqual(settings.account.ban);
        expect(ipBan.settings.account.attempts).toEqual(settings.account.attempts);

        settings = { ip: { ban: false, attempts: 0 }, account: { ban: false, attempts: 0 } }
        ipBan = new IpBan(request, sandbox, settings);

        expect(ipBan.settings.ip.ban).toEqual(settings.ip.ban);
        expect(ipBan.settings.ip.attempts).toEqual(settings.ip.attempts);

        expect(ipBan.settings.account.ban).toEqual(settings.account.ban);
        expect(ipBan.settings.account.attempts).toEqual(settings.account.attempts);

        settings = { ip: { ban: 'false', attempts: 0 }, account: { ban: 'false', attempts: 0 } }
        ipBan = new IpBan(request, sandbox, settings);

        expect(ipBan.settings.ip.ban).toEqual(false);
        expect(ipBan.settings.ip.attempts).toEqual(settings.ip.attempts);

        expect(ipBan.settings.account.ban).toEqual(false);
        expect(ipBan.settings.account.attempts).toEqual(settings.account.attempts);

        settings = { ip: { ban: 'true', attempts: 0 }, account: { ban: 'true', attempts: 0 } }
        ipBan = new IpBan(request, sandbox, settings);

        expect(ipBan.settings.ip.ban).toEqual(false);
        expect(ipBan.settings.ip.attempts).toEqual(settings.ip.attempts);

        expect(ipBan.settings.account.ban).toEqual(false);
        expect(ipBan.settings.account.attempts).toEqual(settings.account.attempts);

        settings = { ip: { ban: true, attempts: 0 }, account: { ban: true, attempts: 0 } }
        ipBan = new IpBan(request, sandbox, settings);

        expect(ipBan.settings.ip.ban).toEqual(false);
        expect(ipBan.settings.ip.attempts).toEqual(settings.ip.attempts);

        expect(ipBan.settings.account.ban).toEqual(false);
        expect(ipBan.settings.account.attempts).toEqual(settings.account.attempts);

        expect(ipBan.ip).toEqual(request.__headers['x-real-ip']);
      });
    });

    describe('process(command, type, account)', () => {
      describe('Account', () => {
        it('Should run processing if brute ban enabled and allowed attempts > 0', async () => {
          const now = moment();
          const request = getRequest();
          const settings = { account: { ban: true, attempts: 1 } }
          const ipBan = new IpBan(request, sandbox, settings);

          jest.spyOn(IpBan.prototype, 'create');
          jest.spyOn(IpBan.prototype, 'validate');

          await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, now);
          expect(IpBan.prototype.create).toBeCalled();

          await ipBan.process('validate', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, now);
          expect(IpBan.prototype.validate).toBeCalled();

          await ipBan.delete();
        });
        it('Should run ip processing if account brute is disabled and ip brute ban is enabled', async () => {
          const now = moment();
          const request = getRequest();
          const settings = { account: { ban: true, attempts: 0 } };
          const ipBan = new IpBan(request, sandbox, settings);

          jest.spyOn(IpBan.prototype, 'create');
          jest.spyOn(IpBan.prototype, 'errors');
          jest.spyOn(IpBan.prototype, 'validate');

          await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, now);
          expect(IpBan.prototype.create).toBeCalledWith(DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, now);

          await ipBan.process('validate', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, now);
          expect(IpBan.prototype.validate).toBeCalledWith(DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, now);
        });
        it('Should not run processing if ip brute ban is disabled, account brute is enabled but no account', async () => {
          const now = moment();
          const request = getRequest();
          const settings = { account: { ban: true, attempts: 0 } };
          const ipBan = new IpBan(request, sandbox, settings);

          jest.spyOn(IpBan.prototype, 'create');
          jest.spyOn(IpBan.prototype, 'errors');
          jest.spyOn(IpBan.prototype, 'validate');

          await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, undefined, now);
          expect(IpBan.prototype.create).toBeCalledWith(DEFAULT_TYPE, DEFAULT_OPERATION, undefined, now);

          await ipBan.process('validate', DEFAULT_TYPE, DEFAULT_OPERATION, undefined, now);
          expect(IpBan.prototype.validate).toBeCalledWith(DEFAULT_TYPE, DEFAULT_OPERATION, undefined, now);
        });
        it('Should not run processing if account and ip brute ban are disabled', async () => {
          const now = moment();
          const request = getRequest();
          const settings = { account: { ban: true, attempts: 0 }, ip: { ban: true, attempts: 0 } };
          const ipBan = new IpBan(request, sandbox, settings);

          jest.spyOn(IpBan.prototype, 'create');
          jest.spyOn(IpBan.prototype, 'errors');
          jest.spyOn(IpBan.prototype, 'validate');

          await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, now);

          expect(IpBan.prototype.create).not.toBeCalled();
          expect(IpBan.prototype.errors).toBeCalled();

          await ipBan.process('validate', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, now);
          expect(IpBan.prototype.validate).not.toBeCalled();
        });
        it('Should not run processing if brute ban disabled', async () => {
          const now = moment();
          const request = getRequest();
          const settings = { account: { ban: false, attempts: 1 }, ip: { ban: false, attempts: 1 } }
          const ipBan = new IpBan(request, sandbox, settings);

          jest.spyOn(IpBan.prototype, 'create');
          jest.spyOn(IpBan.prototype, 'errors');
          jest.spyOn(IpBan.prototype, 'validate');

          await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, now);

          expect(IpBan.prototype.create).not.toBeCalled();
          expect(IpBan.prototype.errors).toBeCalled();

          await ipBan.process('validate', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, now);
          expect(IpBan.prototype.validate).not.toBeCalled();
        });
        it('Should process create with correct data', async () => {
          const command = 'create';
          const now = moment();
          const request = getRequest();
          const ipBan = new IpBan(request, sandbox);

          jest.spyOn(IpBan.prototype, command);
          await ipBan.process(command, DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, now);
          expect(IpBan.prototype.create).toBeCalledWith(DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, now);

          await ipBan.delete();
        });
        it('Should process validate with correct data', async () => {
          const command = 'validate';
          const now = moment();
          const request = getRequest();
          const ipBan = new IpBan(request, sandbox);

          jest.spyOn(IpBan.prototype, command);
          await ipBan.process(command, DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, now);
          expect(IpBan.prototype.validate).toBeCalledWith(DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, now);

          await db.model('ip_ban').delete();
        });
      });

      describe('IP', () => {
        it('Should run processing if brute ban enabled and allowed attempts > 0', async () => {
          const request = getRequest();
          const settings = { ip: { ban: true, attempts: 1 } }
          const ipBan = new IpBan(request, sandbox, settings);

          jest.spyOn(IpBan.prototype, 'create');
          jest.spyOn(IpBan.prototype, 'validate');

          await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION);
          expect(IpBan.prototype.create).toBeCalled();

          await ipBan.process('validate', DEFAULT_TYPE, DEFAULT_OPERATION);
          expect(IpBan.prototype.validate).toBeCalled();

          await ipBan.delete();
        });
        it('Should not run processing if brute ban enabled and allowed attempts == 0', async () => {
          const request = getRequest();
          const settings = { ip: { ban: true, attempts: 0 } }
          const ipBan = new IpBan(request, sandbox, settings);

          jest.spyOn(IpBan.prototype, 'create');
          jest.spyOn(IpBan.prototype, 'errors');
          jest.spyOn(IpBan.prototype, 'validate');

          await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION);

          expect(IpBan.prototype.create).not.toBeCalled();
          expect(IpBan.prototype.errors).toBeCalled();

          await ipBan.process('validate', DEFAULT_TYPE, DEFAULT_OPERATION);
          expect(IpBan.prototype.validate).not.toBeCalled();
        });
        it('Should not run processing if brute ban disabled', async () => {
          const request = getRequest();
          const settings = { ip: { ban: false, attempts: 1 } }
          const ipBan = new IpBan(request, sandbox, settings);

          jest.spyOn(IpBan.prototype, 'create');
          jest.spyOn(IpBan.prototype, 'errors');
          jest.spyOn(IpBan.prototype, 'validate');

          await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION);

          expect(IpBan.prototype.create).not.toBeCalled();
          expect(IpBan.prototype.errors).toBeCalled();

          await ipBan.process('validate', DEFAULT_TYPE, DEFAULT_OPERATION);
          expect(IpBan.prototype.validate).not.toBeCalled();
        });
        it('Should process create with correct data', async () => {
          const command = 'create';
          const now = moment();
          const request = getRequest();
          const ipBan = new IpBan(request, sandbox);

          jest.spyOn(IpBan.prototype, command);
          await ipBan.process(command, DEFAULT_TYPE, DEFAULT_OPERATION, undefined, now);
          expect(IpBan.prototype.create).toBeCalledWith(DEFAULT_TYPE, DEFAULT_OPERATION, undefined, now);

          await ipBan.delete();
        });
        it('Should process validate with correct data', async () => {
          const command = 'validate';
          const now = moment();
          const request = getRequest();
          const ipBan = new IpBan(request, sandbox);

          jest.spyOn(IpBan.prototype, command);
          await ipBan.process(command, DEFAULT_TYPE, DEFAULT_OPERATION, undefined, now);
          expect(IpBan.prototype.validate).toBeCalledWith(DEFAULT_TYPE, DEFAULT_OPERATION, undefined, now);

          await db.model('ip_ban').delete();
        });
      });
    });

    describe('create(type, now)', () => {
      it('Should create ban with type', async () => {
        const now = moment();
        const request = getRequest();
        const ipBan = new IpBan(request, sandbox);

        await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, now);

        const ipBans = await db.model('ip_ban');

        expect(ipBans.length).toEqual(1);
        expect(ipBans[0].type).toEqual(DEFAULT_TYPE);
      });
      it('Should create ban with another type for the ip', async () => {
        const now = moment();
        const request = getRequest();
        const ipBan = new IpBan(request, sandbox);

        await ipBan.process('create', 'login', 'password', DEFAULT_ACCOUNT, now);

        const ipBans = await db.model('ip_ban');

        expect(ipBans.length).toEqual(2);
        expect(ipBans[1].type).toEqual('login');

        await db.model('ip_ban').delete();
      });
      it('Should correctly run', async () => {
        const now = moment();
        const request = getRequest();
        const ipBan = new IpBan(request, sandbox);

        jest.spyOn(IpBan.prototype, 'setBan');
        jest.spyOn(IpBan.prototype, 'setOperation');
        jest.spyOn(IpBan.prototype, 'setAttempts');
        jest.spyOn(IpBan.prototype, 'setBanLevel');
        jest.spyOn(IpBan.prototype, 'setBanTill');
        jest.spyOn(IpBan.prototype, 'setReason');
        jest.spyOn(IpBan.prototype, 'finalize');
        jest.spyOn(IpBan.prototype, 'errors');

        await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, now);

        expect(IpBan.prototype.setBan).toBeCalledWith(DEFAULT_TYPE, DEFAULT_ACCOUNT, now);
        expect(IpBan.prototype.setOperation).toBeCalledWith(DEFAULT_OPERATION);
        expect(IpBan.prototype.setAttempts).toBeCalledWith(now);
        expect(IpBan.prototype.setBanLevel).toBeCalledWith(now);
        expect(IpBan.prototype.setBanTill).toBeCalledWith(now);
        expect(IpBan.prototype.setReason).toBeCalledWith(DEFAULT_TYPE);
        expect(IpBan.prototype.finalize).toBeCalled();
        expect(IpBan.prototype.errors).toBeCalledWith(DEFAULT_TYPE, DEFAULT_OPERATION, now);

        await ipBan.delete();
      });
    });

    describe('delete()', () => {
      it('Should delete ban', async () => {
        const request = getRequest();
        const ipBan = new IpBan(request, sandbox);

        await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION);
        expect(await db.model('ip_ban').where({ ip: ipBan.ip, type: DEFAULT_TYPE }).getOne()).toBeDefined();

        await ipBan.delete();
        expect(await db.model('ip_ban').where({ ip: ipBan.ip, type: DEFAULT_TYPE }).getOne()).not.toBeDefined();
      });
    });

    describe('validate()', () => {
      it('Should pass if ban does not exist', async () => {
        const now = moment();
        const request = getRequest();
        const ipBan = new IpBan(request, sandbox);

        expect(await ipBan.process('validate', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_2)).not.toBeDefined();
      });
      it('Should pass if ban exists and ban till < now', async () => {
        const request = getRequest();
        const ipBan = new IpBan(request, sandbox);

        await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_1);
        await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_1);
        await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_1);

        expect(await ipBan.process('validate', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_2)).not.toBeDefined();
      });
      it('Should not pass if ban exists and ban till > now', async () => {
        const request = getRequest();
        const ipBan = new IpBan(request, sandbox);

        await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_2);
        await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_2);
        await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_2);

        expect(await ipBan.process('validate', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_2)).toBeDefined();

        await ipBan.delete();
      });
    });

    describe('setBan(type)', () => {
      it('Should set already created ban intance by ip if exists', async () => {
        const request = getRequest('0.0.0.1');
        const ipBan1 = new IpBan(request, sandbox);
        const ipBan2 = new IpBan(request, sandbox);

        await ipBan1.setOptions(DEFAULT_ACCOUNT, NOW_1);
        await ipBan2.setOptions(DEFAULT_ACCOUNT, NOW_1);

        await ipBan1.setBan(DEFAULT_TYPE, DEFAULT_ACCOUNT);
        await ipBan2.setBan(DEFAULT_TYPE, DEFAULT_ACCOUNT);

        expect(ipBan1.instance.getValue('id')).toEqual(ipBan2.instance.getValue('id'));
        expect(ipBan1.instance.getValue('ip')).toEqual(ipBan2.instance.getValue('ip'));

        expect(await db.model('ip_ban')).toHaveLength(1);

        await ipBan1.delete();
        await ipBan2.delete();
      });

      it('Should set new ban instance by ip if does not exist', async () => {

        const request1 = getRequest('0.0.0.2');
        const request2 = getRequest('0.0.0.3');

        const ipBan1 = new IpBan(request1, sandbox);
        const ipBan2 = new IpBan(request2, sandbox);

        await ipBan1.setOptions(DEFAULT_ACCOUNT, NOW_1);
        await ipBan2.setOptions(DEFAULT_ACCOUNT, NOW_1);

        await ipBan1.setBan(DEFAULT_TYPE, DEFAULT_ACCOUNT);
        await ipBan2.setBan(DEFAULT_TYPE, DEFAULT_ACCOUNT);

        expect(ipBan1.instance.getValue('id')).not.toEqual(ipBan2.instance.getValue('id'));
        expect(ipBan1.instance.getValue('ip')).not.toEqual(ipBan2.instance.getValue('ip'));

        expect(await db.model('ip_ban')).toHaveLength(2);

        await ipBan1.delete();
        await ipBan2.delete();
      });

      it('Should set ban record proxy instance with correct data', async () => {
        const ip = '0.0.0.0';
        const request = getRequest(ip);
        const ipBan = new IpBan(request, sandbox);

        await ipBan.setOptions(DEFAULT_ACCOUNT, NOW_1);

        await ipBan.setBan(DEFAULT_TYPE, DEFAULT_ACCOUNT);

        expect(ipBan.instance).toBeInstanceOf(RecordProxy);

        expect(ipBan.instance.getValue('ip')).toEqual(ip);
        expect(ipBan.instance.getValue('attempts')).toEqual(0);
        expect(ipBan.instance.getValue('ban_level')).toEqual('0');

        await ipBan.delete();
      });
    });
  });

  describe('IpBan: Common cases', () => {
    describe('Ban by levels: false', () => {
      describe('Account', () => {
        describe('Ban', () => {
          it('Should add attempts if ban till is null; do not change ban till', async () => {
            const ipBan = new IpBan(getRequest(), sandbox, { account: { ban: true, attempts: 3, by_levels: false } });

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_1);
            expect(ipBan.instance.record).toMatchObject({ ban_type: 'account', account: DEFAULT_ACCOUNT.id, attempts: 1, ban_till: null });
            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_1);
            expect(ipBan.instance.record).toMatchObject({ ban_type: 'account', account: DEFAULT_ACCOUNT.id, attempts: 2, ban_till: null });
          });
          it('Should reset attempts, ban for 60 minutes', async () => {
            const ipBan = new IpBan(getRequest(), sandbox, { account: { ban: true, attempts: 3, by_levels: false } });

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_1);
            expect(ipBan.instance.record).toMatchObject({ ban_type: 'account', account: DEFAULT_ACCOUNT.id, attempts: 0 });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_1).add(60, 'minutes').format());
          });
        });

        describe('Next ban', () => {
          it('Should not be changed if ban till > now', async () => {
            const ipBan = new IpBan(getRequest(), sandbox, { account: { ban: true, attempts: 3, by_levels: false } });

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_1);
            expect(ipBan.instance.record).toMatchObject({ ban_type: 'account', account: DEFAULT_ACCOUNT.id, attempts: 0 });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_1).add(60, 'minutes').format());
          });
          it('Should not be changed during validation', async () => {
            const ipBan = new IpBan(getRequest(), sandbox, { account: { ban: true, attempts: 3, by_levels: false } });

            await ipBan.process('validate', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_1);
            expect(ipBan.instance.record).toMatchObject({ ban_type: 'account', account: DEFAULT_ACCOUNT.id, attempts: 0 });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_1).add(60, 'minutes').format());
          });
          it('Should add attempts if ban till < now; do not change ban till', async () => {
            const ipBan = new IpBan(getRequest(), sandbox, { account: { ban: true, attempts: 3, by_levels: false } });

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_2);
            expect(ipBan.instance.record).toMatchObject({ ban_type: 'account', account: DEFAULT_ACCOUNT.id, attempts: 1 });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_1).add(60, 'minutes').format());
            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_2);
            expect(ipBan.instance.record).toMatchObject({ ban_type: 'account', account: DEFAULT_ACCOUNT.id, attempts: 2 });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_1).add(60, 'minutes').format());
          });
          it('Should reset attempts, +60 minutes ban', async () => {
            const ipBan = new IpBan(getRequest(), sandbox, { account: { ban: true, attempts: 3, by_levels: false } });

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_2);
            expect(ipBan.instance.record).toMatchObject({ ban_type: 'account', account: DEFAULT_ACCOUNT.id, attempts: 0 });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_2).add(60, 'minutes').format());

            await ipBan.delete();
          });
        });

        describe('From another account', () => {
          it('Should create another account ban if account ban with the same IP exists [not banned yet]', async () => {
            const ip = '0.0.0.0';
            const request = getRequest(ip);

            const ipBan1 = new IpBan(request, sandbox, { account: { ban: true, attempts: 2, by_levels: false }, ip: { ban: true, attempts: 3, by_levels: false } });
            const ipBan2 = new IpBan(request, sandbox, { account: { ban: true, attempts: 2, by_levels: false }, ip: { ban: true, attempts: 3, by_levels: false } });

            await ipBan1.process('create', 'login', 'password', { id: 1 }, NOW_1);
            await ipBan2.process('create', 'login', 'password', { id: 2 }, NOW_1);

            expect(ipBan1.instance.record).toMatchObject({ ban_type: 'account', ip, attempts: 1, ban_level: '0' });
            expect(ipBan2.instance.record).toMatchObject({ ban_type: 'account', ip, attempts: 1, ban_level: '0' });
          });
          it('Should create another account ban if account ban with the same IP exists [already banned]', async () => {
            const ip = '0.0.0.0';
            const request = getRequest(ip);

            const ipBan1 = new IpBan(request, sandbox, { account: { ban: true, attempts: 2, by_levels: false }, ip: { ban: true, attempts: 3, by_levels: false } });
            const ipBan2 = new IpBan(request, sandbox, { account: { ban: true, attempts: 2, by_levels: false }, ip: { ban: true, attempts: 3, by_levels: false } });

            await ipBan1.process('create', 'login', 'password', { id: 1 }, NOW_1);
            await ipBan2.process('create', 'login', 'password', { id: 2 }, NOW_1);

            await db.model('ip_ban').delete();

            expect(ipBan1.instance.record).toMatchObject({ ban_type: 'account', ip, attempts: 0, ban_level: '0' });
            expect(ipBan2.instance.record).toMatchObject({ ban_type: 'ip', ip, attempts: 1, ban_level: '0' });
          });
          it('Should create another account ban if ip ban set to false', async () => {
            const ip = '0.0.0.0';
            const request = getRequest(ip);

            const ipBan1 = new IpBan(request, sandbox, { account: { ban: true, attempts: 1, by_levels: true }, ip: { ban: false, attempts: 3, by_levels: false } });
            const ipBan2 = new IpBan(request, sandbox, { account: { ban: true, attempts: 1, by_levels: true }, ip: { ban: false, attempts: 3, by_levels: false } });

            await ipBan1.process('create', 'login', 'password', { id: 1 }, NOW_1);
            await ipBan2.process('create', 'login', 'password', { id: 2 }, NOW_1);

            await db.model('ip_ban').delete();

            expect(ipBan1.instance.record).toMatchObject({ ban_type: 'account', account: 1, attempts: 0, ban_level: '1' });
            expect(ipBan2.instance.record).toMatchObject({ ban_type: 'account', account: 2, attempts: 0, ban_level: '1' });

            expect(moment(ipBan1.instance.getValue('ban_till')).format()).toEqual(moment(NOW_1).add(1, 'minutes').format());
            expect(moment(ipBan2.instance.getValue('ban_till')).format()).toEqual(moment(NOW_1).add(1, 'minutes').format());
          });
        });
      });

      describe('IP', () => {
        describe('Ban', () => {
          it('Should add attempts if ban till is null; do not change ban till', async () => {
            const ipBan = new IpBan(getRequest(), sandbox, { ip: { ban: true, attempts: 3, by_levels: false } });

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_1);
            expect(ipBan.instance.record).toMatchObject({ ban_type: 'ip', ip: ipBan.ip, attempts: 1, ban_till: null });
            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_1);
            expect(ipBan.instance.record).toMatchObject({ ban_type: 'ip', ip: ipBan.ip, attempts: 2, ban_till: null });
          });
          it('Should reset attempts, ban for 60 minutes', async () => {
            const ipBan = new IpBan(getRequest(), sandbox, { ip: { ban: true, attempts: 3, by_levels: false } });

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_1);
            expect(ipBan.instance.record).toMatchObject({ ban_type: 'ip', ip: ipBan.ip, attempts: 0 });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_1).add(60, 'minutes').format());
          });
        });

        describe('Next ban', () => {
          it('Should not be changed if ban till > now', async () => {
            const ipBan = new IpBan(getRequest(), sandbox, { ip: { ban: true, attempts: 3, by_levels: false } });

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_1);
            expect(ipBan.instance.record).toMatchObject({ ban_type: 'ip', ip: ipBan.ip, attempts: 0 });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_1).add(60, 'minutes').format());
          });
          it('Should not be changed during validation', async () => {
            const ipBan = new IpBan(getRequest(), sandbox, { ip: { ban: true, attempts: 3, by_levels: false } });

            await ipBan.process('validate', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_1);
            expect(ipBan.instance.record).toMatchObject({ ban_type: 'ip', ip: ipBan.ip, attempts: 0 });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_1).add(60, 'minutes').format());
          });
          it('Should add attempts if ban till < now; do not change ban till', async () => {
            const ipBan = new IpBan(getRequest(), sandbox, { ip: { ban: true, attempts: 3, by_levels: false } });

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_2);
            expect(ipBan.instance.record).toMatchObject({ ban_type: 'ip', ip: ipBan.ip, attempts: 1 });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_1).add(60, 'minutes').format());
            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_2);
            expect(ipBan.instance.record).toMatchObject({ ban_type: 'ip', ip: ipBan.ip, attempts: 2 });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_1).add(60, 'minutes').format());
          });
          it('Should reset attempts, +60 minutes ban', async () => {
            const ipBan = new IpBan(getRequest(), sandbox, { ip: { ban: true, attempts: 3, by_levels: false } });

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_2);
            expect(ipBan.instance.record).toMatchObject({ ban_type: 'ip', ip: ipBan.ip, attempts: 0 });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_2).add(60, 'minutes').format());

            await ipBan.delete();
          });
        });
      });
    });

    describe('Ban by levels: true', () => {
      describe('Account', () => {
        describe('Ban level: 0', () => {
          it('Should add attempts if ban till is null; do not change ban till', async () => {
            const ipBan = new IpBan(getRequest(), sandbox, { account: { ban: true, attempts: 3, by_levels: true } });

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_1);
            expect(ipBan.instance.record).toMatchObject({ account: DEFAULT_ACCOUNT.id, attempts: 1, ban_level: '0', ban_till: null });
            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_1);
            expect(ipBan.instance.record).toMatchObject({ account: DEFAULT_ACCOUNT.id, attempts: 2, ban_level: '0', ban_till: null });
          });
          it('Should reset attempts, increase ban level; ban for 1 minute', async () => {
            const ipBan = new IpBan(getRequest(), sandbox, { account: { ban: true, attempts: 3, by_levels: true } });

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_1);
            expect(ipBan.instance.record).toMatchObject({ account: DEFAULT_ACCOUNT.id, attempts: 0, ban_level: '1' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_1).add(1, 'minutes').format());
          });
        });

        describe('Ban level: 1', () => {
          it('Should not be changed if ban till > now', async () => {
            const ipBan = new IpBan(getRequest(), sandbox, { account: { ban: true, attempts: 3, by_levels: true } });

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_1);
            expect(ipBan.instance.record).toMatchObject({ ban_level: '1', ban_type: 'account', account: DEFAULT_ACCOUNT.id, attempts: 0 });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_1).add(1, 'minutes').format());
          });
          it('Should not be changed during validation', async () => {
            const ipBan = new IpBan(getRequest(), sandbox, { account: { ban: true, attempts: 3, by_levels: true } });

            await ipBan.process('validate', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_1);
            expect(ipBan.instance.record).toMatchObject({ ban_level: '1', ban_type: 'account', account: DEFAULT_ACCOUNT.id, attempts: 0 });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_1).add(1, 'minutes').format());
          });
          it('Should add attempts if ban till < now; do not change ban till', async () => {
            const ipBan = new IpBan(getRequest(), sandbox, { account: { ban: true, attempts: 3, by_levels: true } });

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_2);
            expect(ipBan.instance.record).toMatchObject({ account: DEFAULT_ACCOUNT.id, attempts: 1, ban_level: '1' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_1).add(1, 'minutes').format());
            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_2);
            expect(ipBan.instance.record).toMatchObject({ account: DEFAULT_ACCOUNT.id, attempts: 2, ban_level: '1' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_1).add(1, 'minutes').format());
          });
          it('Should reset attempts, increase ban level; ban for 3 minutes', async () => {
            const ipBan = new IpBan(getRequest(), sandbox, { account: { ban: true, attempts: 3, by_levels: true } });

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_2);
            expect(ipBan.instance.record).toMatchObject({ account: DEFAULT_ACCOUNT.id, attempts: 0, ban_level: '2' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_2).add(3, 'minutes').format());
          });
        });

        describe('Ban level: 2', () => {
          it('Should not be changed if ban till > now', async () => {
            const ipBan = new IpBan(getRequest(), sandbox, { account: { ban: true, attempts: 3, by_levels: true } });

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_2);
            expect(ipBan.instance.record).toMatchObject({ ban_level: '2', ban_type: 'account', account: DEFAULT_ACCOUNT.id, attempts: 0 });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_2).add(3, 'minutes').format());
          });
          it('Should not be changed during validation', async () => {
            const ipBan = new IpBan(getRequest(), sandbox, { account: { ban: true, attempts: 3, by_levels: true } });

            await ipBan.process('validate', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_2);
            expect(ipBan.instance.record).toMatchObject({ ban_level: '2', ban_type: 'account', account: DEFAULT_ACCOUNT.id, attempts: 0 });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_2).add(3, 'minutes').format());
          });
          it('Should add attempts if ban till < now; do not change ban till', async () => {
            const ipBan = new IpBan(getRequest(), sandbox, { account: { ban: true, attempts: 3, by_levels: true } });

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_3);
            expect(ipBan.instance.record).toMatchObject({ account: DEFAULT_ACCOUNT.id, attempts: 1, ban_level: '2' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_2).add(3, 'minutes').format());
            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_3);
            expect(ipBan.instance.record).toMatchObject({ account: DEFAULT_ACCOUNT.id, attempts: 2, ban_level: '2' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_2).add(3, 'minutes').format());
          });
          it('Should reset attempts, increase ban level; ban for 10 minutes', async () => {
            const ipBan = new IpBan(getRequest(), sandbox, { account: { ban: true, attempts: 3, by_levels: true } });

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_3);
            expect(ipBan.instance.record).toMatchObject({ account: DEFAULT_ACCOUNT.id, attempts: 0, ban_level: '3' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_3).add(10, 'minutes').format());
          });
        });

        describe('Ban level: 3', () => {
          it('Should not be changed if ban till > now', async () => {
            const ipBan = new IpBan(getRequest(), sandbox, { account: { ban: true, attempts: 3, by_levels: true } });

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_3);
            expect(ipBan.instance.record).toMatchObject({ ban_level: '3', ban_type: 'account', account: DEFAULT_ACCOUNT.id, attempts: 0 });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_3).add(10, 'minutes').format());
          });
          it('Should not be changed during validation', async () => {
            const ipBan = new IpBan(getRequest(), sandbox, { account: { ban: true, attempts: 3, by_levels: true } });

            await ipBan.process('validate', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_3);
            expect(ipBan.instance.record).toMatchObject({ ban_level: '3', ban_type: 'account', account: DEFAULT_ACCOUNT.id, attempts: 0 });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_3).add(10, 'minutes').format());
          });
          it('Should add attempts if ban till < now; do not change ban till', async () => {
            const ipBan = new IpBan(getRequest(), sandbox, { account: { ban: true, attempts: 3, by_levels: true } });

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_4);
            expect(ipBan.instance.record).toMatchObject({ account: DEFAULT_ACCOUNT.id, attempts: 1, ban_level: '3' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_3).add(10, 'minutes').format());
            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_4);
            expect(ipBan.instance.record).toMatchObject({ account: DEFAULT_ACCOUNT.id, attempts: 2, ban_level: '3' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_3).add(10, 'minutes').format());
          });
          it('Should reset attempts, increase ban level; ban for 60 minutes', async () => {
            const ipBan = new IpBan(getRequest(), sandbox, { account: { ban: true, attempts: 3, by_levels: true } });

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_4);
            expect(ipBan.instance.record).toMatchObject({ account: DEFAULT_ACCOUNT.id, attempts: 0, ban_level: '4' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_4).add(60, 'minutes').format());
          });
        });

        describe('Ban level: 4', () => {
          it('Should not be changed if ban till > now', async () => {
            const ipBan = new IpBan(getRequest(), sandbox, { account: { ban: true, attempts: 3, by_levels: true } });

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_4);
            expect(ipBan.instance.record).toMatchObject({ ban_level: '4', ban_type: 'account', account: DEFAULT_ACCOUNT.id, attempts: 0 });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_4).add(60, 'minutes').format());
          });
          it('Should not be changed during validation', async () => {
            const ipBan = new IpBan(getRequest(), sandbox, { account: { ban: true, attempts: 3, by_levels: true } });

            await ipBan.process('validate', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_4);
            expect(ipBan.instance.record).toMatchObject({ ban_level: '4', ban_type: 'account', account: DEFAULT_ACCOUNT.id, attempts: 0 });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_4).add(60, 'minutes').format());
          });
          it('Should add attempts if ban till < now; do not change ban till', async () => {
            const ipBan = new IpBan(getRequest(), sandbox, { account: { ban: true, attempts: 3, by_levels: true } });

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_5);
            expect(ipBan.instance.record).toMatchObject({ account: DEFAULT_ACCOUNT.id, attempts: 1, ban_level: '4' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_4).add(60, 'minutes').format());
            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_5);
            expect(ipBan.instance.record).toMatchObject({ account: DEFAULT_ACCOUNT.id, attempts: 2, ban_level: '4' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_4).add(60, 'minutes').format());
          });
          it('Should reset attempts, increase ban level; ban for 360 minutes', async () => {
            const ipBan = new IpBan(getRequest(), sandbox, { account: { ban: true, attempts: 3, by_levels: true } });

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_5);
            expect(ipBan.instance.record).toMatchObject({ account: DEFAULT_ACCOUNT.id, attempts: 0, ban_level: '5' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_5).add(360, 'minutes').format());
          });
        });

        describe('Ban level: 5', () => {
          it('Should not be changed if ban till > now', async () => {
            const ipBan = new IpBan(getRequest(), sandbox, { account: { ban: true, attempts: 3, by_levels: true } });

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_5);
            expect(ipBan.instance.record).toMatchObject({ ban_level: '5', ban_type: 'account', account: DEFAULT_ACCOUNT.id, attempts: 0 });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_5).add(360, 'minutes').format());
          });
          it('Should not be changed during validation', async () => {
            const ipBan = new IpBan(getRequest(), sandbox, { account: { ban: true, attempts: 3, by_levels: true } });

            await ipBan.process('validate', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_5);
            expect(ipBan.instance.record).toMatchObject({ ban_level: '5', ban_type: 'account', account: DEFAULT_ACCOUNT.id, attempts: 0 });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_5).add(360, 'minutes').format());
          });
          it('Should add attempts if ban till < now; do not change ban till', async () => {
            const ipBan = new IpBan(getRequest(), sandbox, { account: { ban: true, attempts: 3, by_levels: true } });

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_6);
            expect(ipBan.instance.record).toMatchObject({ account: DEFAULT_ACCOUNT.id, attempts: 1, ban_level: '5' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_5).add(360, 'minutes').format());
            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_6);
            expect(ipBan.instance.record).toMatchObject({ account: DEFAULT_ACCOUNT.id, attempts: 2, ban_level: '5' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_5).add(360, 'minutes').format());
          });
          it('Should reset attempts, ban for 360 minutes', async () => {
            const ipBan = new IpBan(getRequest(), sandbox, { account: { ban: true, attempts: 3, by_levels: true } });

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_6);
            expect(ipBan.instance.record).toMatchObject({ account: DEFAULT_ACCOUNT.id, attempts: 0, ban_level: '5' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_6).add(360, 'minutes').format());
          });
        });

        describe('Validation', () => {
          it('[ban till > now] Should not delete', async () => {
            const ipBan = new IpBan(getRequest(), sandbox, { account: { ban: true, attempts: 3, by_levels: true } });

            await ipBan.process('validate', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_6);
            expect(await db.model('ip_ban').where({ account: DEFAULT_ACCOUNT.id, type: DEFAULT_TYPE }).getOne()).toBeDefined();
          });
          it('[ban till < now] Should not delete', async () => {
            const ipBan = new IpBan(getRequest(), sandbox, { account: { ban: true, attempts: 3, by_levels: true } });

            await ipBan.process('validate', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_7);
            expect(await db.model('ip_ban').where({ account: DEFAULT_ACCOUNT.id, type: DEFAULT_TYPE }).getOne()).toBeDefined();

            await db.model('ip_ban').delete();
          });
        });

        describe('From another account', () => {
          it('Should create another account ban if account ban with the same IP exists [not banned yet]', async () => {
            const ip = '0.0.0.0';
            const request = getRequest(ip);

            const ipBan1 = new IpBan(request, sandbox, { account: { ban: true, attempts: 2, by_levels: true }, ip: { ban: true, attempts: 3, by_levels: true } });
            const ipBan2 = new IpBan(request, sandbox, { account: { ban: true, attempts: 2, by_levels: true }, ip: { ban: true, attempts: 3, by_levels: true } });

            await ipBan1.process('create', 'login', 'password', { id: 1 }, NOW_1);
            await ipBan2.process('create', 'login', 'password', { id: 2 }, NOW_1);

            expect(ipBan1.instance.record).toMatchObject({ ban_type: 'account', ip, attempts: 1, ban_level: '0' });
            expect(ipBan2.instance.record).toMatchObject({ ban_type: 'account', ip, attempts: 1, ban_level: '0' });
          });
          it('Should create another account ban if account ban with the same IP exists [already banned]', async () => {
            const ip = '0.0.0.0';
            const request = getRequest(ip);

            const ipBan1 = new IpBan(request, sandbox, { account: { ban: true, attempts: 2, by_levels: true }, ip: { ban: true, attempts: 3, by_levels: true } });
            const ipBan2 = new IpBan(request, sandbox, { account: { ban: true, attempts: 2, by_levels: true }, ip: { ban: true, attempts: 3, by_levels: true } });

            await ipBan1.process('create', 'login', 'password', { id: 1 }, NOW_1);
            await ipBan2.process('create', 'login', 'password', { id: 2 }, NOW_1);

            expect(ipBan1.instance.record).toMatchObject({ ban_type: 'account', ip, attempts: 0, ban_level: '1' });
            expect(ipBan2.instance.record).toMatchObject({ ban_type: 'ip', ip, attempts: 1, ban_level: '0' });

            await ipBan1.delete();
            await ipBan2.delete();
          });
        });
      });

      describe('IP', () => {
        describe('Ban level: 0', () => {
          it('Should add attempts if ban till is null; do not change ban till', async () => {
            const ipBan = new IpBan(getRequest(), sandbox);

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_1);
            expect(ipBan.instance.record).toMatchObject({ ip: ipBan.ip, attempts: 1, ban_level: '0', ban_till: null });
            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_1);
            expect(ipBan.instance.record).toMatchObject({ ip: ipBan.ip, attempts: 2, ban_level: '0', ban_till: null });
          });
          it('Should reset attempts, increase ban level; ban for 1 minute', async () => {
            const ipBan = new IpBan(getRequest(), sandbox);

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_1);
            expect(ipBan.instance.record).toMatchObject({ ip: ipBan.ip, attempts: 0, ban_level: '1' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_1).add(1, 'minutes').format());
          });
        });

        describe('Ban level: 1', () => {
          it('Should not be changed if ban till > now', async () => {
            const ipBan = new IpBan(getRequest(), sandbox);

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_1);
            expect(ipBan.instance.record).toMatchObject({ ip: ipBan.ip, attempts: 0, ban_level: '1' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_1).add(1, 'minutes').format());
          });
          it('Should not be changed during validation', async () => {
            const ipBan = new IpBan(getRequest(), sandbox);

            await ipBan.process('validate', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_1);
            expect(ipBan.instance.record).toMatchObject({ ip: ipBan.ip, attempts: 0, ban_level: '1' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_1).add(1, 'minutes').format());
          });
          it('Should add attempts if ban till < now; do not change ban till', async () => {
            const ipBan = new IpBan(getRequest(), sandbox);

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_2);
            expect(ipBan.instance.record).toMatchObject({ ip: ipBan.ip, attempts: 1, ban_level: '1' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_1).add(1, 'minutes').format());
            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_2);
            expect(ipBan.instance.record).toMatchObject({ ip: ipBan.ip, attempts: 2, ban_level: '1' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_1).add(1, 'minutes').format());
          });
          it('Should reset attempts, increase ban level; ban for 3 minutes', async () => {
            const ipBan = new IpBan(getRequest(), sandbox);

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_2);
            expect(ipBan.instance.record).toMatchObject({ ip: ipBan.ip, attempts: 0, ban_level: '2' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_2).add(3, 'minutes').format());
          });
        });

        describe('Ban level: 2', () => {
          it('Should not be changed if ban till > now', async () => {
            const ipBan = new IpBan(getRequest(), sandbox);

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_2);
            expect(ipBan.instance.record).toMatchObject({ ip: ipBan.ip, attempts: 0, ban_level: '2' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_2).add(3, 'minutes').format());
          });
          it('Should not be changed during validation', async () => {
            const ipBan = new IpBan(getRequest(), sandbox);

            await ipBan.process('validate', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_2);
            expect(ipBan.instance.record).toMatchObject({ ip: ipBan.ip, attempts: 0, ban_level: '2' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_2).add(3, 'minutes').format());
          });
          it('Should add attempts if ban till < now; do not change ban till', async () => {
            const ipBan = new IpBan(getRequest(), sandbox);

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_3);
            expect(ipBan.instance.record).toMatchObject({ ip: ipBan.ip, attempts: 1, ban_level: '2' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_2).add(3, 'minutes').format());
            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_3);
            expect(ipBan.instance.record).toMatchObject({ ip: ipBan.ip, attempts: 2, ban_level: '2' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_2).add(3, 'minutes').format());
          });
          it('Should reset attempts, increase ban level; ban for 10 minutes', async () => {
            const ipBan = new IpBan(getRequest(), sandbox);

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_3);
            expect(ipBan.instance.record).toMatchObject({ ip: ipBan.ip, attempts: 0, ban_level: '3' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_3).add(10, 'minutes').format());
          });
        });

        describe('Ban level: 3', () => {
          it('Should not be changed if ban till > now', async () => {
            const ipBan = new IpBan(getRequest(), sandbox);

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_3);
            expect(ipBan.instance.record).toMatchObject({ ip: ipBan.ip, attempts: 0, ban_level: '3' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_3).add(10, 'minutes').format());
          });
          it('Should not be changed during validation', async () => {
            const ipBan = new IpBan(getRequest(), sandbox);

            await ipBan.process('validate', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_3);
            expect(ipBan.instance.record).toMatchObject({ ip: ipBan.ip, attempts: 0, ban_level: '3' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_3).add(10, 'minutes').format());
          });
          it('Should add attempts if ban till < now; do not change ban till', async () => {
            const ipBan = new IpBan(getRequest(), sandbox);

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_4);
            expect(ipBan.instance.record).toMatchObject({ ip: ipBan.ip, attempts: 1, ban_level: '3' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_3).add(10, 'minutes').format());
            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_4);
            expect(ipBan.instance.record).toMatchObject({ ip: ipBan.ip, attempts: 2, ban_level: '3' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_3).add(10, 'minutes').format());
          });
          it('Should reset attempts, increase ban level; ban for 60 minutes', async () => {
            const ipBan = new IpBan(getRequest(), sandbox);

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_4);
            expect(ipBan.instance.record).toMatchObject({ ip: ipBan.ip, attempts: 0, ban_level: '4' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_4).add(60, 'minutes').format());
          });
        });

        describe('Ban level: 4', () => {
          it('Should not be changed if ban till > now', async () => {
            const ipBan = new IpBan(getRequest(), sandbox);

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_4);
            expect(ipBan.instance.record).toMatchObject({ ip: ipBan.ip, attempts: 0, ban_level: '4' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_4).add(60, 'minutes').format());
          });
          it('Should not be changed during validation', async () => {
            const ipBan = new IpBan(getRequest(), sandbox);

            await ipBan.process('validate', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_4);
            expect(ipBan.instance.record).toMatchObject({ ip: ipBan.ip, attempts: 0, ban_level: '4' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_4).add(60, 'minutes').format());
          });
          it('Should add attempts if ban till < now; do not change ban till', async () => {
            const ipBan = new IpBan(getRequest(), sandbox);

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_5);
            expect(ipBan.instance.record).toMatchObject({ ip: ipBan.ip, attempts: 1, ban_level: '4' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_4).add(60, 'minutes').format());
            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_5);
            expect(ipBan.instance.record).toMatchObject({ ip: ipBan.ip, attempts: 2, ban_level: '4' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_4).add(60, 'minutes').format());
          });
          it('Should reset attempts, increase ban level; ban for 360 minutes', async () => {
            const ipBan = new IpBan(getRequest(), sandbox);

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_5);
            expect(ipBan.instance.record).toMatchObject({ ip: ipBan.ip, attempts: 0, ban_level: '5' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_5).add(360, 'minutes').format());
          });
        });

        describe('Ban level: 5', () => {
          it('Should not be changed if ban till > now', async () => {
            const ipBan = new IpBan(getRequest(), sandbox);

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_5);
            expect(ipBan.instance.record).toMatchObject({ ip: ipBan.ip, attempts: 0, ban_level: '5' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_5).add(360, 'minutes').format());
          });
          it('Should not be changed during validation', async () => {
            const ipBan = new IpBan(getRequest(), sandbox);

            await ipBan.process('validate', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_5);
            expect(ipBan.instance.record).toMatchObject({ ip: ipBan.ip, attempts: 0, ban_level: '5' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_5).add(360, 'minutes').format());
          });
          it('Should add attempts if ban till < now; do not change ban till', async () => {
            const ipBan = new IpBan(getRequest(), sandbox);

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_6);
            expect(ipBan.instance.record).toMatchObject({ ip: ipBan.ip, attempts: 1, ban_level: '5' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_5).add(360, 'minutes').format());
            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_6);
            expect(ipBan.instance.record).toMatchObject({ ip: ipBan.ip, attempts: 2, ban_level: '5' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_5).add(360, 'minutes').format());
          });
          it('Should reset attempts, ban for 360 minutes', async () => {
            const ipBan = new IpBan(getRequest(), sandbox);

            await ipBan.process('create', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_6);
            expect(ipBan.instance.record).toMatchObject({ ip: ipBan.ip, attempts: 0, ban_level: '5' });
            expect(moment(ipBan.instance.getValue('ban_till')).format()).toEqual(moment(NOW_6).add(360, 'minutes').format());
          });
        });

        describe('Validation', () => {
          it('[ban till > now] Should not delete', async () => {
            const ipBan = new IpBan(getRequest(), sandbox);

            await ipBan.process('validate', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_6);
            expect(await db.model('ip_ban').where({ ip: ipBan.ip, type: DEFAULT_TYPE }).getOne()).toBeDefined();
          });
          it('[ban till < now] Should not delete', async () => {
            const ipBan = new IpBan(getRequest(), sandbox);

            await ipBan.process('validate', DEFAULT_TYPE, DEFAULT_OPERATION, DEFAULT_ACCOUNT, NOW_7);
            expect(await db.model('ip_ban').where({ ip: ipBan.ip, type: DEFAULT_TYPE }).getOne()).toBeDefined();
          });
        });
      });
    });
  });
});
