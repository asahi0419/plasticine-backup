import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Container from './container';

export default class ThemeManager extends Component {
  static propTypes = {
    theme: PropTypes.object.isRequired,
    children: PropTypes.element.isRequired,
  };

  render() {
    const { theme, children } = this.props;

    return (
      <Container theme={theme} id="root" className="theme-manager">
        {children}
      </Container>
    );
  }
}
