import React from 'react';
import { map } from 'lodash/collection';
import { isArray } from 'lodash/lang';
import { flatten, compact } from 'lodash/array';

import BaseField from './base';
import Dropdown from '../../../../../inputs/dropdown';
import { parseOptions } from '../../../../../../../helpers';

export default class extends BaseField {
  renderDropdown = (multiple = false) => {
    const { field, value, onChange } = this.props;
    const { values = {}, default: defaultOption } = parseOptions(field.options);

    const options = map(values, (text, value) => ({ text, value }));
    const clearable = !!value;

    return (
      <Dropdown
        selection
        multiple={multiple}
        options={options}
        clearable={clearable}
        onChange={onChange}
        value={value}
      />
    );
  }

  renderControl = () => {
    const { field, value, operator } = this.props;
    const { values = {}, multi_select } = parseOptions(field.options);

    if (!value || values[value] || isArray(value)) {
      if (['is', 'is_not'].includes(operator)) {
        return this.renderDropdown(multi_select);
      }

      if (['in', 'in_strict', 'not_in', 'not_in_strict'].includes(operator)) {
        return this.renderDropdown(true);
      }
    }

    if (multi_select) {
      return this.renderDropdown(true);
    }

    return this.renderInput();
  }
}
