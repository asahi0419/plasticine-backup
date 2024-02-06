import { get } from 'lodash/object';
import { isString } from 'lodash/lang';

import { checkPrivilege } from '../../../security/privileges';

class AccountProxy {
  constructor(account) {
    this.account = account;
  }

  getValue(fieldAlias) {
    return this.account[fieldAlias];
  }
}

export default class UserProxy {
  constructor(user, sandbox) {
    this.user = user;
    this.sandbox = sandbox;
  }

  getValue(fieldAlias) {
    return this.user.attributes[fieldAlias];
  }

  getAccount() {
    return new AccountProxy(this.user.account);
  }

  __checkPermission(model, type, action) {
    const modelId = isString(model)
      ? (this.user.privileges.find(({ model_alias }) => model_alias === model) || {}).model_id
      : model;

    if (!modelId) return false;

    const permissionScript = get(this.user.permissions, [modelId, type, action].join('.'));
    if (!permissionScript) return false;
    return this.sandbox.executeScript(permissionScript, { modelId }, `permission/${modelId}/script`);
  }

  canCreate(model) {
    return this.__checkPermission(model, 'model', 'create');
  }

  canUpdate(model) {
    return this.__checkPermission(model, 'model', 'update');
  }

  canDelete(model) {
    return this.__checkPermission(model, 'model', 'delete');
  }

  canAttach(model) {
    return this.__checkPermission(model, 'attachment', 'create');
  }

  canAttachPhoto() {
    return false;
  }

  canDeleteAttachment(model) {
    return this.__checkPermission(model, 'attachment', 'delete');
  }

  canViewAttachment(model) {
    return this.__checkPermission(model, 'attachment', 'view');
  }

  canDefineLayout(model) {
    return this.__checkPermission(model, 'model', 'define_layout');
  }

  canDefineFilter(model) {
    return this.__checkPermission(model, 'model', 'define_filter');
  }

  canAtLeastRead(model) {
    return checkPrivilege(this.user, 'read', model);
  }

  canAtLeastWrite(model) {
    return checkPrivilege(this.user, 'read_write', model);
  }

  isGuest() {
    return !!this.user.account.__is_guest;
  }

  isAdmin(model) {
    return checkPrivilege(this.user, 'admin', model);
  }

  isBelongsToWorkgroup(id) {
    return !!this.user.user_groups.find(group => group.id === id);
  }

  isBelongsToWorkgroupByName(name) {
    return !!this.user.user_groups.find(ug => ug.name === name);
  }

  isBelongsToWorkgroupByAlias(alias) {
    return !!this.user.user_groups.find(ug => ug.alias === alias);
  }

  getWorkgroups() {
    return this.user.user_groups;
  }

  getActualLatitude() {
    return null;
  }

  getActualLongitude() {
    return null;
  }

  getOptions() {
    return JSON.stringify(this.user.options);
  }

  getOption(option) {
    return this.user.options[option];
  }

  getGPSData() {
    return this.user.position;
  }

  getLanguage() {
    return this.user.language?.alias || 'en';
  }
}
