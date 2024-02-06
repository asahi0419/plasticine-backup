import React from 'react';
import PubSub from 'pubsub-js';
import qs from 'qs';
import { assign } from 'lodash/object';

import store from '../../../store';
import loadPageVariables from '../../../actions/db/load-page-variables';
import PageElement from '../../../containers/content/page/element';

export default class PageApi {
  constructor(pageComponent, props) {
    this.pageComponent = pageComponent;
    this.props = props;

    // FIXME: doubtful implementation!!!
    const sandbox = pageComponent.props.sandbox;

    this.store = store.redux.instance;
    this.actions = sandbox.api.p.actions;
    this.getSetting = sandbox.api.p.getSetting;
    this.getSettings = sandbox.api.p.getSettings;
    this.currentUser = sandbox.api.p.currentUser;
  }

  setProps = (props = {}) => assign(this.props, props);
  getPageElement = (alias, props = {}) => <PageElement alias={alias} {...props} />;
  getAction = (name) => (this.props.actions || {})[name];
  getActions = () => this.props.actions;
  getVariable = (name) => this.pageComponent.state.variables[name];
  getAttachment = (name) => this.props.attachments[name];
  showMessage = (message) => PubSub.publish('messages', message);
  translate = (key, options) => i18n.t(key.replace(/^static./, ''), options);

  updateRecord = (record) => {
    const { onChange } = this.pageComponent.props;
    if (onChange) onChange(record);
  }

  updateVariables = async (params) => {
    const { page } = this.pageComponent.props;
    const variables = {
      ...this.pageComponent.state.variables,
      ...await loadPageVariables(page, params),
    };

    this.pageComponent.setState({ variables });
    if (!this.pageComponent.initState) return;
    this.pageComponent.setState(this.pageComponent.initState(false) || {});
  }

  // TODO: temporary solution, "p.getRequest" must be completely removed from frontend in the future - #60649
  getRequest = () => {
    return { ...qs.parse(location.search.substring(1)), exec_by: {}};
  }
}
