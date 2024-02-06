import Promise from 'bluebird';
import lodash from 'lodash';

import Sandbox from '../../../../sandbox';
import normalize from '../../../../api/normalizer';
import PlasticineApi from '../../../../api';
import * as HELPERS from '../../../../helpers';
import * as CLEANERS from './cleaners';
import { processTemplateFields, humanizeAttributes } from './helpers';
import OPTIONS, { optionsMapper } from './options';

export default class ProxyRecord {
  constructor(...args) {
    this.create(...args);
  }

  create(attributes, metadata, configs) {
    this.attributes = lodash.isObject(attributes) ? attributes : {};
    this.metadata = lodash.isObject(metadata) ? metadata : {};
    this.relationships = lodash.cloneDeep(this.metadata.relationships || {});
    this.counts = lodash.cloneDeep(this.metadata.counts || {});
    this.configs = lodash.isObject(configs) ? configs : { templates: [], options: {} };
    this.templates = {};
    this.observers = [];
    this.dynamicOnChangeStorage = {};
    this.renderingIsAllowed = true;

    this.initOptions = null;
    this.updateOptions = null;

    this.init();
  }

  init() {
    this.initAttributes && this.initAttributes();
    this.initOptions && this.initOptions();
    this.initFields && this.initFields();
    this.initActions && this.initActions();
    this.initErrors && this.initErrors();
  }

  initAttributes() {
    this.id = this.attributes.id;
    this.originalAttributes = this.attributes;
    this.humanizedAttributes = { ...(this.metadata.human_attributes || {}) };
    this.extraAttributes = { ...(this.metadata.extra_attributes || {}) };
    this.attributesHistory = [];
    this.changedAttributes = {};
  }

  initFields() {
    this.fieldsMap = lodash.keyBy((this.metadata.fields || []), 'alias');
    this.fieldsStates = { required: {}, visible: {}, enabled: {} };
    this.fieldsChanged = {};
  }

  initActions() {
    this.actionsMap = lodash.keyBy((this.metadata.actions || []), 'alias');
    this.actionsStates = { visible: {} };
    this.actionsChanged = this.actionsChanged || {};
  }

  initErrors() {
    this.errors = lodash.reduce((this.metadata.fields || []), (result, field) => {
      result[field.alias] = [];
      return result;
    }, {});
  }

  get options() {
    const { id, options } = this.attributes;
    let defaultOptions = lodash.cloneDeep(OPTIONS);
    if(id) {
      const zeroPad = (num, places) => String(num).padStart(places, '0')
      const previewIndex = lodash.findIndex(defaultOptions.autonumber, {alias : 'preview'});
      const widthIndex = lodash.findIndex(defaultOptions.autonumber, {alias : 'width'});
      const {default:widthDefault } = defaultOptions.autonumber[widthIndex].options;
      defaultOptions.autonumber[previewIndex].options = {...defaultOptions.autonumber[previewIndex].options, ... {default : zeroPad(id, widthDefault)}};

      const modelOptions = HELPERS.parseOptions(options);
      const filterIndex = lodash.findIndex(defaultOptions.reference, {alias : 'filter'});
      defaultOptions.reference[filterIndex].options = {...defaultOptions.reference[filterIndex].options, ... {ref_model: modelOptions.foreign_model}};
    }
    return optionsMapper({
      ...defaultOptions,
      ...lodash.cloneDeep((lodash.get(this.configs, 'options') || {}))
    });
  }

  typecast(v, fieldAlias) {
    const field = this.fieldsMap[fieldAlias];
    if (lodash.isNil(v) || !lodash.isObject(field)) return v;
    const { type, is_option } = field;

    switch(type) {
      case 'array_string':
        if (lodash.isArray(v) && lodash.isEmpty(v)) return null;
        return v;
      case 'string':
        if (lodash.isObject(v) && !is_option) return JSON.stringify(v);
        if (lodash.isNumber(v)) return `${v}`;
        return v;
      case 'journal':
        if (lodash.isObject(v) || lodash.isArray(v)) return JSON.stringify(v);
        return v;
      case 'integer':
      case 'reference':
        if (lodash.isString(v)) {
          if (v === '') return null;
          if (v.includes('.') && !lodash.last(v.split('.'))) return v;
          if (v === '-') return v;
        }
        const value = (['integer', 'reference'].includes(type))
          ? parseInt(v)
          : parseFloat(v)
        return lodash.isNaN(value) ? v : value;
      case 'datetime':
        return new Date(v);
      default:
        return v;
    }
  }

