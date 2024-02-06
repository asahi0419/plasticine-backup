import lodash from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';
import * as Constants from '../constants.js';

export default (data = [], properties = {}) => {
  const sections = getSections(data);
  const result = { data: {}, follow: {} };

  lodash.each(data, (item) => {
    if (isItem(item)) {
      const i = getItem(
        { ...getSection(item, sections) },
        { ...getGroup(item, properties) },
        item
      );

      setResult(result, i);
    }

    if (isGroup(item)) {
      const group = item.group;

      lodash.each(group.items, (item) => {
        if (isItem(item)) {
          const i = getItem(
            { ...getSection(item, sections) },
            { ...getGroup(item, properties), ...group },
            item
          );

          setResult(result, i);
        }
      });
    }

    if (isSection(item)) {
      const section = item.section;

      lodash.each(section.items, (item) => {
        if (isItem(item)) {
          const i = getItem(
            { ...getSection(item, sections), ...section },
            { ...getGroup(item, properties), section: section.name },
            item
          );

          setResult(result, i);
        }
        if (isGroup(item)) {
          const group = item.group;

          lodash.each(group.items, (item) => {
            if (isItem(item)) {
              const i = getItem(
                { ...getSection(item, sections), ...section },
                { ...getGroup(item, properties), ...group, section: section.name },
                item
              );

              setResult(result, i);
            }
          });
        }
      });
    }

    return result;
  });

  lodash.each(result.follow, (f, key) => {
    if (result.data[key]) {
      result.data[key].feature.properties['followed-by'] = f;
    }
  });

  return Object.values(result.data);
};

function isSection(item = {}) {
  return !lodash.isNil(item.section) && item.section.items;
}

function isGroup(item = {}) {
  return !lodash.isNil(item.group) && item.group.items;
}

function isItem(item = {}) {
  return !lodash.isNil(item.key);
}

function getSections(data) {
  return lodash.keyBy(lodash.map(lodash.filter(data, 'section'), ({ section: o = {} }) => {
    const { items, ...r } = o;

    return r;
  }), 'name');
}

function getSection(item = {}, sections = {}) {
  const { geo: properties = {} } = item;

  if (properties.editable === 'free') {
    return { ...Constants.FREE_OBJECTS_SECTION, ...(sections['Free objects'] || {}) };
  }
  if (properties.editable === 'associated') {
    return { ...Constants.ASSOCIATED_OBJECTS_SECTION, ...(sections['Associated objects'] || {}) };
  }

  return Constants.DEFAULT_SECTION;
}

function getGroup(item = {}, props = {}) {
  const { geo: properties = {}, geometry = {} } = item;

  if (properties.editable === 'free') {
    if (geometry.type === 'Point') return Constants.FREE_POINTS_GROUP;
    if (geometry.type === 'LineString') return Constants.FREE_LINES_GROUP;
    if (geometry.type === 'Polygon') return Constants.FREE_POLYGONS_GROUP;
  }

  if (properties.editable === 'associated') {
    const model = db.getModel(properties.model);

    if (geometry.type === 'Point') {
      const result = { ...Constants.ASSOCIATED_POINTS_GROUP, name: model.plural };

      const p = lodash.find(props.Point[`assoc_${model.id}`], { property_id: properties.property_id });
      if (p) {
        result.id = p.property_id;
        if (p.name) result.name = p.name;
        if (p.properties['marker-symbol']) result.icon = p.properties['marker-symbol'];
        if (p.properties['marker-color']) result['icon-color'] = p.properties['marker-color'];
      }

      return result;
    }
    if (geometry.type === 'LineString') {
      const result = { ...Constants.ASSOCIATED_LINES_GROUP, name: model.plural };

      const p = lodash.find(props.LineString[`assoc_${model.id}`], { property_id: properties.property_id });
      if (p) {
        result.id = p.property_id;
        if (p.name) result.name = p.name;
        if (p.properties['marker-symbol']) result.icon = p.properties['marker-symbol'];
        if (p.properties['stroke']) result['icon-color'] = p.properties['stroke'];
      }

      return result;
    }
  }

  return Constants.DEFAULT_GROUP;
}

function getItem(s = {}, g = {}, i = {}) {
  const { items: si, ...section } = s;
  const { items: gi, ...group } = g;
  const { key, options, geometry, records, geo: properties = {}, attr } = i;

  properties.section = section.name || 'default';
  properties.group = group.name || 'default';

  section.id = properties.section;
  group.id = properties.group;

  if (typeof attr === 'object') properties.attr = attr;

  return {
    records,
    metadata: {
      key,
      options,
      section,
      group,
    },
    feature: {
      geometry,
      properties,
    },
  };
}

function setResult(result, i) {
  const fu = i.feature.properties['follow-up'];

  if (fu) {
    result.follow[fu] = result.follow[fu]
      ? [...result.follow[fu], i.metadata.key]
      : [i.metadata.key];
  }

  result.data[`${i.metadata.key}`] = i;
}
