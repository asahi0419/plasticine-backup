import { filter, map, each, find } from 'lodash-es';

import db from '../../data-layer/orm/index.js';
import { loadUserGroups } from '../user/group.js';

const PRIVILEGE_LEVELS = {
  read: 0,
  read_write: 1,
  admin: 2,
};

export const loadAndAssignPrivileges = async (user) => {
  const userGroupIds = await loadUserGroups(user);

  const scope = db.model('privilege').orWhere(function () {
    this.where({ owner_type: 'user', owner_id: user.id });
  });

  if (userGroupIds.length) {
    scope.orWhere(function () {
      this.where({ owner_type: 'user_group' }).whereIn('owner_id', userGroupIds);
    });
  }

  if ((user.account || {}).email !== 'guest@free.man') {
    scope.orWhere({ owner_type: 'all_users' });
  }

  const modelsTable = db.model('model').tableName;
  const privilegesTable = db.model('privilege').tableName;

  const privileges = await scope.distinct(`${privilegesTable}.id`).select([
    `${privilegesTable}.model as model_id`,
    `${modelsTable}.alias as model_alias`,
    `${privilegesTable}.level`,
    `${privilegesTable}.owner_type`,
  ]).leftJoin(modelsTable, `${privilegesTable}.model`, `${modelsTable}.id`);

  user.__privileges = privileges;
};

export const checkPrivilege = (user, level, model) => {
  const levels = Array(Object.keys(PRIVILEGE_LEVELS).length).fill(false);

  const modelClause = parseInt(model) ? { model_id: model } : { model_alias: model };
  const privileges = map(filter(user.__privileges, modelClause), (({ level, owner_type }) => ({ level, owner_type })));
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
