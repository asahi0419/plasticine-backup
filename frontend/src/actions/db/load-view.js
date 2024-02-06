import { find, pick, isNaN, filter } from 'lodash';

import history from '../../history';
import normalize from '../../api/normalizer';
import PlasticineApi from '../../api';

import loadGridView from './view/grid';
import loadMapView from './view/map';
import loadChartView from './view/chart';
import loadCardView from './view/card';
import loadCalendarView from './view/calendar';
import loadTopologyView from './view/topology';

import { processError } from '../helpers';
import { applyUserSettings } from './view/helpers';
import { RECORDS_FULFILLED, METADATA_FULFILLED, APP_OPTIONS_UPDATED } from '../types';

const LOADERS = {
  grid: loadGridView,
  map: loadMapView,
  chart: loadChartView,
  card: loadCardView,
  calendar: loadCalendarView,
  topology: loadTopologyView,
};

const cleanupParams = (params) => pick(params, [
  'sort',
  'fields',
  'page.number',
  'page.size',
  'filter',
  'hidden_filter',
  'exec_by',
  'embedded_to',
  'humanize',
  'refreshId',
  'full_fieldset',
  'extra_fields',
  'sql_debug',
  'date_trunc',
  'extra_params',
]);

const cleanupSettings = (settings) => pick(settings, [
  'hidden_paginator_query_limit',
]);

const loadMetadata = async (modelAlias, viewAlias, { exec_by, embedded_to }) => {
  const { data } = await PlasticineApi.loadView(modelAlias, viewAlias, { exec_by, embedded_to });
  const { entities } = normalize(data);

  return processMetadata(entities, modelAlias, viewAlias, data.meta, data.user);
}

const processMetadata = (metadata, modelAlias, viewAlias, options, user) => {
  const findByModel = isNaN(+modelAlias) ? 'alias' : 'id';
  const findByView = isNaN(+viewAlias) ? 'alias' : 'id';
  const model = find(metadata.model, { [findByModel]: findByModel === 'id' ? +modelAlias : modelAlias });
  const view = find(metadata.view, { [findByView]: findByView === 'id' ? +viewAlias : viewAlias });

  metadata.filter = metadata.filter || {};

  return { metadata, model, view, options, user };
};

// const fetchMetadataFromState = (state, modelAlias, viewAlias, { exec_by }) =>
//   state.metadata[`${modelAlias}/view/${viewAlias}`];

const viewLoader = ({ metadata, model, view, options }, viewOptions, ...rest) => {
  if (!metadata.field) return { payload: { metadata }, modelAlias: model.alias, loadCount: false };
  const params = { ...options, ...viewOptions, loadCount: true }
  if (view.type === 'map') params.loadCount = false
  return LOADERS[view.type](model, view, metadata, params, ...rest);
};

const getFirstAccessibleViewAlias = async (modelAlias, params) => {
  const {data : {data}} = await PlasticineApi.loadView(modelAlias, '__first', params);
  const [viewData] = filter(data, { type: 'view' });
  return viewData?.attributes.alias;
}

export const loadView = async (modelAlias, viewAlias, viewOptions, callbacks = {}) => {
  try {
    const params = cleanupParams(viewOptions);
    let alias = viewAlias === '__first' ? await getFirstAccessibleViewAlias(modelAlias, params) : viewAlias;
    const metadata = await loadMetadata(modelAlias, alias, params);
    applyUserSettings(params, metadata.view, metadata.metadata);

    if (callbacks.onLoadMetadata) callbacks.onLoadMetadata(metadata.metadata);

    return viewLoader(metadata, params);
  } catch (error) {
    const viewType = (viewOptions.exec_by || {}).type;
    if (['related_view'].includes(viewType)) error.silent = true;

    return processError(error);
  }
};

export default (modelAlias, { viewAlias, viewOptions }) => async (dispatch, getState) => {
  // TODO: implement fetching from existed metadata's store
  // const cachedMetadata = fetchMetadataFromState(getState(), modelAlias, viewAlias, viewOptions);
  //
  // const metadata = cachedMetadata
  //   ? await Promise.resolve(processMetadata(cachedMetadata, modelAlias, viewAlias))
  //   : await loadMetadata(modelAlias, viewAlias, viewOptions);

  const state = getState();
  const params = cleanupParams(viewOptions);
  const settings = cleanupSettings(state.app.settings);
  if (history.isLeft('view', { modelAlias, viewAlias })) return;

  const metadata = await loadMetadata(modelAlias, viewAlias, params);
  applyUserSettings(params, metadata.view, metadata.metadata);

  dispatch({ type: APP_OPTIONS_UPDATED, payload: { user: metadata.user } });
  dispatch({ type: METADATA_FULFILLED, payload: metadata.metadata, target: `${modelAlias}/view/${viewAlias}` });

  const { payload, ...rest } = await viewLoader(metadata, params, settings);
  dispatch({ type: RECORDS_FULFILLED, payload: payload.db });

  rest.viewOptions = rest.options;
  delete rest.options;

  return rest;
}
