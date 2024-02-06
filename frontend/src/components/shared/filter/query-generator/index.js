import { compact } from 'lodash/array';
import { isNil } from 'lodash/lang';

import generateExpression from './expression-generators';

const wrapWithBrackets = (string) => `(${string})`;

export const generatePlainQuery = (groups) => new QueryGenerator().process(groups);
export const generateHumanizedQuery = (groups) => new QueryGenerator({ humanize: true }).process(groups);

export default class QueryGenerator {
  constructor(params = {}) {
    this.params = params;
  }

  process(groups) {
    const groupQueries = compact(groups.map(this.generateGroupQuery.bind(this)));
    return groupQueries.length > 1 ? groupQueries.map(wrapWithBrackets).join(' OR ') : groupQueries[0] || '';
  }

  generateGroupQuery(group) {
    const result = [];

    group.items.forEach((item, i) => {
      const itemQuery = this.generateItemQuery(item);

      if (itemQuery) {
        result.push(compact([i > 0 ? item.itemOperator.toUpperCase() : null, itemQuery]).join(' '));
      }
    });

    return result.join(' ');
  }

  generateItemQuery(item) {
    const { field, operator } = item;
    const { humanize } = this.params;

    const rawValue = isNil(item.rawValue) ? item.value : item.rawValue;
    const humanizedValue = isNil(item.humanizedValue) ? rawValue : item.humanizedValue;
    const value = humanize ? humanizedValue : rawValue;

    return generateExpression(field, operator, value, humanize);
  }
}
