import { keyBy, find } from 'lodash-es';

import SEED from '../15-core-locks.js';

const model = db.getModel('core_lock');
const { fields, views } = SEED;

beforeAll(async () => {
  t.fields = keyBy(await db.model('field').where({ model: model.id }), 'alias');
  t.views = keyBy(await db.model('view').where({ model: model.id }), 'alias');
  t.layouts = keyBy(await db.model('layout').where({ model: model.id }), 'name');
  t.filters = keyBy(await db.model('filter').where({ model: model.id }), 'name');
});

describe('Model: Core lock', () => {
  describe('Fields', () => {
    describe('Model', () => {
      it('Should have name', () => expect(t.fields['model'].name).toEqual(find(fields, { alias: 'model' }).name));
      it('Should have type', () => expect(t.fields['model'].type).toEqual(find(fields, { alias: 'model' }).type));
      it('Should have options', () => expect(JSON.parse(t.fields['model'].options)).toMatchObject(find(fields, { alias: 'model' }).options));
      it('Should be required', () => expect(t.fields['model'].required_when_script).toEqual(find(fields, { alias: 'model' }).required_when_script));
    });

    describe('Record ID', () => {
      it('Should have name', () => expect(t.fields['record_id'].name).toEqual(find(fields, { alias: 'record_id' }).name));
      it('Should have type', () => expect(t.fields['record_id'].type).toEqual(find(fields, { alias: 'record_id' }).type));
      it('Should have options', () => expect(t.fields['record_id'].options).toEqual(JSON.stringify(find(fields, { alias: 'record_id' }).options || {})));
      it('Should be required', () => expect(t.fields['record_id'].required_when_script).toEqual(find(fields, { alias: 'record_id' }).required_when_script));
    });

    describe('Field update', () => {
      it('Should have name', () => expect(t.fields['field_update'].name).toEqual(find(fields, { alias: 'field_update' }).name));
      it('Should have type', () => expect(t.fields['field_update'].type).toEqual(find(fields, { alias: 'field_update' }).type));
    });

    describe('Update', () => {
      it('Should have name', () => expect(t.fields['update'].name).toEqual(find(fields, { alias: 'update' }).name));
      it('Should have type', () => expect(t.fields['update'].type).toEqual(find(fields, { alias: 'update' }).type));
      it('Should have options', () => expect(t.fields['update'].options).toEqual(JSON.stringify(find(fields, { alias: 'update' }).options || {})));
      it('Should be required', () => expect(t.fields['update'].required_when_script).toEqual(find(fields, { alias: 'update' }).required_when_script));
    });

    describe('Delete', () => {
      it('Should have name', () => expect(t.fields['delete'].name).toEqual(find(fields, { alias: 'delete' }).name));
      it('Should have type', () => expect(t.fields['delete'].type).toEqual(find(fields, { alias: 'delete' }).type));
      it('Should have options', () => expect(t.fields['delete'].options).toEqual(JSON.stringify(find(fields, { alias: 'delete' }).options || {})));
      it('Should be required', () => expect(t.fields['delete'].required_when_script).toEqual(find(fields, { alias: 'delete' }).required_when_script));
    });
  });

  describe('Views', () => {
    describe('Default', () => {
      it('Should have name', () => expect(t.views['default'].name).toEqual(find(views, { alias: 'default' }).name));
      it('Should have type', () => expect(t.views['default'].type).toEqual(find(views, { alias: 'default' }).type));
      it('Should have layout', () => expect(t.layouts['Default'].name).toEqual(find(views, { alias: 'default' }).layout));
      it('Should have filter', () => expect(t.filters['Default'].name).toEqual(find(views, { alias: 'default' }).filter));
      it('Should have condition script', () => expect(t.views['default'].condition_script).toEqual(find(views, { alias: 'default' }).condition_script));
    });
  });
});
