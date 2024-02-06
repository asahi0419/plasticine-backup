import WSProxy from '../../../sandbox/api/p/ws/index.js';
import { loadGroupUsers } from '../../../user/group.js';
import { getUserGroupField } from '../../../user/group.js';

export default async (service) => {
  const { model, sandbox } = service;
  const record = sandbox.record.attributes;
  const previousAttributes = sandbox.record.previousAttributes;

  switch(model.alias) {
    case 'privilege':
      let user_ids = [];
      let all_users = false;
      if (record.owner_type == 'all_users') {
        all_users = true;
      } else if (record.owner_type == 'user') {
        user_ids.push(record.owner_id);
      } else { // groups
        user_ids = await loadGroupUsers(record.owner_id);
      }

      WSProxy(sandbox.user).sendUpdateStore({ type: 'user_privileges', user_ids, all_users });
      break;
    case 'rtl':
      const userGroupsField = await getUserGroupField();
      if (!userGroupsField) break;
      if (record.source_field !== userGroupsField.id) break;

      WSProxy(sandbox.user).sendUpdateStore({ type: 'user_groups', user_ids: [record.source_record_id] });
      break;
    case 'permission':
      WSProxy(sandbox.user).sendUpdateStore({ type: 'user_permissions' });
      break;
    case'model':
      if (previousAttributes.access_script !== record.access_script ||
        previousAttributes.plural !== record.plural) {
          WSProxy(sandbox.user).sendUpdateStore({ type: 'metadata' });
      }
      break;
    case'view':
      if (previousAttributes.condition_script !== record.condition_script ||
        previousAttributes.name !== record.name) {
          WSProxy(sandbox.user).sendUpdateStore({ type: 'metadata' });
      }
      break;
  }
  return;
};