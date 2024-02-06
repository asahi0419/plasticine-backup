import IntegrityManager from '../index.js';

const { manager } = h.record;

beforeAll(async () => {
  t.model = await manager('model').create();
  t.field = await manager('field').create({
    model: 5,
    type: 'reference',
    options: JSON.stringify({
      foreign_model: t.model.alias,
      foreign_label: 'id',
    }),
  });

  await new IntegrityManager(t.model, sandbox).perform('delete');
});

const checkRelatedPresence = async (model, attributes) => {
  const whereClause = attributes || { model: t.model.id };
  const records = await db.model(model).where(whereClause);
  expect(records).toHaveLength(0);
};

describe('IntegrityManager: Model', () => {
  describe('.perform(\'update\', attributes)', () => {
    it('Alias change should update field references', async () => {
      const aliasUpdated = 'alias_updated';
      const model = { ...t.model, alias: aliasUpdated, __previousAttributes: { alias: t.model.alias } };
      await new IntegrityManager(model, sandbox).perform('update', { alias: aliasUpdated });

      const field = await db.model('field').where({
        model: 5,
        options: JSON.stringify({
          foreign_model: aliasUpdated,
          foreign_label: 'id',
          depends_on: null,
          filter: null,
          default: null,
        }),
      }).getOne();
      expect(field).toBeDefined();
    });
  });

  describe('.perform(\'validate\')', () => {
    it('It should throw an exception if dependent fields found', async () => {
      let result, field;

      field = await manager('field').create({
        model: 5,
        type: 'reference',
        options: JSON.stringify({
          foreign_model: t.model.alias,
          foreign_label: 'id',
        }),
      });
      result = new IntegrityManager(t.model, sandbox).perform('validate');
      await expect(result).rejects.toMatchObject({ name: 'IntegrityError', stack: { models: ['field'] } });
      await db.model('field').where({ id: field.id }).delete();
      result = await new IntegrityManager(t.model, sandbox).perform('validate');
      await expect(result).toEqual();

      field = await manager('field').create({
        model: 5,
        type: 'reference_to_list',
        options: JSON.stringify({
          foreign_model: t.model.alias,
          foreign_label: 'id',
        }),
      });
      result = new IntegrityManager(t.model, sandbox).perform('validate');
      await expect(result).rejects.toMatchObject({ name: 'IntegrityError', stack: { models: ['field'] } });
      await db.model('field').where({ id: field.id }).delete();
      result = await new IntegrityManager(t.model, sandbox).perform('validate');
      await expect(result).toEqual();

      field = await manager('field').create({
        model: 5,
        type: 'global_reference',
        options: JSON.stringify({
          references: {
            model: t.model.alias,
            label: 'id',
          }
        }),
      });
      result = new IntegrityManager(t.model, sandbox).perform('validate');
      await expect(result).rejects.toMatchObject({ name: 'IntegrityError', stack: { models: ['field'] } });
      await db.model('field').where({ id: field.id }).delete();
      result = await new IntegrityManager(t.model, sandbox).perform('validate');
      await expect(result).toEqual();
    });
  });

  describe('.perform(\'delete\')', () => {
    it('It should delete all related privileges', () => checkRelatedPresence('privilege'));
    it('It should delete all related db rules', () => checkRelatedPresence('db_rule'));
    it('It should delete all related escalation rules', () => checkRelatedPresence('escalation_rule'));
    it('It should delete all related ui rules', () => checkRelatedPresence('ui_rule'));
    it('It should delete all related filters', () => checkRelatedPresence('filter'));
    it('It should delete all related appearances', () => checkRelatedPresence('appearance'));
    it('It should delete all related forms', () => checkRelatedPresence('form'));
    it('It should delete all related layouts', () => checkRelatedPresence('layout'));
    it('It should delete all related actions', () => checkRelatedPresence('action'));
    it('It should delete all related charts', () => checkRelatedPresence('chart', { data_source: t.model.id }));
    it('It should delete all related permissions', () => checkRelatedPresence('permission'));
    it('It should delete all related core locks', () => checkRelatedPresence('core_lock'));
    it('It should delete all related user settings', () => checkRelatedPresence('user_setting'));
    it('It should delete all related json translations', () => checkRelatedPresence('json_translation'));
    it('It should delete all related dynamic translations', () => checkRelatedPresence('dynamic_translation'));
    it('It should delete all related planned escalations', () => checkRelatedPresence('planned_task'));
    it('It should delete all related global references crosses (target model)', () => checkRelatedPresence('global_references_cross', { target_model: t.model.id }));
    it('It should delete all related views', () => checkRelatedPresence('view'));
    it('It should delete all related fields', () => checkRelatedPresence('field'));
    it('It should delete all related models', async () => {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      checkRelatedPresence('model', { master_model: t.model.id })
    });
  });
});
