import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import init from '../actions/init';
import { loadUser } from '../actions/db';
import NotificationPanel from '../components/notification-panel';
import Loader from '../components/shared/loader';
import store from '../store';
import history from '../history';
import Sandbox from '../sandbox';

class App extends Component {
  static propTypes = {
    ready: PropTypes.bool.isRequired,
    children: PropTypes.element.isRequired,
    init: PropTypes.func.isRequired,
    loadUser: PropTypes.func.isRequired,
  }

  static childContextTypes = {
    sandbox: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props)

    this.sandbox = new Sandbox({}, 'global')
  }

  getChildContext() {
    return {
      sandbox: this.sandbox,
    };
  }

  async componentDidMount() {
    history.onChange(window.location);

    await this.loadMetadata();
  }

  async componentWillReceiveProps(nextProps) {
    if (this.props.ready === nextProps.ready) {
      if (this.props.authenticated === nextProps.authenticated) return;
    }

    await this.loadMetadata(nextProps);
  }

  async loadMetadata(nextProps = {}) {
    await this.props.init();
    await this.props.loadUser();

    if (nextProps.authenticated) {
      this.sandbox = new Sandbox({ user: store.redux.state('app.user') }, 'global')
    }
  }

  render() {
    p.setUIObject({
      attributes: { __type: 'component' },
      api: this,
    });

    const components = [
      <NotificationPanel key="np" />,
    ];

    if (this.props.ready) {
      components.push(
        React.Children.map(this.props.children, (child) => {
          return React.isValidElement(child)
            ? React.cloneElement(child, { key: 'cc' })
            : child;
        }),
      );
    } else {
      components.push(
        <Loader
          dimmer={true}
          key="lc"
        />,
      );
    }

    return components;
  }
}

const mapStateToProps = (state) => {
  const { ready, authenticated } = state.app;

  return { ready, authenticated };
};

export default connect(mapStateToProps, {
  init,
  loadUser,
})(App);
