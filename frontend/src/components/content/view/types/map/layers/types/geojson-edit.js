import lodash from 'lodash';
import * as Nebula from 'nebula.gl'
import { DataFilterExtension } from '@deck.gl/extensions';

import * as LAYERS from '.';
import * as HELPERS from '../../../../../../../helpers';
import { getProperty } from '../helpers';

class DrawPointMode extends Nebula.DrawPointMode {
  handleClick = (e, props) => {
    if (e.sourceEvent.button === 2) return;
    super.handleClick(e, props);
  }
}

class DrawPolygonMode extends Nebula.DrawPolygonMode {
  handleClick = (e, props) => {
    if (e.sourceEvent.button === 2) return;
    super.handleClick(e, props);
  }
}

class DrawLineStringMode extends Nebula.DrawLineStringMode {
  handleClick = (e, props) => {
    if (e.sourceEvent.button === 2) return;
    super.handleClick(e, props);
  }
}

class ModifyMode extends Nebula.ModifyMode {
  handleClick = (e, props) => {
    if (e.sourceEvent.button === 2) return;
    super.handleClick(e, props);
  }
}

class TransformMode extends Nebula.TransformMode {
  handleClick = (e, props) => {
    if (e.sourceEvent.button === 2) return;
    super.handleClick(e, props);
  }
}

const MODES = {
  point: DrawPointMode,
  lineString: DrawLineStringMode,
  polygon: DrawPolygonMode,
  translate: Nebula.TranslateMode,
  modify: ModifyMode,
  transform: TransformMode,
};

export default class extends LAYERS.BaseLayer {
  static defaultProps = {
    filled: true,
    stroked: true,
    pickable: true,
    lineWidthUnits: 'pixels',
    extensions:     { type: 'array', value: [ new DataFilterExtension({ filterSize: 1 }) ] },
    getLineColor:   { type: 'accessor', value: (f) => this.getLineColor(f) },
    getLineWidth:   { type: 'accessor', value: (f) => this.getLineWidth(f) },
  }

  renderLayers() {
    const { draw, data, onEdit } = this.props;

    const mode = getMode(draw);
    const selectedFeatureIndexes = getSelectedFeatureIndexes(data, draw, mode);

    return [
      new Nebula.EditableGeoJsonLayer({
        data,
        selectedFeatureIndexes,
        onEdit,
        wrapLongitude: true,
        // pointRadiusMinPixels: 6,
        // editHandlePointRadiusMinPixels: 12,
        editHandlePointStrokeWidth: 2,
        getFilterValue: this.props.getFilterValue,
        filterRange: this.props.filterRange,
        extensions: this.props.extensions,
        mode: MODES[mode],
        getEditHandlePointRadius: (f) => {
          if (f.properties.editHandleType === 'intermediate') {
            return 6;
          }

          return 8;
        },
        getEditHandlePointColor: (f) => {
          if (f.properties.positionIndexes) {
            if (!f.properties.positionIndexes.length) {
              return [0, 0, 0, 0]
            }
          }

          if (f.properties.editHandleType === 'intermediate') {
            return HELPERS.HEXtoRGB('#ffffff', {
              toArray: true,
              default: '#ffffff',
              alpha: 0.8,
            })
          }

          if (['rotate', 'scale'].includes(f.properties.editHandleType)) {
            return HELPERS.HEXtoRGB('#ffffff', {
              toArray: true,
              default: '#ffffff',
              alpha: 1,
            })
          }

          return HELPERS.HEXtoRGB('#ffffff', {
            toArray: true,
            default: '#ffffff',
            alpha: f.properties.editable ? 0 : 1,
          })
        },
        getEditHandlePointOutlineColor: (f) => {
          if (f.properties.positionIndexes) {
            if (!f.properties.positionIndexes.length) {
              return [0, 0, 0, 0]
            }
          }

          if (['rotate', 'scale'].includes(f.properties.editHandleType)) {
            return HELPERS.HEXtoRGB('#2184ff', {
              toArray: true,
              default: '#2184ff',
              alpha: 1,
            })
          }

          if (f.geometry.type === 'Point') {
            if (f.properties.editable) {
              return HELPERS.HEXtoRGB('#ffffff', {
                toArray: true,
                default: '#ffffff',
                alpha: 0,
              });
            }

            const color = getProperty(draw.properties, f, 'p-marker-border-color');

            return HELPERS.HEXtoRGB(color, {
              toArray: true,
              default: color,
              alpha: 0.8,
            });
          }
        },
        getFillColor: (f) => {
          if (f.geometry.type === 'Point') {
            return [0, 0, 0, 0]
          }

          if (['LineString', 'Polygon'].includes(f.geometry.type)) {
            let color = getProperty(draw.properties, f, 'fill');
            let alpha = getProperty(draw.properties, f, 'fill-opacity');

            return HELPERS.HEXtoRGB(color, {
              toArray: true,
              default: '#2184ff',
              alpha,
            });
          }
        },
        getLineColor: (f = {}) => {
          if (f.geometry.type === 'Point') {
            return [0, 0, 0, 0]
          }

          if (['LineString', 'Polygon'].includes(f.geometry.type)) {
            let color = getProperty(draw.properties, f, 'stroke');
            let alpha = getProperty(draw.properties, f, 'stroke-opacity');

            if (lodash.find(draw.hovering, { id: f.id })) {
              alpha = 0.7;
            }
            if (lodash.find(draw.selection, { id: f.id })) {
              alpha = 0.8;
            }

            return HELPERS.HEXtoRGB(color, {
              toArray: true,
              default: '#2184ff',
              alpha,
            });
          }
        },
        getLineWidth: (f = {}) => {
          if (['LineString', 'Polygon'].includes(f.geometry.type)) {
            let width = getProperty(draw.properties, f, 'stroke-width');

            if (lodash.find(draw.hovering, { id: f.id })) width = 6;
            if (lodash.find(draw.selection, { id: f.id })) width = 5;

            return width;
          }
        },
      })
    ];
  }
};

function getMode(draw = {}) {
  if (draw.mode) return draw.mode;

  if (draw.selection.length === 1) {
    if (draw.hovering.length === 1) {
      if (lodash.first(draw.selection).id !== lodash.first(draw.hovering).id) {
        return 'translate';
      }
    }

    const feature = lodash.first(draw.selection);

    if (feature.geometry.type === 'LineString') {
      return 'modify';
    }
  }

  return 'translate';
}

function getSelectedFeatureIndexes(data, draw, mode) {
  if (mode === 'modify') {
    return lodash.map([
      ...draw.selection,
    ], (s = {}) => lodash.findIndex(data.features, { id: s.id }));
  }

  return lodash.map([
    ...draw.selection.length
      ? draw.selection
      : draw.hovering,
    ...Object.values(draw.follow),
  ], (s = {}) => lodash.findIndex(data.features, { id: s.id }));
}