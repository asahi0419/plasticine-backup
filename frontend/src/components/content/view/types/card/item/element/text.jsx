import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class TextElement extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
  }

  render() {
    return <div>{this.props.params.text}</div>;
  }
}
