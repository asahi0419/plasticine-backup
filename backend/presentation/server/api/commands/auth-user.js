import db from '../../../../data-layer/orm/index.js';
import { ActionNotFoundError } from '../../../../business/error/index.js';

export default async (req, res) => {
  try {
    const action = await db.model('action').where({ alias: 'auth_user', model: null }).getOne();
    if (!action) throw new ActionNotFoundError();

    req.sandbox.executeScript(action.server_script, `action/${action.id}/server_script`);
  } catch (error) {
    res.error(error);
  }
};