import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tab, Menu, Icon } from 'semantic-ui-react';
import styled from 'styled-components';

import getTabMenuItem from './tab';
import * as HELPERS from '../../../../../../helpers';

const TabStyled = styled(({ showTabs, ...rest }) => <Tab {...rest} />)`
  height: calc(100% - 45px);

  .ui.attached.tabular.menu {
    display: ${({ showTabs }) => showTabs ? 'flex' : 'none'};
    min-height: 30px;
    margin-top: -1px;
    overflow-x: auto;

    .item {
      min-height: 30px;
      margin-bottom: 0;
      border: 1px solid;
      border-bottom: none;
      border-left: none;
      border-radius: 0 !important;

      &:first-child {
        border-left: 1px solid;
      }
    }
    .item:not(.plus-tab) {
      padding: 6px 20px 5px 10px;
      min-width: 120px;
      font-size: 13px;
    }
    .item.plus-tab {
      width: 30px;
      padding: 7px 5px 5px 6px;
      color: inherit !important;

      i {
        margin: 0;
      }
    }
  }

  .widget-content {
    height: ${({ showTabs }) => showTabs ? 'calc(100% - 30px)' : '100%'};
    padding: 0 15px;
    margin: 0 -15px;
  }
`;

export default class TabsPanel extends Component {
  static propTypes = {
    tabs: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    dataToRelate: PropTypes.array.isRequired,
    dashboard: PropTypes.object.isRequired,
    editable: PropTypes.bool.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = { activeIndex: 0 };
  }

  handleSelectTab = (e, { activeIndex }) => {
    this.setState({ activeIndex });
  }

  handleChangeTab = (id, options) => {
    const tabs = this.props.tabs.map((t) => ((t.id === id) ? ({ id, options }) : t));
    this.props.onChange('tabs', tabs);
  }

  handleCreateTab = () => {
    const name = i18n.t('dashboard_view_widget_tab_default_name', { defaultValue: 'View tab' });
    const tabs = this.props.tabs.concat({ id: HELPERS.makeUniqueID(), options: { active: true, name } });
    this.props.onChange('tabs', tabs);
  }

  handleRemoveTab = (id) => {
    const tabs = this.props.tabs.filter((t = {}) => t.id !== id);
    this.props.onChange('tabs', tabs);

    this.setState({ activeIndex: 0 });
  }

  getAddMenuItem = () => {
    return (
      <Menu.Item className="plus-tab" onClick={this.handleCreateTab} key="plus-item">
        <Icon name="plus"/>
      </Menu.Item>
    );
  }

  getPanes = () => {
    const { dashboard, tabs, dataToRelate, editable } = this.props;
    const removable = tabs.length > 1;

    return tabs.filter((t = {}) => editable ? true : t.options.active)
      .map((t = {}) => getTabMenuItem(t, dashboard, dataToRelate, editable, removable, this.handleRemoveTab, this.handleChangeTab));
  }

  render() {
    const { tabs, editable } = this.props;

    const panes = this.getPanes();
    const showTabs = panes.length || editable;

    return (
      <TabStyled
        panes={panes.concat({ menuItem: this.getAddMenuItem() })}
        showTabs={showTabs}
        activeIndex={this.state.activeIndex}
        onTabChange={this.handleSelectTab}
        className="widget-tab"
      />
    );
  }
}
