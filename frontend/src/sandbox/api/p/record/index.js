import moment from 'moment';
import { compact } from 'lodash/array';
import { isUndefined, isArray, isEmpty, isNull } from 'lodash/lang';
import { keyBy, find, map, some, filter, each, reduce } from 'lodash/collection';

import ModelProxy from './model';
import FieldProxy from './field';
import ActionProxy from './action';
import validate from './validator';
import Messenger from '../../../../messenger';
import { isEqual } from './helpers';
import { parseOptions, parseDateFormat } from '../../../../helpers';

export default class Record {
  constructor(record) {
    const metadata = record.metadata || {};

    this.record = record;
    this.metadata = metadata;
    this.model = metadata.model;
    this.uiRules = metadata.uiRules || [];
    this.form = metadata.form;
    this.view = metadata.view;

    this.__templates = {};

    this.initFields();
    this.initActions();
  }

  initFields() {
    const fields = this.metadata.fields || [];
    const options = reduce(this.record.options, (result, type) => {
        each(type, (option) => result.push(option));
        return result;
      }, []);

    this.fields = {
      ...keyBy(options, 'alias'),
      ...keyBy(fields, 'alias'),
    };
  }

  initActions() {
    const actions = this.metadata.actions || [];
    this.actions = keyBy(actions, 'alias');
  }

  getModel() {
    if (!this.model) return;
    return new ModelProxy(this.model);
  }

  getField(fieldAlias) {
    if (this.fields[fieldAlias]) {
      return new FieldProxy(this.fields[fieldAlias], this);
    }
  }

  getAction(actionAlias) {
    if (this.actions[actionAlias]) {
      return new ActionProxy(this.actions[actionAlias], this);
    }
  }

  getValue(fieldAlias) {
    if (!this.hasAccess(fieldAlias)) return undefined;
    return this.record.get(fieldAlias);
  }

  getPrevValue(fieldAlias) {
    return this.record.getPrevValue(fieldAlias);
  }

  getTValue(fieldAlias) {
    return this.__templates[fieldAlias];
  }

  getVisibleValue(fieldAlias) {
    const field = filter(this.record.getFields(), { alias: fieldAlias })[0];
    let value = this.record.get(fieldAlias);

    if (isUndefined(value)) return undefined;
    if (isNull(value)) return null;

    switch (field.type) {
      case 'array_string':
        const { multi_select: multi, values } = parseOptions(field.options);
        if (multi && isArray(value)) {
          value = map(value, (v) => values[v]).join(', ');
        } else {
          value = values[value];
        }
        break;
      case 'boolean':
        const options = { true: 'Yes', false: 'No' };
        value = options[value];
        break;
      case 'datetime':
        const format = parseDateFormat(parseOptions(field.options));
        value = moment(value).format(format);
        break;
      case 'float':
        value = parseFloat(value);
        break;
      default:
        value = this.record.getVisible(fieldAlias) || value;
    }

    this.record.setVisible(fieldAlias, value);
    return value;
  }

  setValue(fieldAlias, value, silent = false) {
    const previousValue = this.getValue(fieldAlias);
    if (previousValue === value) return true;

    const canUpdate = this.hasAccess(fieldAlias) && this.canUpdate(fieldAlias);
    if (!canUpdate) return false;

    if (silent === true) {
      this.record.onChange(fieldAlias, value)
    } else {
      this.record.onChangeWithDynamics(fieldAlias, value);
    }

    return true;
  }

  isChanged(input) {
    if (isUndefined(input)) return this.record.attributesHistory.length > 0;

    const fields = compact([].concat(input).map(alias => this.getField(alias)));
    const previousAttributes = this.record.previousAttributes();

    return some(fields, ({ alias, type }) => !isEqual(this.getValue(alias), previousAttributes[alias], type));
  }

  isPersisted() {
    return this.record.metadata.inserted;
  }

  submit(execute_validation = true) {
    if (!execute_validation) return true;

    const onSubmitRule = find(this.uiRules, { type: 'on_submit' });
    const uiRuleResult = onSubmitRule && this.record.sandbox.executeScript(onSubmitRule.script, { modelId: this.model.id }, `ui_rule/${onSubmitRule.id}/script`);
    if (uiRuleResult === false) return false;

    this.record.setErrors(validate(this.record));
    const errors = this.record.getErrors();
    errors.length && Messenger.error({ list: map(errors, 'message') });

    if (some(this.__templates, (record) => !record.submit())) return false;
    if (this.record.isValid()) return this.record.submit();

    return false;
  }

  assignTemplate(fieldAlias, template) {
    this.__templates[fieldAlias] = new Record(template);
  }

  declare(name, fn) {
    this.record[name] = fn;
  }

  hasAccess(fieldAlias) {
    const field = this.fields[fieldAlias] || {};
    const access = field.is_option ? true : (field.__access || false);

    return access;
  }

  canUpdate(fieldAlias) {
    const field = this.fields[fieldAlias] || {};
    const access = field.is_option ? true : (field.__update || false);

    return access;
  }
}
