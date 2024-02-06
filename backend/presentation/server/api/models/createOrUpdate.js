import db from '../../../../data-layer/orm/index.js';
import getRequest from '../../../../business/sandbox/api/p/get-request/index.js';
import { createPermissionChecker } from '../../../../business/security/permissions.js';
import { NoPermissionsError } from '../../../../business/error/index.js';

// this endpoint created for performance reason.
// it can find data (row:14) only uses simple query operators: "AND" and "=" (equal).
export default async (req, res) => {
  const { body = {}, model, user, sandbox } = req;
  const { data = {}, viewOptions = {} } = body;
  const { attributes = {} } = data;

  const wrappedRequest = getRequest({ request: req })();
  const record = viewOptions.filter && await db.model(model, sandbox).where(await wrappedRequest.getAttributesFromFilter()).getOne();

  await checkPermissions(model, record, sandbox);

  const meta = record ? metaForExistentRecord(user) : metaForNewRecord(user);

  const [result] = record
    ? await db.model(model, sandbox).updateAndGetResult({ ...meta, ...attributes, }, 'id').where({ id: record.id })
    : await db.model(model, sandbox).insertAndGetResult({ ...meta, ...attributes }, 'id');

  res.json({ id: result });
};

const checkPermissions = async (model, record, sandbox) => {
  const action = record ? 'update' : 'create';

  const permissionChecker = createPermissionChecker(sandbox.user, sandbox);
  const permitted = await permissionChecker('model', action, model.id);

  if (!permitted) {
    const message = sandbox.translate(
      'static.no_permissions_to_action_on_the_model',
      { action, model: model.name }
    );
    throw new NoPermissionsError(message);
  }
};

const metaForNewRecord = user => ({
  created_by: user.id,
  created_at: new Date(),
  __inserted: true
});

const metaForExistentRecord = user => ({
  updated_by: user.id,
  updated_at: new Date(),
});
