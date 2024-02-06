const { manager } = h.record;

describe('Record: Helpers', () => {
  describe('processCoreLock(service, record)', () => {
    it('Should be able to create core delete lock', async () => {
      const record = await manager('page').create({ name: 'Test', alias: 'test_delete', __lock: ['delete'] });
      const lock = await db.model('core_lock').where({ model: db.getModel('page').id, record_id: record.id }).getOne();

      expect(lock).toMatchObject({ delete: true, update: false });
    });
    it('Should be able to create core update lock', async () => {
      const record = await manager('page').create({ name: 'Test', alias: 'test_update', __lock: ['update'] });
      const lock = await db.model('core_lock').where({ model: db.getModel('page').id, record_id: record.id }).getOne();

      expect(lock).toMatchObject({ delete: false, update: true });
    });
    it('Should be able to create core update delete lock', async () => {
      const record = await manager('page').create({ name: 'Test', alias: 'test_delete_update', __lock: ['update', 'delete']   });
      const lock = await db.model('core_lock').where({ model: db.getModel('page').id, record_id: record.id }).getOne();

      expect(lock).toMatchObject({ delete: true, update: true });
    });
    it('Should be able to create lock', async () => {
      const record = await manager('page').create({ name: 'Test', alias: 'test', __lock: true });
      const lock = await db.model('core_lock').where({ model: db.getModel('page').id, record_id: record.id }).getOne();

      expect(lock).toMatchObject({ delete: true, update: true });
    });
    it('Should be able not to create lock', async () => {
      const record = await manager('page').create({ name: 'Test', alias: 'test_no_lock' });
      const lock = await db.model('core_lock').where({ model: db.getModel('page').id, record_id: record.id }).getOne();

      expect(lock).not.toBeDefined();
    });
  });
});
