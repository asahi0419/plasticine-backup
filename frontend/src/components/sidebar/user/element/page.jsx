import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { find } from 'lodash/collection';

import LinkWrapper from './link-wrapper';

export default class extends Component {
  static propTypes = {
    pages: PropTypes.array.isRequired,
    params: PropTypes.object.isRequired,
  }

  render() {
    const { pages, params = {} } = this.props;

    const page = find(pages, { id: params.page }) || {};
    const url = `/pages/${page.alias}`;

    return <LinkWrapper name={params.name} icon={params.icon} to={url}/>;
  }
}
