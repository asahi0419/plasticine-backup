import { concat, compact, map } from 'lodash-es';

import db from '../../../../../../data-layer/orm/index.js';
import { serializer } from '../helpers.js';

import * as HELPERS from './helpers.js';

export default async (req, res) => {
  let result = [];

  try {
    const models = await db.model('model').where({ __inserted: true }).whereIn('type', ['audit', 'core', 'custom', 'plugin', 'template', 'worklog']).orderBy('id', 'asc');
    const accessibleModels = await HELPERS.getAccessible('model', models, req.sandbox);
    result = concat(result, serializer(accessibleModels, 'model', { translate: ['name', 'plural'], req }));

    const views = await db.model('view').where({ __inserted: true }).whereIn('model', map(accessibleModels, 'id'));
    const accessibleViews = await HELPERS.getAccessible('view', views, req.sandbox);
    result = concat(result, serializer(accessibleViews, 'view', { translate: ['name'], req }));

    res.json({ data: compact(result) });
  } catch (error) {
    res.error(error);
  }
};
