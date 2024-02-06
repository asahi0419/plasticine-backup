import moment from 'moment';
import { isArray, isObject } from 'lodash-es';

import logger from '../../../../logger/index.js';
import Flags from '../../../../record/flags.js';
import Selector from '../../../../record/fetcher/selector.js';
import QueryBuilder from '../builder.js';
import transactionFunc from '../../utils/db/transaction/index.js';
import * as HELPERS from '../builder.js';
import Applicator from '../applicator.js';
import ModelProxy from '../../model/index.js';
import * as MODEL from '../../model/index.js';
import * as CONSTANTS from '../../../../constants/index.js';

const NOW_1 = moment().format(CONSTANTS.DEFAULT_DATE_FORMAT);
const NOW_2 = moment(NOW_1).add(1, 'day').format(CONSTANTS.DEFAULT_DATE_FORMAT);
const NOW_3 = moment(NOW_2).add(1, 'day').format(CONSTANTS.DEFAULT_DATE_FORMAT);

const { manager } = h.record;

const getQueryBuilder = (model) => {
  t.selectorScope = new Selector(model, sandbox).getScope();
  t.modelProxy = new ModelProxy(model, sandbox);

  return new QueryBuilder(t.modelProxy, t.selectorScope);
};

beforeEach(() => {
  jest.clearAllMocks();
});

beforeAll(async () => {
  t.models = {
    self: await manager('model').create(),
    foreign: await manager('model').create(),
  };
  t.fields = {
    self: {
      integer: await manager('field').create({
        type: 'integer',
        model: t.models.self.id,
      }),
      string: await manager('field').create({
        type: 'string',
        model: t.models.self.id,
      }),
      array_string: await manager('field').create({
        type: 'array_string',
        model: t.models.self.id,
        options: JSON.stringify({
          multi_select: true,
          values: { a: 'A', b: 'B' },
        }),
      }),
      rtl: await manager('field').create({
        type: 'reference_to_list',
        model: t.models.self.id,
        options: JSON.stringify({
          foreign_model: t.models.foreign.alias,
          foreign_label: 'id',
        }),
      }),
      grc: await manager('field').create({
        type: 'global_reference',
        model: t.models.self.id,
        options: JSON.stringify({
          values: [{
            foreign_model: t.models.foreign.alias,
            foreign_label: 'id',
          }]
        }),
      }),
      datetime: await manager('field').create({
        type: 'datetime',
        model: t.models.self.id,
      }),
    },
  };
  t.records = {
    self: [
      await manager(t.models.self.alias).create({ [t.fields.self.integer.alias]: 1, [t.fields.self.string.alias]: 'string1', [t.fields.self.rtl.alias]: [1], [t.fields.self.datetime.alias]: NOW_2 }),
      await manager(t.models.self.alias).create({ [t.fields.self.integer.alias]: 2, [t.fields.self.string.alias]: 'string2' }),
      await manager(t.models.self.alias).create({ [t.fields.self.rtl.alias]: [3] }),
    ],
    foreign: [
      await manager(t.models.foreign.alias).create(),
      await manager(t.models.foreign.alias).create(),
      await manager(t.models.foreign.alias).create(),
    ],
  }
});

