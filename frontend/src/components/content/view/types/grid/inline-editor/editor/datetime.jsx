import React, { Component } from 'react';
import PropTypes from 'prop-types';

import BaseEditor from './base';
import Datetime from '../../../../../../shared/inputs/datetime';
import * as HELPERS from '../../../../../../../helpers';

export default class DatetimeEditor extends BaseEditor {
  renderInput() {
    const onChange = (value) => this.handleInputChange(null, { value });
    const options = HELPERS.parseOptions(this.props.column.options);
    const format = HELPERS.parseDateFormat(options);
    const style = this.inputStyle();

    const { value } = this.state;

    return (
      <Datetime
        value={value}
        style={style}
        format={format}
        onChange={onChange}
        date_only={options.date_only}
      />
    );
  }

}
