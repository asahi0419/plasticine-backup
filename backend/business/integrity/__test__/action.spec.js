import IntegrityManager from '../index.js';

const { manager } = h.record;

describe('IntegrityManager: Action', () => {
  describe('.perform(\'validate\')', () => {
    it('It should throw an exception if dependent users found', async () => {
      const model = await manager('model').create();
      const action = await manager('action').create({ model: model.id, type: 'form_button' });
      const field = await db.model('field').where({ alias: 'actions' }).getOne();
      const rtl = await manager('rtl').create({ source_field: field.id, source_record_id: 1, target_record_id: action.id });

      const result = new IntegrityManager(action, sandbox).perform('validate');
      await expect(result).rejects.toMatchObject({ name: 'IntegrityError', stack: { models: ['page'] }});
    });
  });
});
