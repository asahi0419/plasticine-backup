import { omit } from 'lodash-es';

import ModelProxy from '../../model';
import Selector from '../../../../record/fetcher/selector.js';
import QueryBuilder from '../../query/builder.js';
import { iterateEach, iterateMap, iterateFeed } from '../iterators';
import * as HELPERS from '../iterators/helpers';

beforeAll(async () => {
  t.modelModel = await db.model('model').where({ alias: 'model' }).getOne();
  t.modelModelProxy = new ModelProxy(t.modelModel, sandbox);

  t.userModel = await db.model('model').where({ alias: 'user' }).getOne();
  t.userModelProxy = new ModelProxy(t.userModel, sandbox);
});

describe('p.iterEach', () => {
  it('Sould properly run', async () => {
    jest.spyOn(HELPERS, 'doIteration').mockImplementationOnce(jest.fn());

    const queryBuilder = 'queryBuilder';
    const args = ['arg1', 'arg2'];

    await iterateEach(queryBuilder, ...args);
    expect(HELPERS.doIteration).toBeCalledWith(queryBuilder, 'each', ...args);
  });
});

describe('p.iterMap', () => {
  it('Sould properly run', async () => {
    jest.spyOn(HELPERS, 'doIteration').mockImplementationOnce(jest.fn());

    const queryBuilder = 'queryBuilder';
    const args = ['arg1', 'arg2'];

    await iterateMap(queryBuilder, ...args);
    expect(HELPERS.doIteration).toBeCalledWith(queryBuilder, 'map', ...args);
  });

  it('Should be able to use queryBuilder with find', async () => {
    const selectorScope = new Selector(t.modelModel, sandbox).getScope();
    const queryBuilder = new QueryBuilder(t.modelModelProxy, selectorScope);
    const result = await iterateMap(queryBuilder.find({ id: [1, 2] }), (record) => record.getValue('id'));

    expect(result).toEqual([1, 2]);
  });

  it('Should be able to use queryBuilder with find and limit', async () => {
    const selectorScope = new Selector(t.modelModel, sandbox).getScope();
    const queryBuilder = new QueryBuilder(t.modelModelProxy, selectorScope);
    const result = await iterateMap(queryBuilder.find({ id: [1, 2] }).limit(1), (record) => record.getValue('id'));

    expect(result).toEqual([1]);
  });

  it('Should be able to use queryBuilder with find and order (asc)', async () => {
    const selectorScope = new Selector(t.modelModel, sandbox).getScope();
    const queryBuilder = new QueryBuilder(t.modelModelProxy, selectorScope);
    const result = await iterateMap(queryBuilder.find({ id: [1, 2] }).order({ id: 'asc' }), (record) => record.getValue('id'));

    expect(result).toEqual([1, 2]);
  });

  it('Should be able to use queryBuilder with find and order (desc)', async () => {
    const selectorScope = new Selector(t.modelModel, sandbox).getScope();
    const queryBuilder = new QueryBuilder(t.modelModelProxy, selectorScope);
    const result = await iterateMap(queryBuilder.find({ id: [1, 2] }).order({ id: 'desc' }), (record) => record.getValue('id'));

    expect(result).toEqual([2, 1]);
  });

  it('Should be able to use queryBuilder with empty find result', async () => {
    const selectorScope = new Selector(t.modelModel, sandbox).getScope();
    const queryBuilder = new QueryBuilder(t.modelModelProxy, selectorScope);
    const result = await iterateMap(queryBuilder.find({ id: [-1, -2] }), (record) => record.getValue('id'));

    expect(result).toEqual([]);
  });

  it('Should be able to use queryBuilder with empty find result and limit', async () => {
    const selectorScope = new Selector(t.modelModel, sandbox).getScope();
    const queryBuilder = new QueryBuilder(t.modelModelProxy, selectorScope);
    const result = await iterateMap(queryBuilder.find({ id: [-1, -2] }).limit(1), (record) => record.getValue('id'));

    expect(result).toEqual([]);
  });

  it('Should be able to use queryBuilder with raw selection', async () => {
    const selectorScope = new Selector(t.modelModel, sandbox).getScope();
    const queryBuilder = new QueryBuilder(t.modelModelProxy, selectorScope);
    const result = await iterateMap(queryBuilder.find({ alias: 'model' }).raw(), (record) => record);
    const actual = await db.model('model').where({ alias: 'model' });

    expect(result).toEqual(actual);
  });
  it('Should be able to preload rtls when use queryBuilder with raw selection', async () => {
    const selectorScope = new Selector(t.userModel, sandbox).getScope();
    const queryBuilder = new QueryBuilder(t.userModelProxy, selectorScope);
    const [ result ] = await iterateMap(queryBuilder.find({ name: 'System', surname: 'Administrator' }).raw(), (record) => record);
    const [ actual ] = await db.model('user').where({ name: 'System', surname: 'Administrator' });

    expect(result.phones).toBeDefined();
    expect(result.user_groups.length > 0).toEqual(true);
    expect(omit(result, ['phones', 'user_groups'])).toEqual(actual);
  });
  it('Should be able to select preloading rtls when use queryBuilder with raw selection', async () => {
    const selectorScope = new Selector(t.userModel, sandbox).getScope();
    const queryBuilder = new QueryBuilder(t.userModelProxy, selectorScope);
    const [ result ] = await iterateMap(queryBuilder.fields(['id', 'user_groups']).find({ name: 'System', surname: 'Administrator' }).raw(), (record) => record);
    const [ actual ] = await db.model('user').select(['id']).where({ name: 'System', surname: 'Administrator' });

    expect(result.user_groups.length > 0).toEqual(true);
    expect(omit(result, ['user_groups'])).toEqual(actual);
  });
  it('Should be able to select preloading rtls when use queryBuilder with first raw selection', async () => {
    const selectorScope = new Selector(t.userModel, sandbox).getScope();
    const queryBuilder = new QueryBuilder(t.userModelProxy, selectorScope);
    const [ result ] = await iterateMap(queryBuilder.fields(['id', 'user_groups']).first().find({ name: 'System', surname: 'Administrator' }).raw(), (record) => record);
    const [ actual ] = await db.model('user').select(['id']).where({ name: 'System', surname: 'Administrator' });

    expect(result.user_groups.length > 0).toEqual(true);
    expect(omit(result, ['user_groups'])).toEqual(actual);
  });
  it('Should be able to limit query (limit < actual)', async () => {
    const selectorScope = new Selector(t.modelModel, sandbox).getScope();
    const queryBuilder = new QueryBuilder(t.modelModelProxy, selectorScope);
    const limit = 10;
    const result = await iterateMap(queryBuilder.find({ type: 'core' }).limit(limit), (record) => record.getValue('id'));

    expect(result.length).toEqual(limit);
  });

  it('Should be able to limit query (limit > actual)', async () => {
    const selectorScope = new Selector(t.modelModel, sandbox).getScope();
    const queryBuilder = new QueryBuilder(t.modelModelProxy, selectorScope);
    const limit = 1000;
    const result = await iterateMap(queryBuilder.find({ type: 'core' }).limit(limit), (record) => record.getValue('id'));
    const actual = await db.model('model').where({ type: 'core' });

    expect(result.length).toEqual(actual.length);
  });
});

