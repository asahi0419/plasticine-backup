import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import history from '../../history';
import * as Auth from '../../auth';

class RootContainer extends React.Component {
  static propTypes = {
    openPath: PropTypes.string.isRequired,
  }

  componentDidMount() {
    const { openPath } = this.props;

    if (openPath && history.isValid({ url: openPath })) {
      history.push(this.props.openPath);
    }
  }

  render() {
    return null;
  }
}

function mapStateToProps(state) {
  const { settings = {}, authenticated } = state.app;

  const props = { openPath: settings.start_url };

  if (authenticated) {
    if (settings.home_page) {
      props.openPath = settings.home_page;
    }

    if (Auth.getStore().get('successRedirect')) {
      props.openPath = Auth.getStore().get('successRedirect');
      Auth.getStore().remove('successRedirect');
    }
  }

  return props;
}

export default connect(mapStateToProps, {})(RootContainer);
