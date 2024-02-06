import Promise from 'bluebird';
import { omit, reduce, filter, find } from 'lodash-es';

import { createPermissionChecker } from '../../../../security/permissions.js';
import { createCoreLockChecker } from '../../../../security/core-locks.js';
import { checkPrivilege } from '../../../../security/privileges.js';

import db from '../../../../../data-layer/orm/index.js';

import AccountProxy from './account.js';
import optionsProxy from './options.js';
import * as HELPERS from './helpers.js';

export class UserProxy {
  constructor(user = {}, sandbox) {
    user.options = optionsProxy.options;
    user.position = user._position;

    this.user = user;

    this.permissionChecker = createPermissionChecker(user, sandbox);
    this.coreLockChecker = createCoreLockChecker(user, sandbox);

    this.getSandbox = () => sandbox;
  }

  get record() {
    return this.user;
  }

  getValue(fieldAlias) {
    return this.user[fieldAlias];
  }

  getSession() {
    return this.user.__session;
  }

  canCreate(modelId) {
    return this.permissionChecker('model', 'create', modelId);
  }

  canUpdate(modelId) {
    return this.permissionChecker('model', 'update', modelId) &&
      this.coreLockChecker('model', 'update', modelId);
  }

  canDelete(modelId) {
    return this.permissionChecker('model', 'delete', modelId) &&
      this.coreLockChecker('model', 'delete', modelId);
  }

  canAttach(modelId) {
    const { request = {} } = this.getSandbox();
    const { headers = {} } = request;

    if (headers.client === 'mobile') {
      return this.permissionChecker('attachment', 'create_photo', modelId);
    }
    
    return this.permissionChecker('attachment', 'create', modelId);
  }

  canAttachPhoto(modelId) {
    const { request = {} } = this.getSandbox();
    const { headers = {} } = request;

    if (headers.client === 'mobile') {
      return this.permissionChecker('attachment', 'create_photo', modelId);
    }

    return false;
  }

  canUpdateAttachment() {
    return this.permissionChecker('model', 'update', db.getModel('attachment').id);
  }

  canDeleteAttachment(modelId) {
    return this.permissionChecker('attachment', 'delete', modelId);
  }

  canViewAttachment(modelId) {
    return this.permissionChecker('attachment', 'view', modelId);
  }

  canDefineLayout(modelId) {
    return this.permissionChecker('model', 'define_layout', modelId);
  }

  canDefineFilter(modelId) {
    return this.permissionChecker('model', 'define_filter', modelId);
  }

  canAtLeastRead(modelId) {
    return checkPrivilege(this.user, 'read', modelId);
  }

  canAtLeastWrite(modelId) {
    return checkPrivilege(this.user, 'read_write', modelId);
  }

  canViewFieldValue(fieldAliasOrId, modelAliasOrId, recordId) {
    return HELPERS.getFieldValuePermission(fieldAliasOrId, modelAliasOrId, recordId, 'view', this);
  }

  canUpdateFieldValue(fieldAliasOrId, recordId, modelAliasOrId) {
    return HELPERS.getFieldValuePermission(fieldAliasOrId, modelAliasOrId, recordId, 'update', this);
  }

  canCreateFieldValue(fieldAliasOrId, recordId, modelAliasOrId) {
    return HELPERS.getFieldValuePermission(fieldAliasOrId, modelAliasOrId, recordId, 'create', this);
  }

  canDeleteFieldValue(fieldAliasOrId, recordId, modelAliasOrId) {
    return HELPERS.getFieldValuePermission(fieldAliasOrId, modelAliasOrId, recordId, 'delete', this);
  }

  async getPermissions(recordId, modelAliasOrId) {
    const model = modelAliasOrId ? db.getModel(modelAliasOrId) : HELPERS.getContextModel(this);

    let permissionChecker = this.permissionChecker;
    if (recordId) {
      const sandbox = await (this.getSandbox()).cloneWithoutDynamicContext();
      const rec = await db.model(model).where({ id: recordId, __inserted: true }).getOne();
      await sandbox.assignRecord(rec, db.getModel(model));
      permissionChecker = createPermissionChecker(this.user, sandbox);
    }

    const permissions = filter(this.user.__permissions, (p) => {
      return (p.model === model.id) && (p.action !== 'query');
    });

    const fields = db.getFields({ model: model.id });
    const fieldsMap = reduce(fields, (result, field) => ({ ...result, [field.id]: field }), {});

    return Promise.map(permissions, async (permission) => {
      const { type, action, model, field } = permission;
      const result = omit(permission, [ 'id', 'model', 'script' ]);

      if (result.field) {
        result.field = (fieldsMap[result.field] || {}).alias;
      } else {
        delete result.field;
      }

      try {
        result.allowed = await permissionChecker(type, action, model, field);
      } catch (e) {
        result.allowed = false;
      }

      return result;
    });
  }

  isAdmin(modelId) {
    return checkPrivilege(this.user, 'admin', modelId);
  }

  isGuest() {
    return this.user.account.email == 'guest@free.man';
  }

  isBelongsToWorkgroup(id) {
    return !!find(this.user.__userGroups, { id });
  }

  isBelongsToWorkgroupByName(name) {
    return !!find(this.user.__userGroups, { name });
  }

  isBelongsToWorkgroupByAlias(alias) {
    return !!find(this.user.__userGroups, { alias });
  }

  getWorkgroups() {
    return this.user.__userGroups;
  }

  getActualLatitude() {
    return null;
  }

  getActualLongitude() {
    return null;
  }

  getOptions() {
    return optionsProxy.getOptions();
  }

  getOption(key) {
    return optionsProxy.getOption(key);
  }

  setOptions(options) {
    optionsProxy.setOptions(options);
  }

  setOption(key, value) {
    optionsProxy.setOption(key, value);
  }

  getGPSData() {
    return this.user.position;
  }

  getLanguage() {
    return this.user.language?.alias || 'en';
  }
}

export default ({ user }, sandbox) => {
  const result = new UserProxy(user, sandbox);

  result.getAccount = () => new AccountProxy(user, sandbox);

  return result;
}
