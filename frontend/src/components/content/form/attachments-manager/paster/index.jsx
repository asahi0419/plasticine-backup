import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PubSub from 'pubsub-js';

import PasterService from './service';

export default class Paster extends Component {
  static propTypes = {
    record: PropTypes.object.isRequired,
    onPaste: PropTypes.func.isRequired,
  }

  componentDidMount() {
    const { record, onPaste } = this.props;
    this.service = new PasterService(record);

    this.service.on('paste-image', (file) => {
      PubSub.publish('files_selected', [{ file }]);
      onPaste([file]);
    });

    this.service.listen();
  }

  componentWillUnmount() {
    this.service.stop();
  }

  render() {
    return null;
  }
}
