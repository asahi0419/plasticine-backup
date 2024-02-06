import React, { Component } from 'react';
import PropTypes from 'prop-types';

import LinkWrapper from './link-wrapper';

export default class extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
  }

  render() {
    const { params } = this.props;

    const target = params.open_in_new_tab ? '_blank' : '_self';

    return <LinkWrapper name={params.name} to={params.url} icon={params.icon} target={target}/>;
  }
}
