import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { pick } from 'lodash/object';
import { isEqual } from 'lodash/lang';
import qs from 'qs';

import PlasticineApi from '../../../api';
import Sandbox from '../../../sandbox';
import history from '../../../history';
import connector from './connector';

import Loader from '../../../components/shared/loader';
import View from '../../../components/content/view';
import ViewProps from '../../../components/content/view/props';

class ViewContainer extends Component {
  static propTypes = {
    ready: PropTypes.bool.isRequired,
    params: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,

    viewProps: PropTypes.object.isRequired,
    viewOptions: PropTypes.object.isRequired,

    loadView: PropTypes.func.isRequired,
    openView: PropTypes.func.isRequired,
    closeView: PropTypes.func.isRequired,
    exportView: PropTypes.func.isRequired,
    handleAction: PropTypes.func.isRequired,

    user: PropTypes.object,
  }

  static childContextTypes = {
    sandbox: PropTypes.object,
    setCache: PropTypes.func,
    getCache: PropTypes.func,
  }

  getChildContext() {
    const context = { getCache: () => null, setCache: () => null };

    if (this.props.loaded) {
      context.sandbox = new Sandbox({ user: this.props.user, uiObject: {
        attributes: { ...this.props.viewProps.view, __type: 'view' },
        options: this.props.viewOptions,
      } });
    }

    return context;
  }

  shouldComponentUpdate(nextProps) {
    return (this.props.ready !== nextProps.ready) || !nextProps.loaded
      || (!isEqual(this.props.location, nextProps.location))
      || (!isEqual(this.props.viewOptions, nextProps.viewOptions));
  }

  componentDidMount() {
    console.time('data received');
    this.openView();
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.location, this.props.location)) {
      this.openView();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.loaded) {
      const { model = {}, view = {} } = nextProps.viewProps;

      document.title = `${model.name}: ${view.name} - ${window.APP_NAME}`;
    }
  }

  componentWillUnmount () {
    this.props.closeView();
  }

  openView() {
    const { modelAlias, viewAlias } = this.props.params;
    const params = qs.parse(this.props.location.search.substring(1));

    params.exec_by = { type: 'main_view', alias: viewAlias };
    this.props.openView(modelAlias, viewAlias, params, this.props.loadView);
  }

  updateView = (options) => {
    const { viewOptions, viewProps, location } = this.props;
    const pickedOptions = pick(viewOptions, ['sort', 'fields', 'page.number', 'filter', 'sql_debug', 'date_trunc']);
    const queryString = qs.stringify(Object.assign({}, pickedOptions, options));
    history.push(`/${viewProps.model.alias}/view/${viewProps.view.type}/${viewProps.view.alias}?${queryString}${location.hash}`);
  }

  exportView = (options) => {
    const { viewOptions = {}, viewProps = {} } = this.props;
    let pickedOptions = pick(viewOptions, ['exec_by', 'sort', 'fields', 'page', 'filter', 'date_trunc', 'humanize']);
    if (['pdf', 'docx'].includes(options.format)) {
          pickedOptions = { ...pickedOptions, pdfDocxParams: { viewAlias: viewProps.view.alias, orientation: options.orientation }}
    }
    this.props.exportView(viewProps.model.alias, options.format, pickedOptions);
  }

  updateUserSettings = async (options) => {
    const { view = {} } = this.props.viewProps;

    await PlasticineApi.updateUserSettings('view', view.id, { type: 'main_view', options });
    await this.updateView(options);
  }

  handleAction = (model, action, params) => {
    const { viewProps = {}, viewOptions = {} } = this.props;
    const { exec_by } = viewOptions;
    const options = { ...params, exec_by: { ...exec_by, name: viewProps.view.name } };

    this.props.handleAction(model, action, { viewOptions, ...options });
  }

  getProps = () => {
    const propsLoaded = pick(this.props, ['viewProps', 'viewOptions']);
    const propsCustom = { props: { context: 'main_view', hash: this.props.location.hash } };

    const context = this.getChildContext();
    const props = { ...propsLoaded, ...propsCustom };
    const callbacks = pick(this, ['handleAction', 'exportView', 'updateView', 'updateUserSettings']);

    return ViewProps.create(props, context, callbacks);
  }

  render() {
    const { ready, loaded } = this.props;
    if (!ready && !loaded) return <Loader />;

    const { props, configs, callbacks } = this.getProps();

    return (
      <View
        ready={ready}
        props={props}
        configs={configs}
        callbacks={callbacks}
      />
    );
  }
}

export default connector(ViewContainer);
