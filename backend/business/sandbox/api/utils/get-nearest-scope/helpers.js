import { EARTH_RADIUS_IN_KMS } from './constants.js';

const getDistanceClause = (tableName, lat, lon) => {
  return `ACOS(
    least(
      1,
      COS(RADIANS(${lat})) * COS(RADIANS(${lon})) * COS(RADIANS(${tableName}.p_lat)) * COS(RADIANS(${tableName}.p_lon)) +
      COS(RADIANS(${lat})) * SIN(RADIANS(${lon})) * COS(RADIANS(${tableName}.p_lat)) * SIN(RADIANS(${tableName}.p_lon)) +
      SIN(RADIANS(${lat})) * SIN(RADIANS(${tableName}.p_lat))
    )
  ) * ${EARTH_RADIUS_IN_KMS}`;
};

export const getDistanceScope = (modelBuilder, lat, lon, radius) => {
  return modelBuilder.where(db.client.raw(`(${getDistanceClause(modelBuilder.tableName, lat, lon)} <= ${radius})`));
};
