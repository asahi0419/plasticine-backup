import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { values } from 'lodash/object';
import { isEqual } from 'lodash/lang';
import { keyBy, sortBy, map, each, filter } from 'lodash/collection';
import { Button, Dropdown, Icon, Popup } from 'semantic-ui-react';

import history from '../../../history';
import PlasticineApi from '../../../api';
import * as CONSTANTS from '../../../constants';
import * as HELPERS from '../../../helpers';

import ContextMenu from '../../shared/context-menu';
import ActionButton from './button';
import DropdownNestable from '../../shared/nestable-dropdown'

const StylingWrapper = styled.div`
  display: flex;
  flex-direction: row-reverse;
  height: 32px;

  > button, .group-button {
    height: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    ${({ buttonsAsIcons }) => buttonsAsIcons ? 'width: 22px; padding: 0 !important; i { position: relative; left: 6px; }' : ''}
  }

  > .ui.dropdown button.ellipsis {
    ${({ buttonsAsIcons }) => buttonsAsIcons ? 'width: 22px; padding: 10px 0 !important;' : 'width: 32px; i { position: relative; left: -1px; }'}
  }

  #expandable-group.menu {
    width: 140px;
    left: initial;
    right: 0;
    top: 40px !important;

    .item {
      &:hover > .menu { left: -93% !important; right: 100% !important }
      .icon { margin: 0; }
    }
  }

  .config-context-menu {
    position: relative;
    height: 1px;
  }

  .menu .react-contextmenu {
    top: 0px !important;
    left: -140px !important;
    position: relative !important;
    max-width: 140px !important;
  }

  .dropdown .react-contextmenu-wrapper > .item {
    padding: 0.61rem 1.1rem;
    cursor: pointer;

    &:hover {
      background: rgba(0,0,0,.03) !important;
    }
  }
  .react-contextmenu-wrapper {
    &:last-child {
      .ui[class*="right floated"].button,
      .ui[class*="right floated"].buttons {
        margin-left: 0;
      }
    }
  }
`;

