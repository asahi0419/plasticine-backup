import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { find } from 'lodash/collection';

import LinkWrapper from './link-wrapper';

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    record: PropTypes.object.isRequired,
    actions: PropTypes.array.isRequired,
    params: PropTypes.object.isRequired,
    handleAction: PropTypes.func.isRequired,
  }

  onClick = async (action) => {
    if (!action) return;

    const options = {
      exec_by: { type: 'user_sidebar' },
      record: { id: this.props.record.id },
    };

    const sandbox = new Sandbox()

    if (action.client_script) {
      let result = await sandbox.executeScript(
        action.client_script,
        { modelId: action.model },
        `action/${action.id}/client_script`
      );

      if (typeof result === 'object') {
        if (result.result === true) {
          options.ui_params = result.ui_params;
          result = true;
        } else {
          result = false;
        }
      }

      if (!result) return;
    }

    this.props.handleAction(this.props.model, action, options);
  }

  render() {
    const { params = {}, actions = [] } = this.props;
    const { name, icon } = params;

    const action = find(actions, ({ id }) => id === parseInt(params.action));
    const onClick = () => this.onClick(action);

    return action
      ? <LinkWrapper name={name} icon={icon} onClick={onClick}/>
      : null;
  }
}
