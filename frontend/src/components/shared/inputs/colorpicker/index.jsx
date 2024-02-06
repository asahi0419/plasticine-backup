import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ColorPicker from 'rc-color-picker';
import { Icon } from 'semantic-ui-react';

import { RGBAtoHEX, HEXtoRGB } from '../../../../helpers';

const colorPickerTrigger = {
  width: 17,
  height: 17,
  marginRight: 8,
  borderRadius: '.28571429rem',
  border: '1px solid #d4d4d5',
  backgroundColor: 'inherit'
};

const DEFAULT_COLOR = 'rgba(255, 255, 255, 1)';

export default class extends Component {
  static propTypes = {
    label: PropTypes.string,
    color: PropTypes.string,
    onChange: PropTypes.func.isRequired
  };

  static defaultProps = {
    color: DEFAULT_COLOR,
    defaultColor: DEFAULT_COLOR,
    inline: false
  };

  handleChange = ({ color, alpha }) => {
    const rgb = HEXtoRGB(color);
    const value = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha / 100})`;
    return this.props.onChange(null, { value });
  };

  clearValue = (e) => {
    return this.props.onChange(null, { value: this.props.defaultColor });
  };

  render() {
    const { color, defaultColor, label, inline } = this.props;

    const alpha = parseFloat(color.replace(/^.*,(.+)\)/, '$1')) * 100;

    return (
      <div className="ui colorpicker">
        {label && <label style={{ display: 'block', marginBottom: inline ? '0' : '5px' }}>{label}</label>}
        <div className="trigger" style={{ display: 'flex', alignItems: 'center', height: '17px' }}>
          <ColorPicker style={{ zIndex: 100000 }} color={RGBAtoHEX(color)} alpha={alpha} onChange={this.handleChange}>
            <span><div style={colorPickerTrigger}/></span>
          </ColorPicker>
          <span style={{ marginTop: '-2px' }}>{color}</span>
          {color && (color !== defaultColor) && <Icon link name={'close'} onClick={this.clearValue} style={{ height: 'inherit', marginLeft: '0.25rem' }} />}
        </div>
      </div>
    );
  }
}
