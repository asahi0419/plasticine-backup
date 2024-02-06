import mapboxgl from 'mapbox-gl';
import { reduce } from 'lodash/collection';
import { isObject, isNumber } from 'lodash/lang';
import { pick, keys, values } from 'lodash/object';
import { WebMercatorViewport } from '@deck.gl/core';

import * as CONFIGS from './configs'
import * as HELPERS from '../../../../../helpers';

export const getBounds = (features = []) => {
  if (!features.length) return CONFIGS.DEFAULT_BOUNDS;

  const invalid = [];

  const extender = (bounds, coordinates, i) => {
    try {
      return bounds.extend(coordinates);
    } catch (error) {
      invalid.push(i);
      return bounds
    }
  };

  try {
    const bounds = reduce(features, (bounds, feature = {}, i) => {
      const { geometry = {} } = feature;
      const { coordinates = [], type } = geometry;

      if (type === 'Point') {
        return extender(bounds, coordinates, i);
      }

      if (type === 'LineString') {
        return reduce(coordinates, (b, c) => extender(b, c, i), bounds);
      }

      if (type === 'Polygon') {
        return reduce(coordinates[0], (b, c) => extender(b, c, i), bounds);
      }

      return bounds;
    }, new mapboxgl.LngLatBounds());

    if (invalid.length) {
      console.log('GeoJSON input includes invalid features. Indexes:', invalid);
    }

    let swLng = bounds['_sw'].lng;
    let neLng = bounds['_ne'].lng;
    let swLat = bounds['_sw'].lat;
    let neLat = bounds['_ne'].lat;

    if (swLat < CONFIGS.MAX_BOUNDS_LAT.sw) swLat = CONFIGS.MAX_BOUNDS_LAT.sw;
    if (neLat > CONFIGS.MAX_BOUNDS_LAT.ne) neLat = CONFIGS.MAX_BOUNDS_LAT.ne;

    return [
      [ swLng, swLat ],
      [ neLng, neLat ],
    ];
  } catch (error) {
    console.log('Can not get bounds - something wrong with GeoJSON input');
    console.log(error);
    return CONFIGS.DEFAULT_BOUNDS;
  }
};

export const getViewStateByFeatures = (features = [], params = {}) => {
  let width = params.contentWidth;
  let height = params.contentHeight;

  if (width < 200) width = 200;

  const viewport = new WebMercatorViewport({ width, height })
    .fitBounds(getBounds(features), { padding: params.contentPadding });

    return { ...CONFIGS.DEFAULT_VIEW_STATE, ...pick(viewport, CONFIGS.BOUND_POSITION_KEYS) };
};

export const getViewStateByBounds = (bounds, params = {}) => {
  const viewport = new WebMercatorViewport({
    width: params.contentWidth,
    height: params.contentHeight,
  }).fitBounds(bounds, { padding: params.contentPadding });

  return pick(viewport, CONFIGS.BOUND_POSITION_KEYS);
};

export const getTipData = (object = {}) => {
  const { id, cluster, segment, properties = {} } = object;

  if (properties.editable === 'free') return;

  return object;
};

export const getFormData = (object = {}) => {
  const { properties = {} } = object;

  if (properties.editable === 'free') return;

  let model = properties['p-model'];
  let record = properties['id'];

  if (isObject(properties.ref)) {
    const [ m ] = keys(properties.ref);
    const [ r ] = values(properties.ref);

    if (HELPERS.getModel(+m) && isNumber(+r)) {
      model = +m;
      record = +r;
    }
  }

  if (!(model && record)) return;

  return { model, record };
};

export const roundCoordinates = (coordinates) => {
  return lodash.map(coordinates, (num) => {
    if (lodash.isArray(num)) {
      return roundCoordinates(num);
    }
    return Number(num.toFixed(9));
  });
};
