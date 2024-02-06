import { isEmpty } from 'lodash-es';

import RecordProxy from '../index.js';
import { worklogDBModel } from '../../../../../worklog/model.js';

const { manager } = h.record;

const createTCross = async (attributes) => {
  t.dvf_record = await manager(t.dvf_model.alias).create();
  t.data_record = await manager(t.data_model.alias).create(attributes);

  t.dvf_t_cross = await manager('t_cross').create({
    dtf_field_id: t.dtf_field.id,
    dtf_record_id: t.dtf_record.id,
    data_model_id: t.data_model.id,
    dvf_field_id: t.dvf_field.id,
    data_record_id: t.dvf_record.id,
    dvf_record_id: t.data_record.id,
  });
};

beforeAll(async () => {
  t.dtf_model = await manager('model').create();
  t.dtf_field = await manager('field').create({ model: t.dtf_model.id, type: 'data_template' });
  t.dtf_record = await manager(t.dtf_model.alias).create();

  t.dvf_model = await manager('model').create();
  t.dvf_field = await manager('field').create({ model: t.dvf_model.id, type: 'data_visual' });
  t.dvf_model_journal_field = await manager('field').create({ model: t.dvf_model, type: 'journal' });

  t.t_cross = await db.model('t_cross').where({ dtf_field_id: t.dtf_field.id }).getOne();
  t.data_model = await db.model('model').where({ data_template: t.t_cross.id }).getOne();

  t.array_string_field = await manager('field').create({ model: t.data_model.id, type: 'array_string', options: '{"values":{"one":"One","two":"Two"}}' });
  t.datetime_field = await manager('field').create({ model: t.data_model.id, type: 'datetime' });
  t.float_field = await manager('field').create({ model: t.data_model.id, type: 'float' });

  await createTCross({ [t.array_string_field.alias]: 'one' });

  t.model = t.dvf_model;
  t.fields = await db.model('field').where({ model: t.dvf_model.id });
  t.record = t.dvf_record;

  t.recordProxy = new RecordProxy(t.dvf_record, t.dvf_model, sandbox);
  t.recordProxy.setFields(t.fields);
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Sandbox API', () => {
  describe('RecordProxy', () => {
    describe('pleloadData()', () => {
      it('Should preload data', async () => {
        jest.spyOn(RecordProxy.prototype, 'preloadHumanizedAttributes');

        await t.recordProxy.preloadData();

        expect(RecordProxy.prototype.preloadHumanizedAttributes).toBeCalled();

        expect(isEmpty(t.recordProxy.humanizedAttributes)).toEqual(false);
        expect(isEmpty(t.recordProxy.previousHumanizedAttributes)).toEqual(false);
      });
    });

    describe('preloadTemplates()', () => {
      it('Should not preload templates if no dvf value', async () => {
        await t.recordProxy.preloadTemplates();
        expect(isEmpty(t.recordProxy.templates)).toEqual(true);
      });
      it('Should not preload templates for record which does not exist', async () => {
        t.recordProxy.setValue(t.dvf_field.alias, '{}');
        delete t.recordProxy.record.id;

        await t.recordProxy.preloadTemplates();
        expect(isEmpty(t.recordProxy.templates)).toEqual(true);
      });
      it('Should preload templates', async () => {
        t.recordProxy = new RecordProxy(t.dvf_record, t.dvf_model, sandbox);
        t.recordProxy.setFields(t.fields);
        t.recordProxy.setValue(t.dvf_field.alias, '{}');

        await t.recordProxy.preloadTemplates();
        expect(isEmpty(t.recordProxy.templates)).toEqual(false);
      });
    });

    describe('preloadHumanizedAttributes()', () => {
      it('Should preload humanized attributes', async () => {
        t.recordProxy.humanizedAttributes = {}
        t.recordProxy.previousHumanizedAttributes = {}

        await t.recordProxy.preloadHumanizedAttributes();

        expect(isEmpty(t.recordProxy.humanizedAttributes)).toEqual(false);
        expect(isEmpty(t.recordProxy.previousHumanizedAttributes)).toEqual(false);
      });
    });

    describe('reloadTemplates()', () => {
      it('Should reload templates', async () => {
        jest.spyOn(RecordProxy.prototype, 'preloadTemplates');

        await t.recordProxy.reloadTemplates();

        expect(RecordProxy.prototype.preloadTemplates).toBeCalled();
      });
    });

    describe('reloadVirtualAttributes()', () => {
      it('Should reload virtual attributes', async () => {
        jest.spyOn(RecordProxy.prototype, 'preloadVirtualAttributes');

        await t.recordProxy.reloadVirtualAttributes();

        expect(RecordProxy.prototype.preloadVirtualAttributes).toBeCalled();
      });
    });

    describe('reloadHumanizedAttributes()', () => {
      it('Should reload humanized attributes', async () => {
        jest.spyOn(RecordProxy.prototype, 'preloadHumanizedAttributes');

        await t.recordProxy.reloadHumanizedAttributes();

        expect(RecordProxy.prototype.preloadHumanizedAttributes).toBeCalled();
      });
    });

    describe('setJournalValue(fieldAlias, items)', () => {
      it('Should return journal value for field', async () => {
        t.recordProxy = new RecordProxy(t.dvf_record, t.dvf_model, sandbox);
        t.recordProxy.setFields(t.fields);

        const fieldAlias = t.dvf_model_journal_field.alias;
        const field = t.recordProxy.getField(fieldAlias);

        const expected = { data: 'data', related_field: field.id, related_record: t.record.id };
        await t.recordProxy.setJournalValue(fieldAlias, [expected]);
        const result = await worklogDBModel(t.model).where(expected).getOne();

        expect(result).toMatchObject(expected);
      });
    });

    describe('getJournalValue(fieldAlias)', () => {
      it('Should return journal value for field', async () => {
        t.recordProxy = new RecordProxy(t.dvf_record, t.dvf_model, sandbox);
        t.recordProxy.setFields(t.fields);

        const fieldAlias = t.dvf_model_journal_field.alias;
        const field = t.recordProxy.getField(fieldAlias);

        const item = { data: 'data', related_field: field.id, related_record: t.record.id };
        const result = await t.recordProxy.getJournalValue(fieldAlias);
        const expected = await worklogDBModel(t.model).where(item);

        expect(result).toMatchObject(expected);
      });
    });
  });
});
