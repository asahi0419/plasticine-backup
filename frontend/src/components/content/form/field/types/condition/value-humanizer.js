import { isArray } from 'lodash/lang';

import { parseOptions, isJSValue } from '../../../../../../helpers';
import PlasticineApi from '../../../../../../api';

const AVAILABLE_OPERATORS = ['is', 'is_not', 'in', 'not_in', 'in_strict', 'not_in_strict', 'in_having', 'not_in_having', 'belongs_to_group', 'does_not_belongs_to_group', 'contains_one_of'];
const AVAILABLE_FIELD_TYPES = ['array_string', 'boolean', 'reference', 'reference_to_list', 'current_user'];

export default class ValueHumanizer {

  async process(groups) {
    return await Promise.all(groups.map(this.humanizeGroup));
  }

  humanizeGroup = async (group) => {
    return { items: await Promise.all(group.items.map(this.humanizeItem)) };
  }

  humanizeItem = async (item) => {
    if (AVAILABLE_OPERATORS.includes(item.operator) && AVAILABLE_FIELD_TYPES.includes(item.field.type)) {
      return { ...item, humanizedValue: await this.humanizedValue(item.value, item.field) };
    }
    return item;
  }

  processHumanizedValue = (data, multiple) => {
    const { options = [] } = data;
    return multiple ? options.map(({ text }) => text) : (options[0] || {}).text;
  }

  fetchReferenceHumanizedValue = async (modelAlias, value, label = '{name}') => {
    if (!value || isJSValue(value)) return;

    const multiple = isArray(value);
    const filter = multiple ? `id IN (${value.join(',')})` : `id = ${value}`;

    this.cachedData = this.cachedData || {};
    if (this.cachedData[filter]) return this.processHumanizedValue(this.cachedData[filter], multiple);

    const { data } = await PlasticineApi.loadFieldOptions(modelAlias, { filter, label });
    this.cachedData[filter] = data;

    return this.processHumanizedValue(data, multiple);
  }

  humanizedValue = async (value, field) => {
    switch (field.type) {
      case 'array_string':
        const { values: availableValues } = parseOptions(field.options);
        const humanizedValues = (isArray(value) ? value : value.split(',')).map(v => availableValues[v]);
        return (humanizedValues.length === 1) ? humanizedValues[0] : humanizedValues;
      case 'boolean':
        const options = { true: 'Yes', false: 'No' };
        return options[value];
      case 'reference':
      case 'current_user':
      case 'reference_to_list':
        const { foreign_model, foreign_label } = parseOptions(field.options);
        return this.fetchReferenceHumanizedValue(foreign_model, value, foreign_label);
    }
    return value;
  }
}
