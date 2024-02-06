import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PubSub from 'pubsub-js';

import { makeUniqueID } from '../helpers';
import FormModal from './shared/form-modal';
import ViewModal from './shared/view-modal';
import PageModal from './shared/page-modal'

export default class Modals extends Component {
  state = { modal: null }

  componentDidMount() {
    this.token = PubSub.subscribe('modal', (topic, data) => {
      const modalsElement = this.getModalsElement();
      if (modalsElement) return;
      this.setState({ modal: { ...data, id: makeUniqueID() }});
    });
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.token);
  }

  getModalsElement = () => document.getElementById('modals');

  handleCloseModal = (data) => {
    if (this.state.modal.onClose) {
      this.state.modal.onClose(data)
    }

    this.setState({ modal: null });
  }

  renderFormModal(data) {
    const { modelAlias, recordId, id, options = {}, parent } = data;

    return (
      <FormModal
        key={id}
        modelAlias={modelAlias}
        recordId={recordId}
        opened={true}
        options={options}
        parent={parent}
        onClose={this.handleCloseModal}
      />
    );
  }

  renderViewModal(data = {}) {
    return (
      <ViewModal
        key={data.id}
        modelAlias={data.modelAlias}
        viewAlias={data.viewAlias}
        opened={true}
        options={data.options}
        actions={data.actions}
        parent={data.parent}
        onClose={this.handleCloseModal}
        onChoose={this.state.modal.onChoose}
        selectable={data.selectable}
        rowselect={data.rowselect}
        editable={data.editable}
        showGroupActions={data.showGroupActions}
        showModelName={data.showModelName}
        showFilterManager={data.showFilterManager}
        showQuicksearch={data.showQuicksearch}
        withHeaderMenu={data.withHeaderMenu}
        references={data.references}
        fullMode={data?.options?.popup === 'full'}
      />
    );
  }

  renderPageModal(data) {
    return (
      <PageModal
        key={data.id}
        opened={true}
        parent={data.parent}
        params={data.params}
        pageAlias={data.pageAlias}
        onClose={this.handleCloseModal}
      />
    )
  }

  renderModal(modal) {
    if (modal.target === 'view') {
      return this.renderViewModal(modal);
    }
    
    if (modal.target === 'form') {
      return this.renderFormModal(modal);
    }

    if (modal.target === 'page') {
      return this.renderPageModal(modal);
    }
  }

  render() {
    const { modal } = this.state;
    const modalsElement = this.getModalsElement();

    return (!modalsElement && modal) ? <div id="modals">{this.renderModal(modal)}</div> : null;
  }
}
