import { concat } from 'lodash-es';

import db from '../../../../../../data-layer/orm/index.js';
import { serializer, loadFields } from '../helpers.js';
import { loadFilters, loadResourceWithUserSettings, loadActions } from './helpers.js';

export default async (view, req, result) => {
  const { model, sandbox, user, query = {} } = req;
  const { exec_by } = query;

  const fields = await loadFields(req.model, req.sandbox, { filter_not_in: 'type', filter: ['data_visual', 'journal'] });
  const [layout, userSetting] = await loadResourceWithUserSettings('layout', { id: view.layout }, user, exec_by);

  result = concat(
    result,
    serializer(fields, 'field', { translate: ['name', 'options'], req }),
    serializer([view], 'view', { translate: ['name'], req }),
    serializer([layout], 'layout'),
    serializer(await loadActions(model, sandbox, view, query), 'action', { translate: ['name'], req }),
    serializer(await loadFilters(view), 'filter'),
    serializer(await loadAppearance(view.appearance, 'grid'), 'appearance'),
  );

  if (userSetting) {
    result.push(serializer(db.getModel('layout'), 'model'));
    result.push(serializer(userSetting, 'user_setting'));
  }

  return result;
};

function loadAppearance(id, type) {
  if (!id) return [];
  return db.model('appearance').where({ id, type, __inserted: true }).limit(1);
}
