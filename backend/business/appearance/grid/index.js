import Promise from 'bluebird';
import { omit, map } from 'lodash-es';

import db from '../../../data-layer/orm/index.js';
import Selector from '../../record/fetcher/selector.js';
import { parseOptions } from '../../helpers/index.js';

export default async (appearance, model, params, sandbox) => {
  const rules = parseOptions(appearance.options).rules || [];

  const fetchByRules = rules.map(async (rule) => {
    const { scope } = await new Selector(model, sandbox).getScope(rule.query);
    const column = `${db.model(model).tableName}.id`;

    const recordsScope = scope.clone().clearSelect().select(column);

    if (db.client.provider === 'postgres') {
      recordsScope.whereRaw(`${column} = ANY ('{${params.recordIds}}'::integer[])`);
    } else {
      recordsScope.whereIn(column, params.recordIds);
    }

    return { records: map(await recordsScope, 'id'), options: omit(rule, ['query']) };
  });

  return Promise.all(fetchByRules);
};
