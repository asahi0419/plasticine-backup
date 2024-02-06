import { keyBy } from 'lodash-es';

import db from '../../../data-layer/orm/index.js';
import parseFilter from '../parser.js';
import visitAndProcessNode from './visitors/index.js';

export default class Processor {
  constructor(model, sandbox, options = {}) {
    this.model = model;
    this.sandbox = sandbox;
    this.options = { humanize: false, withQueryOptions: false, ...options };
  }

  async perform(filter) {
    if (!filter) return {};

    const ast = parseFilter(filter, this.sandbox);
    const fieldsMap = keyBy(db.getFields({ model: this.model.id }), 'alias');

    if (ast.parentheses) delete ast.parentheses;

    return visitAndProcessNode(ast, {
      model: this.model,
      sandbox: this.sandbox,
      fieldsMap,
      options: this.options,
    });
  }
}
