import React from 'react';
import { isBoolean } from 'lodash/lang';

import BaseField from './base';
import Dropdown from '../../../../../inputs/dropdown';

export default class extends BaseField {
  renderControl = () => {
    const { value, onChange } = this.props;
    const options = [{ text: 'TRUE', value: 'true' }, { text: 'FALSE', value: 'false' }];
    const stringValue = isBoolean(value) ? value.toString() : value;

    return <Dropdown selection options={options} value={stringValue} onChange={onChange} />;
  }
}
