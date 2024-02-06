import db from '../../../data-layer/orm/index.js';
import { getAliasPattern } from './helpers.js';
import { parseOptions } from '../../helpers/index.js';

const processAppearanceAttributes = (record, oldAlias, newAlias) => {
  const options = parseOptions(record.options);
  const pattern = RegExp(getAliasPattern(oldAlias), 'g');

  options.rules.forEach(({ query }, i) => (options.rules[i].query = query.replace(pattern, `$1${newAlias}`)));

  return { options: JSON.stringify(options) };
};

const processChartAttributes = (record, oldAlias, newAlias) => {
  const options = parseOptions(record.options);

  options.axis_x && (options.axis_x.value === oldAlias) && (options.axis_x.value = newAlias);
  options.axis_y && options.axis_y.forEach((item, i) => (item.value === oldAlias) && (options.axis_y[i].value = newAlias))
  options.aggregation_fields && options.aggregation_fields.forEach((item, i) =>
    (item.value === oldAlias) && (options.aggregation_fields[i].value = newAlias))

  if (options.filter_query) {
    const pattern = RegExp(getAliasPattern(oldAlias), 'g');
    pattern.test(options.filter_query) && (options.filter_query = options.filter_query.replace(pattern, `$1${newAlias}`));
  }

  return { options: JSON.stringify(options) };
};

const processFieldAttributes = (record, oldAlias, newAlias) => {
  const options = parseOptions(record.options);
  const pattern = new RegExp(`^${oldAlias}$|({)${oldAlias}(})`, 'g');

  if (options.foreign_model) {
    options.foreign_model = options.foreign_model.replace(pattern, `$1${newAlias}$2`);
  }

  if (options.foreign_label) {
    options.foreign_label = options.foreign_label.replace(pattern, `$1${newAlias}$2`);
  }

  return { options: JSON.stringify(options) };
};

const processFilterAttributes = (record, oldAlias, newAlias) => {
  const pattern = RegExp(getAliasPattern(oldAlias), 'g');
  const query = record.query ? record.query.replace(pattern, `$1${newAlias}`) : '';

  return { query };
};

const processFormAttributes = (record, oldAlias, newAlias) => {
  const options = parseOptions(record.options);

  if (!options.components) return { options };

  options.components.list.forEach((item, i) =>
    (item === oldAlias) && (newAlias ? (options.components.list[i] = newAlias) : options.components.list.splice(i)));

  options.components.options[oldAlias] && newAlias && (options.components.options[newAlias] = options.components.options[oldAlias])
  delete options.components.options[oldAlias];

  return { options: JSON.stringify(options) };
};

const processLayoutAttributes = (record, oldAlias, newAlias) => {
  if (record.type === 'grid') {
    return processGridLayoutAttributes(record, oldAlias, newAlias);
  }

  if (record.type === 'card') {
    return processCardLayoutAttributes(record, oldAlias, newAlias);
  }
};

const processGridLayoutAttributes = (record, oldAlias, newAlias) => {
  const options = parseOptions(record.options);

  options.columns && options.columns.forEach((item, i) =>
  (item === oldAlias) && (newAlias ? (options.columns[i] = newAlias) : options.columns.splice(i)));

  options.sort_order && options.sort_order.forEach((item, i) => {
    if (item.field) {
      (item.field === oldAlias) && (newAlias ? (options.sort_order[i].field = newAlias) : options.sort_order.splice(i));
    } else {
      (item === oldAlias) && (newAlias ? (options.sort_order[i] = newAlias) : options.sort_order.splice(i));
    }
  });

  options.columns_options[oldAlias] && newAlias && (options.columns_options[newAlias] = options.columns_options[oldAlias])
  delete options.columns_options[oldAlias];

  return { options: JSON.stringify(options) };
}

const processCardLayoutAttributes = (record, oldAlias, newAlias) => {
  const options = parseOptions(record.options);

  options.components.list.forEach((item, i) =>
    (item === oldAlias) && (newAlias ? (options.components.list[i] = newAlias) : options.components.list.splice(i)));

  options.components.options[oldAlias] && newAlias && (options.components.options[newAlias] = options.components.options[oldAlias])
  delete options.components.options[oldAlias];

  options.sort_order && options.sort_order.forEach((item, i) => {
    if (item.field) {
      (item.field === oldAlias) && (newAlias ? (options.sort_order[i].field = newAlias) : options.sort_order.splice(i));
    } else {
      (item === oldAlias) && (newAlias ? (options.sort_order[i] = newAlias) : options.sort_order.splice(i));
    }
  });

  return { options: JSON.stringify(options) };
}

const processUserSettingAttributes = (record, oldAlias, newAlias) => {
  const model = db.getModel(record.model);

  if (model.alias === 'layout') {
    return processGridLayoutAttributes(record, oldAlias, newAlias);
  }
};

export default {
  appearance: processAppearanceAttributes,
  chart: processChartAttributes,
  field: processFieldAttributes,
  filter: processFilterAttributes,
  form: processFormAttributes,
  layout: processLayoutAttributes,
  user_setting: processUserSettingAttributes,
};
