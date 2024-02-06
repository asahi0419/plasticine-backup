import { find } from 'lodash-es';

import db from '../../../data-layer/orm/index.js';
import cache from '../../../presentation/shared/cache/index.js';
import FilterService from '../../filter/index.js';

export default class {
  constructor(model, sandbox, options = {}) {
    this.model = model;
    this.options = options;
    this.filterService = new FilterService(this.model, sandbox, this.options);
  }

  defaultScope() {
    const queryBuilder = db.model(this.model);
    const select = this.options.select || `${queryBuilder.tableName}.*`;

    let baseScope = queryBuilder.select(select);

    if (!this.options.includeNotInserted) {
      baseScope = baseScope.where(`${db.model(this.model).tableName}.__inserted`, true);
    }

    if (!this.options.ignorePermissions) {
      return this.applyQueryPermission(baseScope);
    }

    return Promise.resolve({ scope: baseScope });
  }

  max(args) {
    const queryBuilder = db.model(this.model);
    const baseScope = queryBuilder.select();

    return baseScope.max(args);
  };

  getScope(filter, hiddenFilter) {
    return this.defaultScope()
      .then(({ scope }) => (hiddenFilter ? this.applyFilter(scope, hiddenFilter) : { scope }))
      .then(({ scope }) => this.applyFilter(scope, filter));
  }

  fetch(filter) {
    return this.getScope(filter).then(({ scope }) => scope);
  }

  async applyQueryPermission(scope) {
    const permissions = cache.namespaces.core.get('permissions')[this.model.id];
    const permission = find(permissions, { type: 'model', action: 'query' }) || {};

    if (!permission.script) return { scope };
    return this.filterService.apply(permission.script, scope);
  }

  applyFilter(scope, filter) {
    return this.filterService.apply(filter, scope);
  }
}
