import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu';
import { Link } from 'react-router';
import { isEqual } from 'lodash/lang';
import { reduce, map, filter } from 'lodash/collection';

import { makeUniqueID, dispatchGlobalEvent } from '../../helpers';

const MENU_HIDE = 'REACT_CONTEXTMENU_HIDE';

function hideMenu(opts = {}, target) {
  dispatchGlobalEvent(MENU_HIDE, { ...opts, type: MENU_HIDE }, target);
}

export default class extends Component {
  static propTypes = {
    simple: PropTypes.bool,
    model: PropTypes.object,
    record: PropTypes.object,
    actions: PropTypes.array,
    children: PropTypes.any,
    handleAction: PropTypes.func,
  };

  static defaultProps = {
    actions: [],
    simple: false,
  };

  // TODO: don't like high coupling! Think how to fix it.
  static contextTypes = {
    sandbox: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.id = `${makeUniqueID()}-context-menu`;
  }

  shouldComponentUpdate(nextProps) {
    return !isEqual(nextProps.actions, this.props.actions);
  }

  getAccessibleActions = () => {
    const { actions, model } = this.props;
    const { sandbox } = this.context;

    return filter(actions, ({ id, condition_script: script }) => {
      return !script || sandbox.executeScript(script, { modelId: model.id }, `action/${id}/condition_script`);
    });
  };

  handleContextItemClick = async (e, action) => {
    e.stopPropagation();

    const { simple, model, handleAction, record = {} } = this.props;

    if (simple) return action.handler();
    if (!handleAction) return;

    const options = {};

    if (action.client_script) {
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

      if (!result) return;
    }

    if (record) {
      options.record = {
        ...record.attributes,
        __humanizedAttributes: record.humanizedAttributes,
        __extraAttributes: record.extraAttributes,
        __templateAttributes: reduce(record.templates, (result, t, key) => (
          (result[key] = { ...t.attributes, __extraAttributes: t.extraAttributes }) && result
        ), {}),
      };

      if (record.metadata.associate) {
        options.system_actions = {
          after: [{ name: 'associate', params: { target: record.metadata.associate } }],
        };
      }
    }

    handleAction(model, action, options);
  };

  renderContentAction = (action) => {
    const { as, url, name, target = '_self' } = action;

    const key = makeUniqueID();
    const onClick = (e) => this.handleContextItemClick(e, action);

    return (as === 'link')
      ? <Link key={key} to={url} target={target} onClick={hideMenu} className="react-contextmenu-item link">{name}</Link>
      : <MenuItem key={key} onClick={onClick}>{name}</MenuItem>;
  };

  renderContent = () => {
    const actions = this.getAccessibleActions();
    if (!actions.length) return null;

    return (
      <div key="cm-m" className="config-context-menu">
        <ContextMenu id={this.id}>
          {map(actions, (action) => this.renderContentAction(action))}
        </ContextMenu>
      </div>
    );
  };

  renderTrigger = () => {
    const { children } = this.props;
    if (!children) return null;

    return (
      <ContextMenuTrigger key="cm-t" id={this.id} holdToDisplay={-1}>
        {children}
      </ContextMenuTrigger>
    );
  };

  render() {
    return [
      this.renderContent(),
      this.renderTrigger(),
    ];
  }
}
