import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';
import styled from 'styled-components';

const BaseExtraAttributeStyled = styled.div`
  position: relative;
  display: inline-block;
  height: 32px;

  .icon-wrapper {
    position: relative;
    display: inline-flex;
    height: 100%;
    margin-left: 5px;
    .icon {
      position: relative;
      height: 100%;
      width: 30px;
      margin: 0;
      cursor: pointer;
      &::before {
        position: absolute;
        z-index: 1;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 1.5em;
      }
    }
  }

  .hover-controller {
    position: absolute;
    z-index: 0;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
`;

export default class BaseExtraAttribute extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    field: PropTypes.object.isRequired,
    record: PropTypes.object.isRequired,
    model: PropTypes.object.isRequired,
    options: PropTypes.object.isRequired,
    required: PropTypes.bool,
    enabled: PropTypes.bool,
    visible: PropTypes.bool,
    hoverable: PropTypes.bool,
    disabled: PropTypes.bool,
  }

  static defaultProps = {
    hoverable: true,
    required: false,
    enabled: true,
    visible: true,
  }

  constructor(props) {
    super(props);
    this.state = {
      modalOpened: false,
      hoverable: props.hoverable,
    };
  }

  openModal = (callback) => this.setState({ modalOpened: true }, callback);

  closeModal = () => this.setState({ modalOpened: false, hoverable: false });

  handleClick = () => this.openModal(this.clearModalOpeningInterval);

  handleOver = () => (this.state.hoverable && (this.showModalTimeout = setTimeout(this.openModal, 500)));

  handleOverHoverController = () => (this.props.hoverable && this.setState({ hoverable: true }));

  clearModalOpeningInterval = () => this.setState({ hoverable: this.props.hoverable }, clearTimeout(this.showModalTimeout));

  renderHoverController = () => (<div className="hover-controller" onMouseOver={this.handleOverHoverController}></div>);

  renderIcon = () => {
    const iconRenderer = this.getIconRenderer();
    const props = {
      className: 'icon-wrapper',
      onClick: this.handleClick,
      onMouseOver: this.handleOver,
      onMouseOut: this.clearModalOpeningInterval,
    };

    return <div {...props}>{this.state.modalOpened ? <Icon name="hourglass" /> : iconRenderer()}</div>;
  }

  renderModal = () => {
    if (!this.state.modalOpened) return;

    const { required, enabled, field, record, model, options } = this.props;
    const Modal = this.getModal();

    return (
      <Modal
        required={required}
        enabled={enabled}
        field={field}
        record={record}
        model={model}
        options={options}
        onClose={this.closeModal}
      />
    );
  }

  render() {
    const { visible, required } = this.props;

    if (!required && !visible) return null;

    return (
      <BaseExtraAttributeStyled className="field-extra">
        {this.renderIcon()}
        {this.renderHoverController()}
        {this.renderModal()}
      </BaseExtraAttributeStyled>
    );
  }
}
