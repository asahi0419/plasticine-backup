import db from '../../../../data-layer/orm/index.js';

export default (req, res) => db.model(req.model, req.sandbox)
  .destroyRecord(req.record)
  .then(res.serialize)
  .catch(res.error);
