import { keyBy, find } from 'lodash-es';

import seed from '../06-pages.js';

const model = db.getModel('page');
const { fields, layouts, forms } = seed;

beforeAll(async () => {
  t.fields = keyBy(await db.model('field').where({ model: model.id }), 'alias');
  t.layouts = keyBy(await db.model('layout').where({ model: model.id }), 'name');
  t.forms = keyBy(await db.model('form').where({ model: model.id }), 'alias');
});

describe('Model: Page', () => {
  describe('Layouts', () => {
    describe('Default', () => {
      it('Should have options', () => expect(t.layouts['Default'].options).toEqual(JSON.stringify(find(layouts, { name: 'Default' }).options)));
    });
  });

  describe('Forms', () => {
    describe('Default', () => {
      it('Should have options', () => expect(t.forms['default'].options).toEqual(JSON.stringify(find(forms, { alias: 'default' }).options)));
    });
  });
});
