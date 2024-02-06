import { concat } from 'lodash-es';

import { serializer, loadFields } from '../helpers.js';
import { loadFilters, loadActions } from './helpers.js';

export default async (view, req, result) => {
  const fields = await loadFields(req.model, req.sandbox, { filter_not_in: 'type', filter: ['data_visual', 'journal'] });

  return concat(
    result,
    serializer([view], 'view', { translate: ['name'], req }),
    serializer(fields, 'field', { translate: ['name', 'options'], req }),
    serializer(await loadActions(req.model, req.sandbox, view, req.query), 'action', { translate: ['name'], req }),
    serializer(await loadFilters(view), 'filter'),
  );
};
