import IntegrityManager from '../index.js';

const { manager } = h.record;

describe('IntegrityManager: User group', () => {
  describe('.perform(\'validate\')', () => {
    it('It should throw an exception if dependent users found', async () => {
      const userGroup = await manager('user_group').create();
      const field = await db.model('field').where({ model: 3, alias: 'user_groups' }).getOne();
      const rtl = await manager('rtl').create({ source_field: field.id, source_record_id: 1, target_record_id: userGroup.id });

      const result = new IntegrityManager(userGroup, sandbox).perform('validate');
      await expect(result).rejects.toMatchObject({ name: 'IntegrityError', stack: { models: ['user'] }});
    });
  });

  describe('.perform(\'delete\')', () => {
    it('It should delete all related data', async () => {
      const model = await manager('model').create();
      const userGroup = await manager('user_group').create();
      const privilege = await manager('privilege').create({ owner_type: 'user', owner_id: userGroup.id });

      await new IntegrityManager(userGroup, sandbox).perform('delete');

      const privileges = await db.model('privilege').where({ owner_type: 'user_group', owner_id: userGroup.id });
      expect(privileges).toHaveLength(0);
    });
  });
});
