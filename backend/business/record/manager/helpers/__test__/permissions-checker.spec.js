import Sandbox from '../../../../sandbox/index.js';
import { extendUser } from '../../../../user/index.js';
import checkPermission from '../permissions-checker.js';

describe('Record: Helpers', () => {
  describe('checkPermissions(attributes, service)', () => {
    describe('Destroy', () => {
      it('Should not throw if can delete attachment by permission', async () => {
        const user = await extendUser(await db.model('user').where({ id: 1 }).getOne());
        const request = { i18n: { t: () => null }, parentModel: db.getModel('model') };
        const sandbox = new Sandbox({ user, request });

        const service = {
          sandbox,
          model: db.getModel('attachment'),
          mode: 'secure',
        };

        expect(await checkPermission(service, 'destroy')).not.toBeDefined();
      });
      it('Should throw if can not delete attachment by permission', async () => {
        const user = await extendUser(await db.model('user').where({ id: 2 }).getOne());
        const request = { i18n: { t: () => null }, parentModel: db.getModel('model') };
        const sandbox = new Sandbox({ user, request });

        const service = {
          sandbox,
          model: db.getModel('attachment'),
          mode: 'secure',
        };

        await expect(checkPermission(service, 'destroy')).rejects.toMatchObject({ name: 'NoPermissionsError' });
      });
    });
  });
});
