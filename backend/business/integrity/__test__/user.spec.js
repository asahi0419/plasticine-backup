import IntegrityManager from '../index.js';

const { manager } = h.record;

describe('IntegrityManager: User', () => {
  describe('.perform(\'delete\')', () => {
    it('It should delete all related data', async () => {
      const model = await manager('model').create();
      const user = await manager('user').create();
      const privilege = await manager('privilege').create({ owner_type: 'user', owner_id: user.id });
      const userSetting = await manager('user_setting').create({ user: user.id, model: model.id, record_id: 1 });

      await new IntegrityManager(user, sandbox).perform('delete');

      const userSettings = await db.model('user_setting').where({ user: user.id });
      expect(userSettings).toHaveLength(0);
      const privileges = await db.model('privilege').where({ owner_type: 'user', owner_id: user.id });
      expect(privileges).toHaveLength(0);
    });
  });
});
