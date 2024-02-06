import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PubSub from 'pubsub-js';

import { uploadFiles } from '../../../../helpers';

export default class Uploader extends Component {
  static propTypes = {
    onUpload: PropTypes.func.isRequired,
  }

  componentWillMount() {
    this.selectedFilesToken = PubSub.subscribe('files_selected', (_, files) => {
      uploadFiles(files, this.props.onUpload);
    });
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.selectedFilesToken);
  }

  render() {
    return null;
  }
}
