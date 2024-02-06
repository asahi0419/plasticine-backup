import React from 'react';
import { Input } from 'semantic-ui-react';
import { isArray, isNil } from 'lodash/lang';

import BaseField from './base';

export default class extends BaseField {
  valueAsArray = () => {
    const { value } = this.props;
    return isArray(value) ? [...value] : [value];
  }

  onDoubleChange = (value, position) => {
    const container = this.valueAsArray();
    container[position === 'left' ? 0 : 1] = value;
    this.props.onChange(null, { value: container });
  }

  renderDoubleInput = () => {
    let [ from, to ] = this.valueAsArray();

    if (isNil(from)) from = '';
    if (isNil(to)) to = '';

    return [
      <Input value={from} onChange={(e, { value }) => this.onDoubleChange(value, 'left')} key="from" />,
      <Input value={to} onChange={(e, { value }) => this.onDoubleChange(value, 'right')} key="to" />,
    ];
  }

  onChange = (e, { value }) => {
    const { field, onChange, operator } = this.props;

    const isIntegerType = ['integer', 'float', 'primary_key'].includes(field.type);
    const isArrayOperator = ['in', 'not_in'].includes(operator);

    if (isIntegerType && (!isArrayOperator && value !== '-' && isNaN(value))) return;

    onChange(e, { value });
  }

  renderControl = () => {
    return this.props.operator === 'between' ? this.renderDoubleInput() : this.renderInput();
  }
}
