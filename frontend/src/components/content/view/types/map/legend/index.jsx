import React, { Component } from 'react';
import PropTypes from 'prop-types';

import LegendWidthResizer from './width-resizer';
import LegendMenu from './menu';

export default class Legend extends Component {
  static propTypes = {
    map: PropTypes.object,
    data: PropTypes.object.isRequired,
    legend: PropTypes.object.isRequired,
    configs: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onClickItem: PropTypes.func.isRequired,
  }

  renderWidthResizer() {
    return (
      <LegendWidthResizer
        map={this.props.map}
        configs={this.props.configs}
        onChange={this.props.onChange}
      />
    );
  }

  renderMenu() {
    return (
      <LegendMenu
        data={this.props.data}
        legend={this.props.legend}
        configs={this.props.configs}
        onChange={this.props.onChange}
        onClickItem={this.props.onClickItem}
      />
    );
  }

  render() {
    return (
      <div style={{ position: 'absolute', zIndex: 1, height: '100%' }} className="view-map-legend">
        {this.renderWidthResizer()}
        {this.renderMenu()}
      </div>
    );
  }
}
