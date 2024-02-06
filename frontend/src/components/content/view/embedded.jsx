import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Message } from 'semantic-ui-react';

import store from '../../../store';
import PlasticineApi from '../../../api';
import selectView from '../../../selectors/view';
import View from './';
import ViewProps from './props';
import Loader from '../../shared/loader';
import { loadView } from '../../../actions/db/load-view';
import { downloadView } from '../../../helpers';
import { ACTION_FULFILLED, EXPORT_FORM_RELATED_VIEW_PARAMS } from '../../../actions/types';

export default class EmbeddedView extends Component {
  static propTypes = {
    props: PropTypes.shape({
      hash: PropTypes.string,
      params: PropTypes.object,
      modelAlias: PropTypes.string.isRequired,
      viewAlias: PropTypes.string.isRequired,
      context: PropTypes.string.isRequired,
    }),

    configs: PropTypes.shape({
      withCache: PropTypes.bool,
      selectable: PropTypes.bool,
      rowselect: PropTypes.bool,
      statical: PropTypes.bool,
      withFirstCellLink: PropTypes.bool,
    }),

    callbacks: PropTypes.shape({
      handleAction: PropTypes.func,
      syncCount: PropTypes.func,
      onItemClick: PropTypes.func,
      itemQuickAction: PropTypes.func,
    }),
  }

  static defaultProps = {
    props: {},
    configs: {},
    callbacks: {},
  }

  static contextTypes = {
    componentsCache: PropTypes.object.isRequired,
    sandbox: PropTypes.object,
  }

  static childContextTypes = {
    setCache: PropTypes.func,
    getCache: PropTypes.func,
  }

  constructor(props) {
    super(props);

    this.state = { loaded: false, hash: this.getHash(props) };
  }

  getChildContext() {
    return {
      getCache: this.getCache,
      setCache: this.setCache,
    };
  }

