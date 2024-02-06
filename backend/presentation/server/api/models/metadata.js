import { ModelExporter } from '../../../../business/export/json/index.js';

export default (req, res) => new ModelExporter(req.model).process(req.exportType)
  .then(result => res.status(200).json(result));
