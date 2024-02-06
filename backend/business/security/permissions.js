import Promise from 'bluebird';
import { isMatch, isObject, find, filter, keyBy, some, each } from 'lodash-es';

import db from '../../data-layer/orm/index.js';
import cache from '../../presentation/shared/cache/index.js';
import { modifyScriptWithModelPrivileges } from './privileges.js';
import { parseOptions } from '../helpers/index.js';
import { checkAccess } from './index.js';

const IGNORE_PERMISSIONS_USERS = [
  { name: 'System', surname: 'Escalation' },
  { name: 'System', surname: 'Scheduled' },
];

export const loadAndAssignPermissions = async (user) => {
  user.__permissions = cache.namespaces.core.get('permissions');
};

// IMPORTANT! User must have assigned privileges and permissions.
//
// Please use loadAndAssignPrivileges(user, model) and loadAndAssignPermissions(user, model)
// to ensure that user has been assigned with privileges

export const createPermissionChecker = (user, sandbox) => (type, action, model, field, record) => {
  // // https://redmine.nasctech.com/issues/52132
  // const isCoreGroupUser = !!find(user.__userGroups, { alias: '__core' });
  // if (isCoreGroupUser) return true;
  const ignore = some(IGNORE_PERMISSIONS_USERS, (u) => isMatch(user, u));
  if (ignore) return true;

  model = db.getModel(model).id
  const permissions = user.__permissions[model];
  
  if (type === 'field') {
    const permission = find(permissions, { type, action, field });

    if (permission && permission.script) {
      const context = { modelId: model };
      if (record) {
        if (sandbox.record) {
          return sandbox.executeScript(permission.script, `permission/${permission.id}/script`, context)
        }

        return sandbox.cloneWithoutDynamicContext()
          .then((sandbox) => {
            return db.model(model).where({ id: record }).getOne()
              .then((record) => sandbox.assignRecord(record, db.getModel(model)))
              .then((result) => sandbox.executeScript(permission.script, `permission/${permission.id}/script`, context));
          });
      } else {
        return sandbox.executeScript(permission.script, `permission/${permission.id}/script`, context);
      }
    }

    return true;
  } else {
    if (action === 'create' && type === 'attachment'){
      const permission = find(permissions, { type, action:'create_photo' });
      const context = { modelId: model };
      const permitted = permission && permission.script ? sandbox.executeScript(permission.script, `permission/${permission.id}/script`, context) : false;
      if(permitted)
        return true;
    }
    const permission = find(permissions, { type, action });

    if (permission && permission.script) {
      const context = { modelId: model };
      return sandbox.executeScript(permission.script, `permission/${permission.id}/script`, context);
    }

    return false;
  }
};

export const getPermittedFields = async (model, sandbox, params = {}, context = {}) => {
  let fields = context.fields;

  if (!fields) {
    fields = db.getFields({ model: model.id });

    if (params.filter) {
      if (params.filter_in) {
        fields = filter(fields, (f) => params.filter.includes(f[params.filter_in]));
      } else if (params.filter_not_in) {
        fields = filter(fields, (f) => !params.filter.includes(f[params.filter_not_in]));
      } else if (params.filter_not) {
        fields = filter(fields, (f) => f[params.filter_not] !== params.filter);
      } else {
        fields = db.getFields({ model: model.id, ...params.filter });
      }
    }
  }

  const permissionChecker = createPermissionChecker(sandbox.user, sandbox);
  const calculatePermissions = (field) => {
    const types = sandbox.record ? ['view', 'update'] : ['view'];
    return Promise.reduce(types, async (result, type) => {
      // TODO: add migration for update primary_key
      if ((type === 'update') && (field.type === 'primary_key')) return { ...result, [type]: false };

      return { ...result, [type]: await permissionChecker('field', type, model.id, field.id) }
    }, {});
  };

  const isAccessible = async (field, permissions = {}) => {
    const checkRefAccess = async field => {
      const { foreign_model } = parseOptions(field.options);
      return !!foreign_model && checkAccess('model', { id: db.getModel(foreign_model).id }, sandbox);
    };
    const checkGlobalRefAccess = async field => {
      const gRefValue = sandbox.record.getValue(field.alias);
      return !!gRefValue.model && checkAccess('model', { id: gRefValue.model }, sandbox);
    };

    if (field.type === 'journal') {
      return true;
    }

    if (!permissions.update && !permissions.view) return false;

    if ([ 'reference', 'reference_to_list' ].includes(field.type)) return checkRefAccess(field);
    if ([ 'global_reference' ].includes(field.type) && sandbox.record && isObject(sandbox.record.getValue(field.alias))) {
      return checkGlobalRefAccess(field);
    }

    return true;
  };

  if (params.accessible) {
    const permissionMapper = async (field) => {
      const permissions = await calculatePermissions(field);

      const access = await isAccessible(field, permissions);
      const update = (field.type === 'journal') || permissions.update;

      return {
        ...field,
        __access: access,
        __update: update,
        readonly_when_script: update ? field.readonly_when_script : 'true',
      };
    };
    return Promise.map(fields, permissionMapper);
  } else {
    const permissionFilter = async (field) => isAccessible(field, await calculatePermissions(field));
    return Promise.filter(fields, permissionFilter);
  }
};

export const updatePermissionsFromParent = (user, model, parentModel) => {
  if (model.alias === 'attachment') {
    const vScript = `p.currentUser.canViewAttachment(${parentModel.id})`;
    const cScript = `p.currentUser.canAttach(${parentModel.id})`;

    model.access_script = vScript;

    const permissions = user.__permissions[model.id];
    const permissionsParent = user.__permissions[parentModel.id];

    const attachmentPermissions = keyBy(filter(permissions, { type: 'model' }), 'action');
    const parentModelPermissions = keyBy(filter(permissionsParent, { type: 'attachment' }), 'action');

    each(['create', 'delete'], (action) => {
      if (parentModelPermissions[action]) {
        attachmentPermissions[action].script = modifyScriptWithModelPrivileges(
          parentModelPermissions[action].script,
          parentModel.id
        );
      }
    });

    each(['define_layout', 'define_filter'], (action) => {
      if (attachmentPermissions[action]) {
        attachmentPermissions[action].script = vScript
      }
    });

    const attachmentFieldViewPermissions = filter(permissions, { type: 'field', action: 'view' });
    each(attachmentFieldViewPermissions, (permission) => {
      permission.script = vScript
    });

    const attachmentFieldUpdatePermissions = filter(permissions, { type: 'field', action: 'update' });
    const fields = db.getFields({ model: model.id });
    const fileNameField = filter(fields, { alias: 'file_name' })[0] || {};
    each(attachmentFieldUpdatePermissions, (permission) => {
      if(permission.field === fileNameField.id)
        return;
      permission.script = cScript;
    });
  };
};
