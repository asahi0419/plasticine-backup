import { keyBy, find } from 'lodash-es';

import seed from '../24-settings.js';

const model = db.getModel('setting');
const { records } = seed;

beforeAll(async () => {
  t.records = keyBy(await db.model(model.alias), 'alias');
});

describe('Model: Setting', () => {
  describe('Records', () => {
    describe('Authorization', () => {
      it('Should have value', () => expect(t.records['authorization'].value).toEqual(
        JSON.stringify(find(records, { alias: 'authorization' }).value)
      ));
    });
    describe('Security', () => {
      it('Should have value', () => expect(t.records['security'].value).toEqual(
        JSON.stringify(find(records, { alias: 'security' }).value)
      ));
    });
    describe('Session', () => {
      it('Should have value', () => expect(t.records['session'].value).toEqual(
        JSON.stringify(find(records, { alias: 'session' }).value)
      ));
    });
    describe('Data store periods', () => {
      it('Should have value', () => expect(t.records['data_store_periods'].value).toEqual(
        JSON.stringify(find(records, { alias: 'data_store_periods' }).value)
      ));
    });
    describe('Decoration', () => {
      it('Should have value', () => expect(t.records['decoration'].value).toEqual(
        JSON.stringify(find(records, { alias: 'decoration' }).value)
      ));
    });
  });
});
