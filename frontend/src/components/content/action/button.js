import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Dropdown, Icon, Popup } from 'semantic-ui-react';
import { reduce } from 'lodash/collection';
import qs from 'qs'

import * as CONSTANTS from '../../../constants';
import * as HELPERS from '../../../helpers';
import { processError } from '../../../actions/helpers';

const DEFAULT_STATE = {
  disabled: false,
  hintIsOpened: false,
};

export default class ActionButton extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    action: PropTypes.object.isRequired,
    record: PropTypes.object,
    handleAction: PropTypes.func.isRequired,
    asDropdownItem: PropTypes.bool,
    asIcon: PropTypes.bool,
    defaultIcon: PropTypes.string,
    hash: PropTypes.string,
  };

  static defaultProps = {
    asDropdownItem: false,
    asIcon: false,
    defaultIcon: 'paper plane',
  };

  static contextTypes = {
    sandbox: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = DEFAULT_STATE;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.hash !== this.props.hash) {
      this.setState(DEFAULT_STATE);
    }
  }

  setEnabled = () => {
    this.setState({ disabled: false });
  }

  handleMouseOut = () => {
    if (!this.props.action.hint) return;
    clearTimeout(this.showHintTimeout);
    this.setState({ hintIsOpened: false });
  };

  handleMouseOver = () => {
    if (!this.props.action.hint) return;
    this.showHintTimeout = setTimeout(() => this.setState({ hintIsOpened: true }), 500);
  };

  handleButtonClick = async (e) => {
    if (this.state.disabled) return;

    e.preventDefault();
    this.setState({ disabled: true });
    const { model, action, record } = this.props;

    const callbacks = {
      success: this.setEnabled,
      error: this.setEnabled,
    };
    const options = { callbacks };

    if (action.client_script) {
      try {
        let result = await this.context.sandbox.executeScript(
          action.client_script,
          { modelId: model.id },
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

        if (!result) {
          callbacks.success();
          return;
        }
      } catch (error) {
        processError(error);
        callbacks.error();
        return;
      }
    }


    if (record) {
      options.record = {
        ...record.attributes,
        __humanizedAttributes: record.humanizedAttributes,
        __extraAttributes: record.extraAttributes,
        __templateAttributes: reduce(record.templates, (result, t, key) => {
          const value = { ...t.attributes, __extraAttributes: t.extraAttributes };
          return { ...result, [key]: value };
        }, {}),
      };

      const query = (qs.parse(location.search.substring(1)))

      if (query.system_actions) {
        options.system_actions = query.system_actions
      }
    }

    this.props.handleAction(model, action, options);
  }

  renderWithHint = (buttonRenderer) => {
    const { hint } = this.props.action;
    if (!hint) return buttonRenderer();

    return (
      <Popup
        trigger={buttonRenderer()}
        open={this.state.hintIsOpened}
        content={hint}
      />
    );
  }

  renderButtonAsDropdownItem = () => {
    const { action } = this.props;
    const { icon, icon_position: position } = HELPERS.parseOptions(action.options);

    const children = [
      <span key="name">
        {HELPERS.trimString(action.name, CONSTANTS.UI_ACTION_MENU_NAME_LEN)}
      </span>,
    ];

    if (icon) {
      const element = <Icon key="icon" name={icon} />;

      if (position && (position === 'right')) {
        children.push(element);
      } else {
        children.unshift(element);
      }
    }

    return (
      <Dropdown.Item
        title={action.name}
        onClick={this.handleButtonClick}
        onMouseOver={this.handleMouseOver}
        onMouseOut={this.handleMouseOut}
      >
        {children}
      </Dropdown.Item>
    );
  };

  renderButton = () => {
    const { action, asIcon, defaultIcon } = this.props;
    const options = HELPERS.parseOptions(action.options);
    const iconProps = {};

    if (asIcon) iconProps.icon = defaultIcon;
    if (options.icon) iconProps.icon = options.icon;
    if (options.icon_position) iconProps.labelPosition = options.icon_position;

    return (
      <Button
        {...iconProps}
        basic
        floated="right"
        disabled={this.state.disabled}
        content={asIcon ? '' : <span>{HELPERS.trimString(action.name, CONSTANTS.UI_ACTION_NAME_LEN)}</span>}
        onClick={this.handleButtonClick}
        onMouseOver={this.handleMouseOver}
        onMouseOut={this.handleMouseOut}
        title={action.name}
      />
    );
  };

  render() {
    return this.props.asDropdownItem
      ? this.renderWithHint(this.renderButtonAsDropdownItem)
      : this.renderWithHint(this.renderButton);
  }
}