  get(fieldAlias) {
    return this.typecast(this.attributes[fieldAlias], fieldAlias);
  }

  set(fieldAlias, value) {
    const field = this.fieldsMap[fieldAlias];
    if (lodash.isNil(value) || !field) return;

    this.update({ [fieldAlias]: value });
  }

  getVisible(fieldAlias) {
    return this.humanizedAttributes[fieldAlias];
  }

  setVisible(fieldAlias, value) {
    const field = this.fieldsMap[fieldAlias];
    if (lodash.isNil(value) || !field) return;

    this.humanizedAttributes = { ...this.humanizedAttributes, [fieldAlias]: value };
    this.metadata.human_attributes = { ...(this.metadata.human_attributes || {}), [fieldAlias]: value };
  }

  subscribe(fn) {
    if (!lodash.isFunction(fn)) return;

    this.observers.push(fn);
  }

  unsubscribe(fn) {
    this.observers = this.observers.filter(subscriber => subscriber !== fn);
  }

  broadcast(attributes) {
    this.observers.forEach(subscriber => subscriber(attributes));
  }

  update(attributes) {
    this.attributesHistory.push(lodash.cloneDeep(this.attributes));
    this.changedAttributes = { ...this.changedAttributes, ...attributes };
    this.attributes = { ...this.attributes, ...attributes };
    this.humanizedAttributes = {
      ...this.humanizedAttributes,
      ...humanizeAttributes(attributes, this.getFields()),
    };
  }

  changeField(field) {
    this.fieldsChanged[field.alias] = field;
    this.baseOnChange();
  }

  getField(fieldAlias) {
    return this.fieldsChanged[fieldAlias] || this.fieldsMap[fieldAlias];
  }

  getFields() {
    return lodash.map(this.metadata.fields, ({ alias }) => this.getField(alias));
  }

  getRelationships(type) {
    return this.relationships[type] || [];
  }

  setRelationships(type, value) {
    this.relationships[type] = value;
  }

  getCounts(type) {
    return this.counts[type];
  }

  setCounts(type, value) {
    this.counts[type] = value;
  }

  bindDynamicOnChangeHandler(fieldAlias, fn) {
    this.dynamicOnChangeStorage[fieldAlias] = fn;
  }

  beforeChange(fieldAlias, value) {
    this.__checkDependentFields(fieldAlias, value);
    this.__checkDynamicFilters(fieldAlias);
  }

  baseOnChange(attributes = {}) {
    const attributesProcessed = lodash.reduce(attributes, (r, v, k) => ({ ...r, [k]: this.typecast(v, k) }), {});
    this.update(attributesProcessed);
    if (this.renderingIsAllowed) this.broadcast(attributesProcessed);
  };

  afterChange(fieldAlias, value) {
    const uea = this.updateExtraAttributes(fieldAlias, value)
    const ueaCallback = () => this.updateOptions && this.updateOptions(fieldAlias);

    return uea ? uea.then(ueaCallback) : ueaCallback()
  }

  onChange(fieldAlias, value) {
    this.beforeChange(fieldAlias, value);
    this.baseOnChange({ [fieldAlias]: value });
    this.afterChange(fieldAlias, value);
  }

  onChangeWithDynamics(fieldAlias, value) {
    const uea = this.updateExtraAttributes(fieldAlias, value)
    const ueaCallback = () => {
      const doc = this.dynamicOnChangeStorage[fieldAlias] || (() => {});
      const docFn = () => doc(this.attributes[fieldAlias], value, this.sandbox.api)
      const docCallback = (result) => (result !== false) && this.onChange(fieldAlias, value);

      return HELPERS.isAsyncFunction(doc) ? docFn().then(docCallback) : docCallback(docFn());
    }

    return uea ? uea.then(ueaCallback) : ueaCallback()
  }

  setActionAsVisible(actionAlias, state) {
    this.actionsStates.visible[actionAlias] = !!state;
    this.baseOnChange();
  }

  isActionVisible(actionAlias) {
    const overriddenState = this.actionsStates.visible[actionAlias];
    if (!lodash.isUndefined(overriddenState)) return overriddenState;
    
    const action = this.actionsMap[actionAlias];
    return action && action.condition_script && this.sandbox
      ? this.__executeScriptInModelContext(action.condition_script, `action/${action.id}/condition_script`)
      : false;
  }

