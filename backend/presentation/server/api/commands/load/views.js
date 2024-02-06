import Promise from 'bluebird';

import db from '../../../../../data-layer/orm/index.js';
import { serializer } from './helpers.js';

export default async (req, res) => {
  const { model, sandbox } = req;

  const views = await db.model('view').where({ model: model.id });
  const availableViews = await Promise.filter(views, async(view) => {
    let access = true;
    try {
      access = await sandbox.executeScript(
          view.condition_script,
          `view/${view.id}/condition_script`,
          { modelId: model.id },
      );
      view.condition_script = 'true';
    } catch (e) {
      access = false;
    }

    return access;
  });

  res.json({ data: serializer(availableViews, 'view', { translate: [ 'name' ], req }) });
}
