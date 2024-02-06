import React, { Component } from 'react';
import { Modal, Icon } from 'semantic-ui-react';

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = { isOpened: false };
  }

  handleOpenModal = () => this.setState({ isOpened: true });
  handleCloseModal = () => this.setState({ isOpened: false });

  render() {
    const { isOpened } = this.state;
    const mountNode = document.getElementById('root');

    return (
      <span>
        <Icon name="search" onClick={this.handleOpenModal} />
        <Modal mountNode={mountNode} open={isOpened} onClose={this.handleCloseModal} size='large' closeIcon='close' >
          <div style={{ minHeight: '100px', display: 'flex' }}>
            {React.Children.map(this.props.children, (child) => React.isValidElement(child)
              ? React.cloneElement(child, { closeParent: this.handleCloseModal })
              : child
            )}
          </div>
        </Modal>
      </span>
    );
  }
}
