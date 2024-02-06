import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ReferenceToList from '../../../../../shared/inputs/reference-to-list';

export default class extends Component {
  static propTypes = {
    field: PropTypes.object.isRequired,
    value: PropTypes.array,
    placeholder: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  render() {
    const { field, value, placeholder, onChange } = this.props;
    const {
      foreign_model: foreignModel,
      foreign_label: label,
      view = 'default',
    } = field.options;

    return (
      <ReferenceToList
        value={value}
        multiple={true}
        config={{ foreignModel, label, view }}
        placeholder={placeholder}
        className="search-bar-calendar ui input"
        onChange={onChange}
        showRecordDetail={false}
      />
    );
  }
}