  async componentDidMount() {
    this.mounted = true;

    if (!this.state.ready) {
      await this.loadView(this.props, {}, false);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  async componentWillReceiveProps(nextProps) {
    if (!lodash.isEqual(nextProps.props.modelAlias, this.props.props.modelAlias)) {
      return this.loadView(nextProps, nextProps.props.params, true);
    }
    if (!lodash.isEqual(nextProps.props.params, this.props.props.params)) {
      return this.loadView(nextProps, nextProps.props.params, true);
    }
    if (!lodash.isEqual(this.state.hash, this.getHash(nextProps))) {
      return this.loadView(nextProps, {}, true);
    }
  }

  shouldComponentUpdate(prevProps, prevState) {
    return (this.state.ready !== prevState.ready)
        || (this.state.hash !== prevState.hash);
  }

  getHash = (props = {}) => {
    const { hash } = props.props || {};
    return hash || window.location.hash
  }

  loadView = async (props, options = {}, force = false) => {
    this.setState({ ready: false });

    const { viewProps, viewOptions, errors } = await this.getView(props, options, force);
    if (errors) return this.setErrors(errors);
    const count = (viewProps.records || []).length ? await this.getCount(props, viewOptions, force) : 0;
    const hash = this.getHash(props);

    this.setViewFilter(viewOptions, options.filter);
    this.setViewCount(props, viewOptions, count);

    this.mounted &&
    this.setState({
      hash,
      viewProps,
      viewOptions,
      loaded: true,
      ready: true,
    });
  }

  getView = async (props, options, force) => {
    const withCache = lodash.isUndefined(props.configs.withCache) ? true : props.configs.withCache;
    const viewOptions = this.getOptions(props.props.params, options);
    const cache = this.getCache('view');
    const viewProps = (withCache && cache && !force) ? cache : await this.fetchView(props, viewOptions);

    if (force || !cache) {
      this.setCache('view', viewProps);
    }

    return viewProps;
  }

  getCount = async (props, options, force) => {
    const withCache = lodash.isUndefined(props.configs.withCache) ? true : props.configs.withCache;
    const countOptions = this.getOptions(props.props.params, options);
    const cache = this.getCache('count');
    const count = (withCache && cache && !force) ? cache : await this.fetchCount(props, countOptions);

    if (force || !cache) {
      this.setCache('count', count);
    }

    return count;
  }

  fetchView = async (props, options, force) => {
    const { modelAlias, viewAlias } = props.props;

    const callbacks = {
      onLoadMetadata: (metadata) => {
        this.setState({ loaded: true, viewProps: selectView({}, metadata, modelAlias) });
      }
    };

    const pickedOptions = lodash.pick(options, ['sort', 'fields', 'exec_by', 'ids', 'embedded_to', 'filter', 'hidden_filter', 'humanize']);
    store.redux.instance.dispatch({ type: EXPORT_FORM_RELATED_VIEW_PARAMS, payload: { modelAlias, viewAlias, options: pickedOptions }});
    const result = await loadView(modelAlias, viewAlias, options, callbacks);
    if (result.data && result.data.errors) return { errors: result.data.errors };

    const { payload: { db, metadata }, options: viewOptions, recordsIds } = result;
    const viewProps = { ...selectView(db, metadata, modelAlias, recordsIds), hash: props.props.hash || options.refreshId };

    return { viewProps, viewOptions };
  }

  fetchCount = async (props, options, force) => {
    const { modelAlias } = props.props;

    const result = await PlasticineApi.loadViewCount(modelAlias, lodash.pick(options, [
      'exec_by',
      'embedded_to',
      'filter',
      'hidden_filter',
    ]));
    const { count } = result.data;

    return count;
  }

  getOptions = (params = {}, options = {}) => {
    const { viewOptions = {} } = this.state;
    return {
      ...params,      // init options
      ...viewOptions, // prev options
      ...options,     // next options
      ...lodash.pick(params, ['exec_by', 'embedded_to']),
      ...lodash.pick(options, ['exec_by', 'embedded_to']),
      page: { size: 10, ...options.page },
      hidden_filter: options.hidden_filter || params.hidden_filter,
    };
  }

  getCacheKey = (section, props) => {
    let { modelAlias, viewAlias, fieldAlias, params, context } = props.props;
    const recordId = (params.embedded_to || {}).record_id;
    if (fieldAlias) context = `${fieldAlias}_${context}`;
    return [modelAlias, recordId, viewAlias, context, section, this.state.hash].join('/');
  }

  getCache = (section, props = this.props) => {
    return this.context.componentsCache[this.getCacheKey(section, props)];
  }

  setCache = (section, value, props = this.props) => {
    this.context.componentsCache[this.getCacheKey(section, props)] = value;
  }

  clearCache = () => {
    this.setCache('view', null);
  }

  setViewFilter = (viewOptions, filter) => {
    if (lodash.isString(filter)) {
      lodash.set(viewOptions, 'filter', filter);
    }
  }

  setViewCount = (props, viewOptions, count) => {
    const { syncCount = () => {} } = props.callbacks;

    lodash.set(viewOptions, 'page.totalSize', count);
    syncCount(count);
  }

  updateUserSettings = async (options) => {
    const { context: type } = this.props.props;
    const { viewProps = {} } = this.state;

    await PlasticineApi.updateUserSettings('view', viewProps.view.id, { type, options });
    await this.updateView(options);
   }

  updateView = async (options) => {
    await this.loadView(this.props, options, true);
  }

  exportView = (options) => {
    const { viewOptions = {}, viewProps = {} } = this.state;
    let pickedOptions = lodash.pick(viewOptions, ['sort', 'fields', 'page', 'filter', 'hidden_filter', 'humanize']);
    if (['pdf', 'docx'].includes(options.format)) {
      pickedOptions = lodash.pick(viewOptions, ['exec_by', 'sort', 'fields', 'filter', 'hidden_filter', 'humanize', 'ids', 'embedded_to']);
      pickedOptions = { ...pickedOptions, pdfDocxParams: { viewAlias: viewProps.view.alias, orientation: options.orientation }};
    }
    downloadView(viewProps.model.alias, options.format, pickedOptions);
  }

  handleAction = (model, action, params) => {
    const { handleAction = () => {} } = this.props.callbacks;
    const { viewProps = {}, viewOptions = {} } = this.state;
    const { exec_by, embedded_to } = viewOptions;
    const options = { ...params, exec_by, embedded_to };

    options.callbacks = options.callbacks || {};
    options.callbacks.openView = async (options) => {
      await this.updateView(options);
      store.redux.instance.dispatch({ type: ACTION_FULFILLED });
    };
    options.viewOptions = viewOptions;

    handleAction(model, action, options);
  }

  getProps = () => {
    const propsLoaded = lodash.pick(this.state, ['viewProps', 'viewOptions']);
    const propsCustom = lodash.pick(this.props, ['props', 'configs', 'callbacks']);

    const context = this.context;
    const props = { ...propsLoaded, ...propsCustom };
    const callbacks = { ...lodash.pick(this, ['handleAction', 'exportView', 'updateView', 'updateUserSettings']) };

    return ViewProps.create(props, context, callbacks);
  }

  setUIObjectOptions = () => {
    const { viewProps = {}, viewOptions = {} } = this.state;
    const { view } = viewProps;
    const { this: uiObject } = this.context.sandbox.getContext();

    if (uiObject) {
      uiObject.setAttributes(view);
      uiObject.setOptions(viewOptions);
    };
  }

  setErrors = (errors) => {
    const error = lodash.map(errors, 'message').join();
    this.setState({ ready: true, error });
  }

  renderError(error) {
    return (
      <Message negative style={{ margin: '14px 0' }}>
        <p>{error}</p>
      </Message>
    );
  }

  render() {
    const { error, ready, loaded } = this.state;

    if (error) return this.renderError(error);
    if (!loaded) return <Loader compact={true} />;

    this.setUIObjectOptions();

    const { props, configs, callbacks } = this.getProps();

    return (
      <View
        ready={ready}
        props={props}
        configs={configs}
        callbacks={callbacks}
        clearCache={this.clearCache}
      />
    );
  }
}
