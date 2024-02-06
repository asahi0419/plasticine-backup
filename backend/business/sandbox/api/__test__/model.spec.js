import moment from 'moment';
import { every, isEqual, isNumber } from 'lodash-es';

import Flags from '../../../record/flags.js';
import ModelProxy from '../model/index.js';
import RecordProxy from '../model/record/index.js';
import RecordManager from '../../../record/manager/index.js';
import QueryBuilder from '../query/builder.js';
import transactionFunc from '../utils/db/transaction/index.js';
import { sandboxFactory } from '../../../sandbox/factory.js';
import { extendUser } from '../../../user/index.js';

const { manager } = h.record;
const NOW = moment();

beforeAll(async () => {
  t.models = {
    self: await manager('model').create(),
    foreign: await manager('model').create(),
    result: await manager('model').create(),
  };

  t.fields = {
    self: {
      string: await manager('field').create({
        type: 'string',
        model: t.models.self.id,
        index: 'unique',
      }),
      array_string_ms: await manager('field').create({
        type: 'array_string',
        model: t.models.self.id,
        index: 'unique',
        options: JSON.stringify({
          multi_select: true,
          values: { one: 'One', two: 'Two' },
        }),
      }),
      datetime: await manager('field').create({
        type: 'datetime',
        model: t.models.self.id,
      }),
      grc: await manager('field').create({
        type: 'global_reference',
        model: t.models.self.id,
        options: JSON.stringify({
          references: [{
            foreign_model: t.models.foreign.alias,
            foreign_label: 'id',
          }]
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
    },
    result: {
      string: await manager('field').create({
        type: 'string',
        model: t.models.result.id,
      }),
    },
  };

  t.db_rules = {
    self: [
      await manager('db_rule').create({
        model: t.models.self.id,
        when_perform: 'before',
        on_insert: true,
        script: `const value = {
  string: {
    isChanged: p.record.isChanged('${t.fields.self.string.alias}'),
  },
  array_string_ms: {
    isChanged: p.record.isChanged('${t.fields.self.array_string_ms.alias}'),
  },
  rtl: {
    isChanged: p.record.isChanged('${t.fields.self.rtl.alias}'),
  },
};

const model = await p.getModel(\`${t.models.result.alias}\`);
const record = await model.findOne({ id: 1 });

await record.update({ ['${t.fields.result.string.alias}']: JSON.stringify(value) });`
      }),
    ],
  };

  t.records = {
    foreign: [
      await manager(t.models.foreign.alias).create(),
    ],
    result: [
      await manager(t.models.result.alias).create(),
    ],
  }

  extendUser(sandbox.user);

  t.modelProxy = new ModelProxy(t.models.self, sandbox);
});

describe('Sandbox', () => {
  describe('Api', () => {
    describe('Model', () => {
      describe('constructor(...)', () => {
        it('Should be properly executed', () => {
          expect(t.modelProxy.model).toEqual(t.models.self);
          expect(t.modelProxy.flags).toEqual(Flags.default());
          expect(t.modelProxy.id).toEqual(t.models.self.id);
          expect(t.modelProxy.alias).toEqual(t.models.self.alias);
        });
      });

      describe('get attributes()', () => {
        it('Should return model attributes', () => {
          expect(t.modelProxy.attributes).toEqual(t.models.self.attributes);
        });
      });

      describe('getSQL()', () => {
        it('Should get last sql query', async () => {
          const table = db.model(t.models.self.alias).tableName;

          let result, expected;

          result = t.modelProxy.getSQL();
          expected = undefined;
          expect(result).toEqual(expected);

          await t.modelProxy.find({});
          result = t.modelProxy.getSQL();
          expected = `select "${table}".* from "${table}" where "${table}"."__inserted" = true order by "${table}"."id" asc`;
          expect(result).toEqual(expected);

          await t.modelProxy.find({ id: 1 });
          result = t.modelProxy.getSQL();
          expected = `select "${table}".* from "${table}" where "${table}"."__inserted" = true and (("${table}"."id" = 1)) order by "${table}"."id" asc`;
          expect(result).toEqual(expected);
        });
      });

      describe('getValue(fieldAlias)', () => {
        it('Should validate input', () => {
          let result;

          result = () => t.modelProxy.getValue();
          expect(result).toThrow();
        });
        it('Should return a model value', () => {
          const result = t.modelProxy.getValue('id');
          const expected = t.modelProxy.model.id;

          expect(result).toEqual(expected);
        });
      });

      describe('setOptions(options)', () => {
        it('Should validate input', async () => {
          let result;

          result = () => t.modelProxy.setOptions('string');
          expect(result).toThrow();
        });
        it('Should set new options', () => {
          const options = { test: 'test' };

          t.modelProxy.setOptions(options);

          const result = t.modelProxy.flags;
          const expected = new Flags(options);

          expect(result).toEqual(expected);
        });
      });

      describe('canAttach()', () => {
        it('Should check if user can attach', () => {
          const result = t.modelProxy.canAttach();
          const expected = true;

          expect(result).toEqual(expected);
        });
      });

      describe('build(attributes)', () => {
        it('Should validate input', async () => {
          const result = t.modelProxy.build('');
          await expect(result).rejects.toMatchObject({ name: 'ParamsNotValidError', description: 'model.build - param "attributes" must be an object' });
        });
        it('Should build a record', async () => {
          const attributes = { created_by: 2 };
          const record = await t.modelProxy.build(attributes);

          expect(record).toBeInstanceOf(RecordProxy);
          expect(record.attributes).toMatchObject(attributes);
          expect(record.attributes.__inserted).toEqual(false);
          expect(record.flags).toEqual(t.modelProxy.flags);

          await db.model(t.models.self.alias).delete();
        });
      });

      describe('insert(record)', () => {
        it('Should validate input', async () => {
          const result = t.modelProxy.insert('');
          await expect(result).rejects.toMatchObject({ name: 'ParamsNotValidError', description: 'model.insert - param "attributes" must be an object' });
        });
        it('Should not insert record if some attribute is invalid', async () => {
          const result1 = await t.modelProxy.insert({ [t.fields.self.string.alias]: 'string' });
          expect(result1).toBeDefined();
          const result2 = t.modelProxy.insert({ [t.fields.self.string.alias]: 'string' });
          await expect(result2).rejects.toMatchObject({ name: 'RecordNotValidError', description: 'static.field_must_be_unique' });
          await expect((await db.model(t.modelProxy.model.alias).where({ id: result1.id + 1 }).getOne())['__inserted']).toEqual(false);
          await db.model(t.modelProxy.model.alias).whereIn('id', [result1.id, result1.id + 1]).delete();
        });
        it('Should insert record', async () => {
          const modelProxy = new ModelProxy(t.models.self, sandbox);
          const record = {};

          await modelProxy.insert(record);
          const result = await db.model(t.models.self);

          expect(result.length).toEqual(1);
          expect(every(result, { __inserted: true })).toEqual(true);
          expect(every(result, { created_by: sandbox.user.id })).toEqual(true);
          expect(every(result, ({ created_at }) => created_at !== null)).toEqual(true);

          await db.model(t.models.self.alias).delete();
        });
        it('Should correctly process db rules', async () => {
          const modelProxy = new ModelProxy(t.models.self, sandbox);
          let record;

          record = {};
          await modelProxy.insert(record);
          expect(await db.model(t.models.result.alias).getOne()).toMatchObject({
            [t.fields.result.string.alias]: JSON.stringify({
              string: { isChanged: false },
              array_string_ms: { isChanged: false },
              rtl: { isChanged: false },
            })
          });

          record = { [t.fields.self.string.alias]: 'string' };
          await modelProxy.insert(record);
          expect(await db.model(t.models.result.alias).getOne()).toMatchObject({
            [t.fields.result.string.alias]: JSON.stringify({
              string: { isChanged: true },
              array_string_ms: { isChanged: false },
              rtl: { isChanged: false },
            })
          });

          record = { [t.fields.self.rtl.alias]: [t.records.foreign[0].id] };
          await modelProxy.insert(record);
          expect(await db.model(t.models.result.alias).getOne()).toMatchObject({
            [t.fields.result.string.alias]: JSON.stringify({
              string: { isChanged: false },
              array_string_ms: { isChanged: false },
              rtl: { isChanged: true },
            })
          });

          record = { [t.fields.self.array_string_ms.alias]: ['one'] };
          await modelProxy.insert(record);
          expect(await db.model(t.models.result.alias).getOne()).toMatchObject({
            [t.fields.result.string.alias]: JSON.stringify({
              string: { isChanged: false },
              array_string_ms: { isChanged: true },
              rtl: { isChanged: false },
            })
          });

          await db.model(t.models.self.alias).delete();
        });
        it('Should be able to insert record with own defined created_at/created_by', async () => {
          const created_at = moment(NOW).add(1, 'day');
          const created_by = 2;

          const modelProxy = new ModelProxy(t.models.self, sandbox);
          const record = { created_at, created_by };

          await modelProxy.insert(record);
          const result = await db.model(t.models.self);

          expect(result.length).toEqual(1);
          expect(every(result, { __inserted: true })).toEqual(true);
          expect(every(result, (r) => isEqual(moment(r.created_at).format(), created_at.format()))).toEqual(true);
          expect(every(result, { created_by })).toEqual(true);

          await db.model(t.models.self.alias).delete();
        });
        it('Should set system actions for record manager if the option is present', async () => {
          jest.spyOn(RecordManager.prototype, 'setSystemActions');

          const attributes = {};
          const options = { systemActions: {} };
          const record = await t.modelProxy.insert(attributes, options);

          expect(RecordManager.prototype.setSystemActions).toBeCalledWith(options.systemActions);
        });
      });

      describe('massInsert(records)', () => {
        describe('transacting()', () => {
          it('Should correctly commit', async () => {
            const trx = await transactionFunc();

            const sandbox = await sandboxFactory(process.env.APP_ADMIN_USER);
            const modelProxy = new ModelProxy(t.models.self, sandbox);
            const records = [{}];

            const resultB = await db.model(t.models.self);
            await modelProxy.massInsert(records).transacting(trx);
            await trx.commit();
            const resultA = await db.model(t.models.self);

            expect(resultA.length).toEqual(resultB.length + 1);
          });
          it('Should correctly rollback', async () => {
            const trx = await transactionFunc();

            const sandbox = await sandboxFactory(process.env.APP_ADMIN_USER);
            const modelProxy = new ModelProxy(t.models.self, sandbox);
            const records = [{}];

            const resultB = await db.model(t.models.self);
            await modelProxy.massInsert(records).transacting(trx);
            await trx.rollback();
            const resultA = await db.model(t.models.self);

            expect(resultA.length).toEqual(resultB.length);
          });
        });

        it('Should validate input', async () => {
          const result = t.modelProxy.massInsert();
          await expect(result).rejects.toMatchObject({ name: 'ParamsNotValidError', description: 'static.illegal_mass_insert_arguments' });
        });

        it('Should mass insert records', async () => {
          await db.model(t.models.self.alias).delete();

          const modelProxy = new ModelProxy(t.models.self, sandbox);
          const records = [{}, {}, {}];

          await modelProxy.massInsert(records);
          const result = await db.model(t.models.self);

          expect(result.length).toEqual(records.length);
          expect(every(result, { __inserted: true })).toEqual(true);
          expect(every(result, { created_by: sandbox.user.id })).toEqual(true);
          expect(every(result, ({ created_at }) => created_at !== null)).toEqual(true);

          await db.model(t.models.self.alias).delete();
        });
        it('Should correctly preprocess attributes [string as object]', async () => {
          const value = { key: 'value' };
          const alias = t.fields.self.string.alias;

          const modelProxy = new ModelProxy(t.models.self, sandbox);
          const records = [{ [alias]: value }];

          await modelProxy.massInsert(records);
          const result = await db.model(t.models.self);

          expect(result.length).toEqual(records.length);
          expect(result[0][alias]).toEqual(JSON.stringify(value));

          await db.model(t.models.self.alias).delete();
        });
        it('Should correctly preprocess attributes [string as array]', async () => {
          const value = [{ key: 'value' }];
          const alias = t.fields.self.string.alias;

          const modelProxy = new ModelProxy(t.models.self, sandbox);
          const records = [{ [alias]: value }];

          await modelProxy.massInsert(records);
          const result = await db.model(t.models.self);

          expect(result.length).toEqual(records.length);
          expect(result[0][alias]).toEqual(JSON.stringify(value));

          await db.model(t.models.self.alias).delete();
        });
        it('Should correctly preprocess attributes [empty strings]', async () => {
          const value = '';
          const alias = t.fields.self.string.alias;

          const modelProxy = new ModelProxy(t.models.self, sandbox);
          const records = [{ [alias]: value }];

          await modelProxy.massInsert(records);
          const result = await db.model(t.models.self);

          expect(result.length).toEqual(records.length);
          expect(result[0][alias]).toEqual(null);

          await db.model(t.models.self.alias).delete();
        });
        it('Should correctly preprocess attributes [datetime]', async () => {
          const value = new Date();
          const alias = t.fields.self.datetime.alias;

          const modelProxy = new ModelProxy(t.models.self, sandbox);
          const records = [{ [alias]: value }];

          await modelProxy.massInsert(records);
          const result = await db.model(t.models.self);

          expect(result.length).toEqual(records.length);
          expect(result[0][alias]).toEqual(value);

          await db.model(t.models.self.alias).delete();
        });
        it('Should correctly preprocess attributes [grc as number]', async () => {
          const value = 1;
          const alias = t.fields.self.grc.alias;

          const modelProxy = new ModelProxy(t.models.self, sandbox);
          const records = [{ [alias]: value }];

          await modelProxy.massInsert(records);
          const result = await db.model(t.models.self);

          expect(result.length).toEqual(records.length);
          expect(isNumber(result[0][alias])).toEqual(true);

          await db.model(t.models.self.alias).delete();
        });
        it('Should correctly preprocess attributes [rtl as array]', async () => {
          const value = [1];
          const alias = t.fields.self.rtl.alias;

          const modelProxy = new ModelProxy(t.models.self, sandbox);
          const records = [{ [alias]: value }];

          await modelProxy.massInsert(records);
          const result = await modelProxy.find().raw();

          expect(result.length).toEqual(records.length);
          expect(result[0][alias]).toEqual(value);

          await db.model(t.models.self.alias).delete();
        });
        it('Should correctly preprocess attributes [array string (ms)]', async () => {
          const value = ['one', 'two'];
          const alias = t.fields.self.array_string_ms.alias;

          const modelProxy = new ModelProxy(t.models.self, sandbox);
          const records = [{ [alias]: value }];

          await modelProxy.massInsert(records);
          const result = await db.model(t.models.self);

          expect(result.length).toEqual(records.length);
          expect(result[0][alias]).toEqual("'one','two'");

          await db.model(t.models.self.alias).delete();
        });
        it('Should be able to mass insert records with own defined created_at/created_by', async () => {
          const created_at = moment(NOW).add(1, 'day');
          const created_by = 2;

          const modelProxy = new ModelProxy(t.models.self, sandbox);
          const records = [
            { created_at, created_by },
            { created_at, created_by },
            { created_at, created_by },
          ];

          await modelProxy.massInsert(records);
          const result = await db.model(t.models.self);

          expect(result.length).toEqual(result.length);
          expect(every(result, { __inserted: true })).toEqual(true);
          expect(every(result, (r) => isEqual(moment(r.created_at).format(), created_at.format()))).toEqual(true);
          expect(every(result, { created_by })).toEqual(true);

          await db.model(t.models.self.alias).delete();
        });
      });

      describe('find()', () => {
        it('Should be properly executed', async () => {
          const args = [];

          jest.spyOn(QueryBuilder.prototype, 'find');

          await t.modelProxy.find(...args);

          expect(QueryBuilder.prototype.find).toBeCalledWith(...args);
        });

        it('Should return record with preloaded js-non-filtered rtl values', async () => {
          const foreignRecord1 = await manager(t.models.foreign.alias).create();
          const foreignRecord2 = await manager(t.models.foreign.alias).create();

          const value = [foreignRecord1.id, foreignRecord2.id];
          const field = await manager('field').create({
            type: 'reference_to_list',
            model: t.models.self.id,
            options: JSON.stringify({
              foreign_model: t.models.foreign.alias,
              foreign_label: 'id',
              filter: `"id" = 'js:${foreignRecord1.id}'`,
            }),
          });

          const selfRecord = await manager(t.models.self.alias).create({ [field.alias]: value });
          const modelProxy = new ModelProxy(t.models.self, sandbox);

          const result = await modelProxy.findOne({ id: selfRecord.id });
          expect(result.getValue(field.alias)).toEqual(value);
          await db.model(t.models.self.alias).delete();
        });

        describe('Cases with setOptions', () => {
          it('Should not select not inserted records by default', async () => {
            await t.modelProxy.build();
            const result = await t.modelProxy.find();

            expect(result.length).toEqual(0);
          });
          it('Should select not inserted records when { includeNotInsertedRecords: true }', async () => {
            t.modelProxy.setOptions({ includeNotInsertedRecords: true });
            const result = await t.modelProxy.find();

            expect(result.length).toEqual(1);
          });
          it('Should select not inserted records when { includeNotInsertedRecords: true }, check_permission: { all: false }', async () => {
            t.modelProxy.setOptions({ includeNotInsertedRecords: true, check_permission: { all: false } });
            const result = await t.modelProxy.find();

            expect(result.length).toEqual(1);
          });
          it('Should not select not inserted records when { includeNotInsertedRecords: false, check_permission: { all: false } }', async () => {
            t.modelProxy.setOptions({ includeNotInsertedRecords: false, check_permission: { all: false } });
            const result = await t.modelProxy.find();

            expect(result.length).toEqual(0);
          });
          it('Should not select not inserted records when { includeNotInsertedRecords: false, check_permission: { all: true } }', async () => {
            t.modelProxy.setOptions({ includeNotInsertedRecords: false, check_permission: { all: true } });
            const result = await t.modelProxy.find();

            expect(result.length).toEqual(0);

            await db.model(t.models.self.alias).delete();
            t.modelProxy.setOptions({});
          });
        });
      });

      describe('findOne(params)', () => {
        it('Should be properly executed', async () => {
          const params = {};

          jest.spyOn(ModelProxy.prototype, 'find');
          jest.spyOn(QueryBuilder.prototype, 'findOne');

          await t.modelProxy.findOne(params);

          expect(ModelProxy.prototype.find).toBeCalledWith(params);
          expect(QueryBuilder.prototype.findOne).toBeCalled();
        });
      });

      describe('orFind(...)', () => {
        it('Should be properly executed', async () => {
          const args = [];

          jest.spyOn(QueryBuilder.prototype, 'orFind');

          await t.modelProxy.orFind(...args);

          expect(QueryBuilder.prototype.orFind).toBeCalledWith(...args);
        });
      });

      describe('join(...)', () => {
        it('Should be properly executed', async () => {
          const args = [t.models.foreign.alias, 'id', t.models.self.alias, 'id'];

          jest.spyOn(QueryBuilder.prototype, 'join');

          await t.modelProxy.join(...args);

          expect(QueryBuilder.prototype.join).toBeCalledWith(...args);
        });
      });

      describe('order(...)', () => {
        it('Should be properly executed', async () => {
          const args = [];

          jest.spyOn(QueryBuilder.prototype, 'order');

          await t.modelProxy.order(...args);

          expect(QueryBuilder.prototype.order).toBeCalledWith(...args);
        });
      });

      describe('limit(...)', () => {
        it('Should be properly executed', async () => {
          const args = [];

          jest.spyOn(QueryBuilder.prototype, 'limit');

          await t.modelProxy.limit(...args);

          expect(QueryBuilder.prototype.limit).toBeCalledWith(...args);
        });
      });

      describe('count(...)', () => {
        it('Should be properly executed', async () => {
          const args = [];

          jest.spyOn(QueryBuilder.prototype, 'count');

          await t.modelProxy.count(...args);

          expect(QueryBuilder.prototype.count).toBeCalledWith(...args);
        });
      });

      describe('records()', () => {
        it('Should return wrapped records', async () => {
          await manager(t.models.self.alias).create();
          const [ record ] = await t.modelProxy.records();

          expect(record).toBeInstanceOf(RecordProxy);
          await db.model(t.models.self.alias).delete();
        });
      });
    });
  });
});
