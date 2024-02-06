import { keyBy, find } from 'lodash-es';

import SEED from '../11-forms.js';

const model = db.getModel('form');
const { fields, layouts, forms } = SEED;

beforeAll(async () => {
  t.fields = keyBy(await db.model('field').where({ model: model.id }), 'alias');
});

describe('Model: Form', () => {
  describe('Fields', () => {
    describe('options', () => {
      it('Should have options', () => expect(t.fields['options'].options).toEqual(JSON.stringify(find(fields, { alias: 'options' }).options)));
    });
  });
});
