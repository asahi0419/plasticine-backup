import { merge, get } from 'lodash/object';
import { find } from 'lodash/collection';

import { parseOptions } from '../../../helpers';

export const getLayoutSorters = (layoutOptions) => {
  const sorters = [];

  layoutOptions.sort_order.forEach((order) => {
    switch (order.type) {
      case 'ascending':
        sorters.push(order.field);
        break;
      case 'descending':
        sorters.push(`-${order.field}`);
        break;
    }
  });

  return sorters.join(',');
};

export const applyUserSettings = (options = {}, view = {}, metadata = {}) => {
  if (!metadata.user_setting) return;

  const models = {
    view: find(metadata.model, { alias: 'view' }),
    layout: find(metadata.model, { alias: 'layout' }),
  };

  const userSettings = {
    view: models.view ? find(metadata.user_setting, { model: models.view.id, record_id: view.id }) : {},
    layout: models.layout ? find(metadata.user_setting, { model: models.layout.id, record_id: view.layout }) : {},
  };

  if (userSettings.view && userSettings.view.options) options = merge(options, parseOptions(userSettings.view.options));
  if (userSettings.layout && userSettings.layout.options) metadata.layout[view.layout].options = userSettings.layout.options;
};

export const applyDefaultAutorefresh = (options) => {
  options.autorefresh = options.autorefresh || {};
  options.autorefresh.rate = parseInt(options.autorefresh.rate) || 0;
};

export const applyDefaultPage = (options) => {
  options.page = options.page || {};
  options.page.size = parseInt(options.page.size, 10) || ((options.exec_by.type === 'main_view') ? 30 : 10);
};
