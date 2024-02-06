import { uniq, compact } from 'lodash/array';
import { map, reduce, find } from 'lodash/collection';
import { values, merge } from 'lodash/object';

import PlasticineApi from '../../../api';
import normalize from '../../../api/normalizer';
import { getLayoutSorters, applyDefaultAutorefresh, applyDefaultPage } from './helpers';
import { fetchFilterTree } from '../../helpers';
import { parseOptions } from '../../../helpers';

const DEFAULT_PAGE_SIZE = 30;
const DEFAULT_CARD_WIDTH = 300;
const DEFAULT_CARD_MARGIN = 20;
const DEFAULT_QUERY_LIMIT = 250;

const IMAGE_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

export default (model, view, metadata, viewOptions, settings = {}) => {
  const context = {};
  const options = { ...viewOptions, humanize: true };

  const viewFilter = metadata.filter[view.filter];
  if (options.filter === undefined && viewFilter) {
    options.filter = viewFilter.query;
  }

  const layout = metadata.layout[view.layout];
  const parsedLayoutOptions = parseOptions(layout.options);

  if (!options.sort) {
    const sorters = getLayoutSorters(parsedLayoutOptions);
    if (sorters) options.sort = sorters;
  }

  const fields = [], thumbnailFields = [];
  let isThumbnailed = false;

  parsedLayoutOptions.components.list.forEach((c) => {
    if (!c.startsWith('__')) fields.push(c);
    if (c.startsWith('__thumbnail__.')) thumbnailFields.push(c.split('.')[1]);
    if (c == '__thumbnail__') isThumbnailed = true;
  });

  const isActionPresent = !!(find(parsedLayoutOptions.components.list, (c) => c.startsWith('__action__')) ||
    find(values(parsedLayoutOptions.components.options), (v) => v.action));

  if (isActionPresent || model.alias === 'attachment') {
    options.fields = {};
  } else {
    // It's important to use underscore as key for object, because we have model with alias - filter
    options.fields = { [`_${model.alias}`] : uniq(fields.concat(thumbnailFields)).join(',') };
  }

  applyDefaultAutorefresh(options);
  applyDefaultPage(options);

  const { show_as_carousel } = parsedLayoutOptions.card_style;

  if (view.paginator_enabled && !show_as_carousel) {
    options.page.size = getPageSize(parsedLayoutOptions, viewOptions);
  } else {
    options.page.size = settings.hidden_paginator_query_limit || DEFAULT_QUERY_LIMIT;
  }

  options.include = isThumbnailed ? ['attachments'] : [];
  thumbnailFields.forEach(tf => options.include.push(`${tf}.attachments`));

  if (options.include.length) {
    options.include = options.include.join(',');
  } else {
    delete options.include;
  }

  return PlasticineApi.fetchRecords(model.alias, options)
    .then(({ data }) => {
      const normalizedResponse = normalize(data);
      const recordsIds = normalizedResponse.result[model.alias] || [];
      const db = normalizedResponse.entities;

      if (db[model.alias]) {
        loadThumbnails(Object.values(db[model.alias]), isThumbnailed, thumbnailFields, db);
      }

      const payload = { metadata, db };

      merge(options, {
        page: { number: data.meta.page_number, size: data.meta.page_size, totalSize: data.meta.total_size },
        sort: data.meta.sort,
        filter: data.meta.filter,
      });

      return fetchFilterTree(model.alias, data.meta.filter).then(({ data: { data } }) => {
        options.filterTree = data;

        return {
          payload,
          options,
          modelAlias: model.alias,
          recordsIds,
        };
      });
    });
};

function getPageSize(parsedLayoutOptions, viewOptions) {
  const viewPageSize = (viewOptions.page || {}).size;

  if (viewPageSize) return viewPageSize;

  const containerWidth = document.getElementsByClassName('content-container')[0].offsetWidth;
  const {
    margin: cardMargin = DEFAULT_CARD_MARGIN,
    width: cardWidth = DEFAULT_CARD_WIDTH,
  } = parsedLayoutOptions.card_style;
  const recordsInRow = Math.floor((containerWidth + parseInt(cardMargin)) / (parseInt(cardWidth) + parseInt(cardMargin)));
  return Math.ceil(DEFAULT_PAGE_SIZE / recordsInRow) * recordsInRow;
}

function getThumbnail(record = {}, attachmentsMap = {}) {
  const { relationships = {} } = record.__metadata || {};
  const { attachment = [] } = relationships;
  const recordAttachments = attachment.map(({ id }) => attachmentsMap[id]);

  return recordAttachments.find((a = {}) => {
    const { file_content_type, thumbnail } = a;
    return IMAGE_CONTENT_TYPES.includes(file_content_type) && thumbnail;
  });
}

function loadThumbnails(records, isThumbnailed, thumbnailFields = [], db) {
  const cache = Object.keys(db).reduce((result, key) => {
    result[key] = [];
    return result;
  }, {});

  records.forEach((record) => {
    if (isThumbnailed) {
      record.__metadata.thumbnail = getThumbnail(record, db.attachment);
    }

    thumbnailFields.forEach((tf) => {
      const { relationships = {}} = record.__metadata;

      const relation = relationships[tf];
      if (!relation) return;

      const relatedRecord = (db[relation.type] || {})[relation.id];
      if (!relatedRecord) return;

      if (!cache[relation.type].includes(relation.id)) {
        relatedRecord.__metadata.thumbnail = getThumbnail(relatedRecord, db.attachment);
        cache[relation.type].push(relation.id);
      }

      relationships[tf] = relatedRecord;
    });
  });

  return db;
}
