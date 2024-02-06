import { map } from 'lodash-es';

import IntegrityManager from '../index.js';

const { manager } = h.record;

const getFilterQuery = (field) => `\`alias\` = '${field.alias}'`;
const getAppearanceOptions = (field) => JSON.stringify({
  rules: [{ query: `\`alias\` = '${field.alias}'` }]
});
const getReferenceFieldOptions = (field) => JSON.stringify({
  foreign_model: t.models.self.alias,
  foreign_label: field.alias,
  extra_fields: [],
  depends_on: null,
  filter: null,
  default: null,
});
const getFormOptions = (field) => JSON.stringify({
  components: {
    list: [field.alias],
    options: { [field.alias]: {} },
  }
});
const getFormOptionsRelated = (field) => JSON.stringify({
  related_components: {
    list: [{ id: `${field.id}` }],
    options: { [field.id]: {} },
  }
});
const getLayoutOptionsGrid = (field) => JSON.stringify({
  columns: [field.alias],
  columns_options: { [field.alias]: {} },
  sort_order: [{ field: field.alias, type: 'none'}],
});
const getLayoutOptionsCard = (field) => JSON.stringify({
  components: {
    list: [field.alias],
    options: { [field.alias]: {} },
  },
  sort_order: [{ field: field.alias, type: 'descending' }],
});

beforeAll(async () => {
  t.models = {
    self: await manager('model').create(),
    foreign: await manager('model').create(),
  };
  t.records = {
    self: [
      await manager(t.models.self.alias).create(),
    ],
  };

  t.fields = {
    self: {
      integer: await manager('field').create({
        model: t.models.self.id,
        type: 'integer',
      }),
    },
  };

  t.fields.self.reference = await manager('field').create({
    model: t.models.self.id,
    type: 'reference',
    options: getReferenceFieldOptions(t.fields.self.integer),
  });

  t.appearance = await manager('appearance').create({
    model: t.models.self.id,
    type: 'grid',
    options: getAppearanceOptions(t.fields.self.integer),
  });
  t.filter = await manager('filter').create({
    model: t.models.self.id,
    query: getFilterQuery(t.fields.self.integer),
  });
  t.form = await manager('form').create({
    model: t.models.self.id,
    options: getFormOptions(t.fields.self.integer),
  });

  t.gridLayout = await manager('layout').create({
    model: t.models.self.id,
    type: 'grid',
    options: getLayoutOptionsGrid(t.fields.self.integer),
  });
  t.cardLayout = await manager('layout').create({
    model: t.models.self.id,
    type: 'card',
    options: getLayoutOptionsCard(t.fields.self.integer),
  });

  t.user = await manager('user').create();
  t.userSetting = await manager('user_setting').create({
    user: t.user.id,
    record_id: 1,
    model: db.getModel('layout').id,
    options: getLayoutOptionsGrid(t.fields.self.integer),
  });

  t.grc = await manager('global_references_cross').create({
    source_field: t.fields.self.integer.id,
    source_record_id: t.records.self[0].id,
    target_model: 1,
    target_record_id: 1,
  });
});

describe('IntegrityManager: Field', () => {
  describe('.perform(\'update\', attributes)', () => {
    it('Should update references', async () => {
      const checkReferences = async (model, attributes) => {
        const record = await db.model(model).where(attributes).getOne();
        expect(record).toBeDefined();
      };

      t.fields.self.integer = { ...t.fields.self.integer, alias: 'alias_updated', __previousAttributes: { alias: t.fields.self.integer.alias }};
      await new IntegrityManager(t.fields.self.integer, sandbox).perform('update', { alias: t.fields.self.integer.alias });
      await checkReferences('field',        { options: getReferenceFieldOptions(t.fields.self.integer) });
      await checkReferences('appearance',   { options: getAppearanceOptions(t.fields.self.integer) });
      await checkReferences('form',         { options: getFormOptions(t.fields.self.integer) });
      await checkReferences('layout',       { options: getLayoutOptionsGrid(t.fields.self.integer) });
      await checkReferences('layout',       { options: getLayoutOptionsCard(t.fields.self.integer) });
      await checkReferences('filter',       { query:   getFilterQuery(t.fields.self.integer) });
      // await checkReferences('user_setting', { options: getLayoutOptionsGrid(t.fields.self.integer) }); // https://redmine.nasctech.com/issues/48611
    });
  });

  describe('.perform(\'validate\')', () => {
    it('Should throw an exception if dependent appearances/charts/filters/grcs found', async () => {
      const result = new IntegrityManager(t.fields.self.integer, sandbox).perform('validate');
      await expect(result).rejects.toMatchObject({ name: 'IntegrityError', stack: { models: [
        'appearance',
        'filter',
        'global_references_cross',
        // 'user_setting', // https://redmine.nasctech.com/issues/48611
      ] }});
    });
    it('Should cleanup dependencies', async () => {
      const field = await manager('field').create({ model: t.models.self.id, type: 'integer' });

      let form1 = await manager('form').create({ model: t.models.self.id, options: getFormOptions(field) });
      let form2 = await manager('form').create({ model: t.models.self.id, options: getFormOptionsRelated(field) });
      let layout1 = await manager('layout').create({ model: t.models.self.id, type: 'grid', options: getLayoutOptionsGrid(field) });
      let layout2 = await manager('layout').create({ model: t.models.self.id, type: 'card', options: getLayoutOptionsCard(field) });

      const result = await new IntegrityManager(field, sandbox).perform('delete');

      form1 = await db.model('form').where({ id: form1.id }).getOne();
      expect(JSON.parse(form1.options).components.list.length).toEqual(0);
      expect(Object.keys(JSON.parse(form1.options).components.options).length).toEqual(0);

      form2 = await db.model('form').where({ id: form2.id }).getOne();
      expect(map(JSON.parse(form2.options).related_components.list, ({ id }) => id).length).toEqual(0);
      expect(Object.keys(JSON.parse(form2.options).related_components.options).length).toEqual(0);

      layout1 = await db.model('layout').where({ id: layout1.id }).getOne();
      expect(JSON.parse(layout1.options).columns.length).toEqual(0);
      expect(JSON.parse(layout1.options).sort_order.length).toEqual(0);
      expect(Object.keys(JSON.parse(layout1.options).columns_options).length).toEqual(0);

      layout2 = await db.model('layout').where({ id: layout2.id }).getOne();
      expect(JSON.parse(layout2.options).components[0].list.length).toEqual(0);
      expect(JSON.parse(layout2.options).components[0].sort_order.length).toEqual(0);
      expect(Object.keys(JSON.parse(layout2.options).components[0].options).length).toEqual(0);
    });
  });
});
