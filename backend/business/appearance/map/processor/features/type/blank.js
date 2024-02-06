export default (records) => {
  if (!records.length) return null;

  const fr = records[0] || {};
  const lr = records[records.length - 1] || {};
  const endsAreConverging = fr.p_lon === lr.p_lon && fr.p_lat === lr.p_lat;

  let type;
  if (records.length === 1) {
    type = 'Point';
  } else if (records.length > 1) {
    type = 'LineString';
    if (records.length > 3 && endsAreConverging) {
      type = 'Polygon';
    }
  }

  return {
    type: 'Feature',
    geometry: { type },
  };
};
