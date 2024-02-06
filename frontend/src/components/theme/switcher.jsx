import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon, Dropdown } from 'semantic-ui-react';
import { map } from 'lodash/collection';

export default class ThemeSwitcher extends Component {
  static propTypes = {
    themes: PropTypes.array.isRequired,
    currentTheme: PropTypes.string.isRequired,
    switchTheme: PropTypes.func.isRequired,
  }

  handleSwitchTheme = (alias) => {
    this.props.switchTheme(alias);
  }

  render() {
    const { themes, currentTheme } = this.props;
    const checkmarkIcon = <Icon name="checkmark" style={{ marginLeft: 10, marginRight: 0 }} />;

    return (
      <Dropdown.Item>
        <Icon name="dropdown" />
        <span className="text">{i18n.t('themes', { defaultValue: 'Themes' })}</span>
        <Dropdown.Menu>
          {map(themes, ({ alias, name }, key) => {
            return (
              <Dropdown.Item key={key} onClick={this.handleSwitchTheme.bind(null, alias)}>
                {name}
                {alias === currentTheme && checkmarkIcon}
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown.Item>
    );
  }
}
