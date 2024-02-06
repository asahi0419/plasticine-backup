import Manager from '../manager.js';
import Sandbox from '../../sandbox/index.js';
import Flags from '../flags.js';
import { extendUser } from '../../user/index.js';
import { makeUniqueID } from '../../helpers/index.js';

const { manager } = h.record;

beforeAll(async () => {
  t.fieldModel = db.getModel('field');
  t.models = {
    self: await manager('model').create(),
    foreign: await manager('model').create(),
  };
  t.fields = {
    self: {
      rtl: await manager('field').create({
        model: t.models.self.id,
        type: 'reference_to_list',
        options: `{"foreign_model":"${t.models.foreign.alias}","foreign_label":"id"}`,
      }),
      grc: await manager('field').create({
        model: t.models.self.id,
        type: 'global_reference',
        options: `{"references":[{"model":"${t.models.foreign.alias}","view":"default","label":"id"}]}`,
      }),
    },
  };
  t.records = {
    foreign: [
      await manager(t.models.foreign.id).create(),
      await manager(t.models.foreign.id).create(),
      await manager(t.models.foreign.id).create(),
    ],
  };

  extendUser(sandbox.user);

  t.manager = new Manager(t.models.self, sandbox, 'insecure');
});

describe('Record: Manager', () => {
  describe('create(attributes, { ex_save: { executeActions: true } })', () => {
    it('Should execute any before/after creation/modification actions', async () => {
      const flags = new Flags({ ex_save: { executeActions: true } });
      const attributes = { alias: '__test_1', name: 'Test', model: t.fieldModel.id, type: 'string', 'index': 'none' };
      const result = new Manager(t.fieldModel, sandbox).create(attributes, flags);

      await expect(result).rejects.toMatchObject({ name: 'RecordNotValidError' });
    });
  });
  describe('create(attributes, { ex_save: { executeActions: false } })', () => {
    it('Should not execute any before/after creation/modification actions', async () => {
      const flags = new Flags({ ex_save: { executeActions: false } });
      const attributes = { alias: '__test_2', name: 'Test', model: t.fieldModel.id, type: 'string', 'index': 'none' };
      const result = await new Manager(t.fieldModel, sandbox).create(attributes, flags);

      await expect(result.id).toBeDefined();
    });
  });
  describe('create(attributes, { ex_save: { checkMandatoryFields: true } })', () => {
    it('Should check required fields', async () => {
      const flags = new Flags({ ex_save: { checkMandatoryFields: true } });
      const attributes = { alias: `test_${makeUniqueID()}`, name: '', model: t.fieldModel.id, type: 'string', 'index': 'none' };
      const result = new Manager(t.fieldModel, sandbox).create(attributes, flags);

      await expect(result).rejects.toMatchObject({ name: 'RecordNotValidError' });
    });
  });
  describe('create(attributes, { ex_save: { checkMandatoryFields: false } })', () => {
    it('Should not check required fields', async () => {
      const flags = new Flags({ ex_save: { checkMandatoryFields: false } });
      const attributes = { alias: `test_${makeUniqueID()}`, name: '', model: t.fieldModel.id, type: 'string', 'index': 'none' };
      const result = await new Manager(t.fieldModel, sandbox).create(attributes, flags);

      await expect(result.id).toBeDefined();
    });
  });
  describe('create(attributes, { check_permission: { insert: true } }', () => {
    it('Should not be able to create field value if not permission', async () => {
      const flags = new Flags({ check_permission: { insert: true } });
      const attributes = { alias: `test_${makeUniqueID()}`, name: 'Test', model: t.fieldModel.id, type: 'string', 'index': 'none' };

      const guestUser = await extendUser(await db.model('user').where({ name: 'Guest' }).getOne());
      const guestSandbox = new Sandbox({ user: guestUser });
      const guestManager = new Manager(t.fieldModel, guestSandbox);

      await expect(guestManager.create(attributes, flags)).rejects.toMatchObject({ name: 'NoPermissionsError' });
    });
  });
  describe('create(attributes, { check_permission: { insert: false } }', () => {
    it('Should be able to create field value if not permission', async () => {
      const flags = new Flags({ check_permission: { insert: false } });
      const attributes = { alias: `test_${makeUniqueID()}`, name: 'Test', model: t.fieldModel.id, type: 'string', 'index': 'none' };

      const guestUser = await extendUser(await db.model('user').where({ name: 'Guest' }).getOne());
      const guestSandbox = new Sandbox({ user: guestUser });
      const guestManager = new Manager(t.fieldModel, guestSandbox);

      expect(await guestManager.create(attributes, flags)).toMatchObject({ __inserted: true, created_by: guestUser.id });
    });
  });
  describe('update(attributes, { ex_save: { executeActions: true } })', () => {
    it('Should execute any before/after creation/modification actions', async () => {
      const flags = new Flags({ ex_save: { executeActions: true } });
      const attributes = { alias: `test_${makeUniqueID()}`, name: 'Test', model: t.fieldModel.id, type: 'string', 'index': 'none' };
      const record = await new Manager(t.fieldModel, sandbox).create(attributes, flags);
      const result = new Manager(t.fieldModel, sandbox).update(record, { ...attributes, alias: '__test_3' }, flags);

      await expect(result).rejects.toMatchObject({ name: 'RecordNotValidError' });
    });
  });
  describe('update(attributes, { ex_save: { executeActions: false } })', () => {
    it('Should not execute any before/after creation/modification actions', async () => {
      const flags = new Flags({ ex_save: { executeActions: false } });
      const attributes = { alias: `test_${makeUniqueID()}`, name: 'Test', model: t.fieldModel.id, type: 'string', 'index': 'none' };
      const record = await new Manager(t.fieldModel, sandbox).create(attributes, flags);
      const result = await new Manager(t.fieldModel, sandbox).update(record, { ...attributes, alias: '__test_4' }, flags);

      await expect(result.id).toBeDefined();
    });
  });

  describe('update(attributes, { ex_save: { updateDateTimeFields: true } })', () => {
    it('Should update "updated_at" field', async () => {
      const flags = new Flags({ ex_save: { updateDateTimeFields: true } });
      const attributes = { alias: `test_${makeUniqueID()}`, name: 'Test', model: t.fieldModel.id, type: 'string', 'index': 'none' };
      const record = await new Manager(t.fieldModel, sandbox).create(attributes, flags);
      const result = new Manager(t.fieldModel, sandbox).update(record, { ...attributes, alias: `test_${makeUniqueID()}` }, flags);

      await expect(result.updated_at).not.toBe(record.updated_at);
    });
  });
  describe('update(attributes, { ex_save: { updateDateTimeFields: false } })', () => {
    it('Should not update "updated_at" field', async () => {
      const flags = new Flags({ ex_save: { updateDateTimeFields: false } });
      const attributes = { alias: `test_${makeUniqueID()}`, name: 'Test', model: t.fieldModel.id, type: 'string', 'index': 'none' };
      const record = await new Manager(t.fieldModel, sandbox).create(attributes, flags);
      const result = await new Manager(t.fieldModel, sandbox).update(record, { ...attributes, name: 'Test (Updated)' }, flags);

      await expect(result.updated_at).toBe(record.updated_at);
    });
  });
  describe('update(attributes, { ex_save: { checkMandatoryFields: true } })', () => {
    it('Should check required fields', async () => {
      const flags = new Flags({ ex_save: { checkMandatoryFields: true } });
      const attributes = { alias: `test_${makeUniqueID()}`, name: 'Test', model: t.fieldModel.id, type: 'string', 'index': 'none' };
      const record = await new Manager(t.fieldModel, sandbox).create(attributes, flags);
      const result = new Manager(t.fieldModel, sandbox).update(record, { name: '' }, flags);

      await expect(result).rejects.toMatchObject({ name: 'RecordNotValidError' });
    });
  });
  describe('update(attributes, { ex_save: { checkMandatoryFields: false } })', () => {
    it('Should not check required fields', async () => {
      const flags = new Flags({ ex_save: { checkMandatoryFields: false } });
      const attributes = { alias: `test_${makeUniqueID()}`, name: 'Test', model: t.fieldModel.id, type: 'string', 'index': 'none' };
      const record = await new Manager(t.fieldModel, sandbox).create(attributes, flags);
      const result = await new Manager(t.fieldModel, sandbox).update(record, { name: '' }, flags);

      await expect(result.id).toBeDefined();
    });
  });
  describe('update(attributes, { check_permission: { update: true } }', () => {
    it('Should not be able to update field value if not permission', async () => {
      const flags = new Flags({ check_permission: { update: true } });
      const attributes = { updated_at: new Date() };

      const guestUser = await extendUser(await db.model('user').where({ name: 'Guest' }).getOne());
      const guestSandbox = new Sandbox({ user: guestUser });
      const guestManager = new Manager(t.fieldModel, guestSandbox);

      const record = await db.model('field').where({ id: 1 }).getOne();
      await expect(guestManager.update(record, attributes, flags)).rejects.toMatchObject({ name: 'NoPermissionsError' });
    });
  });
  describe('update(attributes, { check_permission: { update: false } }', () => {
    it('Should be able to update field value if not permission', async () => {
      const flags = new Flags({ check_permission: { update: false } });
      const attributes = { updated_at: new Date() };

      const guestUser = await extendUser(await db.model('user').where({ name: 'Guest' }).getOne());
      const guestSandbox = new Sandbox({ user: guestUser });
      const guestManager = new Manager(t.fieldModel, guestSandbox);

      const record = await db.model('field').where({ id: 1 }).getOne();
      expect(await guestManager.update(record, attributes, flags)).toMatchObject({ updated_by: guestUser.id });
    });
  });

  describe('build(attributes)', () => {
    describe('Service attributes', () => {
      describe('__hash', () => {
        it('Should have value', async () => {
          let record;

          // common build
          record = await t.manager.build();
          expect(record.__hash).toEqual('');

          // persistent build
          record = await t.manager.build({}, true);
          expect(record.__hash).toEqual('');
        });
      });

      describe('__inserted', () => {
        it('Should have value', async () => {
          let record;

          // common build
          record = await t.manager.build();
          expect(record.__inserted).toEqual(false);

          // persistent build
          record = await t.manager.build({}, true);
          expect(record.__inserted).toEqual(false);
        });
      });
    });

    describe('attributes', () => {
      describe('Array (string)', () => {
        it('Should receive default value if values include it', async () => {
          const value = '"one"';

          const field = await manager('field').create({ model: t.models.self.id, type: 'array_string', options: `{"values":{"one":"One","two":"Two"},"default":${value}}` });
          const record = await t.manager.build();

          const result = record[field.alias];
          const expected = value.replace(/"/g, "");

          await expect(result).toEqual(expected);
        });
        it('Should not receive default value if values do not include it', async () => {
          const value = '"three"';

          const field = await manager('field').create({ model: t.models.self.id, type: 'array_string', options: `{"values":{"one":"One","two":"Two"},"default":${value}}` });
          const record = await t.manager.build();

          const result = record[field.alias];
          const expected = null;

          await expect(result).toEqual(expected);
        });
      });
      describe('Array (string) [multiselect]', () => {
        it('Should receive default value if values include it', async () => {
          const value = '["one"]';

          const field = await manager('field').create({ model: t.models.self.id, type: 'array_string', options: `{"values":{"one":"One","two":"Two"},"default":${value},"multi_select":true}` });
          const record = await t.manager.build();

          const result = record[field.alias];
          const expected = "'one'";

          await expect(result).toEqual(expected);
        });
        it('Should not receive default value if values do not include it', async () => {
          const value = '["three"]';

          const field = await manager('field').create({ model: t.models.self.id, type: 'array_string', options: `{"values":{"one":"One","two":"Two"},"default":${value},"multi_select":true}` });
          const record = await t.manager.build();

          const result = record[field.alias];
          const expected = null;

          await expect(result).toEqual(expected);
        });
      });

      describe('Reference to list', () => {
        it('Should build rtl records', async () => {
          const field = t.fields.self.rtl;
          let record, rtls, attributes;

          // ==================================================================
          // __inserted: false on build -> true after create

          attributes = { [field.alias]: [t.records.foreign[0].id] };
          record = await t.manager.build(attributes, true);
          rtls = await db.model('rtl').where({
            source_field: field.id,
            source_record_id: record.id,
          }).whereIn('target_record_id', attributes[field.alias]);

          expect(rtls).toHaveLength(1);
          expect(record.__inserted).toEqual(false);
          expect(rtls[0].__inserted).toEqual(false);
          expect(record[field.alias]).toEqual(attributes[field.alias]);

          attributes = { [field.alias]: [t.records.foreign[0].id, t.records.foreign[1].id] };
          record = await t.manager.create(attributes);
          rtls = await db.model('rtl').where({
            source_field: field.id,
            source_record_id: record.id,
          }).whereIn('target_record_id', attributes[field.alias]);

          expect(rtls).toHaveLength(2);
          expect(record.__inserted).toEqual(true);
          expect(rtls[0].__inserted).toEqual(true);
          expect(rtls[1].__inserted).toEqual(true);
          expect(record[field.alias]).toEqual(attributes[field.alias]);

          // ==================================================================
          // __inserted: false on build -> true after update

          attributes = { [field.alias]: [t.records.foreign[0].id] };
          record = await t.manager.build(attributes, true);
          rtls = await db.model('rtl').where({
            source_field: field.id,
            source_record_id: record.id,
          }).whereIn('target_record_id', attributes[field.alias]);

          expect(rtls).toHaveLength(1);
          expect(record.__inserted).toEqual(false);
          expect(rtls[0].__inserted).toEqual(false);
          expect(record[field.alias]).toEqual(attributes[field.alias]);

          attributes = { [field.alias]: [t.records.foreign[0].id, t.records.foreign[1].id] };
          record = await t.manager.update(record, attributes);
          rtls = await db.model('rtl').where({
            source_field: field.id,
            source_record_id: record.id,
          }).whereIn('target_record_id', attributes[field.alias]);

          expect(rtls).toHaveLength(2);
          expect(record.__inserted).toEqual(true);
          expect(rtls[0].__inserted).toEqual(true);
          expect(rtls[1].__inserted).toEqual(true);
          expect(record[field.alias]).toEqual(attributes[field.alias]);
        });
      });

      describe('Global reference', () => {
        it('Should build grc records', async () => {
          const field = t.fields.self.grc;
          let record, grcs, attributes;

          // ==================================================================
          // __inserted: false on build -> true after create

          attributes = { [field.alias]: t.records.foreign[0] };
          record = await t.manager.build(attributes, true);
          grcs = await db.model('global_references_cross').where({
            source_field: field.id,
            source_record_id: record.id,
            target_record_id: t.records.foreign[0].id,
          });

          expect(grcs).toHaveLength(1);
          expect(record.__inserted).toEqual(false);
          expect(grcs[0].__inserted).toEqual(false);
          expect(record[field.alias]).toEqual({ model: t.models.foreign.id, id: t.records.foreign[0].id });

          attributes = { [field.alias]: t.records.foreign[0] };
          record = await t.manager.create(attributes);
          grcs = await db.model('global_references_cross').where({
            source_field: field.id,
            source_record_id: record.id,
            target_record_id: t.records.foreign[0].id,
          });

          expect(grcs).toHaveLength(1);
          expect(record.__inserted).toEqual(true);
          expect(grcs[0].__inserted).toEqual(true);
          expect(record[field.alias]).toEqual({ model: t.models.foreign.id, id: t.records.foreign[0].id });

          // ==================================================================
          // __inserted: false on build -> true after update

          attributes = { [field.alias]: t.records.foreign[1] };
          record = await t.manager.build(attributes, true);
          grcs = await db.model('global_references_cross').where({
            source_field: field.id,
            source_record_id: record.id,
            target_record_id: t.records.foreign[1].id,
          });

          expect(grcs).toHaveLength(1);
          expect(record.__inserted).toEqual(false);
          expect(grcs[0].__inserted).toEqual(false);
          expect(record[field.alias]).toEqual({ model: t.models.foreign.id, id: t.records.foreign[1].id });

          attributes = { [field.alias]: t.records.foreign[1] };
          record = await t.manager.update(record, attributes);
          grcs = await db.model('global_references_cross').where({
            source_field: field.id,
            source_record_id: record.id,
            target_record_id: t.records.foreign[1].id,
          });

          expect(grcs).toHaveLength(1);
          expect(record.__inserted).toEqual(true);
          expect(grcs[0].__inserted).toEqual(true);
          expect(record[field.alias]).toEqual({ model: t.models.foreign.id, id: t.records.foreign[1].id });
        });
      });
    });
  });
});
