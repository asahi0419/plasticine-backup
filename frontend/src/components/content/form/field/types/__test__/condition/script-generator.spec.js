import { find } from 'lodash/collection';
import moment from 'moment';

import { generateScript } from '../../condition/script-generator';
import { makeUniqueID } from '../../../../../../../helpers';
import { completeFields } from '../../../../../../shared/filter/helpers';

const prepareContentItems = (items = [], fields = []) => {
  return items.map((item) => {
    const field = find(fields, { alias: item.field });
    return { ...item, id: makeUniqueID(), field };
  });
};

describe('ScriptGenerator (Condition field)', () => {

  const fields = completeFields([
    { alias: 'some_integer', type: 'integer' },
    { alias: 'some_float', type: 'float' },
    { alias: 'some_boolean', type: 'boolean' },
    { alias: 'some_datetime', type: 'datetime' },
    { alias: 'some_string', type: 'string' },
    { alias: 'some_array_string', type: 'array_string' },
    { alias: 'some_reference', type: 'reference' },
    { alias: 'some_rtl', type: 'reference_to_list' },
    { alias: 'some_condition', type: 'condition' },
  ], { booleanItems: true, emptyItem: true, currentUserItem: true });

  describe('Array', () => {
    const content = [{
      items: prepareContentItems([
        { field: 'some_array_string', operator: "is", value: "one", itemOperator: "and"},
        { field: 'some_array_string', operator: "is_not", value: "two", itemOperator: "or"},
        { field: 'some_array_string', operator: "is_empty", value: null, itemOperator: "or"},
        { field: 'some_array_string', operator: "is_not_empty", value: null, itemOperator: "or"},
        { field: 'some_array_string', operator: "in", value: ["one"], itemOperator: "or"},
        { field: 'some_array_string', operator: "not_in", value: ["two"], itemOperator: "or"},
        { field: 'some_array_string', operator: "starts_with", value: "On", itemOperator: "or"},
        { field: 'some_array_string', operator: "does_not_start_with", value: "nO", itemOperator: "or"},
        { field: 'some_array_string', operator: "ends_with", value: "ne", itemOperator: "or"},
        { field: 'some_array_string', operator: "does_not_end_with", value: "en", itemOperator: "or"},
        { field: 'some_array_string', operator: "contains", value: "n", itemOperator: "or"},
        { field: 'some_array_string', operator: "does_not_contain", value: "AAA", itemOperator: "or"}
      ], fields)
    }];
    const script = generateScript(content);
    const result = `p.record.getValue('some_array_string') == 'one' || p.record.getValue('some_array_string') != 'two' || !p.record.getValue('some_array_string') || !!p.record.getValue('some_array_string') || [\"one\"].includes(p.record.getValue('some_array_string')) || ![\"two\"].includes(p.record.getValue('some_array_string')) || p.record.getValue('some_array_string').startsWith('On') || !p.record.getValue('some_array_string').startsWith('nO') || p.record.getValue('some_array_string').endsWith('ne') || !p.record.getValue('some_array_string').endsWith('en') || p.record.getValue('some_array_string').includes('n') || !p.record.getValue('some_array_string').includes('AAA')`;

    it('Should generate the correct script', () => {
      expect(script).toEqual(result);
    });
  });

  describe('Boolean', () => {
    const content = [{
      items: prepareContentItems([
        { field: 'some_boolean', operator: "is", value: "true", itemOperator: "and"},
        { field: 'some_boolean', operator: "is_not_empty", value: null, itemOperator: "or"}
      ], fields)
    }, {
      items: prepareContentItems([
        { field: 'some_boolean', operator: "is", value: "false", itemOperator: "and"},
        { field: 'some_boolean', operator: "is_empty", value: null, itemOperator: "or"}
      ], fields)
    }];
    const script = generateScript(content);
    const result = `(p.record.getValue('some_boolean') || !!p.record.getValue('some_boolean')) || (!p.record.getValue('some_boolean') || !p.record.getValue('some_boolean'))`;

    it('Should generate the correct script', () => {
      expect(script).toEqual(result);
    });
  });

  describe('Datetime', () => {
    const content = [{
      items: prepareContentItems([
        { field: 'some_datetime', operator: "on", value: moment("2019-02-01T13:54:41.108Z"), itemOperator: "and"},
        { field: 'some_datetime', operator: "not_on", value: moment("2019-01-31T13:54:51.536Z"), itemOperator: "and"},
        { field: 'some_datetime', operator: "before", value: moment("2019-02-27T22:00:00.750Z"), itemOperator: "and"},
        { field: 'some_datetime', operator: "after", value: moment("2019-01-30T22:00:00.601Z"), itemOperator: "and"},
        { field: 'some_datetime', operator: "between", value: [moment("2019-01-31T22:00:00.709Z"), moment("2019-02-27T22:00:00.872Z")], itemOperator: "and"}
      ], fields)
    }];
    const script = generateScript(content);
    const result = `p.record.getValue('some_datetime') == new Date('2019-02-01T13:54:41.108Z') && p.record.getValue('some_datetime') != new Date('2019-01-31T13:54:51.536Z') && p.record.getValue('some_datetime') < new Date('2019-02-27T22:00:00.750Z') && p.record.getValue('some_datetime') > new Date('2019-01-30T22:00:00.601Z') && (new Date('2019-01-31T22:00:00.709Z') <= p.record.getValue('some_datetime') && p.record.getValue('some_datetime') <= new Date('2019-02-27T22:00:00.872Z'))`;

    it('Should generate the correct script', () => {
      expect(script).toEqual(result);
    });
  });

  describe('Integer, Float', () => {
    const content = [{
      items: prepareContentItems([
        { field: 'some_integer', operator: "is", value: "10", itemOperator: "and"},
        { field: 'some_integer', operator: "is_not", value: "20", itemOperator: "and"},
        { field: 'some_integer', operator: "in", value: "10,11,12", itemOperator: "and"},
        { field: 'some_integer', operator: "not_in", value: "20,21,22", itemOperator: "and"},
        { field: 'some_integer', operator: "less_than", value: "20", itemOperator: "and"},
        { field: 'some_integer', operator: "greater_than", value: "9", itemOperator: "and"},
        { field: 'some_integer', operator: "less_than_or_is", value: "19", itemOperator: "and"},
        { field: 'some_integer', operator: "greater_than_or_is", value: "10", itemOperator: "and"},
        { field: 'some_integer', operator: "between", value: ["10","20"], itemOperator: "and"}
      ], fields)
    }];
    const script = generateScript(content);
    const result = `p.record.getValue('some_integer') == 10 && p.record.getValue('some_integer') != 20 && [10,11,12].includes(p.record.getValue('some_integer')) && ![20,21,22].includes(p.record.getValue('some_integer')) && p.record.getValue('some_integer') < 20 && p.record.getValue('some_integer') > 9 && p.record.getValue('some_integer') <= 19 && p.record.getValue('some_integer') >= 10 && (10 <= p.record.getValue('some_integer') && p.record.getValue('some_integer') <= 20)`;

    it('Should generate the correct script', () => {
      expect(script).toEqual(result);
    });
  });

  describe('Reference', () => {
    const content = [{
      items: prepareContentItems([
        { field: 'some_reference', operator: "is", value: 27, itemOperator: "and"},
        { field: 'some_reference', operator: "is_not", value: 20, itemOperator: "and"},
        { field: 'some_reference', operator: "in", value: [27,1], itemOperator: "and"},
        { field: 'some_reference', operator: "not_in", value: [61], itemOperator: "and"},
        { field: 'some_reference', operator: "is_current_user", value: null, itemOperator: "and"}
      ], fields)
    }];
    const script = generateScript(content);
    const result = `p.record.getValue('some_reference') == 27 && p.record.getValue('some_reference') != 20 && [27,1].includes(p.record.getValue('some_reference')) && ![61].includes(p.record.getValue('some_reference')) && p.record.getValue('some_reference') == p.currentUser.getValue('id')`;

    it('Should generate the correct script', () => {
      expect(script).toEqual(result);
    });
  });

  describe('Reference to List', () => {
    const content = [{
      items: prepareContentItems([
        { field: 'some_rtl', operator: "is", value: [27], itemOperator: "and"},
        { field: 'some_rtl', operator: "is_not", value: [27], itemOperator: "or"},
        { field: 'some_rtl', operator: "is_empty", value: null, itemOperator: "or"},
        { field: 'some_rtl', operator: "is_not_empty", value: null, itemOperator: "or"},
        { field: 'some_rtl', operator: "contains_one_of", value: [27,1], itemOperator: "or"},
        { field: 'some_rtl', operator: "in_having", value: [27,1], itemOperator: "or"},
        { field: 'some_rtl', operator: "not_in_having", value: [27,1], itemOperator: "or"},
        { field: 'some_rtl', operator: "in_strict", value: [27,1], itemOperator: "or"},
        { field: 'some_rtl', operator: "not_in_strict", value: [27,1], itemOperator: "or"},
      ], fields)
    }];
    const script = generateScript(content);
    const result = `p.record.getValue('some_rtl') == [27] || p.record.getValue('some_rtl') != [27] || !p.record.getValue('some_rtl') || !!p.record.getValue('some_rtl') || p.record.getValue('some_rtl').some((v) => [27,1].includes(v)) || [27,1].every((v) => p.record.getValue('some_rtl').includes(v)) || ![27,1].every((v) => p.record.getValue('some_rtl').includes(v)) || p.record.getValue('some_rtl').every((v) => [27,1].includes(v)) || !p.record.getValue('some_rtl').every((v) => [27,1].includes(v))`;

    it('Should generate the correct script', () => {
      expect(script).toEqual(result);
    });
  });

  describe('Condition', () => {
    const content = [{
      items: prepareContentItems([
        { field: 'some_condition', operator: "is", value: 'true', itemOperator: "or"},
        { field: 'some_condition', operator: "is_not", value: 'false', itemOperator: "or"},
      ], fields)
    }];
    const script = generateScript(content);
    const result = `p.record.getValue('some_condition') == 'true' || p.record.getValue('some_condition') != 'false'`;

    it('Should generate the correct script', () => {
      expect(script).toEqual(result);
    });
  });

  describe('currentUser', () => {
    const content = [{
      items: prepareContentItems([
        { field: '__current_user__', operator: "belongs_to_group", value: 1, itemOperator: "and"},
        { field: '__current_user__', operator: "does_not_belongs_to_group", value: 5, itemOperator: "or"},
        { field: '__current_user__', operator: "has_administrator_privilege", value: null, itemOperator: "or"},
        { field: '__current_user__', operator: "has_read_privilege", value: null, itemOperator: "or"},
        { field: '__current_user__', operator: "has_read_write_privilege", value: null, itemOperator: "or"}
      ], fields)
    }];
    const script = generateScript(content);
    const result = `p.currentUser.isBelongsToWorkgroup(1) || !p.currentUser.isBelongsToWorkgroup(5) || p.currentUser.isAdmin() || p.currentUser.canAtLeastRead() || p.currentUser.canAtLeastWrite()`;

    it('Should generate the correct script', () => {
      expect(script).toEqual(result);
    });
  });
});
