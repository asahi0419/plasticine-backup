import { compact } from 'lodash-es';

import { getFormPagination } from '../get-record-siblings.js';

const getResult = (record, query) => {
  record.__inserted = true;
  query.filter = compact(['`id` IN (1, 2, 3)', query.filter]).map(f => `(${f})`).join(' AND ');

  return getFormPagination(t.model, record, query, sandbox);
}

beforeAll(() => {
  t.model = db.getModel('model');
});

describe('Server API', () => {
  describe('Models', () => {
    describe('getRecordSiblings', () => {
      describe('getFormPagination(model, record, query, sandbox)', () => {
        it(`Should return correct result`, async () => {
          let record, query, result;

          record = { id: 1 };
          query = {};
          result = await getResult(record, query);

          expect(result.prev_record_id).toEqual(2);
          expect(result.next_record_id).toEqual(null);

          record = { id: 2 };
          query = {};
          result = await getResult(record, query);

          expect(result.prev_record_id).toEqual(3);
          expect(result.next_record_id).toEqual(1);

          record = { id: 3 };
          query = {};
          result = await getResult(record, query);

          expect(result.prev_record_id).toEqual(null);
          expect(result.next_record_id).toEqual(2);

          record = { id: 1 };
          query = { sort: 'id' };
          result = await getResult(record, query);

          expect(result.prev_record_id).toEqual(null);
          expect(result.next_record_id).toEqual(2);

          record = { id: 2 };
          query = { sort: 'id' };
          result = await getResult(record, query);

          expect(result.prev_record_id).toEqual(1);
          expect(result.next_record_id).toEqual(3);

          record = { id: 3 };
          query = { sort: 'id' };
          result = await getResult(record, query);

          expect(result.prev_record_id).toEqual(2);
          expect(result.next_record_id).toEqual(null);

          record = { id: 1 };
          query = { sort: '-id' };
          result = await getResult(record, query);

          expect(result.prev_record_id).toEqual(2);
          expect(result.next_record_id).toEqual(null);

          record = { id: 2 };
          query = { sort: '-id' };
          result = await getResult(record, query);

          expect(result.prev_record_id).toEqual(3);
          expect(result.next_record_id).toEqual(1);

          record = { id: 3 };
          query = { sort: '-id' };
          result = await getResult(record, query);

          expect(result.prev_record_id).toEqual(null);
          expect(result.next_record_id).toEqual(2);

          record = { id: 1 };
          query = { sort: 'id', filter: '`alias` IN ("model", "field", "user")' };
          result = await getResult(record, query);

          expect(result.prev_record_id).toEqual(null);
          expect(result.next_record_id).toEqual(2);

          record = { id: 2 };
          query = { sort: 'id', filter: '`alias` IN ("model", "field", "user")' };
          result = await getResult(record, query);

          expect(result.prev_record_id).toEqual(1);
          expect(result.next_record_id).toEqual(3);

          record = { id: 3 };
          query = { sort: 'id', filter: '`alias` IN ("model", "field", "user")' };
          result = await getResult(record, query);

          expect(result.prev_record_id).toEqual(2);
          expect(result.next_record_id).toEqual(null);

          record = { id: 1 };
          query = { sort: '-id', filter: '`alias` IN ("model", "field", "user")' };
          result = await getResult(record, query);

          expect(result.prev_record_id).toEqual(2);
          expect(result.next_record_id).toEqual(null);

          record = { id: 2 };
          query = { sort: '-id', filter: '`alias` IN ("model", "field", "user")' };
          result = await getResult(record, query);

          expect(result.prev_record_id).toEqual(3);
          expect(result.next_record_id).toEqual(1);

          record = { id: 3 };
          query = { sort: '-id', filter: '`alias` IN ("model", "field", "user")' };
          result = await getResult(record, query);

          expect(result.prev_record_id).toEqual(null);
          expect(result.next_record_id).toEqual(2);

          record = { id: 1 };
          query = { sort: 'alias', filter: '`alias` IN ("model", "field", "user")' };
          result = await getResult(record, query);

          expect(result.prev_record_id).toEqual(2);
          expect(result.next_record_id).toEqual(3);

          record = { id: 2 };
          query = { sort: 'alias', filter: '`alias` IN ("model", "field", "user")' };
          result = await getResult(record, query);

          expect(result.prev_record_id).toEqual(null);
          expect(result.next_record_id).toEqual(1);

          record = { id: 3 };
          query = { sort: 'alias', filter: '`alias` IN ("model", "field", "user")' };
          result = await getResult(record, query);

          expect(result.prev_record_id).toEqual(1);
          expect(result.next_record_id).toEqual(null);

          record = { id: 1 };
          query = { sort: '-alias', filter: '`alias` IN ("model", "field", "user")' };
          result = await getResult(record, query);

          expect(result.prev_record_id).toEqual(3);
          expect(result.next_record_id).toEqual(2);

          record = { id: 2 };
          query = { sort: '-alias', filter: '`alias` IN ("model", "field", "user")' };
          result = await getResult(record, query);

          expect(result.prev_record_id).toEqual(1);
          expect(result.next_record_id).toEqual(null);

          record = { id: 3 };
          query = { sort: '-alias', filter: '`alias` IN ("model", "field", "user")' };
          result = await getResult(record, query);

          expect(result.prev_record_id).toEqual(null);
          expect(result.next_record_id).toEqual(1);
        });
      });
    });
  });
});
