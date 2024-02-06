import { concat } from 'lodash-es';

import { serializer, loadFields } from '../helpers.js';
import { loadFilters, loadResourceWithUserSettings, loadActions } from './helpers.js';

export default async (view, req, result) => {
  const { model, sandbox, user, query = {} } = req;
  const { exec_by } = query;

  const fields = await loadFields(model, sandbox, { filter_not_in: 'type', filter: ['data_visual', 'journal'] });
  const [layout, userSetting] = await loadResourceWithUserSettings('layout', { id: view.layout }, user, exec_by);

  result = concat(
    result,
    serializer(fields, 'field', { translate: ['name', 'options'], req }),
    serializer([view], 'view', { translate: ['name'], req }),
    serializer([layout], 'layout'),
    serializer(await loadActions(model, sandbox, view, query), 'action', { translate: ['name'], req }),
    serializer(await loadFilters(view), 'filter'),
  );

  if (userSetting) {
    result.push(serializer(db.getModel('layout'), 'model'));
    result.push(serializer(userSetting, 'user_setting'));
  }

  return result;
};
