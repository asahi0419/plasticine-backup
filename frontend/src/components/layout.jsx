import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash/lang';

import ThemeManager from './theme/manager';
import PageElement from '../containers/content/page/element';
import Modals from './modals';

export default class Layout extends Component {
  static propTypes = {
    theme: PropTypes.object.isRequired,
    readyComponents: PropTypes.array.isRequired,
    embedded: PropTypes.bool,
  }

  static defaultProps = {
    embedded: false,
    readyComponents: [],
  }

  shouldComponentUpdate(nextProps) {
    return !isEqual(nextProps, this.props);
  }

  renderFullLayout() {
    const { theme, readyComponents, children } = this.props;

    return (
      <ThemeManager theme={theme}>
        <PageElement alias="layout" readyComponents={readyComponents}>
          {children}
        </PageElement>
        <Modals />
      </ThemeManager>
    );
  }

  render() {
    const { children, embedded, readyComponents } = this.props;
    return embedded ? <div>{children}</div> : this.renderFullLayout();
  }
}
