import { filter, find } from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Header, Divider, Modal } from 'semantic-ui-react';

import Sandbox from '../../../../sandbox';
import normalize from '../../../../api/normalizer';
import PlasticineApi from '../../../../api';
import { parseOptions } from '../../../../helpers';

import Page from '../../page';
import Loader from '../../../shared/loader';

export default class LayoutManager extends Component {
  static propTypes = {
    props: PropTypes.shape({
      model: PropTypes.object.isRequired,
      view: PropTypes.object.isRequired,
      context: PropTypes.string,
    }),

    configs: PropTypes.shape({
      showLayoutManager: PropTypes.bool,
    }),

    callbacks: PropTypes.shape({
      updateView: PropTypes.func.isRequired,
    }),
  }

  constructor(props) {
    super(props);

    this.state = { open: false, page: false, isFetching: false };
  }

  componentWillMount() {
    this.token = PubSub.subscribe('set_view_manager_layout_state', (_, state = {}) => {
      if (state.open) {
        this.fetchContent();
      } else {
        this.setState({ open: false, isFetching: false });
      }
    });
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.token);
  }

  handleClose = () => {
    this.setState({ open: false, isFetching: false });
  }

  updateView = (layout) => {
    const sort = filter(layout.sort_order, (o = {}) => o.type !== 'none').map((o = {}) => o.type === 'ascending' ? o.field : `-${o.field}`).join(',');
    const fields = { [this.props.props.model.alias] : layout.columns.join(',') };

    this.setState({ open: false, page: false });
    this.props.callbacks.updateView({ sort, fields });
  }

  fetchContent = async (options = {}) => {
    const newState = { open: true, isFetching: true };
    this.setState(newState);

    const state = { ...this.state, ...newState };
    if (!state.page) {
      const { data = {} } = await PlasticineApi.loadPages({ filter: `alias = 'layout_manager'` });
      const { entities = {} } = normalize(data);
      const { page, action } = entities;

      state.actions = Object.values(action).concat({ alias: 'cancel_user_layout' });
      state.page = Object.values(page)[0];
    }

    const { data: variables } = await PlasticineApi.executeRecordScript('page', state.page.id, 'server_script', {
      record_id: this.props.props.view.layout,
      type: 'user_setting',
      exec_by: { type: this.props.props.context, id: this.props.props.view.id },
    });

    state.variables = variables;
    state.isFetching = false;

    if (options.reset) return this.updateView(parseOptions(variables.record.options));

    this.setState(state);
  }

  handleAction = async (model, action, options = {}) => {
    delete options.sandbox

    options.exec_by = { type: 'page', id: this.state.page.id };
    options.context = this.props.props.context;

    if (action.alias === 'cancel_user_layout') {
      return this.setState({ open: false, page: false, isFetching: false });
    }

    this.setState({ isFetching: true });
    await PlasticineApi.executeAction(model.alias, action.alias, options);
    this.setState({ isFetching: false });

    if (action.alias === 'reset_user_layout') {
      return this.fetchContent({ reset: true });
    }

    this.updateView(options.options)
  }

  renderLoader = () => {
    if (!this.state.page) {
      return (
        <div style={{ padding: '20px' }}>
          <Loader dimmer={true} />
        </div>
      );
    }

    if (this.state.isFetching) {
      return (
        <Loader dimmer={true} />
      );
    }
  }

  renderContent = () => {
    if (!this.state.page) return;

    const title = i18n.t('customize_layout', { defaultValue: 'Customize layout' });
    const sandbox = new Sandbox({ record: this.state.page });

    return (
      <div>
        <Header as="h2" floated="left">{title}</Header>
        <Divider clearing />
        <Page
          page={this.state.page}
          variables={this.state.variables}
          actions={this.state.actions}
          handleAction={this.handleAction}
          sandbox={sandbox}
        />
      </div>
    );
  }

  renderManager = () => {
    const mountNode = document.getElementById('root');

    return (
      <Modal mountNode={mountNode} open={this.state.open} onClose={this.handleClose}>
        <Modal.Content style={{ position: 'relative' }}>
          {this.renderLoader()}
          {this.renderContent()}
        </Modal.Content>
      </Modal>
    );
  }

  render() {
    if (!this.props.configs.showLayoutManager) return null;
    if (!this.state.open) return null;

    return (
      <div className="view-manager layout">
        {this.renderManager()}
      </div>
    );
  }
}
