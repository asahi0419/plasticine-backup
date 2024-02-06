import { createRequire } from "module";
const require = createRequire(import.meta.url)

import getCurrentUserFunction from '../current-user/index.js';
import { OptionsProxy } from '../current-user/options.js';
import db from '../../../../../data-layer/orm/index.js';

const user = { id: 1, account: { id: 1 }, __session: {}, __userGroups: [] };
const currentUser = getCurrentUserFunction({ user }, sandbox);

afterEach(() => {
  jest.clearAllMocks();
});

describe('Sandbox', () => {
  describe('Api', () => {
    describe('p', () => {
      describe('currentUser', () => {
        it('Should have proper attributes', () => {
          expect(currentUser.user).toBeDefined();
          expect(currentUser.user.options).toBeDefined();
          expect(currentUser.record).toEqual(user);
          expect(currentUser.permissionChecker).toBeDefined();
          expect(currentUser.coreLockChecker).toBeDefined();

          currentUser.permissionChecker = () => true;
        });

        describe('getValue(fieldAlias)', () => {
          it('Should return user value', async () => {
            const result = currentUser.getValue('id');
            const expected = user.id;

            expect(result).toEqual(expected);
          });
        });

        describe('getAccount()', () => {
          it('Should return user account proxy', async () => {
            const result = currentUser.getAccount();

            expect(result.constructor.name).toEqual('AccountProxy');
            expect(result.user.id).toEqual(user.id);
          });
        });

        describe('getSession()', () => {
          it('Should return user session', async () => {
            const result = currentUser.getSession();
            const expected = user.__session;

            expect(result).toEqual(expected);
          });
        });

        describe('canCreate(modelId)', () => {
          it('Should be properly called', async () => {
            const modelId = 1;

            jest.spyOn(currentUser, 'permissionChecker');
            const result = currentUser.canCreate(modelId);
            expect(currentUser.permissionChecker).toBeCalledWith('model', 'create', modelId);
          });
        });

        describe('canUpdate(modelId)', () => {
          it('Should be properly called', async () => {
            const modelId = 1;

            jest.spyOn(currentUser, 'permissionChecker');
            jest.spyOn(currentUser, 'coreLockChecker');
            const result = currentUser.canUpdate(modelId);
            expect(currentUser.permissionChecker).toBeCalledWith('model', 'update', modelId);
            expect(currentUser.coreLockChecker).toBeCalledWith('model', 'update', modelId);
          });
        });

        describe('canDelete(modelId)', () => {
          it('Should be properly called', async () => {
            const modelId = 1;

            jest.spyOn(currentUser, 'permissionChecker');
            jest.spyOn(currentUser, 'coreLockChecker');
            const result = currentUser.canDelete(modelId);
            expect(currentUser.permissionChecker).toBeCalledWith('model', 'delete', modelId);
            expect(currentUser.coreLockChecker).toBeCalledWith('model', 'delete', modelId);
          });
        });

        describe('canAttach(modelId)', () => {
          it('Should be properly called', async () => {
            const modelId = 1;

            jest.spyOn(currentUser, 'permissionChecker');
            const result = currentUser.canAttach(modelId);
            expect(currentUser.permissionChecker).toBeCalledWith('attachment', 'create', modelId);
          });
        });

        describe('canUpdateAttachment()', () => {
          it('Should be properly called', async () => {
            jest.spyOn(currentUser, 'permissionChecker');
            const result = currentUser.canUpdateAttachment();
            expect(currentUser.permissionChecker).toBeCalledWith('model', 'update', db.getModel('attachment').id);
          });
        });

        describe('canDeleteAttachment(modelId)', () => {
          it('Should be properly called', async () => {
            const modelId = 1;

            jest.spyOn(currentUser, 'permissionChecker');
            const result = currentUser.canDeleteAttachment(modelId);
            expect(currentUser.permissionChecker).toBeCalledWith('attachment', 'delete', modelId);
          });
        });

        describe('canViewAttachment(modelId)', () => {
          it('Should be properly called', async () => {
            const modelId = 1;

            jest.spyOn(currentUser, 'permissionChecker');
            const result = currentUser.canViewAttachment(modelId);
            expect(currentUser.permissionChecker).toBeCalledWith('attachment', 'view', modelId);
          });
        });

        describe('canAtLeastRead(modelId)', () => {
          it('Should be properly called', async () => {
            const privileges = require('../../../../security/privileges.js');
            const modelId = 1;

            jest.spyOn(privileges, 'checkPrivilege');
            const result = currentUser.canAtLeastRead(modelId);
            expect(privileges.checkPrivilege).toBeCalledWith(currentUser.user, 'read', modelId);
          });
        });

        describe('canAtLeastWrite(modelId)', () => {
          it('Should be properly called', async () => {
            const privileges = require('../../../../security/privileges.js');
            const modelId = 1;

            jest.spyOn(privileges, 'checkPrivilege');
            const result = currentUser.canAtLeastWrite(modelId);
            expect(privileges.checkPrivilege).toBeCalledWith(currentUser.user, 'read_write', modelId);
          });
        });

        describe('canViewFieldValue(fieldAliasOrId, modelAliasOrId)', () => {
          it('Should be properly called', async () => {
            const helpers = require('../current-user/helpers');
            helpers.getFieldValuePermission = () => {};

            const model = 'model';
            const field = 'field';
            const record = 'record';

            jest.spyOn(helpers, 'getFieldValuePermission');
            const result = currentUser.canViewFieldValue(field, model, record);
            expect(helpers.getFieldValuePermission).toBeCalledWith(field, model, record, 'view', currentUser);
          });
        });

        describe('canUpdateFieldValue(fieldAliasOrId, recordId, modelAliasOrId)', () => {
          it('Should be properly called', async () => {
            const helpers = require('../current-user/helpers');
            helpers.getFieldValuePermission = () => {};

            const model = 'model';
            const field = 'field';
            const record = 'record';

            jest.spyOn(helpers, 'getFieldValuePermission');
            const result = currentUser.canUpdateFieldValue(field, record, model);
            expect(helpers.getFieldValuePermission).toBeCalledWith(field, model, record, 'update', currentUser);
          });
        });

        describe('canCreateFieldValue(fieldAliasOrId, recordId, modelAliasOrId)', () => {
          it('Should be properly called', async () => {
            const helpers = require('../current-user/helpers');
            helpers.getFieldValuePermission = () => {};

            const model = 'model';
            const field = 'field';
            const record = 'record';

            jest.spyOn(helpers, 'getFieldValuePermission');
            const result = currentUser.canCreateFieldValue(field, record, model);
            expect(helpers.getFieldValuePermission).toBeCalledWith(field, model, record, 'create', currentUser);
          });
        });

        describe('canDeleteFieldValue(fieldAliasOrId, recordId, modelAliasOrId)', () => {
          it('Should be properly called', async () => {
            const helpers = require('../current-user/helpers');
            helpers.getFieldValuePermission = () => {};

            const model = 'model';
            const field = 'field';
            const record = 'record';

            jest.spyOn(helpers, 'getFieldValuePermission');
            const result = currentUser.canDeleteFieldValue(field, record, model);
            expect(helpers.getFieldValuePermission).toBeCalledWith(field, model, record, 'delete', currentUser);
          });
        });

        describe('isAdmin(modelId)', () => {
          it('Should be properly called', async () => {
            const privileges = require('../../../../security/privileges.js');
            const modelId = 1;

            jest.spyOn(privileges, 'checkPrivilege');
            const result = currentUser.isAdmin(modelId);
            expect(privileges.checkPrivilege).toBeCalledWith(currentUser.user, 'admin', modelId);
          });
        });

        describe('isGuest()', () => {
          it('Should be properly called', async () => {
            const result = currentUser.isGuest();
            const expected = currentUser.user.account.email == 'guest@free.man';

            expect(result).toEqual(expected);
          });
        });

        describe('isBelongsToWorkgroup(id)', () => {
          it('Should be properly called', async () => {
            const lodash = require('lodash-es');
            const id = 'id';

            jest.spyOn(lodash, 'find');
            const result = currentUser.isBelongsToWorkgroup(id);
            expect(lodash.find).toBeCalledWith(currentUser.user.__userGroups, { id });
          });
        });

        describe('isBelongsToWorkgroupByName(name)', () => {
          it('Should be properly called', async () => {
            const lodash = require('lodash-es');
            const name = 'name';

            jest.spyOn(lodash, 'find');
            const result = currentUser.isBelongsToWorkgroupByName(name);
            expect(lodash.find).toBeCalledWith(currentUser.user.__userGroups, { name });
          });
        });

        describe('isBelongsToWorkgroupByAlias(alias)', () => {
          it('Should be properly called', async () => {
            const lodash = require('lodash-es');
            const alias = 'alias';

            jest.spyOn(lodash, 'find');
            const result = currentUser.isBelongsToWorkgroupByAlias(alias);
            expect(lodash.find).toBeCalledWith(currentUser.user.__userGroups, { alias });
          });
        });

        describe('getWorkgroups()', () => {
          it('Should return user groups', async () => {
            const result = currentUser.getWorkgroups();
            const expected = currentUser.user.__userGroups;

            expect(result).toEqual(expected);
          });
        });

        describe('getActualLatitude()', () => {
          it('Should return user groups', async () => {
            const result = currentUser.getActualLatitude();
            const expected = null;

            expect(result).toEqual(expected);
          });
        });

        describe('getActualLongitude()', () => {
          it('Should return user groups', async () => {
            const result = currentUser.getActualLongitude();
            const expected = null;

            expect(result).toEqual(expected);
          });
        });

        describe('setOptions(options)', () => {
          it('Should be properly called', async () => {
            const options = {};

            jest.spyOn(OptionsProxy.prototype, 'setOptions');
            currentUser.setOptions(options);
            expect(OptionsProxy.prototype.setOptions).toBeCalledWith(options);
          });
        });

        describe('setOption(key, value)', () => {
          it('Should be properly called', async () => {
            const key = 'key';
            const value = 'value';

            jest.spyOn(OptionsProxy.prototype, 'setOption');
            currentUser.setOption(key, value);
            expect(OptionsProxy.prototype.setOption).toBeCalledWith(key, value);
          });
        });

        describe('getOptions()', () => {
          it('Should be properly called', async () => {
            jest.spyOn(OptionsProxy.prototype, 'getOptions');
            currentUser.getOptions();
            expect(OptionsProxy.prototype.getOptions).toBeCalledWith();
          });
        });

        describe('getOption(key)', () => {
          it('Should be properly called', async () => {
            const key = 'key';

            jest.spyOn(OptionsProxy.prototype, 'getOption');
            currentUser.getOption(key);
            expect(OptionsProxy.prototype.getOption).toBeCalledWith(key);
          });
        });

        describe('getGPSData()', () => {
          it('Should be properly called', async () => {
            jest.spyOn(currentUser, 'getGPSData');
            await currentUser.getGPSData();
            expect(currentUser.getGPSData).toBeCalled();
          });
          it('Should return correct GPS data', async () => {
            const now = Date.now();

            await db.model('user_position', sandbox).createRecord({
              user_id: 1,
              accuracy: 10,
              p_lat: 100.737,
              p_lon: 100.737,
              reported_at: now
            }, false);

            const gps = await currentUser.getGPSData();
            expect(gps.accuracy).toEqual(10);
            expect(gps.p_lat).toEqual(100.737);
            expect(gps.p_lon).toEqual(100.737);
            expect(new Date(gps.reported_at).getTime()).toEqual(now);
          });
        });
      });
    });
  });
});
