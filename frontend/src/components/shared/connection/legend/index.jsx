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
    onTickChange: PropTypes.func.isRequired,
    onClickItem: PropTypes.func.isRequired,
    win_size: PropTypes.number.isRequired, 
    sorted: PropTypes.number.isRequired, 
    sorted_result: PropTypes.bool.isRequired, 
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
        onTickChange={this.props.onTickChange}
        value = {this.props.value}
        win_size = {this.props.win_size}
        sorted = {this.props.sorted}
        sorted_result = {this.props.sorted_result}
      />
    );
  }
  

  render() {
    
    return (
      <div style={{ zIndex: 1, height: '500px'}} className="view-map-legend" >
        {this.renderWidthResizer()}
        {this.renderMenu()}
      </div>
    );
  }
}
