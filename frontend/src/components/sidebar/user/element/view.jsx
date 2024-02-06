import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { find } from 'lodash/collection';

import LinkWrapper from './link-wrapper';

export default class extends Component {
  static propTypes = {
    models: PropTypes.array.isRequired,
    views: PropTypes.array.isRequired,
    params: PropTypes.object.isRequired,
  }

  render() {
    const { models, views, params } = this.props;

    const model = find(models, { id: params.model });
    const view = find(views, { id: params.view });

    if (!model || !view) return null;

    const url = `/${model.alias}/view/${view.type}/${view.alias}`;
    return <LinkWrapper name={params.name} icon={params.icon} to={url}/>;
  }
}
