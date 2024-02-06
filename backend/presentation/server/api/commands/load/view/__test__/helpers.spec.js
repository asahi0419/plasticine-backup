import { isArray, isEqual, map } from 'lodash-es';

import { loadResourceWithUserSettings, loadFilters, loadActions } from '../helpers.js';

describe('View loader helpers', () => {
  describe('loadResourceWithUserSettings(type, whereClause, user, exec_by)', () => {
    it('It should return an array with resource and it\'s user setting', async () => {
      const user = await db.model('user').where({ id: 1 }).getOne();
      const resource = await db.model('layout').where({ id: 1 }).getOne();
      const userSetting = await db.model('user_setting').where({ user: user.id, model: resource.model, record_id: resource.id }).getOne();
      const result = await loadResourceWithUserSettings('layout', { id: 1 }, user, { type: 'main_view' });
      const [loadedResource, loadedUserSetting] = result;

      expect(isArray(result)).toBe(true);
      expect(isEqual(resource, loadedResource)).toBe(true);
      expect(isEqual(userSetting, loadedUserSetting)).toBe(true);
    });
  });

  describe('loadFilters(view)', () => {
    it('It should return an array of view filters', async () => {
      const view = await db.model('view').where({ id: 1 }).getOne();
      const filters = await db.model('filter').where({ id: view.filter });
      const loadedFilters = await loadFilters(view);

      expect(isArray(loadedFilters)).toBe(true);
      expect(isEqual(filters, loadedFilters)).toBe(true);
    });

    it('It should return view predefined filters', async () => {
      const filters = await db.model('filter').whereIn('id', [1, 2, 3]);
      const view = { predefined_filters: map(filters, 'id') };
      const loadedFilters = await loadFilters(view);

      expect(isEqual(filters, loadedFilters)).toBe(true);
    });
  });

  describe('loadActions(model, sandbox)', () => {
    // it('It should return an array of model actions', async () => {
    //   const ACTION_TYPES = ['view_button', 'view_choice', 'view_menu_item'];
    //
    //   const model = await db.model('model').where({ id: 1 }).getOne();
    //   const actions = await db.model('action').where({ model: model.id }).whereIn('type', ACTION_TYPES);
    //   const loadedActions = await loadActions(model, sandbox);
    //
    //   expect(isArray(loadedActions)).toBe(true);
    //   expect(isEqual(actions, loadedActions)).toBe(true);
    // });

    describe('filterActionsByOptions', () => {
      it('It should return all actions for grid view', async () => {
        const model = await db.model('model').where({ id: 1 }).getOne();
        const loadedActions = await loadActions(model, sandbox, { type: 'grid' }, { exec_by: { type: 'main_view' } });

        expect(loadedActions.length).toBeGreaterThanOrEqual(1);
      });

      it('It should not return actions for chart', async () => {
        const model = await db.model('model').where({ id: 1 }).getOne();
        const loadedActions = await loadActions(model, sandbox, { type: 'chart' });

        expect(loadedActions.length).toEqual(3);
      });

      // it('It should not return actions for RTL', async () => {
      //   const model = await db.model('model').where({ id: 1 }).getOne();
      //   const loadedActions = await loadActions(model, sandbox, { type: 'grid' }, { exec_by: { type: 'rtl' } });
      //
      //   expect(loadedActions.length).toEqual(0);
      // });
    });
  });
});
