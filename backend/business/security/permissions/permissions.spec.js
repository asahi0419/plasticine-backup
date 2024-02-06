import { loadAndAssignPermissions, updatePermissionsFromParent } from '../permissions.js';

const { manager } = h.record;

beforeAll(async () => {
  await manager('permission', 'secure').build({
    model: 1,
    type: 'model',
    action: 'create',
  }, true);
});

describe('Security: Permissions', () => {
  describe('loadAndAssignPermissions(user)', () => {
    it(`Should load only inserted permissions`, async () => {
      const user = { __permissions: [] };
      const permissions = await db.model('permission').where({ __inserted: true });

      await loadAndAssignPermissions(user);
      expect(Object.values(user.__permissions)).toHaveLength(Object.values(permissions).length);
    });
  });

  describe('updatePermissionsFromParent(user, model, parentModel)', () => {
    it(`Should update permissions from parent`, async () => {
      const model = db.getModel('attachment');
      const parentModel = db.getModel('model');

      const attachmentFieldViewPermission = { model: model.id, type: 'field', action: 'view', script: '' };
      const attachmentFieldUpdatePermission = { model: model.id, type: 'field', action: 'update', script: '' };
      const attachmentModelDefineLayoutPermission = { model: model.id, type: 'model', action: 'define_layout', script: '' };
      const attachmentModelDefineFilterPermission = { model: model.id, type: 'model', action: 'define_filter', script: '' };

      const user = { __permissions: [
        attachmentFieldViewPermission,
        attachmentFieldUpdatePermission,
        attachmentModelDefineLayoutPermission,
        attachmentModelDefineFilterPermission,
      ] };

      updatePermissionsFromParent(user, model, parentModel);

      expect(attachmentFieldViewPermission.script).toEqual(`p.currentUser.canViewAttachment(${parentModel.id})`);
      expect(attachmentFieldUpdatePermission.script).toEqual(`p.currentUser.canAttach(${parentModel.id})`);
      expect(attachmentModelDefineLayoutPermission.script).toEqual(`p.currentUser.canViewAttachment(${parentModel.id})`);
      expect(attachmentModelDefineFilterPermission.script).toEqual(`p.currentUser.canViewAttachment(${parentModel.id})`);
    });
  });
});
