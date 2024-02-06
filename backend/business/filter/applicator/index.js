import { some } from 'lodash-es';

import db from '../../../data-layer/orm/index.js';

import WhereVisitor from './where-visitor.js';
import OtherVisitor from './other-visitor.js';

const STATIC_SQL_FILTERS = {
  RTL_VIEW_FILTER: (scope, source_field, source_record_id) => {
    const rtlTableName = db.model('rtl').tableName;
    scope.whereRaw(`id in (select "target_record_id" from "${rtlTableName}" where "source_field" = ${source_field} and "source_record_id" = ${source_record_id})`);
    return { scope };
  },
};

export default (astTree, scope) => {
  scope.where((builder) => new WhereVisitor(builder).visit(astTree));

  new OtherVisitor(scope).visit(astTree);

  return { scope };
};

export const isStatic = (filter) => {
  return some(Object.keys(STATIC_SQL_FILTERS), (key) => filter.startsWith(key));
};

export const applyFilterStatic = (filter, scope) => {
  const [ name, ...args ] = filter.split(' ');
  return STATIC_SQL_FILTERS[name](scope, ...args);
};
