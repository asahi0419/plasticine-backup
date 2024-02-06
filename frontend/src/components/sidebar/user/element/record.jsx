import React, { Component } from 'react';
import PropTypes from 'prop-types';

import LinkWrapper from './link-wrapper';

export default class extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
  }

  render() {
    const { models, params, createNew } = this.props;

    const model = models.find(({ id }) => (id === params.model));
    // handle PUSH for /new record urls!
    const url = `/${model.alias}/form/${createNew ? 'new' : params.record_id}`;

    return <LinkWrapper name={params.name} icon={params.icon} to={url}/>;
  }
}
