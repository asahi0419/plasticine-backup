import { map } from 'lodash-es';

import db from '../../data-layer/orm/index.js';

export const loadUserGroups = async (user) => {
  if (user.__userGroups) return map(user.__userGroups, 'id');

  const userGroupsField = await getUserGroupField();
  if (!userGroupsField) return [];

  const rows = await db.model('rtl')
                       .select('target_record_id')
                       .where({ source_field: userGroupsField.id, source_record_id: user.id });

  return rows.map(({ target_record_id }) => target_record_id);
};

export const loadAndAssignUserGroups = async (user) => {
  const ids = await loadUserGroups(user);
  const groups = await db.model('user_group').whereIn('id', ids);
  user.__userGroups = groups;
};

export const loadGroupUsers = async (group) => {
  const userGroupsField = await getUserGroupField();
  if (!userGroupsField) return [];

  const rows = await db.model('rtl')
                       .select('source_record_id')
                       .where({ source_field: userGroupsField.id, target_record_id: group });

  return rows.map(({ source_record_id }) => source_record_id);
};

export const getUserGroupField = async () => {
  const userModel = db.getModel('user');
  return db.getField({ model: userModel.id, alias: 'user_groups' });
}
