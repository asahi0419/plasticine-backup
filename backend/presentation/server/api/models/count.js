import { map, values } from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';
import Selector from '../../../../business/record/fetcher/selector.js';

export default async (req, res) => {
  try {
    const { filter, hidden_filter, date_trunc, include_last_updated } = req.query;
    const { model, sandbox } = req;
    const { tableName } = db.model(model);
    let last_updated;

    const options = { select: `${tableName}.id`, dateTruncPrecision: date_trunc };
    const count = await new Selector(model, sandbox, options).getScope(filter, hidden_filter);
  
    if (include_last_updated) {
      const [ recentlyUpdated ] = await new Selector(model, sandbox, {})
        .max({ updated_at: 'updated_at', created_at: 'created_at' });
  
      last_updated = Math.max(...map(values(recentlyUpdated), date => new Date(date).valueOf()));
    }
  
    res.json({
      count: await count.scope.count(),
      last_updated
    });
  } catch (error) {
    res.error(error);
  }
};
