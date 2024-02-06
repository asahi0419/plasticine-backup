import { values } from 'lodash/object';
import { find, orderBy } from 'lodash/collection';

import store from '../store/redux';

const goBackEntryCreator = (currEntry, context) => (path, search = '') => {
  context.deleteEntry(currEntry.pathname);
  context.createEntry(path, search);
  context.createEntry(currEntry.pathname);
};

export const prepareGoBackEntries = (context = {}, options = {}) => {
  if (!store) return;

  const prevEntry = context.getPrevEntry();
  const currEntry = context.getCurrEntry();

  if (!currEntry || !currEntry.model) return;

  const nearestView = context.findNearest('view', context.entries);

  if (currEntry.isForm() || currEntry.isPage()) {
    if (!prevEntry || !nearestView) {
      const createGoBackEntry = goBackEntryCreator(currEntry, context);
      const state = (process.env.NODE_ENV === 'test') ? (context.state || {}) : store.getState();
      const startUrl = state.app.settings.start_url;

      const model = find(state.metadata.app.model, { alias: options.model || currEntry.model });
      if (!model) return createGoBackEntry(`/${startUrl}`);

      const view = find(orderBy(state.metadata.app.view, ['order'], ['desc']), { model: model.id });
      const query = options.filter ? `?filter=${options.filter}` : '';
      if (view) return createGoBackEntry(`/${model.alias}/view/${view.type}/${view.alias}`, query);

      const dashboard = values(state.metadata.app.dashboard)[0];
      if (dashboard) return createGoBackEntry(`/dashboard/${dashboard.alias}`);

      const firstAvailableModel = orderBy(state.metadata.app.model, ['order'], ['desc'])[0];
      if (!firstAvailableModel) return createGoBackEntry(`/${startUrl}`);

      const firstAvailableView = find(orderBy(state.metadata.app.view, ['order'], ['desc']), { model: firstAvailableModel.id });
      if (firstAvailableView) return createGoBackEntry(`/${firstAvailableModel.alias}/view/${firstAvailableView.type}/${firstAvailableView.alias}`);

      return createGoBackEntry(`/${startUrl}`);
    }
  }
};
