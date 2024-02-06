import React, { Component } from 'react';
import PropTypes from 'prop-types';

import PlasticineApi from '../../../../api';
import { getFileType, getFileIcon, downloadAttachment } from '../../../../helpers';

export default class DefaultRenderer extends Component {
  static propTypes = {
    attachment: PropTypes.object.isRequired,
    style: PropTypes.object,
  }

  render() {
    const type = getFileType(this.props.attachment);
    const name = getFileIcon(type);

    const url = PlasticineApi.getAttachmentURL(this.props.attachment);
    const src = `https://docs.google.com/gview?url=${window.location.origin}${url}&embedded=true`;

    return (
      <div style={this.props.style}>
        <iframe width="100%" height="100%" frameBorder="0" className={type} src={src}></iframe>
      </div>
    );
  }
}
