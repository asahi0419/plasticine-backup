import Flags from '../../flags.js';
import { NoPermissionsError } from '../../../error/index.js';
import { createPermissionChecker } from '../../../security/permissions.js';

const PERMISSIONS_MAP = {
  create: 'create',
  update: 'update',
  destroy: 'delete',
};

export default async (service, action, flags = Flags.default()) => {
  const { sandbox, mode } = service;
  if ((mode !== 'secure') || !flags.checkPermission(action) || flags.flags.ignorePermissions) return;

  const permissionAction = PERMISSIONS_MAP[action];
  if (!permissionAction) return;

  const permissionChecker = createPermissionChecker(sandbox.user, sandbox);
  const parentModel = (sandbox.context.request || {}).parentModel;
  const model = parentModel || service.model;
  const type = ((service.model.alias === 'attachment') && parentModel) ? 'attachment' : 'model';

  const permitted = await permissionChecker(type, permissionAction, model.id);
  if (!permitted) {
    const message = sandbox.translate(
      'static.no_permissions_to_action_on_the_model',
      { action, model: (type === 'attachment') ? service.model.name : model.name }
    );
    throw new NoPermissionsError(message);
  }
};
