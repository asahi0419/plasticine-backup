import { isArray } from 'lodash-es';

import db from '../../../data-layer/orm/index.js';

export default class WhereVisitor {
  constructor(scope) {
    this.scope = scope;
  }

  visit(node, operator = 'and') {
    this[`visit_${node.type}`](node, operator);
  }

  visit_operation(node, operator) {
    if (node.group) {
      this.scope[`${operator}Where`]((builder) => {
        new WhereVisitor(builder).visit(node.left, operator);
        new WhereVisitor(builder).visit(node.right, node.operator);
      });
    } else {
      new WhereVisitor(this.scope).visit(node.left, operator);
      new WhereVisitor(this.scope).visit(node.right, node.operator);
    }
  }

  visit_expression(node, operator) {
    const { where, whereOperator } = node.queryOptions;
    if (!where.length) return;

    if (where.length > 1) {
      this.scope.where(builder => this.applyWhereItems(builder, where, operator, whereOperator));
    } else {
      this.applyWhereItems(this.scope, where, operator, whereOperator);
    }
  }

  applyWhereItems(scope, items, parentOperator, whereOperator) {
    this.applyWhere(scope, items[0], parentOperator);

    items.slice(1, items.length).forEach((whereArgs) =>
      this.applyWhere(scope, whereArgs, whereOperator || parentOperator)
    );
  }

  applyWhere(scope, args, operator) {
    if (args[1] === 'like') args[1] = db.client.caseInsensitiveLikeClause();
    else if (args[1] === 'not like') args[1] = 'not ' + db.client.caseInsensitiveLikeClause();

    isArray(args)
      ? scope[`${operator}Where`](...args)
      : scope[`${operator}Where`](args);
  }
}
