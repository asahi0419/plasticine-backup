import {
  each,
  isBoolean,
  isNaN,
  isNumber,
  isNil,
  isNull,
  isString,
  isArray,
  isEmpty
} from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';
import typecast from '../../../field/value/typecast/index.js';
import { parseOptions } from '../../../helpers/index.js';

export const processOptions = async (field) => {
  const options = parseOptions(field.options);

  if (['integer', 'float'].includes(field.type)) {
    const keys = ['default', 'min', 'max', 'step'];

    each(keys, (key) => {
      if (isNaN(Number(options[key])) || isNil(options[key]) || (isString(options[key] && !options[key]))) {
        delete options[key];
      } else {
        options[key] = Number(options[key]);
      }
    });
  }

  if (field.type === 'boolean') {
    if (!(isBoolean(options.default) || isNull(options.default))) options.default = false;
  }

  if (field.type === 'array_string') {
    options.length = 2048;

    if (isString(options.values)) {
      options.values = parseOptions(options.values);
    }

    if (isString(options.default) && !options.default.trim().length) {
      options.default = null;
    }

    if (field.__inserted) {
      const previousOptions = parseOptions(field.__previousAttributes.options);
      options.multi_select = previousOptions.multi_select;
    }
  }

  if (field.type === 'string') {
    options.length = options.length || 255;
    options.format = options.format || null;
    if (options.syntax_hl === 'signature') {
      options.length = 'unlimited';
    }
  }

  if (field.type === 'filter') {
    options.length = options.length || 150000;
    options.ref_model = options.ref_model || null;
  }

  if (field.type === 'condition') {
    options.ref_model = options.ref_model || null;
  }

  if (['data_template', 'data_visual'].includes(field.type)) {
    options.length = options.length || 10000;
    options.syntax_hl = options.syntax_hl || 'json';
  }

  if (['reference', 'reference_to_list'].includes(field.type)) {
    each(options.extra_fields || [], (f, i) => {
      if (Number(f)) return;
      const model = db.getModel(options.foreign_model);
      const field = db.getField({ model: model.id, alias: f }) || {};
      options.extra_fields[i] = field.id;
    });

    if (isNumber(options.foreign_model)) {
      const model = db.getModel(options.foreign_model) || {};
      options.foreign_model = model.alias;
    }

    if (isNumber(options.view)) {
      const view = await db.model('view').where({ id: options.view }).getOne() || {};
      options.view = view.alias;
    }

    if (isString(options.depends_on) && options.depends_on.length) {
      options.depends_on = parseOptions(options.depends_on);
    }

    if (!isArray(options.depends_on) || !options.depends_on.length) {
      options.depends_on = null;
    }

    options.filter = options.filter || null;
  }

  if (field.type === 'global_reference') {
    const references = parseOptions(options.references)
    options.references = isArray(references) ? references : [];
  }

  if (['string', 'color', 'condition', 'fa_icon', 'file', 'filter', 'datetime', 'reference', 'reference_to_list'].includes(field.type)) {
    options.default = typecast(field, options.default) || null;
  }

  if (['geo_point', 'geo_line_string', 'geo_polygon', 'geo_geometry'].includes(field.type)) {
    options.length = options.length || 'unlimited';
    options.syntax_hl = options.syntax_hl || 'json';

    if (['geo_point'].includes(field.type)) {
      options.rows = options.rows || 1;
    }

    if (['geo_line_string'].includes(field.type)) {
      options.rows = options.rows || 2;
    }

    if (['geo_polygon'].includes(field.type)) {
      options.rows = options.rows || 3;
    }

    if (['geo_geometry'].includes(field.type)) {
      options.rows = options.rows || 10;
    }
  }

  field.options = JSON.stringify(options);

  return field;
};
