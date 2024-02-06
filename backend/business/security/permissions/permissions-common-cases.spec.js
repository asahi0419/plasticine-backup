import getRequest from '../../sandbox/api/p/get-request/index.js';
import ModelProxy from '../../sandbox/api/model/index.js';
import { extendUser } from '../../user/index.js';

const { manager } = h.record;

beforeAll(async () => {
  t.model = await manager('model').create();
  t.fields = {
    string: await manager('field').create({ model: t.model.id, type: 'string' }),
    boolean: await manager('field').create({ model: t.model.id, type: 'boolean' }),
  };
  t.record = await manager(t.model.alias).create({ string: 'string' });
  t.permissions = {
    view: await db.model('permission').where({ model: t.model.id, type: 'field', field: t.fields.string.id, action: 'view' }).getOne(),
    update: await db.model('permission').where({ model: t.model.id, type: 'field', field: t.fields.string.id, action: 'update' }).getOne(),
  };

  const a = await manager('permission').update(t.permissions.view, { script: `p.record.getValue('${t.fields.boolean.alias}')` });
  const b = await manager('permission').update(t.permissions.update, { script: `p.record.getValue('${t.fields.boolean.alias}')` });

  await extendUser(sandbox.user);

  t.request = getRequest({ request: { sandbox, model: t.model, params: { record: t.record } } })();
});

describe('Security: Permissions', () => {
  describe('Common cases', () => {
    describe('Restrictions', () => {
      describe('params.getRecord()', () => {
        it(`Should omit all restricted fields from record`, async () => {
          let result;

          await manager(t.model.alias).update(t.record, { [t.fields.boolean.alias]: false });
          result = await t.request.getRecord();
          expect(result.getValue(t.fields.string.alias)).not.toBeDefined();

          await manager(t.model.alias).update(t.record, { [t.fields.boolean.alias]: true });
          result = await t.request.getRecord();
          expect(result.getValue(t.fields.string.alias)).toBeDefined();
        });
      });

      describe('record.update()', () => {
        it(`Should validate field permissions`, async () => {
          const record = await new ModelProxy(t.model, sandbox).findOne({ id: t.record.id });
          const result = () => record.update({ [t.fields.string.alias]: 'record.update()' });

          await record.update({ [t.fields.boolean.alias]: false });
          await expect(result()).rejects.toMatchObject({ name: 'RecordNotValidError' });

          await record.update({ [t.fields.boolean.alias]: true });
          expect((await result()).attributes).toMatchObject({ [t.fields.string.alias]: 'record.update()' });
        });
      });

      describe('model.find().update()', () => {
        it(`Should not validate field permissions`, async () => {
          const record = await new ModelProxy(t.model, sandbox).findOne({ id: t.record.id });
          const result = () => new ModelProxy(t.model, sandbox).find({ id: t.record.id }).update({ [t.fields.string.alias]: 'model.find().update()' });

          await record.update({ [t.fields.boolean.alias]: false });
          expect(await result()).toEqual(1);

          await record.update({ [t.fields.boolean.alias]: true });
          expect(await result()).toEqual(1);
        });
      });
    });
  });
});
