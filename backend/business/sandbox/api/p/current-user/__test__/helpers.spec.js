import Sandbox from '../../../../../sandbox/index.js';

import getCurrentUserFunction from '../index.js';
import * as HELPERS from '../helpers';

const user = { id: 1, account: { id: 1 }, __session: {}, __userGroups: [] };

describe('Sandbox', () => {
  describe('Api', () => {
    describe('p', () => {
      describe('currentUser', () => {
        describe('Helpers', () => {
          describe('getFieldValuePermission(field, model, record, type, userProxy)', () => {
            it('Should be properly called', async () => {
              let model, field, record, currentUser, result;
              const type = 'view';

              currentUser = getCurrentUserFunction({ user }, sandbox);

              field = undefined;
              model = undefined;
              record = undefined;
              expect(() => HELPERS.getFieldValuePermission(field, model, record, type, currentUser)).toThrow();

              field = 1;
              model = undefined;
              record = undefined;
              jest.spyOn(currentUser, 'permissionChecker');
              result = await HELPERS.getFieldValuePermission(field, model, record, type, currentUser);
              expect(currentUser.permissionChecker).toBeCalledWith('field', type, 1, 1, record);

              field = 'id';
              model = undefined;
              record = undefined;
              expect(() => HELPERS.getFieldValuePermission(field, model, record, type, currentUser)).toThrow();

              field = 1;
              model = 1;
              record = undefined;
              jest.spyOn(currentUser, 'permissionChecker');
              result = await HELPERS.getFieldValuePermission(field, model, record, type, currentUser);
              expect(currentUser.permissionChecker).toBeCalledWith('field', type, 1, 1, record);
              jest.clearAllMocks();

              field = 1;
              model = 1;
              record = undefined;
              jest.spyOn(currentUser, 'permissionChecker');
              result = HELPERS.getFieldValuePermission(field, model, record, type, currentUser);
              expect(currentUser.permissionChecker).toBeCalledWith('field', type, 1, 1, record);
              jest.clearAllMocks();

              field = 1;
              model = 'model';
              record = undefined;
              jest.spyOn(currentUser, 'permissionChecker');
              result = await HELPERS.getFieldValuePermission(field, model, record, type, currentUser);
              expect(currentUser.permissionChecker).toBeCalledWith('field', type, 1, 1, record);
              jest.clearAllMocks();

              field = await db.model('field').pluck('alias').where({ id: 1 }).getOne();
              model = 'model';
              record = undefined;
              jest.spyOn(currentUser, 'permissionChecker');
              result = await HELPERS.getFieldValuePermission(field, model, record, type, currentUser);
              expect(currentUser.permissionChecker).toBeCalledWith('field', type, 1, 1, record);
              jest.clearAllMocks();

              // record from context
              currentUser = getCurrentUserFunction({ user }, new Sandbox({ user, request: { body: { record: { id: 1 } } } }));

              field = undefined;
              model = undefined;
              record = undefined;
              expect(() => HELPERS.getFieldValuePermission(field, model, record, type, currentUser)).toThrow();

              field = 1;
              model = undefined;
              record = undefined;
              jest.spyOn(currentUser, 'permissionChecker');
              result = await HELPERS.getFieldValuePermission(field, model, record, type, currentUser);
              expect(currentUser.permissionChecker).toBeCalledWith('field', type, 1, 1, 1);

              field = 'id';
              model = undefined;
              record = undefined;
              expect(() => HELPERS.getFieldValuePermission(field, model, record, type, currentUser)).toThrow();

              field = 1;
              model = 1;
              record = undefined;
              jest.spyOn(currentUser, 'permissionChecker');
              result = await HELPERS.getFieldValuePermission(field, model, record, type, currentUser);
              expect(currentUser.permissionChecker).toBeCalledWith('field', type, 1, 1, 1);
              jest.clearAllMocks();

              field = 1;
              model = 1;
              record = undefined;
              jest.spyOn(currentUser, 'permissionChecker');
              result = HELPERS.getFieldValuePermission(field, model, record, type, currentUser);
              expect(currentUser.permissionChecker).toBeCalledWith('field', type, 1, 1, 1);
              jest.clearAllMocks();

              field = 1;
              model = 'model';
              record = undefined;
              jest.spyOn(currentUser, 'permissionChecker');
              result = await HELPERS.getFieldValuePermission(field, model, record, type, currentUser);
              expect(currentUser.permissionChecker).toBeCalledWith('field', type, 1, 1, 1);
              jest.clearAllMocks();

              field = await db.model('field').pluck('alias').where({ id: 1 }).getOne();
              model = 'model';
              record = undefined;
              jest.spyOn(currentUser, 'permissionChecker');
              result = await HELPERS.getFieldValuePermission(field, model, record, type, currentUser);
              expect(currentUser.permissionChecker).toBeCalledWith('field', type, 1, 1, 1);
              jest.clearAllMocks();

              // record and model from context
              currentUser = getCurrentUserFunction({ user }, new Sandbox({ user, request: { model: { id: 1 }, body: { record: { id: 1 } } } }));

              field = undefined;
              model = undefined;
              record = undefined;
              expect(() => HELPERS.getFieldValuePermission(field, model, record, type, currentUser)).toThrow();

              field = 1;
              model = undefined;
              record = undefined;
              jest.spyOn(currentUser, 'permissionChecker');
              result = await HELPERS.getFieldValuePermission(field, model, record, type, currentUser);
              expect(currentUser.permissionChecker).toBeCalledWith('field', type, 1, 1, 1);

              field = 'id';
              model = undefined;
              record = undefined;
              expect(() => HELPERS.getFieldValuePermission(field, model, record, type, currentUser)).not.toThrow();

              field = 1;
              model = undefined;
              record = undefined;
              jest.spyOn(currentUser, 'permissionChecker');
              result = HELPERS.getFieldValuePermission(field, model, record, type, currentUser);
              expect(currentUser.permissionChecker).toBeCalledWith('field', type, 1, 1, 1);
              jest.clearAllMocks();

              field = 1;
              model = undefined;
              record = undefined;
              jest.spyOn(currentUser, 'permissionChecker');
              result = await HELPERS.getFieldValuePermission(field, model, record, type, currentUser);
              expect(currentUser.permissionChecker).toBeCalledWith('field', type, 1, 1, 1);
              jest.clearAllMocks();

              field = await db.model('field').pluck('alias').where({ id: 1 }).getOne();
              model = undefined;
              record = undefined;
              jest.spyOn(currentUser, 'permissionChecker');
              result = await HELPERS.getFieldValuePermission(field, model, record, type, currentUser);
              expect(currentUser.permissionChecker).toBeCalledWith('field', type, 1, 1, 1);
              jest.clearAllMocks();
            });
          });
        });
      });
    });
  });
});
