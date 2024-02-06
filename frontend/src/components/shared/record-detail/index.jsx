import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { Icon } from 'semantic-ui-react';
import styled from 'styled-components';

import FormModal from '../form-modal';

const RecordDetailStyled = styled.div`
  position: relative;
  display: inline-block;
  height: 100%;

  .icon {
    position: relative;
    z-index: 1;
    height: 100%;
    width: ${props => props.size === 'small' ? '1.18em' : '100%'};
    margin: 0;
    font-size: ${props => props.size === 'small' ? '1em' : '1.5em'};
    line-height: ${props => props.size === 'small' ? '1em' : '1.6em'};
    cursor: pointer;
  }

  .hover-controller {
    position: absolute;
    z-index: 0;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    transform: scale(1.5);
  }
`;

export default class RecordDetail extends Component {
  static propTypes = {
    modelAlias: PropTypes.string.isRequired,
    recordId: PropTypes.number.isRequired,
    hoverable: PropTypes.bool,
    openOnNewTab: PropTypes.bool,
    size: PropTypes.oneOf(['small', 'large']),
  }

  static defaultProps = {
    hoverable: true,
    openOnNewTab: true,
    size: 'small',
  }

  constructor(props) {
    super(props);
    this.state = {
      formModalOpened: false,
      formModalContentIsLoading: false,
      hoverable: props.hoverable,
    };
  }

  handleCloseModal = () => this.setState({ formModalOpened: false, hoverable: false });

  handleModalContentLoaded = () => this.setState({ formModalContentIsLoading: false });

  handleOverFormIcon = () => {
    if (!this.state.hoverable) return;

    this.showFormModalTimeout = setTimeout(() => {
      this.setState({ formModalOpened: true, formModalContentIsLoading: true });
    }, 500);
  }

  handleOverHoverController = () => {
    if (this.props.hoverable) this.setState({ hoverable: true });
  }

  clearFormOpeningInterval = () => clearTimeout(this.showFormModalTimeout);

  selectedCheckboxesCounter = () => document.querySelectorAll('i.checkmark.box.link.icon');

  messageGenerator = () => {
    this.words = ['record', 'records'];
    this.selectedCheckboxes = this.selectedCheckboxesCounter();
    this.selectedCheckboxes.length === 1 ? this.word = this.words[0] : this.word = this.words[1];
    this.message = `Selected ${this.selectedCheckboxes.length} ${this.word}. Are you sure to open the record form?`;
    return this.message;
  }
  
  handleOnClick = (e) => {
    clearTimeout(this.showFormModalTimeout)
    this.selectedCheckboxes = this.selectedCheckboxesCounter();
    this.message = this.messageGenerator();
    
    if (this.selectedCheckboxes.length) {
      if (!confirm(this.message)) {
        e.preventDefault();
      }
    }
  }

  renderFormModal() {
    if (!this.state.formModalOpened) return;

    const { modelAlias, recordId, parent } = this.props;

    return (
      <FormModal
        parent={parent}
        modelAlias={modelAlias}
        recordId={recordId}
        opened={this.state.formModalOpened}
        onClose={this.handleCloseModal}
        onContentLoaded={this.handleModalContentLoaded}
        options={{ popup: 'preview' }}
      />
    );
  }

  render() {
    const { modelAlias, recordId, size, openOnNewTab } = this.props;

    const linkProps = { to: `/${modelAlias}/form/${recordId}`, onClick: this.handleOnClick };
    if (openOnNewTab) linkProps.target = '_blank';

    return (
      <RecordDetailStyled size={size} className="record-detail">
        <Link {...linkProps}>
          {this.state.formModalContentIsLoading ?
            <Icon name="hourglass full" /> :
            <Icon name="wpforms" onMouseOver={this.handleOverFormIcon} onMouseOut={this.clearFormOpeningInterval}/>}
          <div className="hover-controller" onMouseOver={this.handleOverHoverController}></div>
        </Link>
        {this.renderFormModal()}
      </RecordDetailStyled>
    );
  }
}
