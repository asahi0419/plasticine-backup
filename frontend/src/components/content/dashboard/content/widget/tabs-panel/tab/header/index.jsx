import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Menu, Icon } from 'semantic-ui-react';
import { omit } from 'lodash/object';

import SettingsModal from './settings-modal';

export default class Header extends Component {
  static propTypes = {
    tab: PropTypes.object.isRequired,
    editable: PropTypes.bool.isRequired,
    removable: PropTypes.bool.isRequired,
    dataToRelate: PropTypes.array.isRequired,
    onRemove: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
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

  handleSettingsChange = (options) => {
    this.props.onChange(this.props.tab.id, options);
  }

  handleRemoveTab = () => {
    this.props.onRemove(this.props.tab.id);
  }

  renderSettingsModal = () => {
    const { tab = {}, dataToRelate, removable } = this.props;

    if (!this.state.settingsModalOpened) return;

    return (
      <SettingsModal
        onClose={this.handleSettingsClose}
        onRemoveTab={this.handleRemoveTab}
        onChange={this.handleSettingsChange}
        options={tab.options}
        removable={removable}
        dataToRelate={dataToRelate}
      />
    );
  }

  renderName = () => {
    const { tab = {} } = this.props;
    const { options = {} } = tab;

    return options.name || i18n.t('dashboard_view_widget_tab_default_name', { defaultValue: 'View tab' });
  }

  renderSettingsControl = () => {
    const { tab = {}, editable } = this.props;
    const { options = {} } = tab;

    if (!editable) return;

    const name = options.active ? "ellipsis vertical" : "eye slash";
    const style = { position: 'absolute', top: '8px', right: '-2px', fontSize: '14px' };

    return <Icon onClick={this.handleSettingsClick} name={name} style={style} link />;
  }

  render() {
    const props = omit(this.props, ['tab', 'editable', 'removable', 'dataToRelate', 'onRemove']);

    return (
      <Menu.Item className="widget-tab-header" {...props}>
        {this.renderName()}
        {this.renderSettingsControl()}
        {this.renderSettingsModal()}
      </Menu.Item>
    );
  }
}
