import { compact, reduce, each, pick, setWith } from 'lodash-es';

const DEFAULT_USER = {
  account: {},
  language: {},
  options: {},
  __permissions: [],
  __privileges: [],
  __userGroups: [],
};
const DEFAULT_REQ = { query: {}, user: DEFAULT_USER };
const DEFAULT_RES = { json: () => null, error: () => null };

export default (req = DEFAULT_REQ, res = DEFAULT_RES) => {
  try {
    const result = req.query.type
      ? loadUserDetailsData(req)
      : loadUserData(req)

    res.json(result);
  } catch (error) {
    res.error(error);
  }
};

export function loadUserDetailsData(req = DEFAULT_REQ) {
  const details = {
    user_permissions: { permissions: createPermissionsMap(req.user.__permissions) },
    user_privileges: { privileges: preparePrivileges(req.user.__privileges) },
    user_groups: { user_groups: prepareUserGroups(req.user.__userGroups) },
  };

  return details[req.query.type];
}

export function loadUserData(req = DEFAULT_REQ) {
  const result = {
    attributes: pick(req.user, ['id', 'name', 'surname', 'created_at', 'created_by', 'updated_at', 'updated_by', 'autologout']),
    user_groups: prepareUserGroups(req.user.__userGroups),
    permissions: createPermissionsMap(req.user.__permissions),
    privileges: preparePrivileges(req.user.__privileges),
    language: pick(req.user.language, ['name', 'alias']),
    account: prepareAccount(req.user.account),
    options: req.user.options,
  };

  if (req.user.__session) result.session = { id: req.user.__session.id };

  return result;
}

function createPermissionsMap(permissions) {
  return reduce(permissions, (result, modelPermissions, model) => {
    if (!model) return result;

    each(modelPermissions, ({ type, action, field, script }) => {
      if (action === 'query') return;
      if (type === 'field') return;

      setWith(result, compact([model, type, field, action]).join('.'), script, Object);
    });

    return result;
  }, {});
}

function preparePrivileges(privileges) {
  return privileges.map(privilege => pick(privilege, ['model_id', 'model_alias', 'level', 'owner_type']));
}

function prepareUserGroups(groups) {
  return groups.map(group => pick(group, ['id', 'name', 'alias']));
}

function prepareAccount(account) {
  const result = pick(account, ['id', 'status']);
  if (account.email === 'guest@free.man') result.__is_guest = true;
  return result;
}
