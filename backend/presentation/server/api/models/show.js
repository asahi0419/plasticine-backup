import Fetcher from '../../../../business/record/fetcher/index.js';

export default async (req, res) => {
  const params = {
    ...req.query,
    filter: `id = ${req.record.id}`,
    ignore_permissions: !req.record.inserted,
    id_required: true,
  };

  await req.sandbox.assignRecord(req.record, req.model, 'record', {
    preload_virtual_attrubutes: false,
    preload_cross_attrubutes: false,
  });

  return new Fetcher(req.model, req.sandbox, params)
    .fetch()
    .then(res.serialize)
    .catch(res.error);
};
