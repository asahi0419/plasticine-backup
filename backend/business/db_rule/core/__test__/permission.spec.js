const { manager } = h.record;

describe('DB Rule: Permission', () => {
  describe('createCoreDeleteLock', () => {
    it('Should create delete lock for permission', async () => {
      const model = await manager('model').create();
      const field = await manager('field').create({ model: model.id, type: 'string' });
      const permission = await db.model('permission', sandbox).createRecord({
        model: model.id,
        field: field.id,
        type: 'field',
        action: 'create',
        script: 'true',
      });

      await expect(db.model('permission', sandbox).destroyRecord(permission)).rejects.toMatchObject({ name: 'NoPermissionsError' })

      const lock = await db.model('core_lock').where({
        model: db.getModel('permission').id,
        update: false,
        delete: true,
        record_id: permission.id
      }).getOne();

      expect(lock).toBeDefined();
    });
  });
});
