import { GeoJsonLayer } from '@deck.gl/layers';
import { PathStyleExtension, DataFilterExtension } from '@deck.gl/extensions';
import { filter, each, map, find } from 'lodash';

import * as LAYERS from '.';
import * as HELPERS from '../../../../../../../helpers';
import { getProperty } from '../helpers';

export default class extends LAYERS.BaseLayer {
  static defaultProps = {
    filled: true,
    stroked: true,
    pickable: true,
    lineWidthUnits: 'pixels',
    extensions:     { type: 'array', value: [ new PathStyleExtension({ offset: true }), new DataFilterExtension({ filterSize: 1 }) ] },
    getLineColor:   { type: 'accessor', value: (f, props) => this.getLineColor(f, props) },
    getLineWidth:   { type: 'accessor', value: (f, props) => this.getLineWidth(f, props) },
    getOffset:      { type: 'accessor', value: (f, props) => this.getOffset(f, props) },
    getFillColor:   { type: 'accessor', value: (f) => this.getFillColor(f) },
  }

  static getFillColor = (f = {}) => {
    return HELPERS.HEXtoRGB(this.getProperty(f, 'fill'), {
      toArray: true,
      default: '#0000ff',
      alpha: this.getProperty(f, 'fill-opacity'),
    });
  }

  static getLineColor = (f = {}, props) => {
    const color = getProperty(props.draw.properties, f, 'stroke');
    const alpha = getProperty(props.draw.properties, f, 'stroke-opacity');

    return HELPERS.HEXtoRGB(color, {
      toArray: true,
      default: '#0000ff',
      alpha,
    });
  }

  static getLineWidth = (f = {}, props) => {
    const value = getProperty(props.draw.properties, f, 'stroke-width');

    if (value && value > 0) {
      return Math.ceil(value);
    }

    return 0;
  }

  static getOffset = (f = {}, props) => {
    if (f.geometry.type === 'Polygon') {
      if (this.getLineWidth(f, props) >= 2) return 0.5;
    }

    return 0;
  }

  orderLayers(props = {}) {
    const { features, type, sections } = props.data;
    const result = { LineString: {}, Polygon: {} };

    const items = [
      ...filter(features, (f) => f.geometry.type === 'LineString'),
      ...filter(features, (f) => f.geometry.type === 'Polygon')
    ];

    each(sections, (section) => {
      if (!find(items, (item) => item.properties.section === section.id)) return;
      each(items, (feature) => {
        if (feature.properties.section === section.id) {
          const container = result[feature.geometry.type][section.id] || [];

          container.push(feature);
          result[feature.geometry.type][section.id] = container;
        }
      });
    });

    const getLayer = (type) => (features = []) => {
      const [ feature = {} ] = features;

      return new GeoJsonLayer({
        id: `${feature.id}`,
        data: { features, type },
        filled: this.props.filled,
        stroked: this.props.stroked,
        pickable: this.props.pickable,
        lineWidthUnits: this.props.lineWidthUnits,
        onHover: this.props.onHover,
        onClick: this.props.onClick,
        getLineColor: (f) => this.props.getLineColor(f, props),
        getLineWidth: (f) => this.props.getLineWidth(f, props),
        getOffset: (f) => this.props.getOffset(f, props),
        getFillColor: this.props.getFillColor,
        getFilterValue: this.props.getFilterValue,
        filterRange: this.props.filterRange,
        extensions: this.props.extensions,
      });
    };

    return [
      ...map(result.Polygon, getLayer(type)),
      ...map(result.LineString, getLayer(type)),
    ];
  }

  renderLayers() {
    return this.orderLayers(this.props);
  }
};
