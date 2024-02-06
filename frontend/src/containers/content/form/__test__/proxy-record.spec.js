import { isObject, isArray, isBoolean, isUndefined, cloneDeep } from 'lodash/lang';
import { keys, assign, values } from 'lodash/object';
import { flatten } from 'lodash/array';
import { find, map } from 'lodash/collection';

import ProxyRecord from '../proxy-record';
import OPTIONS from '../proxy-record/options';
import * as HELPERS from '../proxy-record/helpers';

describe('ProxyRecord', () => {
  describe('constructor()', () => {
    it('Should initialize record with properties', () => {
      const proxyRecord = new ProxyRecord();

      // constructor
      expect(proxyRecord.attributes).toBeDefined();
      expect(proxyRecord.metadata).toBeDefined();
      expect(proxyRecord.configs).toBeDefined();
      expect(proxyRecord.templates).toBeDefined();
      expect(proxyRecord.observers).toBeDefined();
      expect(proxyRecord.dynamicOnChangeStorage).toBeDefined();
      expect(proxyRecord.renderingIsAllowed).toBeDefined();
      expect(isObject(proxyRecord.attributes)).toBe(true);
      expect(isObject(proxyRecord.metadata)).toBe(true);
      expect(isObject(proxyRecord.configs)).toBe(true);
      expect(isObject(proxyRecord.templates)).toBe(true);
      expect(isArray(proxyRecord.observers)).toBe(true);
      expect(isObject(proxyRecord.dynamicOnChangeStorage)).toBe(true);
      expect(isBoolean(proxyRecord.renderingIsAllowed)).toBe(true);

      // initAttributes
      expect(proxyRecord.id).toBeUndefined();
      expect(proxyRecord.originalAttributes).toBeDefined();
      expect(proxyRecord.humanizedAttributes).toBeDefined();
      expect(proxyRecord.extraAttributes).toBeDefined();
      expect(proxyRecord.attributesHistory).toBeDefined();
      expect(proxyRecord.changedAttributes).toBeDefined();
      expect(isUndefined(proxyRecord.id)).toBe(true);
      expect(isObject(proxyRecord.originalAttributes)).toBe(true);
      expect(isObject(proxyRecord.humanizedAttributes)).toBe(true);
      expect(isObject(proxyRecord.extraAttributes)).toBe(true);
      expect(isArray(proxyRecord.attributesHistory)).toBe(true);
      expect(isObject(proxyRecord.changedAttributes)).toBe(true);

      // initFields
      expect(proxyRecord.fieldsMap).toBeDefined();
      expect(proxyRecord.fieldsStates).toBeDefined();
      expect(proxyRecord.fieldsChanged).toBeDefined();
      expect(isObject(proxyRecord.fieldsMap)).toBe(true);
      expect(isObject(proxyRecord.fieldsStates)).toBe(true);
      expect(isObject(proxyRecord.fieldsChanged)).toBe(true);

      // initErrors
      expect(proxyRecord.errors).toBeDefined();
      expect(isObject(proxyRecord.errors)).toBe(true);
    });
  });

  describe('constructor(attributes, metadata, configs)', () => {
    it('Should initialize record with correct data', () => {
      const attributes = { id: 1, reference: 1 };
      const metadata = {
        fields: [{ alias: 'reference' }],
        human_attributes: { reference: 'Humanized value' },
        extra_attributes: { reference: {} },
      };
      const configs = { templates: [], options: {} };

      const proxyRecord = new ProxyRecord(attributes, metadata, configs);

      // constructor
      expect(proxyRecord.attributes).toEqual(attributes);
      expect(proxyRecord.metadata).toEqual(metadata);
      expect(proxyRecord.configs).toEqual(configs);
      expect(proxyRecord.templates).toEqual({});
      expect(proxyRecord.observers).toEqual([]);
      expect(proxyRecord.dynamicOnChangeStorage).toEqual({});
      expect(proxyRecord.renderingIsAllowed).toEqual(true);

      // initAttributes
      expect(proxyRecord.id).toEqual(attributes.id);
      expect(proxyRecord.originalAttributes).toEqual(attributes);
      expect(proxyRecord.humanizedAttributes).toEqual(metadata.human_attributes);
      expect(proxyRecord.extraAttributes).toEqual(metadata.extra_attributes);
      expect(proxyRecord.attributesHistory).toEqual([]);
      expect(proxyRecord.changedAttributes).toEqual({});

      // initFields
      expect(proxyRecord.fieldsMap).toEqual({ reference: { alias: 'reference' } });
      expect(proxyRecord.fieldsStates).toEqual({ required: {}, visible: {}, enabled: {} });
      expect(proxyRecord.fieldsChanged).toEqual({});

      // initErrors
      expect(proxyRecord.errors).toEqual({ reference: [] });
    });
  });

  describe('__assignSandbox(sandbox)', () => {
    it('Should assign record sandbox', () => {
      const sandbox = true;

      const proxyRecord = new ProxyRecord();

      proxyRecord.__assignSandbox(sandbox)

      expect(proxyRecord.sandbox).toEqual(sandbox);
    });
  });

  describe('__executeScriptInModelContext(script)', () => {
    it('Should execute script in model context', () => {
      const sandbox = { executeScript: jest.fn(() => true) };
      const script = 'true';

      const metadata = { model: { id: 1 } };

      const proxyRecord = new ProxyRecord({}, metadata);

      proxyRecord.__assignSandbox(sandbox);

      expect(proxyRecord.__executeScriptInModelContext(script)).toEqual(true);
    });
  });

  describe('__checkDependentFields(fieldAlias)', () => {
    it('Should check dependent fields [reference]', () => {
      const attributes = { dependent: 1 };
      const metadata = { fields: [
        { alias: 'reference', type: 'reference' },
        { alias: 'dependent', type: 'reference', options: '{"depends_on":["reference"]}' },
      ] };

      const proxyRecord = new ProxyRecord(attributes, metadata);

      proxyRecord.__checkDependentFields('reference');

      expect(proxyRecord.get('dependent')).toEqual(null);
    });

    it('Should check dependent fields [reference_to_list]', () => {
      const attributes = { dependent: [1] };
      const metadata = { fields: [
        { alias: 'reference', type: 'reference_to_list' },
        { alias: 'dependent', type: 'reference_to_list', options: '{"depends_on":["reference"]}' },
      ] };

      const proxyRecord = new ProxyRecord(attributes, metadata);

      proxyRecord.__checkDependentFields('reference');

      expect(proxyRecord.get('dependent')).toEqual([]);
    });

    it('Should check dependent fields [global_reference]', () => {
      const attributes = { dependent: 1 };
      const metadata = { fields: [
        { alias: 'reference', type: 'reference' },
        { alias: 'dependent', type: 'global_reference', options: '{"references":[{"depends_on":["reference"]}]}' },
      ] };

      const proxyRecord = new ProxyRecord(attributes, metadata);

      proxyRecord.__checkDependentFields('reference');

      expect(proxyRecord.get('dependent')).toEqual(null);
    });
  });

  describe('get options()', () => {
    it('Should return record options', () => {
      const option = [];
      const configs = { options: { option } };

      const proxyRecord = new ProxyRecord({}, {}, configs);

      expect(proxyRecord.options.option).toEqual(option);
      expect(keys(proxyRecord.options)).toEqual([ ...keys(OPTIONS), 'option']);
    });
  });

  describe('typecast(value, fieldAlias)', () => {
    it('Should return datetime value for datetime fields', () => {
      const value = '2000';

      const metadata = { fields: [{ alias: 'datetime', type: 'datetime' }] };

      const proxyRecord = new ProxyRecord({}, metadata);

      const expected = new Date(value);
      const result = proxyRecord.typecast(value, 'datetime');

      expect(result).toEqual(expected);
    });

    it('Should return raw value for not datetime fields', () => {
      const metadata = { fields: [{ alias: 'string' }] };

      const proxyRecord = new ProxyRecord({}, metadata);

      const expected = 'expected';
      const result = proxyRecord.typecast(expected, 'string');

      expect(result).toEqual(expected);
    });

    it('Should return raw value if field with alias not found', () => {
      const proxyRecord = new ProxyRecord();

      const expected = 'expected';
      const result = proxyRecord.typecast(expected, 'string');

      expect(result).toEqual(expected);
    });

    it('Should return undefined if value is not specified', () => {
      const proxyRecord = new ProxyRecord();

      const expected = undefined;
      const result = proxyRecord.typecast(expected, 'string');

      expect(result).toEqual(expected);
    });
  });

  describe('get(fieldAlias)', () => {
    it('Should return typecasted value', () => {
      const value = '2000';

      const attributes = { 'datetime': value };
      const metadata = { fields: [{ alias: 'datetime', type: 'datetime' }] };

      const proxyRecord = new ProxyRecord(attributes, metadata);

      const expected = new Date(value);
      const result = proxyRecord.get('datetime');

      expect(result).toEqual(expected);
    });
  });

  describe('set(fieldAlias, value)', () => {
    it('Should properly set value', () => {
      const value = 'new value';

      const attributes = { string: 'old value' };
      const metadata = { fields: [{ alias: 'string' }] };

      const proxyRecord = new ProxyRecord(attributes, metadata);

      proxyRecord.set('string', value);

      expect(find(proxyRecord.attributesHistory, attributes)).toEqual(attributes);
      expect(proxyRecord.changedAttributes.string).toEqual(value);
      expect(proxyRecord.attributes.string).toEqual(value);
    });

    it('Should do nothing if field with alias not found', () => {
      const value = 'new value';

      const attributes = { string: 'old value' };

      const proxyRecord = new ProxyRecord(attributes);

      proxyRecord.set('string', value);

      expect(find(proxyRecord.attributesHistory, attributes)).toBeUndefined();
      expect(proxyRecord.changedAttributes.string).toBeUndefined();
      expect(proxyRecord.attributes.string).toEqual(attributes.string);
    });

    it('Should do nothing if value is not specified', () => {
      const value = undefined;

      const attributes = { string: 'old value' };
      const metadata = { fields: [{ alias: 'string' }] };

      const proxyRecord = new ProxyRecord(attributes, metadata);

      proxyRecord.set('string', value);

      expect(find(proxyRecord.attributesHistory, attributes)).toBeUndefined();
      expect(proxyRecord.changedAttributes.string).toBeUndefined();
      expect(proxyRecord.attributes.string).toEqual(attributes.string);
    });
  });

  describe('getVisible(fieldAlias)', () => {
    it('Should return humanized value', () => {
      const metadata = { human_attributes: { string: 'value' } };

      const proxyRecord = new ProxyRecord({}, metadata);

      const expected = metadata.human_attributes.string;
      const result = proxyRecord.getVisible('string');

      expect(result).toEqual(expected);
    });
  });

  describe('setVisible(fieldAlias, value)', () => {
    it('Should properly set humanized value', () => {
      const value = 'new value';

      const metadata = {
        fields: [{ alias: 'string' }],
        human_attributes: { string: 'old value' },
      };

      const proxyRecord = new ProxyRecord({}, metadata);

      proxyRecord.setVisible('string', value);

      expect(proxyRecord.humanizedAttributes.string).toEqual(value);
    });

    it('Should do nothing if field with alias not found', () => {
      const value = 'new value';

      const metadata = {
        human_attributes: { string: 'old value' },
      };

      const proxyRecord = new ProxyRecord({}, metadata);

      proxyRecord.setVisible('string', value);

      expect(proxyRecord.humanizedAttributes.string).toEqual(metadata.human_attributes.string);
    });

    it('Should do nothing if value is not specified', () => {
      const value = undefined;

      const metadata = {
        fields: [{ alias: 'string' }],
        human_attributes: { string: 'old value' },
      };

      const proxyRecord = new ProxyRecord({}, metadata);

      proxyRecord.setVisible('string', value);

      expect(proxyRecord.humanizedAttributes.string).toEqual(metadata.human_attributes.string);
    });
  });

  describe('subscribe(fn)', () => {
    it('Should add fn to observers', () => {
      const fn = () => {};

      const proxyRecord = new ProxyRecord();

      proxyRecord.subscribe(fn);

      expect(proxyRecord.observers.includes(fn)).toBe(true);
    });

    it('Should do nothing if fn is not a function', () => {
      const fn = 'string';

      const proxyRecord = new ProxyRecord();

      proxyRecord.subscribe(fn);

      expect(proxyRecord.observers.includes(fn)).toBe(false);
    });
  });

  describe('unsubscribe(fn)', () => {
    it('Should remove fn from observers', () => {
      const fn = () => {};

      const proxyRecord = new ProxyRecord();

      proxyRecord.subscribe(fn);
      proxyRecord.unsubscribe(fn);

      expect(proxyRecord.observers.includes(fn)).toBe(false);
    });
  });

  describe('broadcast(attributes)', () => {
    it('Should run all observers with attributes', () => {
      const expected = {};
      const result = { string: 'value' };

      const fn = (attributes) => assign(expected, attributes);

      const proxyRecord = new ProxyRecord();

      proxyRecord.subscribe(fn);
      proxyRecord.broadcast(result);

      expect(expected).toEqual(result);
    });
  });

  describe('update(attributes)', () => {
    it('Should properly update attributes', () => {
      const newAttributes = { string: 'new value' };

      const attributes = { string: 'old value' };
      const metadata = { fields: [{ alias: 'string' }] };

      const proxyRecord = new ProxyRecord(attributes, metadata);

      jest.spyOn(HELPERS, 'humanizeAttributes');
      proxyRecord.update(newAttributes);

      expect(HELPERS.humanizeAttributes).toBeCalledWith(newAttributes, proxyRecord.getFields());
      expect(find(proxyRecord.attributesHistory, attributes)).toEqual(attributes);
      expect(proxyRecord.changedAttributes.string).toEqual(newAttributes.string);
      expect(proxyRecord.attributes.string).toEqual(newAttributes.string);
    });
  });

  describe('previousAttributes()', () => {
    it('Should return previous attributes', () => {
      const oldAttributes = { string: 'old value' };
      const newAttributes = { string: 'new value' };
      const metadata = { fields: [{ alias: 'string' }] };

      const proxyRecord = new ProxyRecord(oldAttributes, metadata);

      expect(proxyRecord.previousAttributes()).toEqual(oldAttributes);

      proxyRecord.update(newAttributes);

      expect(proxyRecord.previousAttributes()).toEqual(oldAttributes);
    });
  });

  describe('baseOnChange(attributes)', () => {
    it('Should call update(attributes)', () => {
      const attributes = { string: 'value' };

      ProxyRecord.prototype.update = jest.fn();

      const proxyRecord = new ProxyRecord();

      proxyRecord.baseOnChange(attributes);

      expect(proxyRecord.update).toBeCalledWith(attributes);
    });

    it('Should call broadcast(attributes) if rendering is allowed', () => {
      const attributes = { string: 'value' };

      ProxyRecord.prototype.broadcast = jest.fn();

      const proxyRecord = new ProxyRecord();

      proxyRecord.renderingIsAllowed = true;
      proxyRecord.baseOnChange(attributes);

      expect(proxyRecord.broadcast).toBeCalledWith(attributes);
    });

    it('Should not call broadcast(attributes) if rendering is not allowed', () => {
      const attributes = { string: 'value' };

      ProxyRecord.prototype.broadcast = jest.fn();

      const proxyRecord = new ProxyRecord();

      proxyRecord.renderingIsAllowed = false;
      proxyRecord.baseOnChange(attributes);

      expect(proxyRecord.broadcast).not.toBeCalled();
    });
  });

  describe('changeField(field)', () => {
    it('Should change field', () => {
      const field = { string: 'value' };

      const proxyRecord = new ProxyRecord();

      proxyRecord.changeField(field);

      expect(find(proxyRecord.fieldsChanged, field)).toEqual(field);
    });

    it('Should call baseOnChange({})', () => {
      const field = { string: 'value' };

      ProxyRecord.prototype.baseOnChange = jest.fn();

      const proxyRecord = new ProxyRecord();

      proxyRecord.changeField(field);

      expect(proxyRecord.baseOnChange).toBeCalledWith({});
    });
  });

  describe('getField(fieldAlias)', () => {
    it('Should return field by alias', () => {
      const field1 = { alias: 'string' };
      const field2 = { alias: 'string', type: 'string' };

      const metadata = { fields: [ field1 ] };

      const proxyRecord = new ProxyRecord({}, metadata);

      const result1 = proxyRecord.getField('string');
      const expected1 = proxyRecord.fieldsMap['string'];

      proxyRecord.changeField(field2);

      const result2 = proxyRecord.getField('string');
      const expected2 = proxyRecord.fieldsChanged['string'];

      expect(result1).toEqual(expected1);
      expect(result2).toEqual(expected2);
    });
  });

  describe('getFields()', () => {
    it('Should return fields', () => {
      const field1 = { alias: 'string' };
      const field2 = { alias: 'string', type: 'string' };

      const metadata = { fields: [ field1 ] };
      const proxyRecord = new ProxyRecord({}, metadata);

      expect(proxyRecord.getFields()).toEqual(map(proxyRecord.metadata.fields, ({ alias }) => proxyRecord.getField(alias)));
    });
  });

  describe('bindDynamicOnChangeHandler(fieldAlias, fn)', () => {
    it('Should add dynamic change handler', () => {
      const fn = () => {};

      const metadata = { fields: [{ alias: 'string' }] };

      const proxyRecord = new ProxyRecord({}, metadata);

      proxyRecord.bindDynamicOnChangeHandler('string', fn);

      expect(proxyRecord.dynamicOnChangeStorage['string']).toEqual(fn);
    });
  });

  describe('__checkDynamicFilters(fieldAlias)', () => {
    it('Should check dynamic filters [reference]', () => {
      const attributes = { dependent: [1] };
      const metadata = { fields: [
        { alias: 'reference', type: 'reference' },
        { alias: 'dependent', type: 'reference', options: '{"filter":"{reference}"}' },
      ] };

      const proxyRecord = new ProxyRecord(attributes, metadata);

      proxyRecord.__checkDynamicFilters('reference');

      expect(proxyRecord.baseOnChange).toBeCalledWith({});
    });

    it('Should check dynamic filters [reference_to_list]', () => {
      const attributes = { dependent: [1] };
      const metadata = { fields: [
        { alias: 'reference_to_list', type: 'reference_to_list' },
        { alias: 'dependent', type: 'reference_to_list', options: '{"filter":"{reference_to_list}"}' },
      ] };

      const proxyRecord = new ProxyRecord(attributes, metadata);

      proxyRecord.__checkDynamicFilters('reference_to_list');

      expect(proxyRecord.baseOnChange).toBeCalledWith({});
    });
  });

  describe('beforeChange(fieldAlias)', () => {
    it('Should trigger before change methods', () => {
      const alias = 'string';

      ProxyRecord.prototype.__checkDependentFields = jest.fn();
      ProxyRecord.prototype.__checkDynamicFilters = jest.fn();

      const proxyRecord = new ProxyRecord();

      proxyRecord.beforeChange(alias);

      expect(proxyRecord.__checkDependentFields).toBeCalledWith(alias);
      expect(proxyRecord.__checkDynamicFilters).toBeCalledWith(alias);
    });
  });

  describe('afterChange(fieldAlias)', () => {
    it('Should trigger after change methods', () => {
      const alias = 'string';

      ProxyRecord.prototype.updateOptions = jest.fn();

      const proxyRecord = new ProxyRecord();

      proxyRecord.afterChange(alias);

      expect(proxyRecord.updateOptions).toBeCalledWith(alias);
    });
  });

  describe('onChange(fieldAlias, value)', () => {
    it('Should trigger full cycle methods', () => {
      const alias = 'string';
      const value = 'value';

      ProxyRecord.prototype.beforeChange = jest.fn();
      ProxyRecord.prototype.afterChange = jest.fn();

      const proxyRecord = new ProxyRecord();

      proxyRecord.onChange(alias, value);

      expect(proxyRecord.beforeChange).toBeCalledWith(alias);
      expect(proxyRecord.baseOnChange).toBeCalledWith({ [alias]: value });
      expect(proxyRecord.afterChange).toBeCalledWith(alias);
    });
  });

  describe('onChangeWithDynamics(fieldAlias, value)', () => {
    it('Should trigger onChange(fieldAlias, value) if handler found with result', () => {
      const fn = () => true;
      const alias = 'string';
      const value = 'value';

      ProxyRecord.prototype.onChange = jest.fn();

      const proxyRecord = new ProxyRecord();

      proxyRecord.bindDynamicOnChangeHandler(alias, fn);
      proxyRecord.onChangeWithDynamics(alias, value);

      expect(proxyRecord.onChange).toBeCalledWith(alias, value);
    });

    it('Should not trigger onChange(fieldAlias, value) if handler found without result', () => {
      const fn = () => false;
      const alias = 'string';
      const value = 'value';

      ProxyRecord.prototype.onChange = jest.fn();

      const proxyRecord = new ProxyRecord();

      proxyRecord.bindDynamicOnChangeHandler(alias, fn);
      proxyRecord.onChangeWithDynamics(alias, value);

      expect(proxyRecord.onChange).not.toBeCalledWith(alias, value);
    });
  });

  describe('setFieldAsRequired(fieldAlias, state)', () => {
    it('Should set field as required', () => {
      const alias = 'string';

      const proxyRecord = new ProxyRecord();

      proxyRecord.setFieldAsRequired(alias, true);

      expect(proxyRecord.isFieldRequired(alias)).toBe(true);
      expect(proxyRecord.baseOnChange).toBeCalledWith({});
    });
  });

  describe('setFieldAsVisible(fieldAlias, state)', () => {
    it('Should set field as visible', () => {
      const alias = 'string';

      const proxyRecord = new ProxyRecord();

      proxyRecord.setFieldAsVisible(alias, true);

      expect(proxyRecord.isFieldVisible(alias)).toBe(true);
      expect(proxyRecord.baseOnChange).toBeCalledWith({});
    });
  });

  describe('setFieldAsEnabled(fieldAlias, state)', () => {
    it('Should set field as enabled', () => {
      const alias = 'string';

      const proxyRecord = new ProxyRecord();

      proxyRecord.setFieldAsEnabled(alias, true);

      expect(proxyRecord.isFieldEnabled(alias)).toBe(true);
      expect(proxyRecord.baseOnChange).toBeCalledWith({});
    });
  });

  describe('isFieldRequired(fieldAlias)', () => {
    it('Should check if field is required [no field]', () => {
      const alias = 'string';

      const proxyRecord = new ProxyRecord();

      expect(proxyRecord.isFieldRequired(alias)).toBe(false);
    });

    it('Should check if field is required [field without required_when_script]', () => {
      const alias = 'string';

      const metadata = { fields: [{ alias: 'string' }] };

      const proxyRecord = new ProxyRecord({}, metadata);

      expect(proxyRecord.isFieldRequired(alias)).toBe(false);
    });

    it('Should check if field is required [from overridden state]', () => {
      const alias = 'string';

      const metadata = { fields: [{ alias: 'string' }] };

      const proxyRecord = new ProxyRecord({}, metadata);

      proxyRecord.setFieldAsRequired(alias, true);

      expect(proxyRecord.isFieldRequired(alias)).toBe(true);
    });

    it('Should check if field is required [field with required_when_script and sandbox]', () => {
      const alias = 'string';

      const metadata = { fields: [{ alias: 'string', required_when_script: 'true' }] };

      ProxyRecord.prototype.__executeScriptInModelContext = jest.fn(() => true);

      const proxyRecord = new ProxyRecord({}, metadata);

      proxyRecord.sandbox = true;

      expect(proxyRecord.isFieldRequired(alias)).toBe(true);
    });
  });

  describe('isFieldVisible(fieldAlias)', () => {
    it('Should check if field is visible [no field]', () => {
      const alias = 'string';

      const proxyRecord = new ProxyRecord();

      expect(proxyRecord.isFieldVisible(alias)).toBe(true);
    });

    it('Should check if field is visible [field without hidden_when_script]', () => {
      const alias = 'string';

      const metadata = { fields: [{ alias: 'string' }] };

      const proxyRecord = new ProxyRecord({}, metadata);

      expect(proxyRecord.isFieldVisible(alias)).toBe(true);
    });

    it('Should check if field is visible [from overridden state]', () => {
      const alias = 'string';

      const metadata = { fields: [{ alias: 'string' }] };

      const proxyRecord = new ProxyRecord({}, metadata);

      proxyRecord.setFieldAsRequired(alias, true);

      expect(proxyRecord.isFieldVisible(alias)).toBe(true);
    });

    it('Should check if field is visible [field with hidden_when_script and sandbox]', () => {
      const alias = 'string';

      const metadata = { fields: [{ alias: 'string', hidden_when_script: 'true' }] };

      const proxyRecord = new ProxyRecord({}, metadata);

      proxyRecord.sandbox = true;

      expect(proxyRecord.isFieldVisible(alias)).toBe(false);
    });
  });

  describe('isFieldEnabled(fieldAlias)', () => {
    it('Should check if field is enabled [no field]', () => {
      const alias = 'string';

      const proxyRecord = new ProxyRecord();

      expect(proxyRecord.isFieldEnabled(alias)).toBe(true);
    });

    it('Should check if field is enabled [field without readonly_when_script]', () => {
      const alias = 'string';

      const metadata = { fields: [{ alias: 'string' }] };

      const proxyRecord = new ProxyRecord({}, metadata);

      expect(proxyRecord.isFieldEnabled(alias)).toBe(true);
    });

    it('Should check if field is enabled [from overridden state]', () => {
      const alias = 'string';

      const metadata = { fields: [{ alias: 'string' }] };

      const proxyRecord = new ProxyRecord({}, metadata);

      proxyRecord.setFieldAsRequired(alias, true);

      expect(proxyRecord.isFieldEnabled(alias)).toBe(true);
    });

    it('Should check if field is enabled [field with readonly_when_script and sandbox]', () => {
      const alias = 'string';

      const metadata = { fields: [{ alias: 'string', readonly_when_script: 'true' }] };

      const proxyRecord = new ProxyRecord({}, metadata);

      proxyRecord.sandbox = true;

      expect(proxyRecord.isFieldEnabled(alias)).toBe(false);
    });
  });

  describe('setErrors(errors)', () => {
    it('Should set errors if previous errors are not the same', () => {
      const errors = { string: [ true ] };

      const metadata = { fields: [{ alias: 'string' }] };

      const proxyRecord = new ProxyRecord({}, metadata);

      proxyRecord.setErrors(errors);

      expect(proxyRecord.errors).toEqual(errors);
      expect(proxyRecord.baseOnChange).toBeCalledWith({});
    });
  });

  describe('getErrors()', () => {
    it('Should return errors for all fields', () => {
      const metadata = { fields: [{ alias: 'string' }] };

      const proxyRecord = new ProxyRecord({}, metadata);

      const result = proxyRecord.getErrors();
      const expected = flatten(values(proxyRecord.errors));

      expect(result).toEqual(expected);
    });
  });

  describe('getErrors(fieldAlias)', () => {
    it('Should return errors for field', () => {
      const metadata = { fields: [{ alias: 'string' }] };

      const proxyRecord = new ProxyRecord({}, metadata);

      const result = proxyRecord.getErrors('string');
      const expected = proxyRecord.errors.string;

      expect(result).toEqual(expected);
    });
  });

  describe('isValid()', () => {
    it('Should return true if errors not found', () => {
      const metadata = { fields: [{ alias: 'string' }] };

      const proxyRecord = new ProxyRecord({}, metadata);

      expect(proxyRecord.isValid()).toEqual(true);
    });

    it('Should return false if errors found', () => {
      const errors = { string: [ true ] };

      const metadata = { fields: [{ alias: 'string' }] };

      const proxyRecord = new ProxyRecord({}, metadata);

      proxyRecord.setErrors(errors);

      expect(proxyRecord.isValid()).toEqual(false);
    });
  });

  describe('submit()', () => {
    it('Should return true', () => {
      const proxyRecord = new ProxyRecord();

      expect(proxyRecord.submit()).toEqual(true);
    });
  });

  describe('updateExtraAttributes(alias, attributes)', () => {
    it('Should update extra attributes for field', () => {
      const attributes = { name: 'new name' };

      const metadata = {
        extra_fields: { reference: [{ alias: 'name' }] },
        extra_attributes: { reference: { name: 'name' } },
      };

      const proxyRecord = new ProxyRecord({}, metadata);

      proxyRecord.updateExtraAttributes('reference', attributes);

      expect(proxyRecord.metadata.extra_attributes).toEqual({ reference: attributes });
    });
  });

  describe('getExtraFieldAttribute(id)', () => {
    it('Should return extra field attribute by id', () => {
      const extraFieldAttribute = { id: 1 };

      const metadata = { extraFieldsAttributes: [ extraFieldAttribute ] };

      const proxyRecord = new ProxyRecord({}, metadata);

      expect(proxyRecord.getExtraFieldAttribute(1)).toEqual(extraFieldAttribute);
    });
  });

  describe('isExtraAttributeRequired(id)', () => {
    it('Should check if extra attribute is required [no extra attribute]', () => {
      const proxyRecord = new ProxyRecord();

      expect(proxyRecord.isExtraAttributeRequired(1)).toBe(false);
    });

    it('Should check if extra attribute is required [extra attribute without required_when_extra]', () => {
      const metadata = { extraFieldsAttributes: [{ id: 1 }] };

      const proxyRecord = new ProxyRecord({}, metadata);

      expect(proxyRecord.isExtraAttributeRequired(1)).toBe(false);
    });

    it('Should check if extra attribute is required [extra attribute with required_when_extra and sandbox]', () => {
      const alias = 'string';

      const metadata = { extraFieldsAttributes: [{ id: 1, required_when_extra: 'true' }] };

      ProxyRecord.prototype.__executeScriptInModelContext = jest.fn(() => true);

      const proxyRecord = new ProxyRecord({}, metadata);

      proxyRecord.sandbox = true;

      expect(proxyRecord.isExtraAttributeRequired(1)).toBe(true);
    });
  });

  describe('isExtraAttributeVisible(id)', () => {
    it('Should check if extra attribute is required [no extra attribute]', () => {
      const proxyRecord = new ProxyRecord();

      expect(proxyRecord.isExtraAttributeVisible(1)).toBe(true);
    });

    it('Should check if extra attribute is required [extra attribute without hidden_when_extra]', () => {
      const metadata = { extraFieldsAttributes: [{ id: 1 }] };

      const proxyRecord = new ProxyRecord({}, metadata);

      expect(proxyRecord.isExtraAttributeVisible(1)).toBe(true);
    });

    it('Should check if extra attribute is required [extra attribute with hidden_when_extra and sandbox]', () => {
      const alias = 'string';

      const metadata = { extraFieldsAttributes: [{ id: 1, hidden_when_extra: 'true' }] };

      ProxyRecord.prototype.__executeScriptInModelContext = jest.fn(() => true);

      const proxyRecord = new ProxyRecord({}, metadata);

      proxyRecord.sandbox = true;

      expect(proxyRecord.isExtraAttributeVisible(1)).toBe(false);
    });
  });

  describe('isExtraAttributeEnabled(id)', () => {
    it('Should check if extra attribute is required [no extra attribute]', () => {
      const proxyRecord = new ProxyRecord();

      expect(proxyRecord.isExtraAttributeEnabled(1)).toBe(true);
    });

    it('Should check if extra attribute is required [extra attribute without readonly_when_extra]', () => {
      const metadata = { extraFieldsAttributes: [{ id: 1 }] };

      const proxyRecord = new ProxyRecord({}, metadata);

      expect(proxyRecord.isExtraAttributeEnabled(1)).toBe(true);
    });

    it('Should check if extra attribute is required [extra attribute with readonly_when_extra and sandbox]', () => {
      const alias = 'string';

      const metadata = { extraFieldsAttributes: [{ id: 1, readonly_when_extra: 'true' }] };

      ProxyRecord.prototype.__executeScriptInModelContext = jest.fn(() => true);

      const proxyRecord = new ProxyRecord({}, metadata);

      proxyRecord.sandbox = true;

      expect(proxyRecord.isExtraAttributeEnabled(1)).toBe(false);
    });
  });

  describe('getComments(fieldAlias)', () => {
    it('Should return comments for field', () => {
      const comments = [1];

      const metadata = { extra_attributes: { string: { __comments: comments } } };

      const proxyRecord = new ProxyRecord({}, metadata);

      expect(proxyRecord.getComments('string')).toEqual(comments);
    });
  });

  describe('setComment(fieldAlias, comment)', () => {
    it('Should return comments for field', async () => {
      const comment = { data: 'comment' };

      const metadata = {
        model: { id: 1 },
        fields: [{ alias: 'string' }],
        extra_attributes: { string: { __comments: [1] } },
      };

      ProxyRecord.prototype.__createWorklogEntry = jest.fn(async () => ({ inserted: true, id: 2 }));

      const proxyRecord = new ProxyRecord({}, metadata);

      await proxyRecord.setComment('string', comment);

      expect(proxyRecord.getComments('string')).toEqual([1, 2]);
    });
  });
});
