import lodash from 'lodash-es';

const KEY_BY_GEOMETRY = {
  Point: 'point',
  LineString: 'line',
  Polygon: 'polygon',
};

export default async (properties, appearance, params) => {
  return lodash.reduce(properties, (result, section, type) => {
    lodash.each(section, (properties, category) => {
      let key = KEY_BY_GEOMETRY[type];
      if (category.startsWith('assoc')) key = `${key}_${category}`;
      setPName(properties);

      result[key] = properties;
    });

    return result;
  }, {});
};

const setPName = (properties) => {
  if (lodash.isArray(properties)) return lodash.each(properties, p => setPName(p));
  properties.properties['p-name'] = properties.properties['p-name'] || properties.name;
};