import lodash from 'lodash'

import * as Types from './types'
import * as Helpers from './helpers'
import * as CONFIGS from '../configs';

export default (props = {}) => {
  const {
    data, draw, configs, exclude, zoom,
    onClick, onHover, onEdit, onSelect,
  } = props;

  // remove data.features duplicated coordinates for LineString, if they near each other
  Helpers.removeDuplicatedCoordinates(data.features);

  const layers = [];

  if (draw.enable) {
    layers.push(new Types.GeoJsonEditLayer({
      id: 'geojson-edit',
      data: {
        type: 'FeatureCollection',
        features: data.features,
        sections: data.sections,
      },
      draw,
      configs,
      onEdit,
      onSelect,
      getFilterValue: (f) => {
        return !exclude.includes(f.id)
          ? 1
          : 0;
      },
    }));
  }

  layers.push(new Types.GeoJsonLayer({
    id: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: data.features,
      sections: data.sections,
    },
    draw,
    onClick,
    onHover,
    getFilterValue: (f) => {
      const conditions = [
        !exclude.includes(f.id),
        f.geometry.type !== 'Point',
      ];

      if (draw.enable) {
        conditions.push(!f.properties.editable)
      }

      return lodash.every(conditions) ? 1 : 0
    },
  }));

  const features = lodash.filter(data.features, (f) => {
    const conditions = [
      f.geometry.type === 'Point',
      !exclude.includes(f.id),
    ]

    return lodash.every(conditions);
  });

  if (configs.cluster && zoom !== CONFIGS.DEFAULT_VIEW_STATE.maxZoom) {
    layers.push(new Types.ClusterLayer({
      id: 'cluster',
      data: features,
      draw,
      configs,
      exclude,
      onClick,
      onHover,
    }));
  } else {
    const { same, uniq } = Helpers.getRegularFeatures(features);

    lodash.each(same, (g, k) => {
      if (Object.keys(g).length > 1) {
        const data = lodash.reduce(g, (result, value) => [...result, ...value], []);

        layers.push(new Types.IconGroupLayer({
          id: `icon-rscrd-mixed-${k}`,
          data,
          draw,
          configs,
          exclude,
          onClick,
          onHover,
        }));
      } else {
        lodash.each(g, (data, key) => {
          layers.push(new Types.IconGroupLayer({
            id: `icon-rscrd-plain-${k}-${key}`,
            data,
            draw,
            configs,
            exclude,
            onClick,
            onHover,
          }));
        });
      }
    });

    if (uniq.length) {
      lodash.each(['pixels', 'meters'], (sizeUnits) => {
        layers.push(new Types.IconLayer({
          id: `icon-regular-uniq-${sizeUnits}`,
          data: uniq,
          draw,
          configs,
          onClick,
          onHover,
          sizeUnits,
          getFilterValue: (f) => {
            const su = Helpers.getProperty(draw.properties, f, 'p-size-units')

            return !exclude.includes(f.id)
              && (su === sizeUnits)
                ? 1
                : 0
          },
        }));
        layers.push(new Types.TextLayer({
          id: `text-regular-uniq-${sizeUnits}`,
          subLayer: true,
          data: uniq,
          sizeUnits,
          getFilterValue: (f) => {
            const su = Helpers.getProperty(draw.properties, f, 'p-size-units')
            const pt = Helpers.getProperty(draw.properties, f, 'p-text')

            if (exclude.includes(f.id)) return 0
            if (exclude.includes(f.properties['follow-up'])) return 0
            if (su !== sizeUnits) return 0
            if (!pt) return 0

            return 1
          },
        }));
      });
    }
  }

  return layers;
};
