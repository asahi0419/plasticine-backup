import { createRequire } from "module";
const require = createRequire(import.meta.url)

import { find } from 'lodash-es';

import { getSetting } from '../../../../../../business/setting/index.js';

import * as HELPERS from '../helpers.js';
import * as CONSTANTS from '../constants.js';

const { manager } = h.record;

describe('Server API', () => {
  describe('Commands', () => {
    describe('Init', () => {
      describe('Helpers', () => {
        describe('getTranslations(data, langAlias)', () => {
          it('Should return translations by language alias', async () => {
            const data = { en: { translation: { static: 'static' } } };
            const langAlias = 'en';

            const result = HELPERS.getTranslations(data, langAlias);
            const expected = data[langAlias].translation.static;

            expect(result).toEqual(expected);
          });

          it('Should return an empty object if wrong data', async () => {
            const data = { en: 'en' };
            const langAlias = 'en';

            const result = HELPERS.getTranslations(data, langAlias);
            const expected = {};

            expect(result).toEqual(expected);
          });
        });

        describe('getPages(sandbox, authenticated)', () => {
          it('Should properly run', async () => {
            const helpers = require('../../load/pages');
            const authenticated = true;
            const filter = '`alias` IN (' + CONSTANTS.PAGES_LIST.join() + ')';

            jest.spyOn(helpers, 'loadPages');
            const result = await HELPERS.getPages(sandbox, authenticated);
            expect(helpers.loadPages).toBeCalledWith(sandbox, filter);
          });

          it('Should return null if not authenticated', async () => {
            const authenticated = false;

            const result = await HELPERS.getPages(sandbox, authenticated);
            const expected = null;

            expect(result).toEqual(expected);
          });
        });

        describe('getComponents(authenticated)', () => {
          it('Should return components', async () => {
            const authenticated = true;
            const components = require('../../../../../../business/components').default();

            const result = HELPERS.getComponents(authenticated);
            const expected = components;

            expect(result).toEqual(expected);
          });

          it('Should return null if not authenticated', async () => {
            const authenticated = false;

            const result = HELPERS.getComponents(authenticated);
            const expected = null;

            expect(result).toEqual(expected);
          });
        });

        describe('getSettings(sandbox, authenticated, errors)', () => {
          it('Should return settings object for authenticated user', async () => {
            const authenticated = true;
            const result = await HELPERS.getSettings(sandbox, authenticated);

            expect(result.project_name).toBeDefined();
            expect(result.start_url).toBeDefined();
            expect(result.theme).toBeDefined();
            expect(result.themes).toBeDefined();
            expect(result.plugins).toBeDefined();
            expect(result.db_provider).toBeDefined();
            expect(result.limits).toBeDefined();
            expect(result.hidden_paginator_query_limit).toBeDefined();
            expect(result.env_name).toBeDefined();
            expect(result.host).toBeDefined();
            expect(result.host.name).toBeDefined();
            expect(result.host.protocol).toBeDefined();
            expect(result.host.url).toBeDefined();
            expect(result.host.timeout).toBeDefined();
          });

          it('Should return settings object for non authenticated user', async () => {
            const authenticated = false;
            const result = await HELPERS.getSettings(sandbox, authenticated);

            const themes = getSetting('themes');
            const defaultTheme = find(themes, 'default');

            expect(result.project_name).toBeDefined();
            expect(result.start_url).toBeDefined();
            expect(result.theme).toEqual(defaultTheme.alias);
            expect(result.themes[0]).toEqual(defaultTheme);
            expect(result.plugins).not.toBeDefined();
            expect(result.db_provider).not.toBeDefined();
            expect(result.limits).not.toBeDefined();
            expect(result.hidden_paginator_query_limit).not.toBeDefined();
            expect(result.env_name).not.toBeDefined();
            expect(result.host).not.toBeDefined();
            expect(result.host.timeout).toBeDefined();
          });
        });

        describe('validateSettings(list, settings, sandbox, errors)', () => {
          it('Should validate settings by keys list', () => {
            const list = ['themes'];
            const settings = { themes: {}, limits: {} };
            const errors = [];

            HELPERS.validateSettings(list, settings, sandbox, errors);

            expect(errors).toEqual(["static.parse_settings_error"]);
            expect(settings.limits).toEqual({});
            expect(settings.themes).not.toEqual({});
          });
        });

        describe('getStartUrl(startUrl)', () => {
          it('Should return start url', () => {
            const startUrl = 'startUrl';

            const result = HELPERS.getStartUrl(startUrl);
            const expected = startUrl;

            expect(result).toEqual(expected);
          });

          it('Should return default start url if no input', () => {
            const startUrl = '';

            const result = HELPERS.getStartUrl(startUrl);
            const expected = CONSTANTS.DEFAULT_START_URL;

            expect(result).toEqual(expected);
          });
        });

        describe('loadPlugins()', () => {
          it('Should properly run', async () => {
            const result = await HELPERS.loadPlugins();
            const expected = [];

            expect(result).toEqual(expected);
          });
        });

        describe('loadHomePageByUser(sandbox)', () => {
          it('Should return undefined if no user home page', async () => {
            const result = await HELPERS.loadHomePageByUser(sandbox);
            const expected = undefined;

            expect(result).toEqual(expected);
          });
          it('Should return home page path', async () => {
            const model = db.getModel('page');
            const record = await db.model(model.alias).where({ alias: 'logout' }).getOne();
            const user = await manager('user').update({ id: sandbox.user.id, __inserted: true }, { home_page: { model: model.id, id: record.id } });
            sandbox.user.home_page = await db.model('user').pluck('home_page').where({ id: user.id }).getOne();

            const result = await HELPERS.loadHomePageByUser(sandbox);
            const expected = `/${model.alias}s/${record.alias}`;

            expect(result).toEqual(expected);
          });
        });

        describe('loadHomePageBySetting(sandbox)', () => {
          it('Should return undefined if no setting home page', async () => {
            const value = '/pages/logout';
            const setting = await db.model('setting').where({ alias: 'home_page' }).getOne();
            await manager('setting').update(setting, { value: '' });

            const result = await HELPERS.loadHomePageBySetting(sandbox);
            const expected = undefined;

            expect(result).toEqual(expected);
          });
          it('Should return home page path', async () => {
            const value = '/pages/logout';
            const setting = await db.model('setting').where({ alias: 'home_page' }).getOne();
            await manager('setting').update(setting, { value });

            const result = await HELPERS.loadHomePageBySetting(sandbox);
            const expected = value;

            expect(result).toEqual(expected);
          });
        });
      });
    });
  });
});
