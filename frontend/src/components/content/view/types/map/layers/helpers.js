const GROUP_KEYS = {
  Point: 'marker-color',
  Polygon: 'fill',
  LineString: 'stroke',
} // temporary solution

export function getRegularFeatures(features) {
  const groups = lodash.groupBy(features, (f) => hashCode(`${f.geometry.coordinates}`))

  return lodash.reduce(groups, (r, val, k) => {
    if (val.length === 1) {
      r.uniq.push(val[0])
    } else {
      val = lodash.filter(val, (f) => !`${f.id}`.endsWith(':a') && !`${f.id}`.endsWith(':b'));
      const uniq = lodash.uniqBy(val, (v) => hashCode(JSON.stringify(v)))
      if (uniq.length) {
        if (uniq.length > 1) {
          r.same[k] = lodash.groupBy(lodash.values(uniq), (f) => f.properties[GROUP_KEYS[f.geometry.type]])
        } else {
          r.uniq.push(uniq[0])
          // console.log(`Found duplicated feature`, uniq[0])
        }
      }
    }
    return r
  }, { same: {}, uniq: [] })
}

function hashCode(string) {
  let hash = 0, i, chr

  if (string.length === 0) return hash
  for (i = 0; i < string.length; i++) {
    chr = string.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0; // Convert to 32bit integer
  }

  return hash
}

export function getProperty(properties = {}, feature = {}, name, property) {
  const { geometry = {} } = feature;
  const { type } = geometry;

  const KEY_BY_GEOMETRY = {
    Point: 'point',
    LineString: 'line',
    Polygon: 'polygon',
  }
  const key = KEY_BY_GEOMETRY[type]

  if (feature.properties[name]) {
    property = feature.properties[name];
  } else {
    if (feature.properties.editable) {
      if (feature.properties.editable === 'associated') {
        if (properties[`${key}_assoc_${feature.properties.model}`]) {
          const p = lodash.find(properties[`${key}_assoc_${feature.properties.model}`], { condition: 'true' }) || {}
          property = (p?.properties || {})[name];
        }
      }
    }
  }

  if (!property) {
    property = (properties[key]?.properties || {})[name];
  }

  return property;
}

export function removeDuplicatedCoordinates(features) {
  lodash.map(features, (f) => {
    if (f.geometry.type === 'LineString') {
      let last;

      f.geometry.coordinates = lodash.filter(f.geometry.coordinates, (curr) => {
        if (last) {
          const [ llon, llat ] = last;
          const [ clon, clat ] = curr;

          if ((llon === clon) && (llat === clat)) return false;
        }

        last = curr
        return true
      });
    }
  });
}