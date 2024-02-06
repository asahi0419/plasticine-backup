import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { find } from 'lodash/collection';

import Layout from '../components/layout';

class LayoutContainer extends Component {
  static propTypes = {
    theme: PropTypes.object.isRequired,
    readyComponents: PropTypes.array.isRequired,
  }

  render() {
    const { theme, readyComponents, children } = this.props;

    return (
      <Layout
        theme={theme}
        readyComponents={readyComponents}
      >{children}</Layout>
    );
  }
}

const mapStateToProps = (state) => {
  const { readyComponents, settings } = state.app;
  const theme = find(settings.themes, { alias: settings.theme });

  return { theme, readyComponents };
};

export default connect(mapStateToProps)(LayoutContainer);
