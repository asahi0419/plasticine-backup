import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { Header } from 'semantic-ui-react'

import DefaultRenderer from '../../../../shared/renderers/attachment/default';
import ImageRenderer from '../../../../shared/renderers/attachment/image';
import Modal from '../../../../shared/modal';
import { bytesToSize, getFileType, downloadAttachment } from '../../../../../helpers';

const RENDERERS = {
  image: ImageRenderer,
  default: DefaultRenderer,
};

export default class Preview extends Component {
  static propTypes = {
    attachment: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
  }

  renderHeader(style) {
    const attachment = this.props.attachment;
    const previewText = i18n.t('preview_attachment', { defaultValue: 'Preview' });
    const fileName = attachment.file_name;
    const fileSize = bytesToSize(attachment.file_size);

    return <Header style={style} as='h3'>{previewText}: {fileName} ({fileSize})</Header>;
  }

  renderContent(style, type) {
    const attachment = this.props.attachment;
    const Renderer = RENDERERS[type] || RENDERERS.default;

    return <Renderer attachment={attachment} style={style} />;
  }

  renderDownloadLink(style) {
    return (
      <Link onClick={() => downloadAttachment(this.props.attachment)} style={style}>
        {i18n.t('download_attachment', { defaultValue: 'Download' })}
      </Link>
    );
  }

  render() {
    const { attachment, onClose } = this.props;
    if (!attachment) return null;

    const type = getFileType(attachment);

    const scale = 70;
    const padding = 1;

    const headerHeight = 25;
    const headerMarginBottom = 10;
    const linkHeight = 20;
    const linkMarginTop = 10;

    const styleHeader = { marginBottom: `${headerMarginBottom}px`, height: `${headerHeight}px` };
    const styleLink = { marginTop: `${linkMarginTop}px`, height: `${linkHeight}px`, display: 'block', cursor: 'pointer' };

    const styleModal = { width: 'auto', height: 'auto' };
    const styleModalContent = { padding: `${padding}vw` };
    const styleRenderer = {};

    if (type === 'image') {
      styleRenderer.maxWidth = `${scale - padding * 2}vw`;
      styleRenderer.maxHeight = `${scale}vh`;
    } else {
      styleRenderer.height = `calc(100% - ${headerHeight + headerMarginBottom + linkHeight + linkMarginTop}px)`;

      styleModal.width = `${scale - padding * 2}vw`;
      styleModal.height = `${scale}vh`;

      styleModalContent.width = '100%';
      styleModalContent.height = '100%';
    }

    return (
      <Modal style={styleModal} styleContent={styleModalContent} opened={true} onClose={onClose} closeOnDimmerClick={true}>
        {this.renderHeader(styleHeader)}
        {this.renderContent(styleRenderer, type)}
        {this.renderDownloadLink(styleLink)}
      </Modal>
    );
  }
}
