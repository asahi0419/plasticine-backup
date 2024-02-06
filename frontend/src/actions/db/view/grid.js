import { map } from 'lodash/collection';
import { reduce } from 'lodash/collection';
import { merge, omit, values, pick } from 'lodash/object';
import { intersection, uniq, compact } from 'lodash/array';

import PlasticineApi from '../../../api';
import normalize from '../../../api/normalizer';
import { getLayoutSorters, applyDefaultAutorefresh, applyDefaultPage } from './helpers';
import { fetchFilterTree, processError } from '../../helpers';
import { parseOptions } from '../../../helpers';

const DEFAULT_QUERY_LIMIT = 100;

export default async (model, view, metadata, viewOptions, settings) => {
  const options = getOptions(model, view, metadata, viewOptions, settings);
  const result = await getRecords(model.alias, omit(options, ['templates', 'autorefresh'])) || {};

  const { db, meta = {}, recordsIds } = result;

  const filterTree = await getFilterTree(model.alias, meta.filter);
  const appearance = await getAppearance(model.alias, view.appearance, recordsIds);

  merge(options, {
    page: { number: meta.page_number, size: meta.page_size, totalSize: meta.total_size },
    sort: meta.sort,
    filter: meta.filter,
    filterTree,
    appearance,
  });

  return {
    payload: { metadata, db },
    options,
    modelAlias: model.alias,
    recordsIds,
  };
};

const getOptions = (model, view, metadata, viewOptions, settings = {}) => {
  const options = { ...viewOptions, humanize: true };
  const filter = metadata.filter[view.filter];
  const layout = metadata.layout[view.layout];
  const parsedLayoutOptions = parseOptions(layout.options);

  // It's important to use underscore as key for object, because we have model with alias - filter
  options.fields = { [`_${model.alias}`] : getFieldsList(parsedLayoutOptions.columns, metadata.field, viewOptions.extra_fields, view.cell_edit_enabled) };

  applyDefaultAutorefresh(options);
  applyDefaultPage(options);

  if (!view.paginator_enabled && (options.exec_by.type !== 'related_view')) {
    options.page = options.page || {};
    options.page.size = settings.hidden_paginator_query_limit || DEFAULT_QUERY_LIMIT;
  }
  if ((options.filter === undefined) && filter) options.filter = filter.query;
  if (!options.sort) {
    const sorters = getLayoutSorters(parsedLayoutOptions);
    if (sorters) options.sort = sorters;
  }

  return options;
}

const getFieldsList = (columns, fields, extraFields, editable) => {
  let columnsAliases = intersection(columns, map(fields, 'alias'));
  if (!columnsAliases.length) columnsAliases = map(fields, 'alias');

  if (extraFields && extraFields.length) {
    const extraFieldsAliases = compact(map(extraFields, (fieldId) => fields[fieldId]?.alias));
    columnsAliases = uniq(columnsAliases.concat(extraFieldsAliases));
  }

  if (!editable) return columnsAliases.join(',');

  const refFields = reduce(values(fields).filter((field) => field.type === 'reference'), (result, field) => {
    const { depends_on } = parseOptions(field.options);
    if (depends_on) {
      const aliases = [field.alias, ...depends_on];
      return intersection(columnsAliases, aliases).length ? result.concat(aliases) : result;
    } else {
      return result;
    }
  }, []);

  return uniq(columnsAliases.concat(refFields)).join(',');
}

const getRecords = async (modelAlias, options) => {
  try {
    const { data } = await PlasticineApi.fetchRecords(modelAlias, options);
    const { result, entities: db } = normalize(data);
    const recordsIds = compact(result[modelAlias] || []);

    return { db, meta: data.meta, recordsIds };
  } catch (error) {
    processError(error);
    return { meta: {} };
  }
}

const getFilterTree = async (modelAlias, filter) => {
  if (!filter) return {};

  const { data: result = {} } = await fetchFilterTree(modelAlias, filter) || {}
  const { data: filterTree = {} } = result;

  return filterTree;
}

const getAppearance = async (modelAlias, appearanceId, recordsIds) => {
  if (!appearanceId || !recordsIds.length) return [];
  const { data: { data: appearance } } = await PlasticineApi.executeAppearance(modelAlias, appearanceId, recordsIds);
  return appearance;
}
