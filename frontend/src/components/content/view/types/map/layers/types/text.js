import { isString, isNil } from 'lodash/lang';
import { DataFilterExtension } from '@deck.gl/extensions';
import { TextLayer } from '@deck.gl/layers';

import * as LAYERS from '.';
import * as HELPERS from '../../../../../../../helpers';

const padding = 4;

export default class extends LAYERS.BaseLayer {
  static defaultProps = {
    subLayer:             false,
    background:           true,
    backgroundPadding:    [ padding, padding ],
    sizeUnits:            'pixels',
    extensions:           { type: 'array', value: [new DataFilterExtension({ filterSize: 1 })] },
    getAlignmentBaseline: { type: 'accessor', value: (f) => this.getAlignmentBaseline(f) },
    getAngle:             { type: 'accessor', value: (f) => this.getAngle(f) },
    getBackgroundColor:   { type: 'accessor', value: (f) => this.getBackgroundColor(f) },
    getBorderColor:       { type: 'accessor', value: (f) => this.getBorderColor(f) },
    getBorderWidth:       { type: 'accessor', value: (f) => this.getBorderWidth(f) },
    getColor:             { type: 'accessor', value: (f) => this.getColor(f) },
    getSize:              { type: 'accessor', value: (f) => this.getSize(f) },
    getPixelOffset:       { type: 'accessor', value: (f) => this.getPixelOffset(f) },
    getText:              { type: 'accessor', value: (f) => this.getText(f) },
    getTextAnchor:        { type: 'accessor', value: (f) => this.getTextAnchor(f) },
  }

  static getAlignmentBaseline = (f) => {
    const value = this.getProperty(f, 'p-text-anchor') || '';

    if (value.includes('top')) return 'top';
    if (value.includes('bottom')) return 'bottom';

    return 'center';
  }

  static getAngle = (f) => {
    const value = +this.getProperty(f, 'p-text-rotate');
    const valueDefault = 0;

    return value || valueDefault;
  }

  static getBackgroundColor = (f) => {
    const value = this.getProperty(f, 'p-text-halo-color');
    if (!value) return [0, 0, 0, 0];

    return HELPERS.HEXtoRGB(value, { toArray: true });
  }

  static getBorderColor = (f) => {
    const value = this.getProperty(f, 'p-text-halo-color');
    if (!value) return [0, 0, 0, 0];

    return HELPERS.HEXtoRGB(value, { toArray: true, alpha: 0 });
  }

  static getBorderWidth = (f) => {
    const value = this.getProperty(f, 'p-text-halo-width');
    if (isNil(value)) return 0;

    return (value > 0) ? (padding / value) : padding;
  }

  static getColor = (f) => {
    const valueDefault = '#202020';
    const value = this.getProperty(f, 'p-text-color');

    return HELPERS.HEXtoRGB(value, { toArray: true, default: valueDefault });
  }

  static getSize = (f) => {
    const valueDefault = 12;
    const value = this.getProperty(f, 'p-text-size');

    return value || valueDefault;
  }

  static getPixelOffset = (f) => {
    const value = this.getProperty(f, 'p-text-offset');
    if (isNil(value)) return [0, 0];

    return isString(value) ? HELPERS.parseOptions(value) : value;
  }

  static getText = (f) => {
    return this.getProperty(f, 'p-text');
  }

  static getTextAnchor = (f) => {
    const value = this.getProperty(f, 'p-text-anchor') || '';

    if (value.includes('left')) return 'start';
    if (value.includes('right')) return 'end';

    return 'middle';
  }

  renderLayers() {
    let options = {
      data: this.props.data,
      background: this.props.background,
      backgroundPadding: this.props.backgroundPadding,
      filterRange: this.props.filterRange,
      extensions: this.props.extensions,
      sizeUnits: this.props.sizeUnits,
      getAlignmentBaseline: this.props.getAlignmentBaseline,
      getAngle: this.props.getAngle,
      getBackgroundColor: this.props.getBackgroundColor,
      getBorderColor: this.props.getBorderColor,
      getBorderWidth: this.props.getBorderWidth,
      getColor: this.props.getColor,
      getPixelOffset: this.props.getPixelOffset,
      getPosition: this.props.getPosition,
      getSize: this.props.getSize,
      getText: this.props.getText,
      getTextAnchor: this.props.getTextAnchor,
      getFilterValue: this.props.getFilterValue || ((f) => 1),
      updateTriggers: {
        getFilterValue: this.props.getFilterValue || ((f) => 1)
      },
    }

    if (this.props.subLayer) {
      options = this.getSubLayerProps(options)
    } else {
      options.id = HELPERS.makeUniqueID()
    }

    return [
      new TextLayer(options),
    ];
  }
};
