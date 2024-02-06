import { keyBy, find } from 'lodash-es';

import SEED from '../05-actions.js';

const model = db.getModel('action');
const { fields, layouts, forms } = SEED;

beforeAll(async () => {
  t.fields = keyBy(await db.model('field').where({ model: model.id }), 'alias');
});

describe('Model: Action', () => {
  describe('Fields', () => {
    describe('Type', () => {
      it('Should have options', () => expect(t.fields['type'].options).toEqual(JSON.stringify(find(fields, { alias: 'type' }).options)));
    });
  });
});
