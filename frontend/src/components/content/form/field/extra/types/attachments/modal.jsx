import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'semantic-ui-react';

export default class AttachmentsModal extends Component {
  static propTypes = {
    enabled: PropTypes.bool.isRequired,
    field: PropTypes.object.isRequired,
    record: PropTypes.object.isRequired,
    model: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
  }

  render() {
    return (
      <Modal mountNode={document.getElementById('root')} open={true} onClose={this.props.onClose} style={{ position: 'relative' }} size="large" closeIcon="close">
        <Modal.Content>Not done yet ...</Modal.Content>
      </Modal>
    );
  }
}
