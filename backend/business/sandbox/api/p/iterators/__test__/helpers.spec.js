import ModelProxy from '../../../model';
import Selector from '../../../../../record/fetcher/selector.js';
import QueryBuilder from '../../../query/builder.js';
import * as HELPERS from '../helpers';

beforeAll(async () => {
  const model = db.getModel('model');

  t.model = model;
  t.modelProxy = new ModelProxy(t.model, sandbox);
});

describe('p.iterators', () => {
  describe('Helpers', () => {
    describe('doIteration(queryBuilder, type, ...args)', () => {
      describe('Type: map', () => {
        it('Should properly run', async () => {
          const selectorScope = new Selector(t.model, sandbox).getScope();
          const queryBuilder = new QueryBuilder(t.modelProxy, selectorScope);
          const type = 'map';
          const args = [jest.fn()];

          const result = await HELPERS.doIteration(queryBuilder, type, ...args);
          const expected = [];

          expect(result).toEqual(expected);
        });
      });

      describe('Type: each', () => {
        it('Should properly run', async () => {
          const selectorScope = new Selector(t.model, sandbox).getScope();
          const queryBuilder = new QueryBuilder(t.modelProxy, selectorScope);
          const type = 'each';
          const args = [jest.fn()];

          const result = await HELPERS.doIteration(queryBuilder, type, ...args);
          const expected = undefined;

          expect(result).toEqual(expected);
        });
      });

      describe('Type: feed', () => {
        it('Should properly run', async () => {
          const selectorScope = new Selector(t.model, sandbox).getScope();
          const queryBuilder = new QueryBuilder(t.modelProxy, selectorScope);
          const type = 'feed';
          const args = [jest.fn()];

          const result = await HELPERS.doIteration(queryBuilder, type, ...args);
          const expected = undefined;

          expect(result).toEqual(expected);
        });
      });
    });

    describe('extractArgs(args, queryLimit)', () => {
      it('Should properly run', async () => {
        let cb = jest.fn();
        let batchSize = 1000;

        let args = [cb];
        let queryLimit = 0;

        let result = await HELPERS.extractArgs(args, queryLimit);
        let expected = { cb, batchSize };

        expect(result).toEqual(expected);

        cb = jest.fn();

        args = [cb];
        queryLimit = 10;

        result = await HELPERS.extractArgs(args, queryLimit);
        expected = { cb, batchSize: queryLimit };

        expect(result).toEqual(expected);

        cb = jest.fn();
        batchSize = 100;

        args = [batchSize, cb];
        queryLimit = 10;

        result = await HELPERS.extractArgs(args, queryLimit);
        expected = { cb, batchSize };

        expect(result).toEqual(expected);
      });
    });

    describe('resolveResult(result)' , () => {
      it('Should be able to process plain result', async () => {
        const expected = {};
        const result = await HELPERS.resolveResult(expected);

        expect(result).toEqual(expected);
      });

      it('Should be able to process promise result', async () => {
        const expected = {};
        const result = await HELPERS.resolveResult(new Promise((resolve) => resolve(expected)));

        expect(result).toEqual(expected);
      });
    });
  });
});
