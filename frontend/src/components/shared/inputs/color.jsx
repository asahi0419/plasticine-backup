import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';
import styled from 'styled-components';
import { SketchPicker } from 'react-color';
import { isEmpty } from 'lodash/lang';

import { parseRGBAString } from '../../../helpers';

const StyledInput = styled.div`
  margin-top: 4px;

  > .color {
    width: 22px;
    height: 22px;
    border-radius: 3px;
    box-shadow: 0 0 0 1px rgba(0,0,0,.1);
    display: inline-block;
    cursor: pointer;
    margin-right: 8px;
    vertical-align: middle;
  }

  .popover {
    position: absolute;
    z-index: 2;
    margin-top: 2px;
  }

  .cover {
    position: fixed;
    top: 0px;
    right: 0px;
    bottom: 0px;
    left: 0px;
  }
`;

export default class Color extends Component {
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    enabled: PropTypes.bool,
  };

  state = {
    displayColorPicker: false,
  };

  handleClick = () => {
    if (!this.props.enabled) return;
    this.setState({ displayColorPicker: !this.state.displayColorPicker })
  };

  handleClose = () => {
    this.setState({ displayColorPicker: false })
  };

  handleClearValue = () => {
    if (!this.props.enabled) return;
    this.props.onChange({});
  };

  renderPicker = (color) => {
    if (!this.state.displayColorPicker || !this.props.enabled) return null;

    return (
      <div className='popover'>
        <div className='cover' onClick={ this.handleClose }/>
        <SketchPicker color={ color } onChange={ this.props.onChange } presetColors={[]} />
      </div>
    )
  };

  render() {
    const { value } = this.props;
    const color = parseRGBAString(value) || {};
    const colorStyle = {};

    if (!isEmpty(color)) {
      colorStyle.background = `rgba(${ color.r }, ${ color.g }, ${ color.b }, ${ color.a })`;
    }

    return (
      <StyledInput className='color-input'>
        <div className='color' style={ colorStyle } onClick={ this.handleClick } />
        <span style={{ marginRight: '8px' }}>{value}</span>
        {!isEmpty(color) &&  <Icon name="remove" onClick={this.handleClearValue} link />}

        {this.renderPicker(color)}
      </StyledInput>
    )
  }
}
