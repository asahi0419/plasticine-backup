import { compact, uniq } from 'lodash/array';
import { filter, find, map } from 'lodash/collection';
import { castArray, isNumber } from 'lodash/lang';

import { selectLayoutFields } from './layout';

const ACTIONS_TYPES = {
  grid: ['view_button', 'view_choice', 'view_menu_item'],
  map: ['view_button', 'view_menu_item', 'map_item', 'map_item_context', 'map_item_tip', 'map_draw'],
  chart: ['view_button', 'view_menu_item'],
  card: ['view_button', 'view_menu_item', 'card_view'],
  calendar: ['view_button', 'view_menu_item', 'calendar_action'],
  topology: ['view_button', 'view_menu_item', 'topology_item', 'topology_item_context'],
};

const METADATA_EXTRACTORS = {
  grid: extractGridMetadata,
  map: extractMapMetadata,
  chart: () => ({}),
  card: extractCardMetadata,
  calendar: () => ({}),
  topology: () => ({}),
};

const DATA_EXTRACTORS = {
  grid: extractGridData,
  map: extractMapData,
  chart: extractChartData,
  card: extractCardData,
  calendar: extractCalendarData,
  topology: extractTopologyData,
};

function extractRecords(db = {}, model = {}, recordsIds = []) {
  return map(recordsIds, (id) => (db[model.alias] || {})[id]);
}

function extractGridMetadata(db, metadata, model, view) {
  const layout = view.layout ? metadata.layout[view.layout] : null;
  return { layout };
}

function extractMapMetadata(db, metadata, model, view) {
  const appearance = view.appearance ? metadata.appearance[view.appearance] : null;
  return { appearance };
}

function extractCardMetadata(db, metadata, model, view) {
  const layout = view.layout ? metadata.layout[view.layout] : null;
  return { layout };
}

function extractGridData(db, model, recordsIds) {
  return { records: extractRecords(db, model, recordsIds) };
}

function extractCardData(db, model, recordsIds) {
  return { records: extractRecords(db, model, recordsIds) };
}

function extractCalendarData(db, model, recordsIds) {
  return { records: extractRecords(db, model, recordsIds) };
}

function extractTopologyData(db, model, recordsIds) {
  return { records: extractRecords(db, model, recordsIds) };
}

function extractMapData(db) {
  return {
    features: db.features || [],
    sections: db.sections || [],
    groups: db.groups || [],
    properties: db.properties || {},
  };
}

function extractChartData(db) {
  return {
    error: db.chart_error,
    scope: db.chart_scope,
    builder: db.chart_builder,
    version: db.chart_version,
  };
}

export default (db, metadata, modelAlias, recordsIds) => {
  if (!metadata) return {};

  const model = find(metadata.model, { [isNumber(modelAlias) ? 'id' : 'alias']: modelAlias });
  const view = find(metadata.view, { model: model.id });
  const fields = filter(metadata.field, { model: model.id });
  const actions = filter(metadata.action, (o) => {
    return o.model === model.id && ACTIONS_TYPES[view.type].includes(o.type);
  });

  const filterIds = uniq(compact(castArray(view.predefined_filters).concat(view.filter)));
  const filters = filterIds.map(id => metadata.filter[id]);

  const viewSpecificMetadata = METADATA_EXTRACTORS[view.type](db, metadata, model, view);
  const viewSpecificData = DATA_EXTRACTORS[view.type](db, model, recordsIds);

  const columns = selectLayoutFields(fields, viewSpecificMetadata.layout)

  return { model, view, fields, columns, actions, filters, ...viewSpecificMetadata, ...viewSpecificData };
};
