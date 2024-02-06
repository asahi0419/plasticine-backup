import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { Button } from 'semantic-ui-react';

export default class ActionElement extends Component {
  static propTypes = {
    action: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
    model: PropTypes.object.isRequired,
    record: PropTypes.object.isRequired,
    handleAction: PropTypes.func.isRequired,
  }

  static contextTypes = {
    sandbox: PropTypes.object.isRequired,
  }

  onClick = async () => {
    const { action, model, record, handleAction } = this.props;

    const options = {
      record: {
        ...record.attributes,
        __humanizedAttributes: record.humanizedAttributes,
      },
    };

    if (action.client_script) {
      let result = await this.context.sandbox.executeScript(
        action.client_script,
        { modelId: model.id },
        `action/${action.id}/client_script`,
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

    handleAction(model, action, options);
  }

  render() {
    const { action, params } = this.props;

    const actionElements = {
      link: <Link style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={this.onClick}>{this.props.children || action.name}</Link>,
      button: <Button onClick={this.onClick}>{action.name}</Button>
    };

    return actionElements[params.type];
  }
}
