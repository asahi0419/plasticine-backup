import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Header from './header';
import TabsPanel from './tabs-panel';
import SettingsModal from './settings-modal';

const WidgetStyled = styled.div`
  height: inherit;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
  padding: 0 15px;
`;

export default class Widget extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    mode: PropTypes.oneOf(['view', 'edit']),
    tabs: PropTypes.array.isRequired,
    dataToRelate: PropTypes.array.isRequired,
    dashboard: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = { settingsModalOpened: false };
  }

  handleSettingsClick = () => {
    this.setState({ settingsModalOpened: true });
  }

  handleSettingsClose = () => {
    this.setState({ settingsModalOpened: false });
  }

  handleChange = (key, value) => {
    this.props.onChange({ id: this.props.id, [key]: value });
  }

  handleRemoveClick = () => {
    this.props.onRemove({ id: this.props.id });
  }

  renderHeader() {
    const { tabs = [], name = '', mode } = this.props;

    const [ firstTab = {} ] = tabs;
    const { name: firstTabName = '' } = firstTab.options || {};

    const isEditing = mode === 'edit';
    const content = isEditing ? name : ((tabs.length > 1) ? firstTabName : name);

    return (
      <Header
        content={content}
        onRemoveClick={this.handleRemoveClick}
        onSettingsClick={this.handleSettingsClick}
        editable={isEditing}
      />
    );
  }

  renderTabs() {
    return (
      <TabsPanel
        tabs={this.props.tabs}
        onChange={this.handleChange}
        dashboard={this.props.dashboard}
        dataToRelate={this.props.dataToRelate}
        editable={this.props.mode === 'edit'}
      />
    );
  }

  renderSettingsModal() {
    if (!this.state.settingsModalOpened) return;

    return (
      <SettingsModal
        onClose={this.handleSettingsClose}
        onChange={this.handleChange}
        options={{ name: this.props.name }}
      />
    );
  }

  render() {
    return (
      <WidgetStyled className="widget">
        {this.renderHeader()}
        {this.renderTabs()}
        {this.renderSettingsModal()}
      </WidgetStyled>
    );
  }
}
