import { isEmpty } from 'lodash-es';

import Processor from './processor/index.js';
import applyFilter, { applyFilterStatic, isStatic } from './applicator/index.js';

const DEFAULT_OPTIONS = { withQueryOptions: true };

export default class {
  constructor(model, sandbox, options = {}) {
    this.model = model;
    this.sandbox = sandbox;
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  async apply(filter, scope) {
    if (isEmpty(filter)) return { scope };
    if (isStatic(filter)) return applyFilterStatic(filter, scope);

    const filterTree = await new Processor(this.model, this.sandbox, this.options).perform(filter);
    return applyFilter(filterTree, scope);
  }
}
