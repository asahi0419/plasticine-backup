import { filter, each, reduce, map } from 'lodash-es';

import db from '../../../data-layer/orm/index.js';
import BasePerformer from './base.js';
import { getAliasPattern, getForeignModelPattern, getForeignLabelPattern } from '../utils/helpers.js';
import { parseOptions } from '../../helpers/index.js';
import { worklogIsExist } from '../../worklog/model.js';

export default class FieldPerformer extends BasePerformer {
  async getComponentsToCleanup() {
    const components = [];

    components.push({ model: 'permission', field: 'field' });

    if (worklogIsExist(this.record.model)) {
      components.push({ model: `worklog_${this.record.model}`, field: 'related_field' });
    }

    return components;
  }

  async getDependencyToUpdate(type, recordAlias) {
    const record = { ...this.record, alias: recordAlias || this.record.alias };

    const dependency = {
      form: await db.model('form').where({ model: record.model })
        .andWhere('options', db.client.regexpClause(), getAliasPattern(record.alias))
        .orWhere('options', db.client.regexpClause(), getAliasPattern(record.id)),
      layout: await db.model('layout').where({ model: record.model })
        .andWhere('options', db.client.regexpClause(), getAliasPattern(record.alias))
        .orWhere('options', db.client.regexpClause(), getAliasPattern(record.id)),
    };

    if (type === 'delete') {
      await cleanupForms(record, dependency.form);
      await cleanupLayouts(record, dependency.layout);
    }

    return dependency;
  }

  async getDependency(recordAlias) {
    const record = { ...this.record, alias: recordAlias || this.record.alias };

    const dependency = {
      appearance: await db.model('appearance').where({ model: record.model }).then(records => records.filter(r => isAppearanceDependent(r, record.alias))),
      chart: await db.model('chart').where({ data_source: record.model }).then(records => records.filter(r => isChartDependent(r, record.alias))),
      filter: await db.model('filter').where({ model: record.model }).andWhere('query', db.client.regexpClause(), getAliasPattern(record.alias)),
      field: await db.model('field').whereIn('type', ['reference', 'reference_to_list'])
                                    .andWhere('model', record.model)
                                    .andWhere('options', db.client.regexpClause(), getForeignModelPattern(db.getModel(record.model).alias))
                                    .andWhere('options', db.client.regexpClause(), getForeignLabelPattern(record.alias)),
      // user_setting: await db.model('user_setting').where({ model: db.getModel('layout').id }).andWhere('options', db.client.regexpClause(), getAliasPattern(recordAlias || record.alias)), // https://redmine.nasctech.com/issues/48611
      escalation_rule: (record.type === 'datetime') ? await db.model('escalation_rule').where({ target_field: record.id }) : [],
      attachment: await db.model('attachment').where({ field: record.id }),
      dynamic_translation: await db.model('dynamic_translation').where({ field: record.id }),
      json_translation: await db.model('json_translation').where({ field: record.id }),
      global_references_cross: await db.model('global_references_cross').where({ source_field: record.id }),
    };

    return dependency;
  }
}

const isAppearanceDependent = (record, alias) => {
  if (!record.options) return false;
  const { rules } = parseOptions(record.options);
  if (!rules) return false;

  const pattern = RegExp(getAliasPattern(alias), 'g');

  return rules.some(({ query, field }) => pattern.test(query) || (field && (field === record.id)));
};

const isChartDependent = (record, alias) => {
  const { axis_x, axis_y, aggregation_fields, filter_query } = parseOptions(record.options);

  if (axis_x && (axis_x.value === alias)) return true;
  if (axis_y && axis_y.some(({ value }) => value === alias)) return true;
  if (aggregation_fields && aggregation_fields.some(({ value }) => value === alias)) return true;

  if (filter_query) {
    const pattern = RegExp(getAliasPattern(alias), 'g');
    return pattern.test(filter_query);
  }

  return false;
};

async function cleanupForms(record, records = []) {
  each(records, (r) => {
    const currOptions = parseOptions(r.options);

    const components = currOptions.components || {};
    const componentsList = components.list || [];
    const componentsOptions = components.options || {};

    const componentsRelated = currOptions.related_components || {};
    const componentsRelatedList = componentsRelated.list || [];
    const componentsRealtedOptions = componentsRelated.options || {};

    const nextOptions = {
      ...currOptions,
      components: {
        ...components,
        list: filter(componentsList, (alias) => (alias !== record.alias)),
        options: reduce(componentsOptions, (result, value, alias) => (alias === record.alias) ? result : ({ ...result, [alias]: value }), {}),
      },
      related_components: {
        ...componentsRelated,
        list: filter(componentsRelatedList, ({ id }) => (id.split('_')[0] != record.id)),
        options: reduce(componentsRealtedOptions, (result, value, id) => (id.split('_')[0] == record.id) ? result : ({ ...result, [id]: value }), {}),
      },
    };

    r.options = JSON.stringify(nextOptions);
  });
};

async function cleanupLayouts(record, records = []) {
  each(records, (r) => {
    const currOptions = parseOptions(r.options);

    if (r.type === 'grid') {
      const columns = currOptions.columns || [];
      const columnsOptions = currOptions.columns_options || {};
      const sortOrder = currOptions.sort_order || [];

      const nextOptions = {
        ...currOptions,
        columns: filter(columns, (alias) => (alias !== record.alias)),
        columns_options: reduce(columnsOptions, (result, value, alias) => (alias === record.alias) ? result : ({ ...result, [alias]: value }), {}),
        sort_order: filter(sortOrder, ({ field: alias }) => (alias !== record.alias)),
      };

      r.options = JSON.stringify(nextOptions);
    }

    if (r.type === 'card') {
      const components = currOptions.components || [];

      const nextOptions = {
        ...currOptions,
        components: map(components, (component) => {
          return {
            list: filter(component.list, (alias) => (alias !== record.alias)),
            options: reduce(component.options, (result, value, alias) => (alias === record.alias) ? result : ({ ...result, [alias]: value }), {}),
            sort_order: filter(component.sort_order, ({ field: alias }) => (alias !== record.alias)),
          }
        }),
      };

      r.options = JSON.stringify(nextOptions);
    }
  });
};
