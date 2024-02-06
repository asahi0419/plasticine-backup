import { filter, map, each, find } from 'lodash/collection';

const PRIVILEGE_LEVELS = {
  read: 0,
  read_write: 1,
  admin: 2,
};

export const checkPrivilege = (user, level, model) => {
  const levels = Array(Object.keys(PRIVILEGE_LEVELS).length).fill(false);

  const modelClause = parseInt(model) ? { model_id: model } : { model_alias: model };
  const privileges = map(filter(user.privileges, modelClause), (({ level, owner_type }) => ({ level, owner_type })));
  const applyAllUsersPrivilege = find(privileges, ({ owner_type }) => ['user', 'user_group'].includes(owner_type));

  each(privileges, ({ level, owner_type }) => {
    if ((owner_type === 'all_users') && applyAllUsersPrivilege) return;
    const index = PRIVILEGE_LEVELS[level];
    if (index !== undefined) levels.fill(true, 0, index + 1);
  });

  const indexOfLevel = PRIVILEGE_LEVELS[level];
  if (indexOfLevel === undefined) return false;

  return levels[indexOfLevel];
};

export const modifyScriptWithModelPrivileges = (script, modelId) => {
  [
    ['p.currentUser.canAtLeastRead\\(\\)', `p.currentUser.canAtLeastRead(${modelId})`],
    ['p.currentUser.canAtLeastWrite\\(\\)', `p.currentUser.canAtLeastWrite(${modelId})`],
    ['p.currentUser.isAdmin\\(\\)', `p.currentUser.isAdmin(${modelId})`],
    ['p.currentUser.canCreate\\(\\)', `p.currentUser.canCreate(${modelId})`],
    ['p.currentUser.canUpdate\\(\\)', `p.currentUser.canUpdate(${modelId})`],
    ['p.currentUser.canDelete\\(\\)', `p.currentUser.canDelete(${modelId})`],
    ['p.currentUser.canAttach\\(\\)', `p.currentUser.canAttach(${modelId})`],
    ['p.currentUser.canAttachPhoto\\(\\)', `p.currentUser.canAttachPhoto(${modelId})`],
    ['p.currentUser.canViewAttachment\\(\\)', `p.currentUser.canViewAttachment(${modelId})`],
    ['p.currentUser.canDeleteAttachment\\(\\)', `p.currentUser.canDeleteAttachment(${modelId})`],
    ['p.currentUser.canDefineLayout\\(\\)', `p.currentUser.canDefineLayout(${modelId})`],
    ['p.currentUser.canDefineFilter\\(\\)', `p.currentUser.canDefineFilter(${modelId})`],
  ].forEach(([source, target]) => {
    script = script.replace(new RegExp(source, 'g'), target);
  });

  return script;
};
