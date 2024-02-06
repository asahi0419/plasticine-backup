import { keys, each, mapisFunction } from 'lodash-es';

import Flags from '../../../../record/flags.js';
import Manager from '../../../../record/manager/index.js';
import Selector from '../../../../record/fetcher/selector.js';
import ModelProxy from '../../model/index.js';
import Processor from '../processorindex.js';
import Applicator from '../applicatorindex.js';
import QueryBuilder from '../builderindex.js';
import * as CONSTANTS from '../constantsindex.js';

const getQueryQueryApplicator = () => {
  t.model = { id: 1, alias: 'model' };
  t.modelProxy = new ModelProxy(t.model, sandbox);
  t.selectorScope = new Selector(t.model, sandbox).getScope();
  t.queryBuilder = new QueryBuilder(t.modelProxy, t.selectorScope);

  return new Applicator(t.queryBuilder);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Sandbox', () => {
  describe('Api', () => {
    describe('QueryApplicator', () => {
      describe('Common cases', () => {
        describe('update(params) - with builder.setOptions({ ex_save: { updateDateTimeFields: true } })', () => {
          it('Should update "updated_at" field', async () => {
            const model = await db.model('model').where({ id: 2 }).getOne();
            const attributes = { alias: 'test_1', name: 'Test', model: 2, type: 'string', 'index': 'none' };
            const record = await new Manager(model, sandbox).create(attributes);

            const selectorScope = new Selector(model, sandbox).getScope();
            const modelProxy = new ModelProxy(model, sandbox);
            const queryBuilder = new QueryBuilder(modelProxy, selectorScope);

            queryBuilder.setOptions({ ex_save: { updateDateTimeFields: true } })
            await queryBuilder.find({ id: record.id }).update({ name: 'Test (Update)' });

            const updatedRecord = await db.model('field').where({ id: record.id }).getOne();

            await expect(record.updated_at).not.toBe(updatedRecord.updated_at);
            await db.model('field').where({ id: record.id }).delete();
          });
        });

        describe('update(params) - with builder.setOptions({ ex_save: { updateDateTimeFields: false } })', () => {
          it('Should not update "updated_at" field', async () => {
            const model = await db.model('model').where({ id: 2 }).getOne();
            const attributes = { alias: 'test_2', name: 'Test', model: 2, type: 'string', 'index': 'none' };
            const record = await new Manager(model, sandbox).create(attributes);

            const selectorScope = new Selector(model, sandbox).getScope();
            const modelProxy = new ModelProxy(model, sandbox);
            const queryBuilder = new QueryBuilder(modelProxy, selectorScope);

            queryBuilder.setOptions({ ex_save: { updateDateTimeFields: false } });
            await queryBuilder.find({ id: record.id }).update({ name: 'Test (Update)' });

            const updatedRecord = await db.model('field').where({ id: record.id }).getOne();

            await expect(record.updated_at).toBe(updatedRecord.updated_at);
            await db.model('field').where({ id: record.id }).delete();
          });
        });

        describe('fetch()', () => {
          it('Should select only inserted records of joined model by default', async () => {
            const model = db.getModel('model');

            const selectorScope = new Selector(model, sandbox).getScope();
            const modelProxy = new ModelProxy(model, sandbox);
            const queryBuilder = new QueryBuilder(modelProxy, selectorScope);

            await queryBuilder.join('field', 'model', 'model', 'id').find({});
            expect(modelProxy.lastQuerySQL).toMatch('\"object_2\".\"__inserted\" = true ');
          });
          it('Should select all records of joined model if model proxy has include option', async () => {
            const model = db.getModel('model');

            const selectorScope = new Selector(model, sandbox).getScope();
            const modelProxy = new ModelProxy(model, sandbox).setOptions({ includeNotInsertedRecords: true });
            const queryBuilder = new QueryBuilder(modelProxy, selectorScope);

            await queryBuilder.join('field', 'model', 'model', 'id').find({});
            expect(modelProxy.lastQuerySQL).not.toMatch('\"object_2\".\"__inserted\" = true ');
          });
        });
      });

      describe('constructor(builder)', () => {
        it('Should correctly run', () => {
          jest.spyOn(Applicator.prototype, 'setFlags');

          const result = getQueryQueryApplicator();

          expect(result.builder).toEqual(t.queryBuilder);
          expect(result.tableName).toEqual(db.model(t.queryBuilder.model).tableName);
          expect(result.joinedTableNames).toEqual([]);
          expect(result.selectedColumns).toEqual([`${result.tableName}.*`]);

          expect(Applicator.prototype.setFlags).toBeCalledWith(t.queryBuilder.flags);
        });
      });

      describe('setFlags()', () => {
        it('Should correctly run', () => {
          const result = getQueryQueryApplicator();
          const flags = 'flags';

          result.setFlags(flags);

          expect(result.flags).toEqual(flags);
          expect(result).toBeInstanceOf(Applicator);
        });
      });

      describe('applyFlags(scope, flags)', () => {
        it('Should correctly run', () => {
          const scope = { where: jest.fn() };
          let result, flags;

          result = getQueryQueryApplicator();
          result.joinedTableNames = ['joinedTableName'];
          result.applyFlags(scope, new Flags({ includeNotInsertedRecords: false }));

          expect(scope.where).toBeCalledWith(`joinedTableName.__inserted`, true);
          expect(result).toBeInstanceOf(Applicator);

          jest.clearAllMocks();

          result = getQueryQueryApplicator();
          result.joinedTableNames = ['joinedTableName'];
          result.applyFlags(scope, new Flags({ includeNotInsertedRecords: true }));

          expect(scope.where).not.toBeCalledWith(`joinedTableName.__inserted`, true);
          expect(result).toBeInstanceOf(Applicator);
        });
      });

      describe('setLastQuerySQL(sqlQuery)', () => {
        it('Should correctly run', () => {
          const sqlQuery = 'sqlQuery';
          let result;

          result = getQueryQueryApplicator().setLastQuerySQL(sqlQuery);
          expect(result.builder.modelProxy.lastQuerySQL).toEqual(sqlQuery);
          expect(result).toBeInstanceOf(Applicator);

          result = getQueryQueryApplicator().setFlags(new Flags({ sqlDebug: false })).setLastQuerySQL(sqlQuery);
          expect(result.builder.modelProxy.lastQuerySQL).toEqual(undefined);
          expect(result).toBeInstanceOf(Applicator);
        });
      });

      describe('get applicators()', () => {
        it('Should correctly run', () => {
          const result = getQueryQueryApplicator().applicators;

          expect(result).toEqual(keys(CONSTANTS.APPLICATORS));
        });
      });

      describe('count()', () => {
        it('Should correctly run', async () => {
          jest.spyOn(Applicator.prototype, '__applyToScope');

          const result = getQueryQueryApplicator();
          result.builder.selectorScope = Promise.resolve({ scope: {
            clone: jest.fn(() => ({
              andWhere: jest.fn(),
              limit: jest.fn(),
              offset: jest.fn(),
              count: jest.fn(() => 'count'),
            })),
          } });

          expect(await result.count()).toEqual('count');
          expect(Applicator.prototype.__applyToScope).toBeCalledWith(CONSTANTS.COUNT_APPLICATORS);
        });
      });

      describe('distinct(fieldAliases)', () => {
        it('Should correctly run', async () => {
          jest.spyOn(Applicator.prototype, '__applyToScope');

          const fieldAliases = ['alias'];
          const result = getQueryQueryApplicator();
          result.builder.selectorScope = Promise.resolve({ scope: {
            clone: jest.fn(() => ({
              andWhere: jest.fn(),
              limit: jest.fn(),
              offset: jest.fn(),
              distinct: jest.fn((...fieldAliases) => fieldAliases),
            })),
          } });

          expect(await result.distinct(fieldAliases)).toEqual(fieldAliases);
          expect(Applicator.prototype.__applyToScope).toBeCalledWith(CONSTANTS.DISTINCT_APPLICATORS);
        });
      });

      describe('delete()', () => {
        it('Should correctly run', async () => {
          jest.spyOn(Applicator.prototype, '__applyToScope');

          const result = getQueryQueryApplicator();
          result.builder.selectorScope = Promise.resolve({ scope: {
            clone: jest.fn(() => ({
              andWhere: jest.fn(),
              limit: jest.fn(),
              offset: jest.fn(),
              delete: jest.fn(() => 'delete'),
            })),
          } });

          expect(await result.delete()).toEqual('delete');
          expect(Applicator.prototype.__applyToScope).toBeCalledWith(CONSTANTS.DELETE_APPLICATORS);
        });
      });

      describe('fetch()', () => {
        it('Should correctly run', async () => {
          jest.spyOn(Applicator.prototype, '__applyToScope');
          jest.spyOn(Applicator.prototype, 'applyFlags');
          jest.spyOn(Applicator.prototype, 'setLastQuerySQL');

          const first = jest.fn(() => 'first');

          let result = getQueryQueryApplicator();
          let select = jest.fn((selectedColumns) => ({
            selectedColumns,
            toString: jest.fn(() => 'toString'),
          }));
          result.builder.selectorScope = Promise.resolve({ scope: {
            clone: jest.fn(() => ({
              select,
              limit: jest.fn(),
              offset: jest.fn(),
              andWhere: jest.fn(),
              orderBy: jest.fn(),
            })),
          } });

          expect(JSON.stringify(await result.fetch())).toEqual(JSON.stringify(select(result.selectedColumns)));
          expect(Applicator.prototype.__applyToScope).toBeCalledWith(result.applicators);
          expect(Applicator.prototype.applyFlags).toBeCalledWith(expect.any(Object), t.queryBuilder.flags);
          expect(Applicator.prototype.setLastQuerySQL).toBeCalledWith('toString');
          expect(select).toBeCalledWith(result.selectedColumns);
          expect(first).not.toBeCalled();

          jest.clearAllMocks();

          result = getQueryQueryApplicator();
          result.builder.selectFirst = true;
          select = jest.fn((selectedColumns) => ({
            first,
            selectedColumns,
            toString: jest.fn(() => 'toString'),
          }));
          result.builder.selectorScope = Promise.resolve({ scope: {
            clone: jest.fn(() => ({
              select,
              limit: jest.fn(),
              offset: jest.fn(),
              andWhere: jest.fn(),
              orderBy: jest.fn(),
            })),
          } });

          expect(JSON.stringify(await result.fetch())).toEqual(JSON.stringify(select(result.selectedColumns)));
          expect(Applicator.prototype.__applyToScope).toBeCalledWith(result.applicators);
          expect(Applicator.prototype.applyFlags).toBeCalledWith(expect.any(Object), t.queryBuilder.flags);
          expect(Applicator.prototype.setLastQuerySQL).toBeCalledWith('toString');
          expect(select).toBeCalledWith(result.selectedColumns);
          expect(first).toBeCalled();
        });
      });

      describe('__applyToScope(sections)', () => {
        it('Should correctly run', async () => {
          let result = getQueryQueryApplicator();

          each(result.applicators, (section, key) => {
            jest.spyOn(Applicator.prototype, [CONSTANTS.APPLICATORS[section]]);
          });

          await result.__applyToScope(result.applicators);
          const performed = await new Processor(result.builder).perform();

          each(result.applicators, (section, key) => {
            expect(result[CONSTANTS.APPLICATORS[section]]).toBeCalledWith(performed[section], performed);
          });
        });
      });

      describe('__applyUpdaters(updaters)', () => {
        it('Should correctly run', async () => {
          let updaters;
          let result = getQueryQueryApplicator();
          result.scope = { update:jest.fn(), updateAndGetResult: jest.fn()};

          updaters = undefined;
          await result.__applyUpdaters(updaters);
          expect(result.scope.update).not.toBeCalled();

          updaters = ['updater'];
          await result.__applyUpdaters(updaters);

          each(updaters, (updater) => {
            expect(result.scope.updateAndGetResult).toBeCalledWith(updater);
          });
        });
      });

      describe('__applyColumns(columns)', () => {
        it('Should correctly run', async () => {
          let columns;
          let result = getQueryQueryApplicator();

          columns = undefined;
          await result.__applyColumns(columns);
          expect(result.selectedColumns).toEqual([`${result.tableName}.*`]);

          columns = ['column'];
          await result.__applyColumns(columns);
          expect(result.selectedColumns).toEqual(columns);
        });
      });

      describe('__applyFroms(froms)', () => {
        it('Should correctly run', async () => {
          let froms;
          let result = getQueryQueryApplicator();
          result.scope = { __applyFroms: jest.fn() };

          froms = undefined;
          await result.__applyFroms(froms);
          expect(result.scope.__applyFroms).not.toBeCalled();

          froms = [{}];
          await result.__applyFroms(froms);
          expect(result.scope.__applyFroms).toBeCalledWith(froms);

          froms = [() => null];
          await result.__applyFroms(froms);
          expect(result.scope.__applyFroms).toBeCalledWith(map(froms, (from) => from(result.scope)));
        });
      });

      describe('__applyFinders(finders)', () => {
        it('Should correctly run', async () => {
          function Scope() {
            const method = jest.fn(function (fn) {
              const result = isFunction(fn.call) ? fn.call(this) : jest.fn();
              if (result) result.orWhere = method;
              return result;
            });

            this.where = method;
            this.whereRaw = method;
            this.andWhere = method;
            this.orWhere = method;
          };

          let finders, clause;
          let result = getQueryQueryApplicator();

          finders = undefined;
          result.scope = new Scope();
          await result.__applyFinders(finders);
          expect(result.scope.andWhere).not.toBeCalled();

          jest.clearAllMocks();

          clause = { column: 'column', operand: 'operand', value: 'value' },
          finders = [{ type: 'and', clauses: [clause] }];
          result.scope = new Scope();
          await result.__applyFinders(finders);

          expect(result.scope.andWhere).toBeCalled();
          expect(result.scope.where).toBeCalledWith(clause.column, clause.operand, clause.value);

          jest.clearAllMocks();

          clause = { column: 'column', operand: 'operand', value: 'value' },
          finders = [{ type: 'or', clauses: [clause] }];
          result.scope = new Scope();
          await result.__applyFinders(finders);

          expect(result.scope.andWhere).toBeCalled();
          expect(result.scope.where).toBeCalledWith(clause.column, clause.operand, clause.value);

          jest.clearAllMocks();

          clause = { whereRaw: 'whereRaw' },
          finders = [{ type: 'or', clauses: [clause] }];
          result.scope = new Scope();
          await result.__applyFinders(finders);

          expect(result.scope.andWhere).toBeCalled();
          expect(result.scope.whereRaw).toBeCalled();

          jest.clearAllMocks();

          clause = { column: 'column', operand: 'operand', whereOperator: 'or', value: ['value'] },
          finders = [{ type: 'and', clauses: [clause] }];
          result.scope = new Scope();
          await result.__applyFinders(finders);

          expect(result.scope.andWhere).toBeCalled();
          expect(result.scope.orWhere).toBeCalledWith(clause.column, clause.operand, clause.value[0]);

          jest.clearAllMocks();

          clause = { column: 'column', operand: '!=', value: 'value' },
          finders = [{ type: 'and', clauses: [clause] }];
          result.scope = new Scope();
          await result.__applyFinders(finders);

          expect(result.scope.andWhere).toBeCalled();
          expect(result.scope.orWhere).toBeCalled();
          expect(result.scope.where).toBeCalledWith(clause.column, clause.operand, clause.value);
        });
      });

      describe('__applyJoins(joins)', () => {
        it('Should correctly run', async () => {
          let joins, join;
          let result = getQueryQueryApplicator();
          result.scope = { leftJoin: jest.fn() };

          joins = undefined;
          await result.__applyJoins(joins);
          expect(result.scope.leftJoin).not.toBeCalled();

          join = { joinTable: 'joinTable', leftColumn: 'leftColumn', rightColumn: 'rightColumn', selectors: 'selectors' };
          joins = [join];
          await result.__applyJoins(joins);
          expect(result.scope.leftJoin).toBeCalledWith(join.joinTable, join.leftColumn, join.rightColumn);
          expect(result.joinedTableNames).toEqual([join.joinTable]);
        });
      });

      describe('__applyServiceJoins(joins)', () => {
        it('Should correctly run', async () => {
          function Scope() {
            this.leftJoin = jest.fn(function (tableName, fn) { return fn.call(this); });
            this.on = jest.fn(function (fn) { return jest.fn(); });
          };

          let joins, join;
          let result = getQueryQueryApplicator();
          result.scope = new Scope();

          joins = undefined;
          await result.__applyServiceJoins(joins);
          expect(result.scope.leftJoin).not.toBeCalled();

          join = { tableName: 'tableName', onItems: [{ left: 'left', right: 'right' }] };
          joins = [join];
          await result.__applyServiceJoins(joins);
          expect(result.scope.leftJoin).toBeCalledWith(join.tableName, expect.any(Function));
          expect(result.scope.on).toBeCalledWith(join.onItems[0].left, '=', join.onItems[0].right);
          expect(result.joinedTableNames).toEqual([join.tableName]);
        });
      });

      describe('__applyOrderings(orderings)', () => {
        it('Should correctly run', async () => {
          function Scope() {
            this.orderBy = jest.fn();
          };

          let orderings, ordering;
          let result = getQueryQueryApplicator();
          result.scope = new Scope();

          orderings = undefined;
          await result.__applyOrderings(orderings);
          expect(result.scope.orderBy).toBeCalled();

          ordering = { column: 'column', direction: 'direction' };
          orderings = [ordering];
          await result.__applyOrderings(orderings);
          expect(result.scope.orderBy).toBeCalledWith(ordering.column, ordering.direction);
        });
      });

      describe('__applyGroupings(groupings)', () => {
        it('Should correctly run', async () => {
          function Scope() {
            this.groupBy = jest.fn();
          };

          let groupings, grouping;
          let result = getQueryQueryApplicator();
          result.scope = new Scope();

          groupings = undefined;
          await result.__applyGroupings(groupings);
          expect(result.scope.groupBy).not.toBeCalled();

          grouping = 'grouping';
          groupings = [grouping];
          await result.__applyGroupings(groupings);
          expect(result.scope.groupBy).toBeCalledWith(groupings);
          expect(result.selectedColumns).toEqual([ `${result.tableName}.*`, ...groupings ]);
        });
      });

      describe('__applyAgregates(agregates)', () => {
        it('Should correctly run', async () => {
          function Scope() {
            this.client = { raw: jest.fn() };
          };

          let agregates, aggregate;
          let result = getQueryQueryApplicator();
          result.scope = new Scope();

          agregates = undefined;
          await result.__applyAgregates(agregates);
          expect(result.scope.client.raw).not.toBeCalled();

          aggregate = 'aggregate';
          agregates = [aggregate];
          await result.__applyAgregates(agregates);
          expect(result.scope.client.raw).toBeCalledWith(aggregate);
        });
      });

      describe('__applyLimiter(limiter)', () => {
        it('Should correctly run', async () => {
          function Scope() {
            this.limit = jest.fn();
          };

          let limiter;
          let result = getQueryQueryApplicator();
          result.scope = new Scope();

          limiter = undefined;
          await result.__applyLimiter(limiter);
          expect(result.scope.limit).not.toBeCalled();

          limiter = 10;
          await result.__applyLimiter(limiter);
          expect(result.scope.limit).toBeCalledWith(limiter);
        });
      });

      describe('__applyOffset(offset)', () => {
        it('Should correctly run', async () => {
          function Scope() {
            this.offset = jest.fn();
          };

          let offset;
          let result = getQueryQueryApplicator();
          result.scope = new Scope();

          offset = undefined;
          await result.__applyOffset(offset);
          expect(result.scope.offset).not.toBeCalled();

          offset = 10;
          await result.__applyOffset(offset);
          expect(result.scope.offset).toBeCalledWith(offset);
        });
      });
    });
  });
});
