import React from 'react';
import { isArray } from 'lodash/lang';

import BaseField from './base';
import Datetime from '../../../../../inputs/datetime';
import DatetimeDropdown from '../../../../../inputs/datetime-dropdown';
import { parseOptions } from '../../../../../../../helpers';
import db from '../../../../../../../db'

export default class extends BaseField {
  changeProxyHandler = (type, value) => {
    if (type === 'single') return this.props.onChange(null, { value });
    const container = (isArray(this.props.value) ? this.props.value : [this.props.value]).slice();
    container[type === 'left' ? 0 : 1] = value;
    this.props.onChange(null, { value: container });
  }

  renderDatepicker = (value, type, key) => {
    const options = parseOptions(this.props.field.options);
    const { field_date_notime } = db.state.app.settings.format;

    if (type === 'single') {
      return (
        <DatetimeDropdown
          value={value}
          format={field_date_notime}
          date_only={options.date_only}
          onChange={this.changeProxyHandler.bind(this, type)}
          key={key}
        />
      )
    } else { 
      return (
        <Datetime
          value={value}
          format={field_date_notime}
          date_only={options.date_only}
          onChange={this.changeProxyHandler.bind(this, type)}
          key={key}
        />
      )  
    }
  };

  renderDoubleInput = () => {
    const { value } = this.props;
    const [from, to] = isArray(value) ? value : [value];
    return [this.renderDatepicker(from, 'left', 'from'), this.renderDatepicker(to, 'right', 'to')];
  }

  renderInput = () => this.renderDatepicker(this.props.value, 'single');

  renderControl = () => {
    return this.props.operator === 'between' ? this.renderDoubleInput() : this.renderInput();
  }
}
