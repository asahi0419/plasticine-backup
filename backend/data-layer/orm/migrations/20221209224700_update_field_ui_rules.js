import * as HELPERS from './helpers/index.js';

const SCRIPT_UP_INIT = `const { each, reduce, keys, find, filter, pick, map, isNull } = lodash;
const { parseOptions, getModel, getView } = utils;

function initOptions() {
  const type = {
    prev: p.record.getPrevValue('type'),
    curr: p.record.getValue('type'),
  };

  const optionsParsed = parseOptions(this.attributes.options);
  const options = this.options[
    ['inventory', 'subcategory', 'unit'].includes(optionsParsed.subtype)
      ? optionsParsed.subtype
      : this.attributes.type]
    || [];
    const optionsAttributes = reduce(options, (result, option) => {
      let value = optionsParsed[option.alias];
      if (!p.record.isPersisted()) {
        if ((type.curr === 'boolean') && isNull(value)) {
          value = null;
        } else {
          value = parseOptions(option.options).default;
        }
      }
      return { ...result, [option.alias]: value };
    }, { subtype: this.attributes.subtype });

  each(keys(optionsAttributes), (key) => {
    if (key === 'template_based') {
      const option = find(options, ({ alias }) => (alias === 'foreign_model'));
      optionsAttributes[key]
        && (option.options = JSON.stringify({ ...parseOptions(option.options), foreign_model: 'inventory_template' }))
        && (option.name = 'Template');
    }

    if (key === 'foreign_model') {
      if (optionsAttributes[key]) {
        const model = getModel(optionsAttributes[key]);
        if (model) optionsAttributes[key] = model.id;
      }

      const option = find(options, ({ alias }) => (alias === 'properties'));
      if (option) {
        optionsAttributes[key]
        && (option.options = JSON.stringify({
          ...parseOptions(option.options),
          foreign_model: optionsAttributes.template_based ? 'inventory_template' : 'inventory_category',
          tree: optionsAttributes.foreign_model,
        }));
      }
    }

    if (key === 'view') {
      if (optionsAttributes[key]) {
        const view = getView(optionsAttributes['foreign_model'], optionsAttributes[key]);
        if (view) optionsAttributes[key] = view.id;
      }
    }

    if (key === 'filter') {
      const model = getModel(optionsParsed.foreign_model)
      if (model) {
        const option = find(options, ({ alias }) => (alias === 'filter'));
        option.options = JSON.stringify({
          ...parseOptions(option.options),
          ref_model: model.id,
        })
      }
    }
  });

  const actualFields = filter(this.metadata.fields, (field) => parseOptions(field.options).subtype !== 'option');
  const actualAttributes = pick(this.originalAttributes, map(actualFields, 'alias'));

  this.attributes = { ...actualAttributes, ...optionsAttributes };
  this.attributes.options = JSON.stringify(optionsAttributes);

  this.metadata.options = options;
  this.metadata.fields = [ ...(this.metadata.fields || []), ...options ];
}

p.record.declare('initOptions', initOptions);
p.record.record.init();`;

const SCRIPT_UP_UPDATE = `const { find } = lodash;
const { parseOptions } = utils;

function updateOptions(alias) {
  if (alias === 'type') return this.init();

  const option = find(this.metadata.options, { alias });
  if (!option) return;

  const options = { ...parseOptions(this.get('options')), [alias]: this.get(alias) }

  if (alias === 'foreign_model') {
    if (this.attributes.subtype === 'inventory') {
      const field = this.getField('properties');
      field.options = JSON.stringify({ ...parseOptions(field.options), tree: this.attributes.foreign_model });
    }

    delete this.attributes.foreign_label;
    delete this.attributes.view;
    delete this.attributes.extra_fields;
    delete this.attributes.default;

    const fieldView = p.record.getField('view');
    const fieldExtraFields = p.record.getField('extra_fields');
    const fieldFilter = p.record.getField('filter');

    const fieldOptionsView = fieldView.getOptions();
    const fieldOptionsExtraFields = fieldExtraFields.getOptions();
    const fieldOptionsFilter = fieldFilter.getOptions();

    fieldView.setOptions({ ...fieldOptionsView, filter: \`\\\`model\\\` = \${this.attributes.foreign_model}\` });
    fieldExtraFields.setOptions({ ...fieldOptionsExtraFields, filter: \`\\\`model\\\` = \${this.attributes.foreign_model}\` });

    if (this.attributes.foreign_model) {
      const refModel = utils.getModel(this.attributes.foreign_model)
      this.attributes.filter = ''
      
      fieldFilter.setOptions({ 
        ...fieldOptionsFilter, 
        ref_model: refModel.id
      })
    } else {
      delete this.attributes.filter
    }
  }

  if (alias === 'template_based') {
    delete this.attributes.foreign_model;
    delete this.attributes.properties;

    const foreignModelField = this.getField('foreign_model');
    const propertiesField = this.getField('properties');

    if (this.attributes.template_based) {
      foreignModelField.name = 'Template'
      foreignModelField.options = JSON.stringify({ ...parseOptions(foreignModelField.options), foreign_model: 'inventory_template' });
      propertiesField.options = JSON.stringify({ ...parseOptions(propertiesField.options), foreign_model: 'inventory_template' });
    } else {
      foreignModelField.name = 'Category'
      foreignModelField.options = JSON.stringify({ ...parseOptions(foreignModelField.options), foreign_model: 'inventory_category' });
      propertiesField.options = JSON.stringify({ ...parseOptions(propertiesField.options), foreign_model: 'inventory_category' });
    }
  }

  this.update({ options: JSON.stringify(options) });
}

p.record.declare('updateOptions', updateOptions);`;

