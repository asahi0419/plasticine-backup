import { Parser } from 'flora-sql-parser';

import { FilterError } from '../error/index.js';

export default (sql, sandbox) => {
  try {
    const parser = new Parser();
    const clause = preprocessInput(sql);
    const input = `select * from t where ${clause}`;

    return parser.parse(input).where;
  } catch (error) {
    if (error.name === 'SyntaxError') {
      error.message = sandbox.translate('static.parse_filter_syntax_error', { query: sql });
    }

    throw new FilterError(error);
  }
};

export const preprocessInput = (expression) => expression.replace(/(["'])js:(?:(?=(\\?))\2.)*?\1/g, '($&)');
