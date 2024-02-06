import { map } from 'lodash/collection';
import { compact } from 'lodash/array';

import PlasticineApi from '../../../api';
import { parseOptions } from '../../../helpers';
import { applyDefaultAutorefresh } from './helpers';

const getOptions = (model, chart, view, metadata, viewOptions) => {
  const options = { ...viewOptions };

  const filter = metadata.filter[view.filter];

  if (!options.filter) {
    if (options.refreshId) {
      options.filter = '';
    } else if (filter) {
      options.filter = filter.query;
    } else {
      options.filter = chart.filter;
    }
  }

  applyDefaultAutorefresh(options);

  return options;
};

export default async (model, view, metadata, viewOptions) => {
  const chart = metadata.chart[view.chart];
  const options = getOptions(model, chart, view, metadata, viewOptions)
  const result = await loadChartScope(chart.id, options);

  const db = {
    chart_error: result.error,
    chart_scope: result.scope,
    chart_builder: chart.client_script,
    chart_version: chart.version,
  };

  const payload = { metadata, db };

  return { payload, options, modelAlias: model.alias };
};

export const loadChartScope = async (chartId, options = {}) => {
  const main_filter = options.filter;
  const hidden_filter = options.hidden_filter;
  const filter = (main_filter && hidden_filter) ? `(${main_filter}) AND (${hidden_filter})` : (main_filter || hidden_filter);

  const { data: result } = await PlasticineApi.loadChartScope(chartId, { ...options, filter });
  const { data: { error, scope } } = result;

  if (error) error.name = `Server script: ${error.name}`;

  return { error, scope };
};
