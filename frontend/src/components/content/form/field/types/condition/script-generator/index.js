import { compact } from 'lodash/array';
import { isString, isEmpty } from 'lodash/lang';

import * as EXPRESSION_GENERATORS from './expression-generators';
import { wrapWithGetValue, wrapWithBrackets } from './helpers';
import { noValueOperators } from '../../../../../../shared/filter/operators';

const OPERATORS = { or: '||', and: '&&' };

export const generateScript = (groups) => new ScriptGenerator().process(groups);

export default class ScriptGenerator {
  process(groups) {
    const groupQueries = groups.map(this.generateGroupQuery.bind(this));
    return groupQueries.length > 1 ? groupQueries.map(wrapWithBrackets).join(` ${OPERATORS.or} `) : groupQueries[0] || '';
  }

  generateGroupQuery(group) {
    const result = [];

    group.items.forEach((item, i) => {
      const itemQuery = this.generateItemQuery(item);

      if (itemQuery) {
        result.push(compact([(i > 0 ? OPERATORS[item.itemOperator] : null), itemQuery]).join(' '));
      }
    });

    return result.join(' ');
  }

  generateItemQuery(item) {
    const { field, operator, value } = item;
    const fieldToProcess = wrapWithGetValue(field.alias);

    if (field.type === 'boolean_stub') {
      return `${field.alias === 'true'}`;
    }

    if (operator === 'is_empty') return `!${fieldToProcess}`;
    if (operator === 'is_not_empty') return `!!${fieldToProcess}`;
    if (!value && !noValueOperators.includes(operator)) return;

    const generator = EXPRESSION_GENERATORS[field.type];
    return generator(fieldToProcess, operator, value);
  }
}
