import React, { Component } from 'react';
import PropTypes from 'prop-types';

import LegendWidthResizer from './width-resizer';
import LegendMenu from './menu';

export default class Legend extends Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    configs: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  renderWidthResizer() {
    return (
      <LegendWidthResizer
        configs={this.props.configs}
        onChange={this.props.onChange}
      />
    );
  }

  renderMenu() {
    return (
      <LegendMenu
        data={this.props.data}
        configs={this.props.configs}
      />
    );
  }

  render() {
    return (
      <div style={{ position: 'absolute', zIndex: 1, height: '100%' }} className="">
        {this.renderWidthResizer()}
        {this.renderMenu()}
      </div>
    );
  }
}