describe('Sandbox', () => {
  describe('Api', () => {
    describe('QueryBuilder', () => {
      describe('Common cases', () => {
        describe('transacting()', () => {
          describe('update', () => {
            it('Should correctly commit', async () => {
              const trx = await transactionFunc();

              const record = await manager(t.models.self.alias).create();
              const builder = getQueryBuilder(t.models.self);
              await builder.find({ id: record.id }).update({ [t.fields.self.string.alias]: 'string' }).transacting(trx);

              await trx.commit();
              const result = await db.model(t.models.self.alias).where({ id: record.id }).getOne();
              expect(result[t.fields.self.string.alias]).toEqual('string');
            });
            it('Should correctly rollback', async () => {
              const trx = await transactionFunc();

              const record = await manager(t.models.self.alias).create();
              const builder = getQueryBuilder(t.models.self);
              await builder.find({ id: record.id }).update({ [t.fields.self.string.alias]: 'string' }).transacting(trx);

              await trx.rollback();
              const result = await db.model(t.models.self.alias).where({ id: record.id }).getOne();
              expect(result[t.fields.self.string.alias]).not.toEqual('string');
            });
          });

          describe('delete', () => {
            it('Should correctly commit', async () => {
              const trx = await transactionFunc();

              const record = await manager(t.models.self.alias).create();
              const builder = getQueryBuilder(t.models.self);
              await builder.find({ id: record.id }).delete().transacting(trx);

              await trx.commit();
              expect(await db.model(t.models.self.alias).where({ id: record.id }).getOne()).not.toBeDefined();
            });
            it('Should correctly rollback', async () => {
              const trx = await transactionFunc();

              const record = await manager(t.models.self.alias).create();
              const builder = getQueryBuilder(t.models.self);
              await builder.find({ id: record.id }).delete().transacting(trx);

              await trx.rollback();
              expect(await db.model(t.models.self.alias).where({ id: record.id }).getOne()).toBeDefined();
            });
          });
        });

        describe('first()', () => {
          it('Should return first record from the query', async () => {
            const builder = getQueryBuilder(t.models.self);
            const result = await builder.find({ id: [1, 2] }).first();
            expect(result.attributes).toMatchObject({ id: 1 });
          });
          it('Should return first record from the query [raw]', async () => {
            const builder = getQueryBuilder(t.models.self);
            const result = await builder.find({ id: [1, 2] }).first().raw();
            expect(result).toMatchObject({ id: 1 });
          });
        });

        describe('order(options, model = null)', () => {
          it('Should return correct result (asc)', async () => {
            const builder = getQueryBuilder(t.models.self);
            const result = await builder.find({ id: [1, 2] }).order({ id: 'asc' });
            expect(result.map((attributes) => attributes.id)).toEqual([1, 2]);
          });
          it('Should return correct result (asc) [raw]', async () => {
            const builder = getQueryBuilder(t.models.self);
            const result = await builder.find({ id: [1, 2] }).order({ id: 'asc' }).raw();
            expect(result.map(({ id }) => id)).toEqual([1, 2]);
          });

          it('Should return correct result (desc)', async () => {
            const builder = getQueryBuilder(t.models.self);
            const result = await builder.find({ id: [1, 2] }).order({ id: 'desc' });
            expect(result.map((attributes) => attributes.id)).toEqual([2, 1]);
          });
          it('Should return correct result (desc) [raw]', async () => {
            const builder = getQueryBuilder(t.models.self);
            const result = await builder.find({ id: [1, 2] }).order({ id: 'desc' }).raw();
            expect(result.map(({ id }) => id)).toEqual([2, 1]);
          });
        });

        describe('find(params)', () => {
          it('Should call deprecation warning', async () => {
            jest.spyOn(logger, 'info');
            const builder = getQueryBuilder(t.models.self);
            await builder.find();
            expect(logger.info).toBeCalledWith('find(...).then will be deprecated soon. Please use p.iterEach or p.iterMap.', { user: sandbox.user.id });
          });
          it('Should call deprecation warning [raw]', async () => {
            jest.spyOn(logger, 'info');
            const builder = getQueryBuilder(t.models.self);
            await builder.find().raw();
            expect(logger.info).toBeCalledWith('find(...).then will be deprecated soon. Please use p.iterEach or p.iterMap.', { user: sandbox.user.id });
          });

          it('Should not call deprecation warning with update', async () => {
            jest.spyOn(logger, 'info');
            const builder = getQueryBuilder(t.models.self);
            await builder.find().update({ created_at: +new Date() });
            expect(logger.info).not.toBeCalledWith('find(...).then will be deprecated soon. Please use p.iterEach or p.iterMap.', { user: sandbox.user.id });
          });
          it('Should not call deprecation warning with update [raw]', async () => {
            jest.spyOn(logger, 'info');
            const builder = getQueryBuilder(t.models.self);
            await builder.find().update({ created_at: +new Date() }).raw();
            expect(logger.info).not.toBeCalledWith('find(...).then will be deprecated soon. Please use p.iterEach or p.iterMap.', { user: sandbox.user.id });
          });

          it('Should return correct result for integer by not null', async () => {
            const builder = getQueryBuilder(t.models.self);
            const expected = await db.model(t.models.self.alias).whereNotNull(t.fields.self.integer.alias);
            let result;

            result = await builder.find({ [t.fields.self.integer.alias]: { '!=': null } });
            expect(result).toHaveLength(expected.length);
            result = await builder.find({ [t.fields.self.integer.alias]: 'ISNOTNULL' });
            expect(result).toHaveLength(expected.length);
          });
          it('Should return correct result for integer by not null [raw]', async () => {
            const builder = getQueryBuilder(t.models.self);
            const expected = await db.model(t.models.self.alias).whereNotNull(t.fields.self.integer.alias);
            let result;

            result = await builder.find({ [t.fields.self.integer.alias]: { '!=': null } }).raw();
            expect(result).toHaveLength(expected.length);
            result = await builder.find({ [t.fields.self.integer.alias]: 'ISNOTNULL' }).raw();
            expect(result).toHaveLength(expected.length);
          });

          it('Should return correct result for integer by null', async () => {
            const builder = getQueryBuilder(t.models.self);
            const expected = await db.model(t.models.self.alias).whereNull(t.fields.self.integer.alias);
            let result;

            result = await builder.find({ [t.fields.self.integer.alias]: { '=': null } });
            expect(result).toHaveLength(expected.length);
            result = await builder.find({ [t.fields.self.integer.alias]: 'ISNULL' });
            expect(result).toHaveLength(expected.length);
          });
          it('Should return correct result for integer by null [raw]', async () => {
            const builder = getQueryBuilder(t.models.self);
            const expected = await db.model(t.models.self.alias).whereNull(t.fields.self.integer.alias);
            let result;

            result = await builder.find({ [t.fields.self.integer.alias]: { '=': null } }).raw();
            expect(result).toHaveLength(expected.length);
            result = await builder.find({ [t.fields.self.integer.alias]: 'ISNULL' }).raw();
            expect(result).toHaveLength(expected.length);
          });

          it('Should return correct result for integer by complex clause', async () => {
            const builder = getQueryBuilder(t.models.self);
            let result;

            result = await builder.find({ [t.fields.self.integer.alias]: { '>': 0, '<': 2 } });
            expect(result).toHaveLength(1);
          });
          it('Should return correct result for integer by complex clause (in)', async () => {
            const builder = getQueryBuilder(t.models.self);
            let result;

            result = await builder.find({ [t.fields.self.integer.alias]: { 'IN': [1] } });
            expect(result).toHaveLength(1);
          });
          it('Should return correct result for integer by complex clause (not in)', async () => {
            const builder = getQueryBuilder(t.models.self);
            let result;

            result = await builder.find({ [t.fields.self.integer.alias]: { 'NOTIN': [1] } });
            expect(result).toHaveLength(1);
          });
          it('Should return correct result for integer by complex clause [raw]', async () => {
            const builder = getQueryBuilder(t.models.self);
            let result;

            result = await builder.find({ [t.fields.self.integer.alias]: { '>': 0, '<': 2 } }).raw();
            expect(result).toHaveLength(1);
          });

          it('Should return correct result for datetime by not null', async () => {
            const builder = getQueryBuilder(t.models.self);
            const expected = await db.model(t.models.self.alias).whereNotNull('updated_at');
            let result;

            result = await builder.find({ updated_at: { '!=': null } });
            expect(result).toHaveLength(expected.length);
            result = await builder.find({ updated_at: 'ISNOTNULL' });
            expect(result).toHaveLength(expected.length);
          });
          it('Should return correct result for datetime by not null [raw]', async () => {
            const builder = getQueryBuilder(t.models.self);
            const expected = await db.model(t.models.self.alias).whereNotNull('updated_at');
            let result;

            result = await builder.find({ updated_at: { '!=': null } }).raw();
            expect(result).toHaveLength(expected.length);
            result = await builder.find({ updated_at: 'ISNOTNULL' }).raw();
            expect(result).toHaveLength(expected.length);
          });

          it('Should return correct result for datetime by null', async () => {
            const builder = getQueryBuilder(t.models.self);
            const expected = await db.model(t.models.self.alias).whereNull('updated_at');
            let result;

            result = await builder.find({ updated_at: { '=': null } });
            expect(result).toHaveLength(expected.length);
            result = await builder.find({ updated_at: 'ISNULL' });
            expect(result).toHaveLength(expected.length);
          });
          it('Should return correct result for datetime by null [raw]', async () => {
            const builder = getQueryBuilder(t.models.self);
            const expected = await db.model(t.models.self.alias).whereNull('updated_at');
            let result;

            result = await builder.find({ updated_at: { '=': null } }).raw();
            expect(result).toHaveLength(expected.length);
            result = await builder.find({ updated_at: 'ISNULL' }).raw();
            expect(result).toHaveLength(expected.length);
          });

          it('Should return correct result for datetime by complex clause', async () => {
            const builder = getQueryBuilder(t.models.self);
            let result;

            result = await builder.find({ [t.fields.self.datetime.alias]: { '>': NOW_1, '<': NOW_3 } });
            expect(result).toHaveLength(1);
          });
          it('Should return correct result for datetime by complex clause [raw]', async () => {
            const builder = getQueryBuilder(t.models.self);
            let result;

            result = await builder.find({ [t.fields.self.datetime.alias]: { '>': NOW_1, '<': NOW_3 } }).raw();
            expect(result).toHaveLength(1);
          });

          it('Should reset findOne selection', async () => {
            const builder = getQueryBuilder(t.models.self);
            builder.findOne();
            expect(isArray(await builder.find())).toEqual(true);
          });
          it('Should reset findOne selection [raw]', async () => {
            const builder = getQueryBuilder(t.models.self);
            builder.findOne().raw();
            expect(isArray(await builder.find().raw())).toEqual(true);
          });

          describe('update', () => {
            it('Should return count of updated records', async () => {
              let builder;
              let result;

              builder = getQueryBuilder(t.models.self);
              result = await builder.find({ [t.fields.self.string.alias]: 'string1' }).update({ [t.fields.self.string.alias]: 'string1updated' });
              expect(result).toEqual(1);

              builder = getQueryBuilder(t.models.self);
              result = await builder.find({ [t.fields.self.string.alias]: 'string1updated' }).update({ [t.fields.self.string.alias]: 'string1' });
              expect(result).toEqual(1);
            });
          });
        });

        describe('findOne(params)', () => {
          it('Should reset find selection', async () => {
            const builder = getQueryBuilder(t.models.self);
            builder.find();
            expect(isObject(await builder.findOne())).toEqual(true);
          });
          it('Should reset find selection [raw]', async () => {
            const builder = getQueryBuilder(t.models.self);
            builder.find().raw();
            expect(isObject(await builder.findOne().raw())).toEqual(true);
          });

          it('Should not call deprecation warning', async () => {
            jest.spyOn(logger, 'info');
            const builder = getQueryBuilder(t.models.self);
            await builder.findOne({ id: 1 });
            expect(logger.info).not.toBeCalledWith('find(...).then will be deprecated soon. Please use p.iterEach or p.iterMap.', { user: sandbox.user.id });
          });
          it('Should not call deprecation warning [raw]', async () => {
            jest.spyOn(logger, 'info');
            const builder = getQueryBuilder(t.models.self);
            await builder.findOne({ id: 1 }).raw();
            expect(logger.info).not.toBeCalledWith('find(...).then will be deprecated soon. Please use p.iterEach or p.iterMap.', { user: sandbox.user.id });
          });
        });

        describe('join', () => {
          it('Should return correct result', async () => {
            const builder = getQueryBuilder(t.models.self);
            const result = await builder.join('model', 'id', t.models.self.alias, t.fields.self.integer.alias).find({ id: 1 });
            expect(result[0].attributes).toMatchObject({ id: 1, [t.fields.self.string.alias]: 'string1' });
            expect(result[0].joinedAttributes).toMatchObject({ __j_1_id: 1, __j_1_alias: 'model' });
          });
          it('Should return correct result [raw]', async () => {
            const builder = getQueryBuilder(t.models.self);
            const result = await builder.join('model', 'id', t.models.self.alias, t.fields.self.integer.alias).find({ id: 1 }).raw();
            expect(result[0][t.models.self.alias]).toMatchObject({ id: 1, [t.fields.self.string.alias]: 'string1' });
            expect(result[0]['model']).toMatchObject({ id: 1, alias: 'model', type: 'core' });
          });
        });

        describe('fields(fieldAliases)', () => {
          describe('find', () => {
            it('Should return correct result with selected fields', async () => {
              let builder = getQueryBuilder(t.models.self);
              let result;

              builder = getQueryBuilder(t.models.self);
              result = await builder.fields().find({ id: 1 });
              expect(result[0].attributes).toMatchObject({ id: 1, [t.fields.self.string.alias]: 'string1' });
              builder = getQueryBuilder(t.models.self);
              result = await builder.fields(['id']).find({ id: 1 });
              expect(result[0].attributes).toEqual({ __type: t.models.self.alias, id: 1 });
            });
            it('Should return correct result with selected fields [raw]', async () => {
              let builder = getQueryBuilder(t.models.self);
              let result;

              builder = getQueryBuilder(t.models.self);
              result = await builder.fields().find({ id: 1 }).raw();
              expect(result[0]).toMatchObject({ id: 1, [t.fields.self.string.alias]: 'string1' });
              builder = getQueryBuilder(t.models.self);
              result = await builder.fields(['id']).find({ id: 1 }).raw();
              expect(result[0]).toEqual({ id: 1 });
            });

            it('Should preload rtl fields', async () => {
              const builder = getQueryBuilder(t.models.self);
              const result = await builder.fields([t.fields.self.rtl.alias]).find({ [t.fields.self.rtl.alias]: [1] });
              expect(result[0].attributes).toEqual({ __type: t.models.self.alias, id: 1, [t.fields.self.rtl.alias]: [1] });
            });
            it('Should preload rtl fields [raw]', async () => {
              const builder = getQueryBuilder(t.models.self);
              const result = await builder.fields([t.fields.self.rtl.alias]).find({ [t.fields.self.rtl.alias]: [1] }).raw();
              expect(result[0]).toEqual({ [t.fields.self.rtl.alias]: [1] });
            });
          });

          describe('findOne', () => {
            it('Should return correct result with selected fields', async () => {
              const builder = getQueryBuilder(t.models.self);
              let result;

              result = await builder.fields().findOne({ id: 1 });
              expect(result.attributes).toMatchObject({ id: 1, [t.fields.self.string.alias]: 'string1' });
              result = await builder.fields([t.fields.self.string.alias]).findOne({ id: 1 });
              expect(result.attributes).toEqual({ __type: t.models.self.alias, [t.fields.self.string.alias]: 'string1' });
            });
            it('Should return correct result with selected fields [raw]', async () => {
              const builder = getQueryBuilder(t.models.self);
              let result;

              result = await builder.fields().findOne({ id: 1 }).raw();
              expect(result).toMatchObject({ id: 1, [t.fields.self.string.alias]: 'string1' });
              result = await builder.fields([t.fields.self.string.alias]).findOne({ id: 1 }).raw();
              expect(result).toEqual({ [t.fields.self.string.alias]: 'string1' });
            });

            it('Should return correct result with selected fields [arbitrary chaining]', async () => {
              const builder = getQueryBuilder(t.models.self);
              let result;

              result = await builder.findOne({ id: 1 }).fields();
              expect(result.attributes).toMatchObject({ id: 1, [t.fields.self.string.alias]: 'string1' });
              result = await builder.findOne({ id: 1 }).fields([t.fields.self.string.alias]);
              expect(result.attributes).toEqual({ __type: t.models.self.alias, [t.fields.self.string.alias]: 'string1' });
            });
            it('Should return correct result with selected fields [arbitrary chaining] [raw]', async () => {
              const builder = getQueryBuilder(t.models.self);
              let result;

              result = await builder.findOne({ id: 1 }).fields().raw();
              expect(result).toMatchObject({ id: 1, [t.fields.self.string.alias]: 'string1' });
              result = await builder.findOne({ id: 1 }).fields([t.fields.self.string.alias]).raw();
              expect(result).toEqual({ [t.fields.self.string.alias]: 'string1' });
            });

            it('Should preload rtl fields', async () => {
              const builder = getQueryBuilder(t.models.self);
              const result = await builder.fields([t.fields.self.rtl.alias]).findOne({ [t.fields.self.rtl.alias]: [1] });
              expect(result.attributes).toEqual({ __type: t.models.self.alias, id: 1, [t.fields.self.rtl.alias]: [1] });
            });
            it('Should preload rtl fields [raw]', async () => {
              const builder = getQueryBuilder(t.models.self);
              const result = await builder.fields([t.fields.self.rtl.alias]).findOne({ [t.fields.self.rtl.alias]: [1] }).raw();
              expect(result).toEqual({ [t.fields.self.rtl.alias]: [1] });
            });
          });

          describe('update', () => {
            describe('common cases', () => {
              it('Should be able to perform update finding rtl value', async () => {
                let builder, result, records, value;

                builder = getQueryBuilder(t.models.self);
                result = await builder.find({ [t.fields.self.rtl.alias]: [3] }).update();
                expect(result).toEqual(1);
              });
              it('Should be able to perform delete finding rtl value', async () => {
                let builder, result, records, value;

                builder = getQueryBuilder(t.models.self);
                result = await builder.find({ [t.fields.self.rtl.alias]: [3] }).delete();
                expect(result).toEqual(1);
              });
            });

            describe('fields', () => {
              describe('array_string', () => {
                it('Should return correct result with updated values', async () => {
                  let builder, result, value, records;

                  builder = getQueryBuilder(t.models.self);
                  value = ['a', 'b'];
                  result = await builder.find({ id: 1 }).update({ [t.fields.self.array_string.alias]: value });
                  expect(result).toEqual(1);
                  builder = getQueryBuilder(t.models.self);
                  records = await builder.find({ id: 1 });
                  expect(records[0].attributes).toMatchObject({ id: 1, [t.fields.self.array_string.alias]: value });
                });
              });

              describe('string', () => {
                it('Should be able to update with object', async () => {
                  let builder, result, value, records;

                  builder = getQueryBuilder(t.models.self);
                  value = { key: 'value' };
                  result = await builder.find({ id: 1 }).update({ [t.fields.self.string.alias]: value });
                  expect(result).toEqual(1);
                  builder = getQueryBuilder(t.models.self);
                  records = await builder.find({ id: 1 });
                  expect(records[0].attributes).toMatchObject({ id: 1, [t.fields.self.string.alias]: JSON.stringify(value) });
                  await builder.find({ id: 1 }).update({ [t.fields.self.string.alias]: 'string1' });
                });
              });

              describe('datetime', () => {
                it('Should return correct result with updated values', async () => {
                  let builder, result, value, records;

                  builder = getQueryBuilder(t.models.self);
                  value = new Date();
                  result = await builder.find({ id: 1 }).update({ [t.fields.self.datetime.alias]: value });
                  expect(result).toEqual(1);
                  builder = getQueryBuilder(t.models.self);
                  records = await builder.find({ id: 1 });
                  expect(records[0].attributes).toMatchObject({ id: 1, [t.fields.self.datetime.alias]: value });
                });
              });

              describe('rtl', () => {
                it('Should be able to update with array', async () => {
                  let builder, result, value, records;

                  builder = getQueryBuilder(t.models.self);
                  value = [2];
                  result = await builder.find({ id: 1 }).update({ [t.fields.self.rtl.alias]: value });
                  expect(result).toEqual(1);
                  builder = getQueryBuilder(t.models.self);
                  records = await builder.find({ id: 1 });
                  expect(records[0].attributes).toMatchObject({ id: 1, [t.fields.self.rtl.alias]: value });
                });
                it('Should be able to update with null', async () => {
                  let builder, result, value, records;

                  builder = getQueryBuilder(t.models.self);
                  value = null;
                  result = await builder.find({ id: 1 }).update({ [t.fields.self.rtl.alias]: value });
                  expect(result).toEqual(1);
                  builder = getQueryBuilder(t.models.self);
                  records = await builder.find({ id: 1 });
                  expect(records[0].attributes).toMatchObject({ id: 1, [t.fields.self.rtl.alias]: [] });
                });
              });

              describe('grc', () => {
                it('Should be able to update with number', async () => {
                  let builder, result, value, records;

                  builder = getQueryBuilder(t.models.self);
                  value = 1;
                  result = await builder.find({ id: 1 }).update({ [t.fields.self.grc.alias]: value });
                  expect(result).toEqual(1);
                  builder = getQueryBuilder(t.models.self);
                  records = await builder.find({ id: 1 });
                  expect(records[0].attributes).toMatchObject({ id: 1, [t.fields.self.grc.alias]: value });
                });
                it('Should be able to update with null', async () => {
                  let builder, result, value, records;

                  builder = getQueryBuilder(t.models.self);
                  value = null;
                  result = await builder.find({ id: 1 }).update({ [t.fields.self.grc.alias]: value });
                  expect(result).toEqual(1);
                  builder = getQueryBuilder(t.models.self);
                  records = await builder.find({ id: 1 });
                  expect(records[0].attributes).toMatchObject({ id: 1, [t.fields.self.grc.alias]: value });
                });
              });
            });
          });

          describe('join', () => {
            it('Should return correct result', async () => {
              let builder = getQueryBuilder(t.models.self);
              let result;

              builder = getQueryBuilder(t.models.self);
              result = await builder.fields().join('model', 'id', t.models.self.alias, t.fields.self.integer.alias).find({ id: 1 });
              expect(result[0].attributes).toMatchObject({ id: 1, [t.fields.self.string.alias]: 'string1', __inserted: true });
              expect(result[0].joinedAttributes).toMatchObject({ __j_1_id: 1, __j_1_alias: 'model', __j_1_type: 'core' });
              builder = getQueryBuilder(t.models.self);
              result = await builder.fields([t.fields.self.string.alias], t.models.self.alias).fields(['type'], 'model').join('model', 'id', t.models.self.alias, t.fields.self.integer.alias).find({ id: 1 });
              expect(result[0].attributes).toEqual({ __type: t.models.self.alias, [t.fields.self.string.alias]: 'string1' });
              expect(result[0].joinedAttributes).toMatchObject({ __j_1_type: 'core' });
            });
            it('Should return correct result [raw]', async () => {
              let builder;
              let result;

              builder = getQueryBuilder(t.models.self);
              result = await builder.fields().join('model', 'id', t.models.self.alias, t.fields.self.integer.alias).find({ id: 1 }).raw();
              expect(result[0][t.models.self.alias]).toMatchObject({ id: 1, [t.fields.self.string.alias]: 'string1', __inserted: true });
              expect(result[0]['model']).toMatchObject({ id: 1, type: 'core', alias: 'model' });
              builder = getQueryBuilder(t.models.self);
              result = await builder.fields([t.fields.self.string.alias], t.models.self.alias).fields(['type'], 'model').join('model', 'id', t.models.self.alias, t.fields.self.integer.alias).find({ id: 1 }).raw();
              expect(result[0][t.models.self.alias]).toEqual({ [t.fields.self.string.alias]: 'string1' });
              expect(result[0]['model']).toEqual({ type: 'core' });
            });
          });
        });
      });

      describe('constructor(modelProxy, selectorScope)', () => {
        it('Should correctly run', () => {
          jest.spyOn(QueryBuilder.prototype, 'setFlags');

          const result = getQueryBuilder(t.models.self);

          expect(result.modelProxy).toEqual(t.modelProxy);
          expect(result.model).toEqual(t.modelProxy.model);
          expect(result.sandbox).toEqual(t.modelProxy.sandbox);

          expect(result.selectorScope).toEqual(t.selectorScope);

          expect(result.finders).toEqual([]);
          expect(result.joins).toEqual([]);
          expect(result.serviceJoins).toEqual([]);
          expect(result.orderings).toEqual([]);
          expect(result.groupings).toEqual([]);
          expect(result.agregates).toEqual([]);
          expect(result.columns).toEqual([]);
          expect(result.updaters).toEqual([]);

          expect(result.options).toEqual({});

          expect(result.cloned).toEqual(false);
          expect(result.selectRaw).toEqual(false);
          expect(result.selectFirst).toEqual(false);

          expect(QueryBuilder.prototype.setFlags).toBeCalledWith(t.modelProxy.flags);
        });
      });

      describe('setFlags()', () => {
        it('Should correctly run', () => {
          const result = getQueryBuilder(t.models.self);
          const flags = 'flags';

          result.setFlags(flags);

          expect(result.flags).toEqual(flags);
          expect(result).toBeInstanceOf(QueryBuilder);
        });
      });

      describe('clone()', () => {
        it('Should correctly run', () => {
          const result = getQueryBuilder(t.models.self);
          const cloned = result.clone();

          expect(cloned.finders).toEqual(result.finders);
          expect(cloned.joins).toEqual(result.joins);
          expect(cloned.orderings).toEqual(result.orderings);
          expect(cloned.groupings).toEqual(result.groupings);
          expect(cloned.agregates).toEqual(result.agregates);
          expect(cloned.limiter).toEqual(result.limiter);
          expect(cloned.offset).toEqual(result.offset);
          expect(cloned.columns).toEqual(result.columns);
          expect(cloned.updaters).toEqual(result.updaters);
          expect(cloned.cloned).toEqual(true)

          expect(cloned).toBeInstanceOf(QueryBuilder);
        });
      });

      describe('first()', () => {
        it('Should correctly run', () => {
          const result = getQueryBuilder(t.models.self);

          result.first();

          expect(result.selectFirst).toEqual(true);
          expect(result).toBeInstanceOf(QueryBuilder);
        });
      });

      describe('find(params, model)', () => {
        it('Should correctly run', () => {
          let result;

          result = getQueryBuilder(t.models.self);
          result.find(null);
          expect(result.finders).toEqual([]);
          expect(result.selectFirst).toEqual(false);
          expect(result).toBeInstanceOf(QueryBuilder);

          result = getQueryBuilder(t.models.self);
          result.find({ id: 1 });
          expect(result.finders).toEqual([{"modelAlias": t.models.self.alias, "params": {"id": 1}, "type": "and"}]);
          expect(result.selectFirst).toEqual(false);
          expect(result).toBeInstanceOf(QueryBuilder);

          result = getQueryBuilder(t.models.self);
          result.find({ id: 1 }, 'field');
          expect(result.finders).toEqual([{"modelAlias": "field", "params": {"id": 1}, "type": "and"}]);
          expect(result.selectFirst).toEqual(false);
          expect(result).toBeInstanceOf(QueryBuilder);

          result = getQueryBuilder(t.models.self);
          result.find({ id: 1 }, { alias: 'user' });
          expect(result.finders).toEqual([{"modelAlias": "user", "params": {"id": 1}, "type": "and"}]);
          expect(result.selectFirst).toEqual(false);
          expect(result).toBeInstanceOf(QueryBuilder);
        });
      });

      describe('findOne(params, model)', () => {
        it('Should correctly run', () => {
          let result;

          result = getQueryBuilder(t.models.self);
          result.findOne(null);
          expect(result.finders).toEqual([]);
          expect(result.selectFirst).toEqual(false);
          expect(result).toBeInstanceOf(QueryBuilder);

          result = getQueryBuilder(t.models.self);
          result.findOne({ id: 1 });
          expect(result.finders).toEqual([{"modelAlias": t.models.self.alias, "params": {"id": 1}, "type": "and"}]);
          expect(result.selectFirst).toEqual(true);
          expect(result).toBeInstanceOf(QueryBuilder);

          result = getQueryBuilder(t.models.self);
          result.findOne({ id: 1 }, 'field');
          expect(result.finders).toEqual([{"modelAlias": "field", "params": {"id": 1}, "type": "and"}]);
          expect(result.selectFirst).toEqual(true);
          expect(result).toBeInstanceOf(QueryBuilder);

          result = getQueryBuilder(t.models.self);
          result.findOne({ id: 1 }, { alias: 'user' });
          expect(result.finders).toEqual([{"modelAlias": "user", "params": {"id": 1}, "type": "and"}]);
          expect(result.selectFirst).toEqual(true);
          expect(result).toBeInstanceOf(QueryBuilder);
        });
      });

      describe('orFind(params, model)', () => {
        it('Should correctly run', () => {
          let result;

          result = getQueryBuilder(t.models.self);
          result.orFind(null);
          expect(result.finders).toEqual([]);
          expect(result.selectFirst).toEqual(false);
          expect(result).toBeInstanceOf(QueryBuilder);

          result = getQueryBuilder(t.models.self);
          result.orFind({ id: 1 });
          expect(result.finders).toEqual([{"modelAlias": t.models.self.alias, "params": {"id": 1}, "type": "or"}]);
          expect(result.selectFirst).toEqual(false);
          expect(result).toBeInstanceOf(QueryBuilder);

          result = getQueryBuilder(t.models.self);
          result.orFind({ id: 1 }, 'field');
          expect(result.finders).toEqual([{"modelAlias": "field", "params": {"id": 1}, "type": "or"}]);
          expect(result.selectFirst).toEqual(false);
          expect(result).toBeInstanceOf(QueryBuilder);

          result = getQueryBuilder(t.models.self);
          result.orFind({ id: 1 }, { alias: 'user' });
          expect(result.finders).toEqual([{"modelAlias": "user", "params": {"id": 1}, "type": "or"}]);
          expect(result.selectFirst).toEqual(false);
          expect(result).toBeInstanceOf(QueryBuilder);
        });
      });

      describe('update(params, model)', () => {
        it('Should correctly run', () => {
          let result;

          result = getQueryBuilder(t.models.self);
          result.update(null);
          expect(result.updaters).toEqual([]);
          expect(result).toBeInstanceOf(QueryBuilder);

          result = getQueryBuilder(t.models.self);
          result.update({ id: 1 });
          expect(result.updaters).toEqual([{"modelAlias": t.models.self.alias, "params": {"id": 1}}]);
          expect(result).toBeInstanceOf(QueryBuilder);

          result = getQueryBuilder(t.models.self);
          result.update({ id: 1 }, 'field');
          expect(result.updaters).toEqual([{"modelAlias": "field", "params": {"id": 1}}]);
          expect(result).toBeInstanceOf(QueryBuilder);

          result = getQueryBuilder(t.models.self);
          result.update({ id: 1 }, { alias: 'user' });
          expect(result.updaters).toEqual([{"modelAlias": "user", "params": {"id": 1}}]);
          expect(result).toBeInstanceOf(QueryBuilder);
        });
      });

      describe('join(leftModel, leftFieldAlias, rightModel, rightFieldAlias)', () => {
        it('Should correctly run', () => {
          let result;

          result = getQueryBuilder(t.models.self);
          result.join();
          expect(result.joins).toEqual([]);
          expect(result).toBeInstanceOf(QueryBuilder);

          result = getQueryBuilder(t.models.self);
          result.join({ id: 1, alias: 'model' }, 'left', { id: 2, alias: 'field' }, 'right');
          expect(result.joins).toEqual([{"left": {"fieldAlias": "left", "modelAlias": "model"}, "right": {"fieldAlias": "right", "modelAlias": "field"}}]);
          expect(result).toBeInstanceOf(QueryBuilder);
        });
      });

      describe('order(options, model)', () => {
        it('Should correctly run', () => {
          let result;

          result = getQueryBuilder(t.models.self);
          result.order();
          expect(result.orderings).toEqual([]);
          expect(result).toBeInstanceOf(QueryBuilder);

          result = getQueryBuilder(t.models.self);
          result.order({ id: 'asc' });
          expect(result.orderings).toEqual([{"direction": "asc", "fieldAlias": "id", "modelAlias": t.models.self.alias}]);
          expect(result).toBeInstanceOf(QueryBuilder);

          result = getQueryBuilder(t.models.self);
          result.order({ id: 'asc' }, 'field');
          expect(result.orderings).toEqual([{"direction": "asc", "fieldAlias": "id", "modelAlias": "field"}]);
          expect(result).toBeInstanceOf(QueryBuilder);
        });
      });

      describe('group(fieldAlias, agregates, model)', () => {
        it('Should correctly run', () => {
          let result;

          result = getQueryBuilder(t.models.self);
          result.group();
          expect(result.groupings).toEqual([]);
          expect(result).toBeInstanceOf(QueryBuilder);

          result = getQueryBuilder(t.models.self);
          result.group('id');
          expect(result.groupings).toEqual([{"fieldAlias": "id", "modelAlias": t.models.self.alias}]);
          expect(result).toBeInstanceOf(QueryBuilder);

          result = getQueryBuilder(t.models.self);
          result.group('id', {}, 'field');
          expect(result.groupings).toEqual([{"fieldAlias": "id", "modelAlias": "field"}]);
          expect(result).toBeInstanceOf(QueryBuilder);
        });
        describe('fields(fieldAliases, model)', () => {
          it('Should correctly run', () => {
            let result;

            result = getQueryBuilder(t.models.self);
            result.fields();
            expect(result.columns).toEqual([]);
            expect(result).toBeInstanceOf(QueryBuilder);

            result = getQueryBuilder(t.models.self);
            result.fields(['id']);
            expect(result.columns).toEqual([{"fieldAliases": ["id"], "modelAlias": t.models.self.alias}]);
            expect(result).toBeInstanceOf(QueryBuilder);

            result = getQueryBuilder(t.models.self);
            result.fields(['id'], 'field');
            expect(result.columns).toEqual([{"fieldAliases": ["id"], "modelAlias": "field"}]);
            expect(result).toBeInstanceOf(QueryBuilder);
          });
        });

        describe('limit(value, offset)', () => {
          it('Should correctly run', () => {
            let result;

            result = getQueryBuilder(t.models.self);
            result.limit();
            expect(result.limiter).toEqual(undefined);
            expect(result.offset).toEqual(undefined);
            expect(result).toBeInstanceOf(QueryBuilder);

            result = getQueryBuilder(t.models.self);
            result.limit(10);
            expect(result.limiter).toEqual(10);
            expect(result.offset).toEqual(undefined);
            expect(result).toBeInstanceOf(QueryBuilder);

            result = getQueryBuilder(t.models.self);
            result.limit(10, 0);
            expect(result.limiter).toEqual(10);
            expect(result.offset).toEqual(0);
            expect(result).toBeInstanceOf(QueryBuilder);

            result = getQueryBuilder(t.models.self);
            result.limit(10, 10);
            expect(result.limiter).toEqual(10);
            expect(result.offset).toEqual(10);
            expect(result).toBeInstanceOf(QueryBuilder);
          });
        });

        describe('setOptions(options)', () => {
          it('Should correctly run', () => {
            let result;

            result = getQueryBuilder(t.models.self);
            result.setOptions();
            expect(result.flags).toEqual(t.modelProxy.flags);
            expect(result).toBeInstanceOf(QueryBuilder);

            result = getQueryBuilder(t.models.self);
            result.setOptions({ flag: 'flag' });
            expect(result.flags).toEqual(new Flags({ flag: 'flag' }));
            expect(result).toBeInstanceOf(QueryBuilder);
          });
        });

        describe('distinct(fieldAliases)', () => {
          it('Should correctly run', () => {
            Applicator.prototype.distinct = jest.fn();

            let result, fieldAliases;

            fieldAliases = ['id'];
            result = getQueryBuilder(t.models.self);
            expect(result.distinct(fieldAliases)).toEqual(new Applicator(result).distinct(fieldAliases));
          });
        });

        describe('count()', () => {
          it('Should correctly run', () => {
            Applicator.prototype.count = jest.fn();

            let result;

            result = getQueryBuilder(t.models.self);
            expect(result.count()).toEqual(new Applicator(result).count());
          });
        });

        describe('fetchRawRecords()', () => {
          it('Should correctly run', () => {
            Applicator.prototype.fetch = jest.fn();

            let result;

            result = getQueryBuilder(t.models.self);
            expect(result.fetchRawRecords()).toEqual(new Applicator(result).fetch());
          });
        });

        describe('delete()', () => {
          it('Should correctly run', () => {
            let result;

            result = getQueryBuilder(t.models.self);
            result.delete();

            expect(result.deletion).toEqual(true);
          });
        });

        describe('raw()', () => {
          it('Should correctly run', () => {
            let result;

            result = getQueryBuilder(t.models.self);
            result.raw();

            expect(result.selectRaw).toEqual(true);
          });
        });

        describe('setMode(mode)', () => {
          it('Should correctly run', () => {
            let result, mode;

            mode = 'mode';
            result = getQueryBuilder(t.models.self);
            result.setMode(mode);

            expect(result.mode).toEqual(mode);
          });
        });

        describe('then()', () => {
          it('Should correctly run', async () => {
            MODEL.wrapRecord = (modelProxy, params = {}) => (r) => 'wrapRecord';
            MODEL.wrapRecords = (modelProxy, params = {}) => (r) => 'wrapRecords';

            let result, records;

            records = [];
            result = getQueryBuilder(t.models.self);
            QueryBuilder.prototype.fetchRawRecords = () => Promise.resolve(records);
            expect(await result).toEqual(records);

            records = [{ id: 1 }];
            result = getQueryBuilder(t.models.self);
            QueryBuilder.prototype.fetchRawRecords = () => Promise.resolve(records);
            expect(await result).toEqual('wrapRecords');

            records = [{ id: 1 }];
            result = getQueryBuilder(t.models.self).first();
            QueryBuilder.prototype.fetchRawRecords = () => Promise.resolve(records);
            expect(await result).toEqual('wrapRecord');

            records = [{ id: 1 }];
            result = getQueryBuilder(t.models.self).raw();
            QueryBuilder.prototype.fetchRawRecords = () => Promise.resolve(records);
            expect(await result).not.toEqual(HELPERS.groupRecordsByJoinedModels(records, result.joins, result.columns));

            const wrapRecord = {};
            const wrapRecords = [ wrapRecord ];

            MODEL.wrapRecord = (modelProxy, params = {}) => (r) => wrapRecord;
            MODEL.wrapRecords = (modelProxy, params = {}) => (r) => wrapRecords;

            records = [{ id: 1, model: 1, __j_1_model: 1, __j_1_id: 1 }];
            result = getQueryBuilder(t.models.self).raw().join({ id: 1, alias: 'model' }, 'id', { id: 2, alias: 'field' }, 'model');
            QueryBuilder.prototype.fetchRawRecords = () => Promise.resolve(records);
            expect(await result).toEqual([{ field: wrapRecord, model: wrapRecord }]);
          });
        });
      });
    });
  });
});
