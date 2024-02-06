import db from '../../../../data-layer/orm/index.js';
import Selector from '../../../../business/record/fetcher/selector.js';
import Sorter from '../../../../business/record/fetcher/sorter.js';

export default async (req, res) => {
  res.json(await getFormPagination(req.model, req.record, req.query, req.sandbox));
};

export async function getFormPagination(model, record, query, sandbox) {
  if (!record.__inserted) return {};

  const { filter = '', sort = '-id' } = query;

  const { scope: selectorScope } = await new Selector(model, sandbox).getScope(filter);
  const { scope: sorterScope } = await new Sorter(model, null, sandbox).apply(sort).to(selectorScope);
  const scope = sorterScope.clearSelect().clearClause('distinct').select([`${db.client.tableResolver.resolve(model)}.id`]);

  const { prev_row_id, next_row_id } = await db.client.getRowSiblings(scope, record.id) || {};

  return {
    prev_record_id: prev_row_id,
    next_record_id: next_row_id,
  };
}
