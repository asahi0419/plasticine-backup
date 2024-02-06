const { manager } = h.record;

beforeAll(async () => {
  t.model = await manager('model').create();
  t.fields = [
    await manager('field').create({ model: t.model.id, type: 'float', alias: 'p_lat' }),
    await manager('field').create({ model: t.model.id, type: 'float', alias: 'p_lon' }),
  ];
  t.records = [
    await manager(t.model.alias).create({ p_lat: 0.55, p_lon: 0.55 }),
  ];
});

describe('DB Functions', () => {
  describe('getRecordsByDistance(modelAlias, p_lat, p_lon, max_distance, earth_radius, cond)', () => {
    it('Should correctly run', async () => {
      const funcName = 'getRecordsByDistance';
      const args = [ t.model.alias, t.records[0].p_lat, t.records[0].p_lon, 1.55, 1.55, 'true' ];
      const result = await sandbox.vm.utils.db.callFunc(funcName, args);

      expect(result.rows.length).toEqual(1);
    });
    it('Should correctly run', async () => {
      const funcName = 'getRecordsByDistance';
      const args = [ t.model.alias, t.records[0].p_lat, t.records[0].p_lon, 1.55, 1.55, 'false' ];
      const result = await sandbox.vm.utils.db.callFunc(funcName, args);

      expect(result.rows.length).toEqual(0);
    });
  });
});
