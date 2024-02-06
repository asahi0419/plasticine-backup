import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import * as Auth from '../../auth';

export default function (ComposedComponent) {
  class Authentication extends Component {
    static propTypes = {
      authenticated: PropTypes.bool.isRequired,
      startURL: PropTypes.string.isRequired,
    }

    static contextTypes = {
      router: PropTypes.object,
    }

    componentWillMount() {
      if (this.props.authenticated) return;

      if (location.pathname !== '/') {
        Auth.getStore().set('successRedirect', Auth.getLocation());
      }

      this.context.router.push(this.props.startURL);
    }

    componentWillUpdate(nextProps) {
      if (nextProps.authenticated) return;

      this.context.router.push(this.props.startURL);
    }

    render() {
      const { authenticated, ...props } = this.props;

      if (authenticated) {
        return <ComposedComponent {...props} />;
      }

      return null;
    }
  }

  function mapStateToProps(state) {
    return {
      startURL: state.app.settings.start_url,
      authenticated: state.app.authenticated,
    };
  }

  return connect(mapStateToProps)(Authentication);
}
