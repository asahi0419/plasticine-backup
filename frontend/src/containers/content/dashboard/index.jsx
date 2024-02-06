import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { values } from 'lodash/object';
import { find, filter } from 'lodash/collection';

import db from '../../../db';
import { loadDashboards } from '../../../actions/db';
import { closeDashboard, openDashboard } from '../../../actions/view/dashboard';
import { handleAction } from '../../../actions/view/actions';

import Loader from '../../../components/shared/loader';
import Provider from './provider';

class DashboardContainer extends Component {
  static propTypes = {
    ready: PropTypes.bool.isRequired,
    params: PropTypes.object.isRequired,

    openDashboard: PropTypes.func.isRequired,
    closeDashboard: PropTypes.func.isRequired,
    handleAction: PropTypes.func.isRequired,
  }

  componentDidMount() {
    this.openDashboard();
  }

  shouldComponentUpdate(nextProps) {
    return (this.props.ready !== nextProps.ready)
        || (this.props.params.dashboardAlias !== nextProps.params.dashboardAlias)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.params.dashboardAlias !== this.props.params.dashboardAlias) {
      this.openDashboard();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.ready) {
      document.title = `${nextProps.record.name} - ${window.APP_NAME}`;
    }
  }

  componentWillUnmount () {
    this.props.closeDashboard();
  }

  openDashboard() {
    this.props.openDashboard(this.props.params.dashboardAlias, this.props.params, this.props.loadDashboards);
  }

  render() {
    if (!this.props.ready) return <Loader />;

    return <Provider {...this.props} />;
  }
}

function mapStateToProps(state = {}) {
  const { app = {}, view = {}, metadata = {} } = state;
  const { content = {} } = view;
  const { ready, params = {} } = content;
  const { user = {} } = app;

  if (!ready) return { ready };

  const model = db.getModel('dashboard') || {};
  const actions = db.model('action').where({ model: model.id });
  const dashboards = db.model('dashboard').where();
  const [ dashboard = {} ] = dashboards;

  const record = find(dashboards, { alias: params.dashboardAlias || dashboard.alias });
  const editable = find(actions, { alias: 'edit' });

  return {
    ready,
    user,
    model,
    actions,
    dashboards,

    record,
    editable,
  };
}

export default connect(mapStateToProps, {
  loadDashboards,
  openDashboard,
  closeDashboard,
  handleAction,
})(DashboardContainer);
