import db from '../../../../../data-layer/orm/index.js';
import { loadTemplates } from './helpers.js';

export default async (req, res, next) => {
  try {
    const model = db.getModel(req.query.modelId);
    const templates = await loadTemplates(model);

    res.json({ data: templates });
  } catch (error) {
    res.error(error);
  }
};
