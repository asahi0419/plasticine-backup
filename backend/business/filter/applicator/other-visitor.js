import { each, isArray, isEqual, differenceWith, uniqWith } from 'lodash-es';

export default class OtherVisitor {
  constructor(scope) {
    this.scope = scope;

    this.froms = [];
    this.joins = [];
  }

  visit(node) {
    this[`visit_${node.type}`](node);
  }

  visit_operation(node, operator) {
    this.visit(node.left);
    this.visit(node.right);
  }

  visit_expression(node) {
    const { froms, joins, having, groupBy, distinct } = node.queryOptions;

    if (isArray(froms) && froms.length) this.applyFroms(froms);
    if (isArray(joins) && joins.length) this.applyJoins(joins);

    if (having) this.applyHaving(having);
    if (groupBy) this.applyGroupBy(groupBy);
    if (distinct) this.applyDistinct(distinct);
  }

  applyFroms(froms) {
    each(froms, (from) => this.scope.froms.push(from));
  }

  applyJoins(joins) {
    differenceWith(joins, this.joins, isEqual).forEach(({ tableName, onItems }) => {
      this.scope.leftJoin(tableName, (builder) => {
        onItems.forEach(item => builder.on(item.left, '=', item.right));
      });
    });

    this.joins = uniqWith(joins, this.joins, isEqual);
  }

  applyHaving(havingClause) {
    this.scope.havingRaw(havingClause);
  }

  applyGroupBy(groupByColumn) {
    this.scope.groupBy(groupByColumn);
  }

  applyDistinct(distinctColumn) {
    this.scope.distinct(distinctColumn);
  }
}
