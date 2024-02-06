import { getSetting } from '../../../setting/index.js';
import * as HELPERS from './helpers.js';

export default class Paginator {
  apply(page = {}) {
    this.page = {
      number: 1,
      size: getSetting('limits.query_iterator') || 1000,
      ...page,
    };
    return this;
  }

  to(scope) {
    const pageNumber = HELPERS.getPageNumber(this.page.number);
    const pageSize = HELPERS.getPageSize(this.page.size);
    const offset = (pageNumber - 1) * pageSize;

    if (pageSize) {
      scope.limit(pageSize).offset(offset);
    } else {
      scope.where({ id: -1 });
    }

    return {
      pageNumber,
      pageSize,
      scope,
    };
  }
}
