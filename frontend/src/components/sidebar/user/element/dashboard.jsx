import React, { Component } from 'react';
import PropTypes from 'prop-types';

import LinkWrapper from './link-wrapper';

export default class extends Component {
  static propTypes = {
    dashboards: PropTypes.array.isRequired,
    params: PropTypes.object.isRequired,
  }

  render() {
    const { dashboards, params } = this.props;

    const dashboard = dashboards.find(({ id }) => (id === params.dashboard));
    const url = `/dashboard/${dashboard.alias}`;

    return <LinkWrapper name={params.name} icon={params.icon} to={url}/>;
  }
}
