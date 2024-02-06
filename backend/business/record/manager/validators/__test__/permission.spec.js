import Flags from '../../../../record/flags.js';
import Sandbox from '../../../../sandbox/index.js';
import permissionValidator from '../permission.js';
import { extendUser } from '../../../../user/index.js';

describe('Record: Validator', () => {
  describe('Permission:', () => {
    it('Should correctly process ignorePermissions flag', async () => {
      const model = db.getModel('model');
      const field = db.getField({ id: 1 });
      const record = { ...model };
      const value = 'value';

      const user = await extendUser(await db.model('user').where({ id: 2 }).getOne());
      const sandbox = new Sandbox({ user });

      await sandbox.assignRecord(record, model);
      let flags, result, expected;

      flags = new Flags({ ignorePermissions: true });
      result = await permissionValidator(value, field, sandbox, flags);
      expected = undefined;
      expect(result).toEqual(expected);

      flags = new Flags({ ignorePermissions: false });
      result = await permissionValidator(value, field, sandbox, flags);
      expected = 'static.no_permissions_to_action_on_the_field';
      expect(result).toEqual(expected);
    });
  });
});