  setFieldAsRequired(fieldAlias, state) {
    this.fieldsStates.required[fieldAlias] = !!state;
    this.baseOnChange();
  }

  setFieldAsVisible(fieldAlias, state) {
    this.fieldsStates.visible[fieldAlias] = !!state;
    this.baseOnChange();
  }

  setFieldAsEnabled(fieldAlias, state) {
    this.fieldsStates.enabled[fieldAlias] = !!state;
    this.baseOnChange();
  }

  isFieldRequired(fieldAlias) {
    const overriddenState = this.fieldsStates.required[fieldAlias];
    if (!lodash.isUndefined(overriddenState)) return overriddenState;

    const field = this.fieldsMap[fieldAlias];
    return field && field.required_when_script && this.sandbox
      ? this.__executeScriptInModelContext(field.required_when_script, `field/${field.id}/required_when_script`)
      : false;
  }

  isFieldVisible(fieldAlias) {
    const overriddenState = this.fieldsStates.visible[fieldAlias];
    if (!lodash.isUndefined(overriddenState)) return overriddenState;

    const field = this.fieldsMap[fieldAlias];
    return field && field.hidden_when_script && this.sandbox
      ? !this.__executeScriptInModelContext(field.hidden_when_script, `field/${field.id}/hidden_when_script`)
      : true;
  }

  isFieldEnabled(fieldAlias) {
    const overriddenState = this.fieldsStates.enabled[fieldAlias];
    if (!lodash.isUndefined(overriddenState)) return overriddenState;

    const field = this.fieldsMap[fieldAlias];
    return field && field.readonly_when_script && this.sandbox
      ? !this.__executeScriptInModelContext(field.readonly_when_script, `field/${field.id}/readonly_when_script`)
      : true;
  }

  setErrors(errors) {
    if (!lodash.isEqual(this.errors, errors)) {
      this.errors = errors;
      this.baseOnChange();
    }
  }

  getErrors(fieldAlias) {
    if (fieldAlias) return this.errors[fieldAlias] || [];
    return lodash.flatten(lodash.values(this.errors));
  }

  isValid() {
    return !lodash.some(this.errors, (errors) => errors.length);
  }

  isChanged(input) {
    return !lodash.isEqual(this.attributes[input], this.originalAttributes[input]);
  }

  submit() {
    return true;
  }

  previousAttributes() {
    return lodash.last(this.attributesHistory) || this.attributes;
  }

  getPrevValue(alias) {
    return (this.previousAttributes() || {})[alias]
  } 

  updateExtraAttributes(alias, value) {
    if (!this.metadata.extra_fields) return;
    if (!this.metadata.extra_fields[alias]) return;

    if (!this.metadata.extra_attributes) return;
    if (!this.metadata.extra_attributes[alias]) return;

    if (value === this.getPrevValue()) return;

    if (value) {
      const field = this.getField(alias);
      const options = HELPERS.parseOptions(field.options);
      const fieldset = lodash.map(this.metadata.extra_fields[alias], 'alias');

      return PlasticineApi.fetchRecord(options.foreign_model, value, { fields: { [`_${options.foreign_model}`]: fieldset.join(',') } }).then(async ({ data }) => {
        const { entities } = await normalize(data);

        this.metadata.extra_attributes = {
          ...this.metadata.extra_attributes,
          [alias]: lodash.pick(entities[options.foreign_model][value] || {}, fieldset),
        };
      })
    } else {
      this.metadata.extra_attributes = {
        ...this.metadata.extra_attributes,
        [alias]: {},
      }
    }
  }

  getExtraFieldAttribute(id) {
    return lodash.find(this.metadata.extraFieldsAttributes, { id });
  }

  isExtraAttributeRequired(id) {
    const attribute = this.getExtraFieldAttribute(id);

    return attribute && attribute.required_when_extra && this.sandbox
      ? this.__executeScriptInModelContext(attribute.required_when_extra, `extra_field_attribute/${attribute.id}/required_when_extra`)
      : false;
  }

  isExtraAttributeVisible(id) {
    const attribute = this.getExtraFieldAttribute(id);

    return attribute && attribute.hidden_when_extra && this.sandbox
    ? !this.__executeScriptInModelContext(attribute.hidden_when_extra, `extra_field_attribute/${attribute.id}/hidden_when_extra`)
    : true;
  }

