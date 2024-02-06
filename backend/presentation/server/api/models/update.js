import db from '../../../../data-layer/orm/index.js';
import {humanize} from '../../../../business/record/fetcher/humanizer/index.js';

export default (req, res) => db.model(req.model, req.sandbox)
  .updateRecord(req.record, req.body.data.attributes)
  .then(async (data) => {
    if (req.query.humanize) await humanize(req.model.id, [], [data], req.sandbox);
    return data;
  })
  .then(res.serialize)
  .catch(res.error);
