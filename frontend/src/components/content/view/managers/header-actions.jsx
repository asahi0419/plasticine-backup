import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { filter } from 'lodash/collection';

import ActionsBar from '../../action/actions-bar';

export default class HeaderActionsManager extends Component {
  static propTypes = {
    props: PropTypes.shape({
      model: PropTypes.object.isRequired,
      actions: PropTypes.array.isRequired,
    }),
    configs: PropTypes.shape({
      showHeaderActions: PropTypes.bool.isRequired,
    }),
    callbacks: PropTypes.shape({
      handleAction: PropTypes.func,
    }),
  }

  renderManager() {
    const { props = {}, callbacks = {} } = this.props;
    const { handleAction } = callbacks;
    const { model } = props;

    const actions = filter(props.actions, (a = {}) => {
      return a.group || ['view_button'].includes(a.type);
    });

    return (
      <ActionsBar
        model={model}
        actions={actions}
        handleAction={handleAction}
        context="view"
      />
    );
  }

  render() {
    if (!this.props.configs.showHeaderActions) return null;
    if (!this.props.callbacks.handleAction) return null;

    return (
      <div className="view-manager header-actions-manager">
        {this.renderManager()}
      </div>
    );
  }
}
