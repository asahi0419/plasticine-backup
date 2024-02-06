import { keyBy, find } from 'lodash-es';

import SEED from '../30-dashboards.js';

const model = db.getModel('dashboard');
const { fields } = SEED;

beforeAll(async () => {
  t.fields = keyBy(await db.model('field').where({ model: model.id }), 'alias');
});

describe('Model: Action', () => {
  describe('Fields', () => {
    describe('Type', () => {
      it('Should have options', () => expect(t.fields['options'].options).toEqual(JSON.stringify(find(fields, { alias: 'options' }).options)));
    });
  });
});
