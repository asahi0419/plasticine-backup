import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { map } from 'lodash/collection';
import { isArray } from 'lodash/lang';
import { compact } from 'lodash/array';

import * as HELPERS from '../../../../../../../helpers';

import Dropdown from '../../../../../../shared/inputs/dropdown';
import BaseEditor from './base';

export default class ArrayStringEditor extends BaseEditor {
  handleInputChange = (e, { value }) => {
    const { multi_select: multi } = HELPERS.parseOptions(this.props.column.options);

    if (multi) {
      if (!isArray(value)) value = (value || '').split(',');
      value = compact(value || []);
    }

    this.setState({ value });
  }

  renderInput() {
    const { value } = this.state;
    const { values, multi_select: multi, default: def } = HELPERS.parseOptions(this.props.column.options);

    const style = { ...this.inputStyle(), minWidth: '7em' };
    const options = map(values, (v, key) => ({ text: v, value: key }));
    const clearable = value && !def;

    return (
      <Dropdown
        multiple={multi}
        value={value}
        options={options}
        clearable={clearable}
        onChange={this.handleInputChange}
        style={style}
        selection
      />
    );
  }
}
