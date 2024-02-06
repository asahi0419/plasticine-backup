import { pick } from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';
import Selector from '../../../record/fetcher/selector.js';
import ModelProxy from '../model/index.js';
import QueryBuilder from '../query/builder.js';

const getScope = (request, filters) => {
  if (!request.model) return;
  const model = db.getModel(request.model.alias);

  return new QueryBuilder(
    new ModelProxy(model, request.sandbox),
    new Selector(model, request.sandbox).getScope(filters.filter, filters.hidden_filter)
  );
}

export default (context = {}) => () => {
  const { request = {} } = context;
  const { body = {} } = request;
  const { exec_by = {}, record = {} } = body;

  switch (exec_by.type) {
    case 'form':
    case 'page':
      if (!record.id) return;
      return getScope(request, ({ filter: `id = ${record.id}` }));
    case 'view':
    case 'main_view':
    case 'embedded_view':
    case 'related_view':
      return getScope(request, pick((body.viewOptions || {}), ['filter', 'hidden_filter']));
  }
};
