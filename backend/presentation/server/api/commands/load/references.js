export default async (req, res) => {
  const references = await req.sandbox.vm.p.service.modelReferences({
    record_id: req.params.id,
    model: req.params.modelAlias,
  })

  res.json(references);
};
