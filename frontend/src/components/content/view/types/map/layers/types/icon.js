import lodash from 'lodash';
import { IconLayer } from '@deck.gl/layers';
import { DataFilterExtension } from '@deck.gl/extensions';

import * as HELPERS from '../../../../../../../helpers';
import { getProperty } from '../helpers';

export default (props = {}) => {
  const { draw = {} } = props;

  return new IconLayer({
    id: props.id,
    data: props.data,
    pickable: true,
    alphaCutoff: 0,
    sizeScale: 1.15,
    sizeUnits: props.sizeUnits || 'pixels',
    sizeMinPixels: 0,
    onClick: props.onClick,
    onHover: props.onHover,
    extensions: [ new DataFilterExtension({ filterSize: 1 }) ],
    filterRange: [1, 1],
    getFilterValue: props.getFilterValue || ((f) => 1),
    updateTriggers: { getFilterValue: props.getFilterValue || ((f) => 1) },
    getPosition: (f = {}) => f.geometry.coordinates,
    getIcon: (f = {}) => {
      const icon = getProperty(draw.properties, f, 'marker-symbol', 'circle');
      let url = HELPERS.getIcon('font-awesome', 'svg', icon);
      if (!url) {
        url = HELPERS.getIcon('font-awesome', 'svg', 'circle');
      }

      return { url, width: 512, height: 512, mask: true };
    },
    getColor: (f = {}) => {
      let color = getProperty(draw.properties, f, 'marker-color');
      let alpha = getProperty(draw.properties, f, 'marker-opacity');

      if (draw.enable) {
        if (lodash.find(draw.selection, { id: f.id })) {
          color = '#ffffff';
        }
      }

      return HELPERS.HEXtoRGB(color, {
        toArray: true,
        default: '#00ff00',
        alpha,
      });
    },
    getSize: (f = {}) => {
      if (draw.enable) {
        if (lodash.find(draw.selection, { id: f.id })) return 16;
      }

      if (!lodash.isNaN(+f.properties['p-marker-size'])) {
        return +f.properties['p-marker-size'];
      }
      if (!lodash.isNaN(+f.properties['pms'])) {
        return +f.properties['pms'];
      }

      if (f.properties.editable === 'free') {
        if (!lodash.isNaN(+draw.properties[`point`].properties['p-marker-size'])) {
          return +draw.properties[`point`].properties['p-marker-size'];
        }
        if (!lodash.isNaN(+draw.properties[`point`].properties['pms'])) {
          return +draw.properties[`point`].properties['pms'];
        }
      }

      if (f.properties.editable === 'associated') {
        if (!lodash.isNaN(+draw.properties[`point_assoc_${f.properties.model}`].properties['p-marker-size'])) {
          return +draw.properties[`point_assoc_${f.properties.model}`].properties['p-marker-size'];
        }
        if (!lodash.isNaN(+draw.properties[`point_assoc_${f.properties.model}`].properties['pms'])) {
          return +draw.properties[`point_assoc_${f.properties.model}`].properties['pms'];
        }
      }

      const size = getProperty(draw.properties, f, 'marker-size');

      switch (size) {
        case 'small':
          return 20;
        case 'medium':
          return 30;
        case 'large':
          return 40;
        default:
          return 30;
      }
    },
  });
};