const SCRIPT_DOWN_INIT = `const { each, reduce, keys, find, filter, pick, map, isNull } = lodash;
const { parseOptions, getModel, getView } = utils;

function initOptions() {
  const type = {
    prev: p.record.getPrevValue('type'),
    curr: p.record.getValue('type'),
  };

  const optionsParsed = parseOptions(this.attributes.options);
  const options = this.options[this.attributes.type] || [];

  const optionsAttributes = reduce(options, (result, option) => {
    let value = optionsParsed[option.alias];
    if (!p.record.isPersisted()) {
      if ((type.curr === 'boolean') && isNull(value)) {
        value = null;
      } else {
        value = parseOptions(option.options).default;
      }
    }

    if (value) {
      if (option.alias === 'foreign_model') {
        const model = getModel(value);
        if (model) value = model.id;
      }

      if (option.alias === 'view') {
        const view = getView(result['foreign_model'], value);
        if (view) value = view.id;
      }

      if (option.alias === 'filter') {
        const model = getModel(optionsParsed.foreign_model)
        if (model) {
          option.options = JSON.stringify({
            ...parseOptions(option.options),
            ref_model: model.id,
          })
        }
      }
    }

    return { ...result, [option.alias]: value };
  }, { subtype: this.attributes.subtype });

  const actualFields = filter(this.metadata.fields, (field) => parseOptions(field.options).subtype !== 'option');
  const actualAttributes = pick(this.originalAttributes, map(actualFields, 'alias'));

  this.attributes = { ...actualAttributes, ...optionsAttributes };
  this.attributes.options = JSON.stringify(optionsAttributes);

  this.metadata.options = options;
  this.metadata.fields = [ ...(this.metadata.fields || []), ...options ];
}

p.record.declare('initOptions', initOptions);
p.record.record.init();`;

const SCRIPT_DOWN_UPDATE = `const { find } = lodash;
const { parseOptions } = utils;

function updateOptions(alias) {
  if (alias === 'type') return this.init();

  const option = find(this.metadata.options, { alias });
  if (!option) return;

  const options = { ...parseOptions(this.get('options')), [alias]: this.get(alias) };

  if (alias === 'foreign_model') {
    delete this.attributes.foreign_label;
    delete this.attributes.view;
    delete this.attributes.extra_fields;
    delete this.attributes.default;

    const fieldView = p.record.getField('view');
    const fieldExtraFields = p.record.getField('extra_fields');
    const fieldFilter = p.record.getField('filter');

    const fieldOptionsView = fieldView.getOptions();
    const fieldOptionsExtraFields = fieldExtraFields.getOptions();
    const fieldOptionsFilter = fieldFilter.getOptions();

    fieldView.setOptions({ ...fieldOptionsView, filter: \`\\\`model\\\` = \${this.attributes.foreign_model}\` });
    fieldExtraFields.setOptions({ ...fieldOptionsExtraFields, filter: \`\\\`model\\\` = \${this.attributes.foreign_model}\` });

    if (this.attributes.foreign_model) {
      const refModel = utils.getModel(this.attributes.foreign_model)
      this.attributes.filter = ''
      
      fieldFilter.setOptions({ 
        ...fieldOptionsFilter, 
        ref_model: refModel.id
      })
    } else {
      delete this.attributes.filter
    }
  }

  this.update({ options: JSON.stringify(options) });
}

p.record.declare('updateOptions', updateOptions);`;

export const up = (knex) => {
  return HELPERS.onModelsExistence(knex, ['ui_rule', 'plugin'], async () => {
    const plugin = await HELPERS.getRecord(knex, 'plugin', { alias: 'plugin_inventory', status: 'active' });

    if (plugin) {
      await HELPERS.updateRecord(knex, 'ui_rule', { name: 'Options: Initialize' }, { script: SCRIPT_UP_INIT });
      await HELPERS.updateRecord(knex, 'ui_rule', { name: 'Options: Update' }, { script: SCRIPT_UP_UPDATE });
    } else {
      await HELPERS.updateRecord(knex, 'ui_rule', { name: 'Options: Initialize' }, { script: SCRIPT_DOWN_INIT });
      await HELPERS.updateRecord(knex, 'ui_rule', { name: 'Options: Update' }, { script: SCRIPT_DOWN_UPDATE });
    }
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
