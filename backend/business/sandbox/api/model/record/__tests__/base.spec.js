import moment from 'moment';
import Promise from 'bluebird';
import { omit } from 'lodash-es';

import Flags from '../../../../../record/flags.js';
import ModelProxy, { wrapRecord } from '../../index.js';
import FieldProxy from '../field.js';
import RecordProxy from '../index.js';
import RecordManager from '../../../../../record/manager/index.js';
import { extendUser } from '../../../../../user/index.js';
import { cleanupAttributes } from '../../../../../helpers/index.js';
import * as RecordManagerFactory from '../../../../../record/manager/factory.js';

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
      }),
      rtl: await manager('field').create({
        type: 'reference_to_list',
        model: t.models.self.id,
        options: JSON.stringify({
          foreign_model: t.models.foreign.alias,
          foreign_label: 'id',
        }),
      }),
      rtl_filtered: await manager('field').create({
        type: 'reference_to_list',
        model: t.models.self.id,
        options: JSON.stringify({
          foreign_model: t.models.foreign.alias,
          foreign_label: 'id',
          filter: 'id = 100',
        }),
      }),
      global_reference: await manager('field').create({
        type: 'global_reference',
        model: t.models.self.id,
        options: JSON.stringify({
          references: [
            {
              model: t.models.foreign.alias,
              view: 'default',
            }
          ]
        }),
      }),
    },
    result: {
      string: await manager('field').create({
        type: 'string',
        model: t.models.result.id,
      }),
    }
  };
  t.records = {
    self: [
      await manager(t.models.self.alias).create(),
    ],
    foreign: [
      await manager(t.models.foreign.alias).create(),
      await manager(t.models.foreign.alias).create(),
    ],
    result: [
      await manager(t.models.result.alias).create(),
    ],
  }
  t.db_rules = {
    self: [
      await manager('db_rule').create({
        model: t.models.self.id,
        when_perform: 'before',
        on_update: true,
        script: `const value = lodash.reduce({
  string: {
    prev: p.record.getPrevValue('${t.fields.self.string.alias}'),
    curr: p.record.getValue('${t.fields.self.string.alias}'),
  },
  rtl: {
    prev: p.record.getPrevValue('${t.fields.self.rtl.alias}'),
    curr: p.record.getValue('${t.fields.self.rtl.alias}'),
  },
  global_reference: {
    prev: p.record.getPrevValue('${t.fields.self.global_reference.alias}'),
    curr: p.record.getValue('${t.fields.self.global_reference.alias}'),
  },
}, (result, field, alias) => {
  if (['string', 'global_reference'].includes(alias)) {
    if (field.prev && field.curr) result[alias] = field;
  }

  if (alias === 'rtl') {
    if (field.prev.length && field.curr.length) result[alias] = field;
  }

  return result;
}, {});

const model = await p.getModel(\`${t.models.result.alias}\`);
const record = await model.findOne({ id: 1 });

await record.update({ ['${t.fields.result.string.alias}']: JSON.stringify(value) });`
      }),
    ],
  };

  const attributes = {
    __previousAttributes: {},
    __previousHumanizedAttributes: {},
    __j_attributes: {},
  };

  await extendUser(sandbox.user);

  t.record = { ...t.records.self[0], ...attributes };
  t.recordProxy = new RecordProxy(t.record, t.models.self, sandbox);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('RecordProxy', () => {
  describe('constructor(...)', () => {
    describe('attributes', () => {
      it('Should have previousAttributes', () => {
        expect(t.recordProxy.previousAttributes).toEqual(t.record.__previousAttributes);
      });

      it('Should have previousHumanizedAttributes', () => {
        expect(t.recordProxy.previousHumanizedAttributes).toEqual(t.record.__previousHumanizedAttributes);
      });

      it('Should have joinedAttributes', () => {
        expect(t.recordProxy.joinedAttributes).toEqual({ __j_attributes: {} });
      });

      it('Should have humanizedAttributes', () => {
        expect(t.recordProxy.humanizedAttributes).toEqual({});
      });

      it('Should have templateAttributes', () => {
        expect(t.recordProxy.templateAttributes).toEqual({});
      });

      it('Should have extraAttributes', () => {
        expect(t.recordProxy.extraAttributes).toEqual({});
      });
    });

    describe('record', () => {
      it('Should have originalRecord', () => {
        expect(t.recordProxy.originalRecord).toBeDefined();
      });

      it('Should have record', () => {
        expect(t.recordProxy.record).toEqual(t.recordProxy.originalRecord);
      });
    });

    describe('context', () => {
      it('Should have model', () => {
        expect(t.recordProxy.model).toEqual(t.models.self);
      });

      it('Should have templates', () => {
        expect(t.recordProxy.templates).toEqual({});
      });

      it('Should have __changedAttributes', () => {
        expect(t.recordProxy.__changedAttributes).toEqual({});
      });

      it('Should have __dynamicFieldsOptions', () => {
        expect(t.recordProxy.__dynamicFieldsOptions).toEqual({});
      });
    });
  });

  describe('get id()', () => {
    it('Should return record id', () => {
      expect(t.recordProxy.id).toEqual(t.record.id);
    });
  });

  describe('get attributes()', () => {
    it('Should return record attributes', () => {
      const result = t.recordProxy.attributes;
      const expected = cleanupAttributes(t.recordProxy.record);

      expect(result).toEqual(expected);
    });
  });

  describe('get changedAttributes()', () => {
    it('Should return record changed attributes', () => {
      t.recordProxy.setValue('__name', 'name changed');

      const result = t.recordProxy.changedAttributes;
      const expected = cleanupAttributes(t.recordProxy.__changedAttributes);

      expect(result).toEqual(expected);

      t.recordProxy.setValue('__name', t.recordProxy.getPrevValue('__name'));
    });
  });

  describe('get flags()', () => {
    it('Should return model proxy flags if internal flags are not present', () => {
      expect(t.recordProxy.flags).not.toEqual(t.recordProxy.__flags);
      expect(t.recordProxy.flags).toEqual(t.recordProxy.proxyModel.flags);
    });
    it('Should return internal flags if present', () => {
      t.recordProxy.setFlags(new Flags({ test: 'test' }));

      expect(t.recordProxy.flags).toEqual(t.recordProxy.__flags);
      expect(t.recordProxy.flags).not.toEqual(t.recordProxy.proxyModel.flags);

      t.recordProxy.__flags = undefined;
    });
  });

  describe('get fields()', () => {
    it('Should return fields if present', () => {
      const fields = [{ alias: 'test' }];

      expect(t.recordProxy.fields).toEqual([]);
      t.recordProxy.setFields(fields);
      expect(t.recordProxy.fields).toEqual(fields);
      t.recordProxy.setFields([]);
    });
  });

  describe('get recordManager()', () => {
    it('Should set record manager', () => {
      jest.spyOn(RecordManagerFactory, 'createManager');
      const recordManager = t.recordProxy.recordManager;
      expect(RecordManagerFactory.createManager).toBeCalled();
    });
    it('Should set record manager dynamic fields options', () => {
      jest.spyOn(RecordManager.prototype, 'setDynamicFieldsOptions');
      const recordManager = t.recordProxy.recordManager;
      expect(RecordManager.prototype.setDynamicFieldsOptions).toBeCalledWith(t.recordProxy.__dynamicFieldsOptions);
    });
    it('Should return record manager', () => {
      const recordManager = t.recordProxy.recordManager;
      expect(recordManager).toBeInstanceOf(RecordManager);
    });
  });

  describe('getModel()', () => {
    it('Should return model proxy', () => {
      const modelProxy = t.recordProxy.getModel();
      expect(modelProxy).toBeInstanceOf(ModelProxy);
    });
  });

  describe('getField(fieldAlias)', () => {
    it('Should return undefined if field is not present', () => {
      const fieldProxy = t.recordProxy.getField('alias');
      expect(fieldProxy).not.toBeDefined();
    });
    it('Should return field proxy if field is present', async () => {
      const fields = [{ alias: 'created_by', type: 'reference' }];
      t.recordProxy.setFields(fields);

      const fieldProxy = t.recordProxy.getField('created_by');
      expect(fieldProxy).toBeInstanceOf(FieldProxy);
      expect(fieldProxy.getValue()).toEqual(sandbox.user.id);

      t.recordProxy.setFields([]);
    });
  });

  describe('assignAttributes(attributes)', () => {
    it('Should validate input', () => {
      let result;

      result = () => t.recordProxy.assignAttributes();
      expect(result).toThrow();

      result = () => t.recordProxy.assignAttributes({});
      expect(result).not.toThrow();
    });
    it('Should return field proxy if field presents', async () => {
      const attributes = {
        name: 'test',
        __humanizedAttributes: { name: 'test' },
        __templateAttributes: { name: 'test' },
        __extraAttributes: { name: 'test' },
      };

      t.recordProxy.assignAttributes(attributes);

      expect(t.recordProxy.humanizedAttributes).toEqual({ ...t.recordProxy.humanizedAttributes, ...attributes.__humanizedAttributes });
      expect(t.recordProxy.templateAttributes).toEqual({ ...t.recordProxy.templateAttributes, ...attributes.__templateAttributes });
      expect(t.recordProxy.extraAttributes).toEqual({ ...t.recordProxy.extraAttributes, ...attributes.__extraAttributes });

      expect(t.recordProxy.__changedAttributes).toEqual({ ...t.recordProxy.__changedAttributes, ...t.recordProxy.__newAttributes });
      expect(t.recordProxy.record).toEqual({ ...t.recordProxy.record, ...t.recordProxy.__newAttributes });

      t.recordProxy = new RecordProxy(t.record, t.models.self, sandbox);
    });
    it('Should not change updated_at if the corresponding flag is present', () => {
      t.recordProxy.setFlags(new Flags({ ex_save: { updateDateTimeFields: false } }));
      t.recordProxy.assignAttributes({ updated_at: new Date() });

      expect(t.recordProxy.record.updated_at).toEqual(t.recordProxy.previousAttributes.updated_at);
      t.recordProxy = new RecordProxy(t.record, t.models.self, sandbox);
    });
  });

  describe('resetChangedAttributes()', () => {
    it('Should reset changed attributes', () => {
      t.recordProxy.__changedAttributes = { test: 'test' };
      t.recordProxy.resetChangedAttributes();
      expect(t.recordProxy.__changedAttributes).toEqual({});
    });
  });

  describe('validate()', () => {
    it('Should validate record', async () => {
      jest.spyOn(RecordManager.prototype, 'validate');
      await t.recordProxy.validate();
      expect(RecordManager.prototype.validate).toBeCalledWith(t.recordProxy.record, true);
    });
  });

  describe('save(options)', () => {
    it('Should update record if it has id', async () => {
      jest.spyOn(RecordManager.prototype, 'update');
      await t.recordProxy.save();
      expect(RecordManager.prototype.update).toBeCalledWith(t.recordProxy.originalRecord, { ...omit(t.recordProxy.record, ['id']), __humanizedAttributes: t.recordProxy.humanizedAttributes }, t.recordProxy.flags);
    });
    it('Should create record if it does not have id', async () => {
      jest.spyOn(RecordManager.prototype, 'create');

      const record = manager(t.models.self.alias).build();
      const recordProxy = new RecordProxy(record, t.models.self, sandbox);
      await recordProxy.save();

      expect(RecordManager.prototype.create).toBeCalledWith({ ...omit(recordProxy.record, ['id']), __humanizedAttributes: recordProxy.humanizedAttributes }, recordProxy.flags);
    });
    it('Should set system actions if they are present as option', async () => {
      jest.spyOn(RecordManager.prototype, 'setSystemActions');

      const options = { systemActions: {} };
      await t.recordProxy.save(options);

      expect(RecordManager.prototype.setSystemActions).toBeCalledWith(options.systemActions);
    });
    it('Should save templates', async () => {
      jest.spyOn(RecordProxy.prototype, 'saveTemplates');
      await t.recordProxy.save();
      expect(RecordProxy.prototype.saveTemplates).toBeCalled();
    });
    it('Should reset changed attributes', async () => {
      jest.spyOn(RecordProxy.prototype, 'resetChangedAttributes');
      await t.recordProxy.save();
      expect(RecordProxy.prototype.resetChangedAttributes).toBeCalled();
    });
    it('Should return record proxy instance of saved record', async () => {
      const result = await t.recordProxy.save();
      expect(result).toBeInstanceOf(RecordProxy);
    });
  });

  describe('saveTemplate(alias)', () => {
    it('Should save template with alias', async () => {
      const template = await manager(t.models.self.alias).build();
      const templateAttributes = {};
      const templateRecordProxy = new RecordProxy(template, t.models.self, sandbox);

      jest.spyOn(templateRecordProxy, 'update');

      t.recordProxy.templateAttributes['test'] = templateAttributes;
      t.recordProxy.templates['test'] = templateRecordProxy;

      await t.recordProxy.saveTemplate('test');

      expect(templateRecordProxy.update).toBeCalledWith(templateAttributes);

      t.recordProxy.templateAttributes = {};
      t.recordProxy.templates = {};
    });
    it('Should return record proxy instance of template', async () => {
      const template = await manager(t.models.self.alias).build();
      const templateAttributes = {};
      const templateRecordProxy = new RecordProxy(template, t.models.self, sandbox);

      t.recordProxy.templateAttributes['test'] = templateAttributes;
      t.recordProxy.templates['test'] = templateRecordProxy;

      const result = await t.recordProxy.saveTemplate('test');

      expect(result).toBeInstanceOf(RecordProxy);

      t.recordProxy.templateAttributes = {};
      t.recordProxy.templates = {};
    });
  });

  describe('saveTemplates()', () => {
    it('Should save record templates', async () => {
      jest.spyOn(RecordProxy.prototype, 'saveTemplate');

      t.recordProxy.templates = { template1: { update: jest.fn() }, template2: { update: jest.fn() } };
      t.recordProxy.templateAttributes = { template1: {}, template2: {} };
      await t.recordProxy.saveTemplates();
      t.recordProxy.templates = {};
      t.recordProxy.templateAttributes = {};

      expect(RecordProxy.prototype.saveTemplate).toBeCalledWith('template1');
      expect(RecordProxy.prototype.saveTemplate).toBeCalledWith('template2');
    });
  });

  describe('update(attributes, options)', () => {
    it('Should validate input', () => {
      let result;

      result = () => t.recordProxy.update();
      expect(result).toThrow();

      result = () => t.recordProxy.update({});
      expect(result).not.toThrow();
    });
    it('Should update record', async () => {
      jest.spyOn(RecordProxy.prototype, 'assignAttributes');
      jest.spyOn(RecordProxy.prototype, 'save');

      const attributes = {};
      const options = {};

      await t.recordProxy.update(attributes, options);

      expect(RecordProxy.prototype.assignAttributes).toBeCalledWith(attributes);
      expect(RecordProxy.prototype.save).toBeCalledWith(options);
    });
    it('Should return record proxy instance of updated record', async () => {
      const result = await t.recordProxy.update({});

      expect(result).toBeInstanceOf(RecordProxy);
    });

    it('Should automatically assign updated_at/updated_by', async () => {
      const fieldAlias = t.fields.self.string.alias;

      const { id } = await manager(t.models.self.alias).create();
      const record = await db.model(t.models.self.alias).where({ id }).getOne();
      const recordProxy = new RecordProxy(record, t.models.self, sandbox);

      await recordProxy.update({ [fieldAlias]: 'test' });
      const result1 = await db.model(t.models.self.alias).where({ id }).getOne();

      await new Promise((resolve) => setTimeout(resolve, 100));

      await recordProxy.update({ [fieldAlias]: 'test' });
      const result2 = await db.model(t.models.self.alias).where({ id }).getOne();

      expect(result1.updated_at).toBeDefined();
      expect(result1.updated_by).toEqual(sandbox.user.id);

      expect(result2.updated_at).toBeDefined();
      expect(result2.updated_by).toEqual(sandbox.user.id);

      expect(result1.updated_at).not.toEqual(result2.updated_at);
    });

    it('Should be able to update record with own defined updated_at/updated_by', async () => {
      const updated_at = moment(NOW).add(1, 'day');
      const updated_by = 2;

      const { id } = await manager(t.models.self.alias).create();
      const record = await db.model(t.models.self.alias).where({ id }).getOne();
      const recordProxy = new RecordProxy(record, t.models.self, sandbox);

      await recordProxy.update({ updated_at, updated_by });

      const result = await db.model(t.models.self.alias).where({ id }).getOne();

      expect(moment(result.updated_at).format()).toEqual(updated_at.format());
      expect(result.updated_by).toEqual(updated_by);
    });
  });

  describe('delete()', () => {
    it('Should delete record', async () => {
      const record = await manager(t.models.self.alias).create();
      const model = db.getModel(t.models.self.alias);

      const recordProxy = new RecordProxy(record, model, sandbox)

      jest.spyOn(RecordManager.prototype, 'destroy');

      const result = await recordProxy.delete();

      expect(RecordManager.prototype.destroy).toBeCalledWith(recordProxy.record, recordProxy.flags);
    });
    it('Should return record proxy instance of deleted record', async () => {
      const record = await manager(t.models.self.alias).create();
      const model = db.getModel(t.models.self.alias);

      const recordProxy = new RecordProxy(record, model, sandbox)
      const result = await recordProxy.delete();

      expect(result).toBeInstanceOf(RecordProxy);
    });
  });

  describe('getValue(fieldAlias, model)', () => {
    it('Should validate input', () => {
      let result;

      result = () => t.recordProxy.getValue('', 'string');
      expect(result).toThrow();

      result = () => t.recordProxy.getValue('', {});
      expect(result).not.toThrow();
    });
    it('Should return record value if model param is not present', () => {
      const fieldAlias = 'alias';

      const result = t.recordProxy.getValue(fieldAlias);
      const expected = t.recordProxy.record[fieldAlias];

      expect(result).toEqual(expected);
    });
    it('Should return record value if model param is the parent model', () => {
      const fieldAlias = 'alias';

      const result = t.recordProxy.getValue(fieldAlias, t.model);
      const expected = t.recordProxy.record[fieldAlias];

      expect(result).toEqual(expected);
    });
    it('Should return joined record value if model param is not the parent model', () => {
      const fieldAlias = 'alias';
      const model = { id: 2 };

      t.recordProxy.joinedAttributes[`__j_${model.id}_${fieldAlias}`] = {};

      const result = t.recordProxy.getValue(fieldAlias, model);
      const expected = t.recordProxy.joinedAttributes[`__j_${model.id}_${fieldAlias}`];

      expect(result).toEqual(expected);

      t.recordProxy.joinedAttributes = {};
    });
    it('Should not filter rtl values by field filter', async () => {
      const fieldAlias = t.fields.self.rtl_filtered.alias;
      const value = [1];

      const record = omit(await manager(t.models.self.alias).create({ [fieldAlias]: value }), [fieldAlias]);
      const model = db.getModel(t.models.self.alias);

      const modelProxy = new ModelProxy(t.models.self, sandbox);
      const recordProxy = await wrapRecord(modelProxy)(record);

      const result = recordProxy.getValue(fieldAlias);
      const expected = value;

      expect(result).toEqual(expected);
    });
    it('Should return undefined if no field', async () => {
      const result = t.recordProxy.getValue('no_field');
      const expected = undefined;

      expect(result).toEqual(expected);
    });
  });

  describe('getPrevValue(fieldAlias)', () => {
    describe('Common', () => {
      it('Should return record value if it is present', () => {
        const fieldAlias = 'test';

        t.recordProxy.record[fieldAlias] = 'test';

        const result = t.recordProxy.getPrevValue(fieldAlias);
        const expected = t.recordProxy.record[fieldAlias];

        expect(result).toEqual(expected);

        delete t.recordProxy.record[fieldAlias];
      });
      it('Should return record previous value if it is present', () => {
        const fieldAlias = 'alias';

        const result = t.recordProxy.getPrevValue(fieldAlias);
        const expected = t.recordProxy.originalRecord[fieldAlias];

        expect(result).toEqual(expected);
      });
      it('Should return undefined if no field', async () => {
        const result = t.recordProxy.getPrevValue('no_field');
        const expected = undefined;

        expect(result).toEqual(expected);
      });
    });

    describe('Fields', () => {
      describe('String', () => {
        it('Should return previous value', async () => {
          const fieldAlias = t.fields.self.string.alias;

          const prev = 'prev';
          const curr = 'curr';
          const { id } = await manager(t.models.self.alias).create({ [fieldAlias]: prev });
          const record = await db.model(t.models.self.alias).where({ id }).getOne();
          const recordProxy = new RecordProxy(record, t.models.self, sandbox);

          expect(recordProxy.getPrevValue(fieldAlias)).toEqual(prev);
          expect(recordProxy.getValue(fieldAlias)).toEqual(prev);

          recordProxy.assignAttributes({ [fieldAlias]: curr });

          expect(recordProxy.getPrevValue(fieldAlias)).toEqual(prev);
          expect(recordProxy.getValue(fieldAlias)).toEqual(curr);
        });
        it('Should return previous value in context of before update db rule', async () => {
          const fieldAlias = t.fields.self.string.alias;

          const prev = 'prev';
          const curr = 'curr';
          const { id } = await manager(t.models.self.alias).create({ [fieldAlias]: prev });
          const record = await db.model(t.models.self.alias).where({ id }).getOne();
          const recordProxy = new RecordProxy(record, t.models.self, sandbox);

          await recordProxy.update({ [fieldAlias]: curr });
          const result = await db.model(t.models.result.alias).where({ id: 1 }).getOne();
          const expected = JSON.stringify({ string: { prev, curr } });

          expect(result[t.fields.result.string.alias]).toEqual(expected);
        });
      });

      describe('Reference to list', () => {
        it('Should not return values if not preloaded', async () => {
          const fieldAlias = t.fields.self.rtl.alias;

          const prev = [1];
          const curr = [1, 2];
          const { id } = await manager(t.models.self.alias).create({ [fieldAlias]: prev });
          const record = await db.model(t.models.self.alias).where({ id }).getOne();
          const recordProxy = new RecordProxy(record, t.models.self, sandbox);

          expect(recordProxy.getPrevValue(fieldAlias)).not.toBeDefined();
          expect(recordProxy.getValue(fieldAlias)).not.toBeDefined();

          recordProxy.assignAttributes({ [fieldAlias]: curr });

          expect(recordProxy.getPrevValue(fieldAlias)).toEqual(curr);
          expect(recordProxy.getValue(fieldAlias)).toEqual(curr);
        });
        it('Should return values if preloaded', async () => {
          const fieldAlias = t.fields.self.rtl.alias;

          const prev = [1];
          const curr = [1, 2];
          const record = await manager(t.models.self.alias).create({ [fieldAlias]: prev });
          const recordProxy = new RecordProxy(record, t.models.self, sandbox);

          expect(recordProxy.getPrevValue(fieldAlias)).toEqual(prev);
          expect(recordProxy.getValue(fieldAlias)).toEqual(prev);

          recordProxy.assignAttributes({ [fieldAlias]: curr });

          expect(recordProxy.getPrevValue(fieldAlias)).toEqual(prev);
          expect(recordProxy.getValue(fieldAlias)).toEqual(curr);
        });
        it('Should return previous value in context of before update db rule', async () => {
          const fieldAlias = t.fields.self.rtl.alias;

          const prev = [1];
          const curr = [1, 2];
          const { id } = await manager(t.models.self.alias).create({ [fieldAlias]: prev });
          const record = await db.model(t.models.self.alias).where({ id }).getOne();
          const recordProxy = new RecordProxy(record, t.models.self, sandbox);

          await recordProxy.update({ [fieldAlias]: curr });
          const result = await db.model(t.models.result.alias).where({ id: 1 }).getOne();
          const expected = JSON.stringify({ rtl: { prev, curr } });

          expect(result[t.fields.result.string.alias]).toEqual(expected);
        });
      });

      describe('Global reference', () => {
        it('Should be changed if value is not null', async () => {
          const fieldAlias = t.fields.self.global_reference.alias;

          const prev = t.records.foreign[0];
          const curr = t.records.foreign[1];
          const { id } = await manager(t.models.self.alias).create({ [fieldAlias]: prev });
          const record = await db.model(t.models.self.alias).where({ id }).getOne();
          const recordProxy = new RecordProxy(record, t.models.self, sandbox);

          const prevCross = await db.model('global_references_cross').where({
            target_model: t.models.foreign.id,
            target_record_id: prev.id,
            source_field: t.fields.self.global_reference.id,
            source_record_id: record.id,
          }).getOne();

          expect(recordProxy.getPrevValue(fieldAlias)).toEqual(prevCross.id);
          expect(recordProxy.getValue(fieldAlias)).toEqual(prevCross.id);

          recordProxy.assignAttributes({ [fieldAlias]: curr });

          expect(recordProxy.getPrevValue(fieldAlias)).toEqual(prevCross.id);
          expect(recordProxy.getValue(fieldAlias)).toEqual(curr);
        });
        it('Should not be changed if value is null', async () => {
          const fieldAlias = t.fields.self.global_reference.alias;

          const prev = null;
          const curr = null;
          const { id } = await manager(t.models.self.alias).create({ [fieldAlias]: prev });
          const record = await db.model(t.models.self.alias).where({ id }).getOne();
          const recordProxy = new RecordProxy(record, t.models.self, sandbox);

          expect(recordProxy.getPrevValue(fieldAlias)).toEqual(prev);
          expect(recordProxy.getValue(fieldAlias)).toEqual(prev);

          recordProxy.assignAttributes({ [fieldAlias]: curr });

          expect(recordProxy.getPrevValue(fieldAlias)).toEqual(prev);
          expect(recordProxy.getValue(fieldAlias)).toEqual(curr);
        });
      });
    });
  });

  describe('getPrevVisibleValue(fieldAlias)', () => {
    it('Should return empty string if nothing present', () => {
      const fields = [{ alias: 'string' }];
      t.recordProxy.setFields(fields);

      const fieldAlias = 'string';

      const result = t.recordProxy.getPrevVisibleValue(fieldAlias);
      const expected = '';

      expect(result).toEqual(expected);
    });
    it('Should return record value if it is present', () => {
      const fieldAlias = 'string';

      t.recordProxy.record[fieldAlias] = 'test';

      const result = t.recordProxy.getPrevVisibleValue(fieldAlias);
      const expected = t.recordProxy.record[fieldAlias];

      expect(result).toEqual(expected);

      delete t.recordProxy.record[fieldAlias];
    });
    it('Should return record visible value if it is present', () => {
      const fieldAlias = 'string';

      t.recordProxy.humanizedAttributes[fieldAlias] = 'string';

      const result = t.recordProxy.getVisibleValue(fieldAlias);
      const expected = t.recordProxy.humanizedAttributes[fieldAlias];

      expect(result).toEqual(expected);
    });
    it('Should return record previous value if it is present', () => {
      const fieldAlias = 'string';

      const result = t.recordProxy.getPrevValue(fieldAlias);
      const expected = t.recordProxy.originalRecord[fieldAlias];

      expect(result).toEqual(expected);
    });
    it('Should return record previous visible value if it is present', () => {
      const fieldAlias = 'string';

      t.recordProxy.previousHumanizedAttributes[fieldAlias] = 'previous_string';

      const result = t.recordProxy.getPrevVisibleValue(fieldAlias);
      const expected = t.recordProxy.previousHumanizedAttributes[fieldAlias];

      expect(result).toEqual(expected);

      t.recordProxy.humanizedAttributes = {};
      t.recordProxy.previousHumanizedAttributes = {};

      t.recordProxy.setFields([]);
    });
    it('Should return undefined if no field', async () => {
      const result = t.recordProxy.getPrevVisibleValue('no_field');
      const expected = undefined;

      expect(result).toEqual(expected);
    });
  });

  describe('getVisibleValue(fieldAlias)', () => {
    describe('Common', () => {
      it('Should return empty string if nothing present', () => {
        const fields = [{ alias: 'string' }];
        t.recordProxy.setFields(fields);

        const fieldAlias = 'string';

        const result = t.recordProxy.getVisibleValue(fieldAlias);
        const expected = '';

        expect(result).toEqual(expected);
      });
      it('Should return record value if it is present', () => {
        const fieldAlias = 'string';

        t.recordProxy.setValue('string', 'string');

        const result = t.recordProxy.getVisibleValue(fieldAlias);
        const expected = t.recordProxy.record[fieldAlias];

        expect(result).toEqual(expected);
      });
      it('Should return record visible value if it is present', () => {
        const fieldAlias = 'string';

        t.recordProxy.humanizedAttributes[fieldAlias] = 'string';

        const result = t.recordProxy.getVisibleValue(fieldAlias);
        const expected = t.recordProxy.humanizedAttributes[fieldAlias];

        expect(result).toEqual(expected);

        t.recordProxy.humanizedAttributes = {};
        t.recordProxy.setFields([]);
      });
      it('Should return undefined if no field', async () => {
        const result = t.recordProxy.getVisibleValue('no_field');
        const expected = undefined;

        expect(result).toEqual(expected);
      });
    });

    describe('Fields', () => {
      describe('Global reference', () => {
        it('Should return visible value', async () => {
          const fieldAlias = t.fields.self.global_reference.alias;
          const modelProxy = new ModelProxy(t.models.self, sandbox);
          const recordProxy = await modelProxy.insert({ [fieldAlias]: t.records.foreign[0] });

          await recordProxy.preloadData();

          expect(recordProxy.getVisibleValue(fieldAlias)).toEqual(`${t.models.foreign.id}/${t.records.foreign[0].id}`);
        });
      });
    });
  });

  describe('getTValue(fieldAlias)', () => {
    it('Should return record template by field alias', () => {
      const fieldAlias = 'test';
      const template = {};

      t.recordProxy.templates[fieldAlias] = template

      const result = t.recordProxy.getTValue(fieldAlias);
      const expected = template;

      expect(result).toEqual(expected);

      t.recordProxy.templates = {};
    });
  })

  describe('setValue(fieldAlias, value)', () => {
    it('Should set record value', () => {
      const fieldAlias = 'test';
      const value = 'test';

      t.recordProxy.setValue(fieldAlias, value);

      const result = t.recordProxy.record[fieldAlias];
      const expected = value;

      expect(result).toEqual(expected);
    });
    it('Should set stringified record value if input is object', () => {
      const fieldAlias = 'test';
      const value = {};

      t.recordProxy.setValue(fieldAlias, value);

      const result = t.recordProxy.record[fieldAlias];
      const expected = JSON.stringify(value);

      expect(result).toEqual(expected);
    });
    it('Should set __changedAttributes value', () => {
      const fieldAlias = 'test';
      const value = 'test';

      t.recordProxy.setValue(fieldAlias, value);

      const result = t.recordProxy.__changedAttributes[fieldAlias];
      const expected = value;

      expect(result).toEqual(expected);
    });
    it('Should return true', () => {
      const fieldAlias = 'test';
      const value = 'test';

      const result = t.recordProxy.setValue(fieldAlias, value);
      const expected = true;

      expect(result).toEqual(expected);

      delete t.recordProxy.record[fieldAlias];
      delete t.recordProxy.__changedAttributes[fieldAlias];
    });
    it('Should return false if no field', () => {
      const result = t.recordProxy.setValue('no_field');
      const expected = false;

      expect(result).toEqual(expected);
    });
  });

  describe('setFlags(flags)', () => {
    it('Should not set flags if param is not present', () => {
      t.recordProxy.setFlags();

      expect(t.recordProxy.__flags).not.toBeDefined();
      expect(t.recordProxy.flags).toEqual(t.recordProxy.proxyModel.flags);
    });
    it('Should set flags if param is present', () => {
      const flags = new Flags({ test: 'test' });
      t.recordProxy.setFlags(flags);
      expect(t.recordProxy.flags).toEqual(flags);
      t.recordProxy.__flags = undefined;
    });
  });

  describe('setFields(fields)', () => {
    it('Should set fields if param is present', () => {
      const fields = [{ test: 'test' }];
      t.recordProxy.setFields(fields);
      expect(t.recordProxy.fields).toEqual(fields);
      t.recordProxy.setFields([]);
    });
  });

  describe('setOptions(options)', () => {
    it('Should not set options if param is not present', () => {
      expect(t.recordProxy.setOptions).toThrow();
    });
    it('Should set options if param is present', () => {
      const options = { check_permission: { all: false } };
      t.recordProxy.setOptions(options);
      expect(t.recordProxy.flags.flags).toMatchObject(options);
      t.recordProxy.__flags = undefined;
    });
  });

  describe('setFieldOptions(fieldAlias, options)', () => {
    it('Should not set field options if field is not present', () => {
      t.recordProxy.setFieldOptions('test', {});

      expect(t.recordProxy.__dynamicFieldsOptions['test']).not.toBeDefined();
    });
    it('Should not set field options if options are not present', () => {
      t.recordProxy.setFieldOptions('alias');

      expect(t.recordProxy.__dynamicFieldsOptions['alias']).not.toBeDefined();
    });
    it('Should set field options if field and options are present', () => {
      t.recordProxy.setFields([{ alias: 'alias' }]);
      t.recordProxy.setFieldOptions('alias', { test: 'test' });

      expect(t.recordProxy.__dynamicFieldsOptions['alias']).toEqual({ test: 'test' });

      t.recordProxy.__dynamicFieldsOptions = {};
      t.recordProxy.setFields([]);
    });
  });

  describe('isPersisted()', () => {
    it('Should check if record is inserted', () => {
      const result = t.recordProxy.isPersisted();
      const expected = t.recordProxy.record.__inserted;

      expect(result).toEqual(expected);
    });
  });

  describe('isValid()', () => {
    it('Should check if record is valid', async () => {
      jest.spyOn(RecordManager.prototype, 'validate');
      await t.recordProxy.isValid();
      expect(RecordManager.prototype.validate).toBeCalledWith(t.recordProxy.record, false);
    });
  });

  describe('isChanged(input)', () => {
    it('Should be false if nothing changed', () => {
      t.recordProxy = new RecordProxy(t.records.self[0], t.models.self, sandbox);

      const result = t.recordProxy.isChanged();
      const expected = false;

      expect(result).toEqual(expected);
    });

    it('Should be true if attribute was changed', () => {
      t.recordProxy.setValue('string', 'string changed');

      const result = t.recordProxy.isChanged();
      const expected = true;

      expect(result).toEqual(expected);

      t.recordProxy.setValue('string', t.recordProxy.getPrevValue('string'));
    });

    it('Should check that certain attribute was changed or not', () => {
      t.recordProxy.setValue('string', 'string changed');

      expect(t.recordProxy.isChanged('string')).toEqual(true);
      expect(t.recordProxy.isChanged('alias')).toEqual(false);

      t.recordProxy.setValue('string', t.recordProxy.getPrevValue('string'));
    });
  });
});
