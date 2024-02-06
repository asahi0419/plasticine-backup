import { getDistanceScope } from '../helpers.js';
import { EARTH_RADIUS_IN_KMS } from '../constants.js';

describe('Sandbox', () => {
  describe('utils.getDistanceScope: Helpers', () => {
    describe('getDistanceScope(modelBuilder, lat, lon, radius)', () => {
      it('Should return distance scope', async () => {
        const modelBuilder = db.model('model');
        const lat = 0;
        const lon = 0;
        const radius = 10;

        const result = getDistanceScope(modelBuilder, lat, lon, radius).toString();
        const expected = `select * from \"${modelBuilder.tableName}\" where (ACOS(
    least(
      1,
      COS(RADIANS(${lat})) * COS(RADIANS(${lon})) * COS(RADIANS(${modelBuilder.tableName}.p_lat)) * COS(RADIANS(${modelBuilder.tableName}.p_lon)) +
      COS(RADIANS(${lat})) * SIN(RADIANS(${lon})) * COS(RADIANS(${modelBuilder.tableName}.p_lat)) * SIN(RADIANS(${modelBuilder.tableName}.p_lon)) +
      SIN(RADIANS(${lat})) * SIN(RADIANS(${modelBuilder.tableName}.p_lat))
    )
  ) * ${EARTH_RADIUS_IN_KMS} <= ${radius})`;

        expect(result).toEqual(expected);
      });
    });
  });
});
