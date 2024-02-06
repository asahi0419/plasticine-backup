import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import switchTheme from '../actions/switch-theme';
import ThemeSwitcher from '../components/theme/switcher';

class ThemeSwitcherContainer extends Component {
  static propTypes = {
    themes: PropTypes.array,
    currentTheme: PropTypes.string,
    switchTheme: PropTypes.func,
  }

  render() {
    const { themes, currentTheme, switchTheme } = this.props;
    return <ThemeSwitcher themes={themes} currentTheme={currentTheme} switchTheme={switchTheme} />;
  }
}

const mapStateToProps = (state) => {
  return {
    themes: state.app.settings.themes,
    currentTheme: state.app.settings.theme,
  };
};

export default connect(mapStateToProps, { switchTheme })(ThemeSwitcherContainer);