export default class ActionsBar extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    actions: PropTypes.array.isRequired,
    record: PropTypes.object,
    handleAction: PropTypes.func.isRequired,
    context: PropTypes.string.isRequired,
    buttonsAsIcons: PropTypes.bool,
    defaultIcon: PropTypes.string,
    visibleActionsLength: PropTypes.number,
    hash: PropTypes.string,
    open: PropTypes.bool,
  }

  static defaultProps = {
    defaultIcon: 'paper plane',
    hash: window.location.hash,
    visibleActionsLength: 3,
    open: true,
  }

  constructor(props) {
    super(props);

    this.state = {
      showHiddenActionsGroup: false,
      hiddenActions: [],
      visibleActions: [],
      open: false
    };
  }

  componentDidMount() {
    this.setContent(this.props.actions);

    window.addEventListener('resize', this.handleWindowResize);
  }

  componentWillReceiveProps(nextProps) {
    if (isEqual(this.props.actions, nextProps.actions)) return;

    this.setContent(nextProps.actions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
  }

  setContent(actions = []) {
    const plainActions = [];
    const groupActions = [];

    const groupActionsObj = map(filter(actions, 'group'), (a = {}) => ({ ...a, items: [] }));
    const groupActionsMap = keyBy(groupActionsObj, 'alias');

    each(actions, (action = {}) => {
      const { group } = HELPERS.parseOptions(action.options);

      if (group) {
        if (groupActionsMap[group]) {
          groupActionsMap[group].items.push(action);
        }
      } else {
        if (!action.group) {
          plainActions.push(action);
        }
      }
    });

    each(groupActionsMap, (action = {}) => {
      if (action.items.length) groupActions.push(action);
    });

    const sortedActions = sortBy(plainActions.concat(groupActions), ['position']);
    const visibleActionsLength = HELPERS.isTablet() ? 1 : this.props.visibleActionsLength;

    this.setState({
      showHiddenActionsGroup: sortedActions.length > visibleActionsLength,
      hiddenActions: sortedActions.reverse().slice(visibleActionsLength),
      visibleActions: sortedActions.reverse().slice(-visibleActionsLength)
    });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
  }

  handleWindowResize = () => {
    this.setContent(this.props.actions);
  }

  handleAction = (model, action, options) => {
    const { handleAction, context } = this.props;
    handleAction(model, action, { exec_by: context, ...options });
  }

  handleMenuClick = () => {
    this.setState({ open: false });
  }

  renderContextMenu = (action, component) => {
    const key = HELPERS.makeUniqueID();
    const model = this.props.model;
    const actions = [
      {
        name: i18n.t('configure', { defaultValue: 'Configure' }),
        condition_script: 'p.currentUser.isAdmin()',
        as: 'link',
        url: `/action/form/${action.id}`,
        target: '_blank',
      },
      {
        name: i18n.t('translate', { defaultValue: 'Translate' }),
        condition_script: 'p.currentUser.isAdmin()',
        handler: async () => {
          const { data: { id } } = await PlasticineApi.loadTranslation('action', action.id, 'name');
          history.push(`/dynamic_translation/form/${id}`);
        },
      },
    ];

    return (
      <ContextMenu key={key} model={model} actions={actions} simple={true}>
        {component}
      </ContextMenu>
    );
  }

  renderAction = (action, asDropdownItem) => {
    const { model, record, buttonsAsIcons, defaultIcon } = this.props;
    const { hash } = window.location;

    return this.renderContextMenu(action,
      <ActionButton
        asDropdownItem={asDropdownItem}
        model={model}
        action={action}
        record={record}
        key={action.id}
        handleAction={this.handleAction}
        asIcon={buttonsAsIcons}
        defaultIcon={defaultIcon}
        hash={hash}
      />
    );
  }

  renderGroupContainer = (actions, trigger) => {
    return (
      <DropdownNestable key={HELPERS.makeUniqueID()} trigger={trigger} icon={null}>
        <Dropdown.Menu onClick={this.handleMenuClick} id="expandable-group">
          {actions.map((action) => action.items
            ? this.renderDropdownGroupAction(action)
            : this.renderAction(action, true))}
        </Dropdown.Menu>
      </DropdownNestable>
    )
  }

  renderActionLabel = (action) => {
    const { buttonsAsIcons, defaultIcon } = this.props;
    const options = HELPERS.parseOptions(action.options);
    const children = [<span key="name" className="text">{HELPERS.trimString(action.name, CONSTANTS.UI_ACTION_NAME_LEN)}</span>];

    const icon = options.icon ? options.icon : (buttonsAsIcons && defaultIcon);

    if (icon) {
      options.icon_position && (options.icon_position === 'right')
        ? children.push(<Icon key="icon" name={icon} style={{ margin: '0 0 0 6px' }} />)
        : children.unshift(<Icon key="icon" name={icon} style={{ margin: '0 6px 0 0' }} />);
    }
    return children;
  }

  renderDropdownGroupAction = (action) => {
    return (
      <div key={action.id} className="ui simple dropdown link item">
        {this.renderActionLabel(action)}
        <Dropdown.Menu>
          {action.items.map((action) => this.renderAction(action, true))}
        </Dropdown.Menu>
      </div>
    )
  }

  renderButtonGroupAction = (action) => {
    const button = this.renderContextMenu(action, <Button title={action.name} basic floated="right">{this.renderActionLabel(action)}</Button>);
    const trigger = action.hint ? (<Popup key={action.id} trigger={button} content={action.hint} on="hover" />) : button;

    const sorted = action.items.sort((a,b) => (b.position - a.position))

    return this.renderGroupContainer(sorted, trigger);
  }

  renderHiddenActionsGroup = () => {
    if (!this.state.showHiddenActionsGroup) return;

    const trigger = <Button basic floated="right" icon="ellipsis horizontal" className="ellipsis" />;
    return this.renderGroupContainer(this.state.hiddenActions, trigger);
  }

  renderVisibleActionsGroup = () =>
    this.state.visibleActions.map((action) => action.items
      ? this.renderButtonGroupAction(action)
      : this.renderAction(action));

  render() {
    const { buttonsAsIcons } = this.props;

    return (
      <StylingWrapper buttonsAsIcons={buttonsAsIcons} className={buttonsAsIcons ? 'actions-bar buttons-as-icons' : 'actions-bar'}>
        {this.renderHiddenActionsGroup()}
        {this.renderVisibleActionsGroup()}
      </StylingWrapper>
    );
  }
}
