import { pick, map, each, filter, isString, isObject, isNaN, isArray } from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';
import * as CONSTANTS from '../../../constants/index.js';
import { viewAliasToId } from '../../../helpers/index.js';

export const processComponentsAttachmentsOptions = async (options) => {
  if (!isObject(options.components)) return;

  const { options: componentsOptions = {} } = options.components;
  const { __attachments__ = {} } = componentsOptions;
  const { last_versions_view, previous_versions_view } = __attachments__;
  const model = db.getModel('attachment');

  if (isString(last_versions_view)) {
    const id = await viewAliasToId(model, last_versions_view);
    options.components.options.__attachments__.last_versions_view = id;
  }

  if (isString(previous_versions_view)) {
    const id = await viewAliasToId(model, previous_versions_view);
    options.components.options.__attachments__.previous_versions_view = id;
  }
};

export const processComponentsWorklogOptions = async (options = {}) => {
  if (!isArray((options.components || {}).list)) return;
  if (!isObject((options.components || {}).options)) return;

  const worklogs = filter(options.components.list, (key) => key.startsWith('__worklog__'));

  each(worklogs, (key) => {
    if (!options.components.options[key]) {
      options.components.options[key] = {};
    }

    if (!options.components.options[key].audit_text_pattern) {
      options.components.options[key].audit_text_pattern = CONSTANTS.DEFAULT_AUDIT_TEXT_PATTERN;
    }

    if (!options.components.options[key].audit_text_limit || isNaN(+options.components.options[key].audit_text_limit)) {
      options.components.options[key].audit_text_limit = CONSTANTS.DEFAULT_AUDIT_TEXT_LIMIT;
    }

    if (+options.components.options[key].audit_text_limit < 0) {
      options.components.options[key].audit_text_limit = 0;
    } else {
      options.components.options[key].audit_text_limit = +options.components.options[key].audit_text_limit;
    }
  });
};

export const cleanupComponentsOptions = (options) => {
  const processList = (list) => map(list, (item) => (isObject(item) && item.id) ? item.id : item);

  if (isObject(options.components)) {
    const { options: componentsOptions = {}, list = [] } = options.components;
    options.components.options = pick(componentsOptions, processList(list));
  }

  if (isObject(options.related_components)) {
    const { options: componentsOptions = {}, list = [] } = options.related_components;

    options.related_components.options = pick(componentsOptions, processList(list));
  }
};