  isExtraAttributeEnabled(id) {
    const attribute = this.getExtraFieldAttribute(id);

    return attribute && attribute.readonly_when_extra && this.sandbox
      ? !this.__executeScriptInModelContext(attribute.readonly_when_extra, `extra_field_attribute/${attribute.id}/readonly_when_extra`)
      : true;
  }

  getComments(fieldAlias) {
    return lodash.get(this.extraAttributes, `${fieldAlias}.__comments`) || [];
  }

  async setComment(fieldAlias, comment) {
    if (!comment.data) return;
    comment.data = comment.data.replace(/(<([^>]+)>)/ig, '');

    const newComment = {
      related_field: this.fieldsMap[fieldAlias].id,
      related_model: this.metadata.model.id,
      related_record: this.id,
      ...comment
    }

    const entry = await this.__createWorklogEntry(newComment);

    if (entry) {
      lodash.set(
        this.extraAttributes, `${fieldAlias}.__comments`,
        [...this.getComments(fieldAlias), entry.id]
      );
    }
  }

  async setComments(fieldAlias, comments) {
    await Promise.each(comments, comment => this.setComment(fieldAlias, comment));
  }

  assignTemplate = (fieldAlias, template) => {
    if (this.templates[fieldAlias]) return this.templates[fieldAlias];

    const { model, uiRules, extraFieldsAttributes } = template.metadata;
    const { data_record_id } = template.options;

    const record = this.metadata.relationships[model.alias][data_record_id];
    const field = this.fieldsMap[fieldAlias];
    const value = this.get(fieldAlias);
    const fields = processTemplateFields(lodash.cloneDeep(template.metadata.fields), field, value, this.sandbox);

    const attributes = lodash.omit(record || {}, ['__metadata', 'type']);
    const metadata = { ...(record.__metadata || {}), model, fields, uiRules, extraFieldsAttributes };

    const proxyRecord = new ProxyRecord(attributes, metadata);
    const sandbox = new Sandbox({ record: proxyRecord, user: null });
    proxyRecord.__assignSandbox(sandbox);

    this.templates[fieldAlias] = proxyRecord;
    this.sandbox.api.p.record.assignTemplate(fieldAlias, proxyRecord);

    return proxyRecord;
  }

  __assignSandbox(sandbox) {
    this.sandbox = sandbox;
  }

  __executeUiRules() {
    const { model, uiRules } = this.metadata;

    lodash.each(['on_change', 'on_load'], (type) => {
      const filtered = lodash.filter(uiRules, { type });
      const ordered = lodash.sortBy(filtered, [({ order = 0 }) => parseInt(order, 10)]);

      lodash.each(ordered, (rule = {}) => this.sandbox.executeScript(rule.script, { modelId: model.id }, `ui_rule/${rule.id}/script`));
    });
  }

  __executeScriptInModelContext(script, path) {
    const { metadata: { model }, sandbox } = this;

    this.renderingIsAllowed = false;
    const result = sandbox.executeScript(script, { modelId: model.id }, path);
    this.renderingIsAllowed = true;
    return result;
  }

  __checkDependentFields(fieldAlias, value) {
    if (!CLEANERS.DEPENDENTABLE_CLEANERS[this.fieldsMap[fieldAlias].type]) return;

    this.metadata.fields.forEach((field) => {
      const cleaner = CLEANERS.DEPENDENTABLE_CLEANERS[field.type];
      cleaner && cleaner(field, fieldAlias, value, this);
    });
  }

  __checkDynamicFilters(fieldAlias) {
    const filterableTypes = ['reference', 'reference_to_list'];
    let fieldsAffected = false;

    this.metadata.fields.filter(field => filterableTypes.includes(field.type)).forEach((field) => {
      const options = HELPERS.parseOptions(field.options);

      if (options.filter && options.filter.includes(`{${fieldAlias}}`)) {
        fieldsAffected = true;
      }
    });

    if (fieldsAffected) this.baseOnChange();
  }

  async __createWorklogEntry(input = {}) {
    const attributes = { ...input };
    const modelAlias = 'worklog_' + attributes.related_model;
    delete attributes.related_model;

    const result = await PlasticineApi.createRecord(
      modelAlias,
      { data: { attributes } }
    );
    const { data = {} } = result.data;

    if (data.inserted && data.id) return data;
  }
}