describe('p.iterFeed', () => {
  it('Sould properly run', async () => {
    jest.spyOn(HELPERS, 'doIteration').mockImplementationOnce(jest.fn());

    const queryBuilder = 'queryBuilder';
    const args = ['arg1', 'arg2'];

    await iterateFeed(queryBuilder, ...args);
    expect(HELPERS.doIteration).toBeCalledWith(queryBuilder, 'feed', ...args);
  });

  it('Should be able to batch query', async () => {
    const selectorScope = new Selector(t.modelModel, sandbox).getScope();
    const queryBuilder = new QueryBuilder(t.modelModelProxy, selectorScope);
    const result = [];
    const batch = 1;
    const actual = await db.model('model').where({});

    await iterateFeed(queryBuilder.find({}), batch, (records) => result.push(records.length));

    expect(result.length).toEqual(actual.length);
    expect(result[0]).toEqual(batch);
  });
  it('Should be able to limit & batch query (limit < batch)', async () => {
    const selectorScope = new Selector(t.modelModel, sandbox).getScope();
    const queryBuilder = new QueryBuilder(t.modelModelProxy, selectorScope);
    const result = [];
    const limit = 5;
    const batch = 10;

    await iterateFeed(queryBuilder.find({}).limit(limit), batch, (records) => result.push(records.length));

    expect(result.length).toEqual(1);
    expect(result[0]).toEqual(limit);
  });
  it('Should be able to limit & batch query (limit > batch)', async () => {
    const selectorScope = new Selector(t.modelModel, sandbox).getScope();
    const queryBuilder = new QueryBuilder(t.modelModelProxy, selectorScope);
    const result = [];
    const limit = 10;
    const batch = 5;

    await iterateFeed(queryBuilder.find({}).limit(limit), batch, (records) => result.push(records.length));

    expect(result.length).toEqual(limit / batch);
    expect(result[0]).toEqual(batch);
  });
});
