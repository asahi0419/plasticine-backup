import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'semantic-ui-react';

import Loader from './loader';

const ModalWindow = ({ opened, onClose, children, style = {}, styleContent = {}, closeOnDimmerClick = false }) => {
  const mountNode = document.getElementById('root');
  const closeIcon = onClose ? 'close' : null;
  const size = (style.width || style.height) ? null : 'large';

  return (
    <Modal
      className="form-modal"
      closeIcon={closeIcon}
      closeOnDimmerClick={closeOnDimmerClick}
      mountNode={mountNode}
      onClose={onClose}
      open={opened}
      size={size}
      style={style}
    >
      <Modal.Content style={{ padding: '0 15px', ...styleContent }}>
        {children ? children : <Loader compact={true} />}
      </Modal.Content>
    </Modal>
  );
};

ModalWindow.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ModalWindow;
