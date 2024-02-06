import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { map } from 'lodash/collection';
import { invert } from 'lodash/object';

import Dropdown from '../../../../../../shared/inputs/dropdown';
import BaseEditor from './base';

const BOOLEAN_VALUES = { 'Yes': true, 'No': false };

export default class BooleanEditor extends BaseEditor {
  handleInputChange = (e, { value }) => {
    this.setState({ value: BOOLEAN_VALUES[value] });
  }

  renderInput() {
    const { value } = this.state;
    const options = map(BOOLEAN_VALUES, (value, key) => ({ text: i18n.t(key, { defaultValue: key }), value: key }));

    return (
      <Dropdown
        value={invert(BOOLEAN_VALUES)[value]}
        options={options}
        onChange={this.handleInputChange}
        style={{ ...this.inputStyle(), minWidth: '5em' }}
        selection
      />
    );
  }
}
