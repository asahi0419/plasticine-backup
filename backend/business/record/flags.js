import { cloneDeep, isNil, merge } from 'lodash-es';

const ACTIONS_MAP = {
  query: 'query',
  create: 'insert',
  update: 'update',
  destroy: 'delete',
};

const DEFAULT_FLAGS = {
  preload_data: false,
  sqlDebug: true,
  includeNotInsertedRecords: false,
  ignorePermissions: false,
  validateAttributes: true,
  ex_save: {
    executeActions: true,
    recalcEscalTimes: true,
    updateDateTimeFields: true,
    checkMandatoryFields: true,
    protectSystemFields: true,
  },
  check_permission: {
    delete: true,
    update: true,
    insert: true,
    query: true,
  },
};

export default class Flags {
  static default() {
    return new Flags();
  }

  constructor(flags = {}) {
    this.flags = merge({}, DEFAULT_FLAGS, flags);
  }

  getFlags() {
    return cloneDeep(this.flags);
  }

  enabledSQLDebug() {
    return !!this.flags.sqlDebug;
  }

  includeNotInsertedRecords() {
    return this.flags.includeNotInsertedRecords;
  }

  checkPermission(action) {
    const { check_permission } = this.flags;

    if (isNil(check_permission)) return true;
    if (!check_permission) return false;
    if (check_permission.all === false) return false;
    if (check_permission.all === true) return true;
    if (check_permission.destroy === false) return false;
    if (!ACTIONS_MAP[action]) return true;

    return !!check_permission[ACTIONS_MAP[action]];
  }
}
