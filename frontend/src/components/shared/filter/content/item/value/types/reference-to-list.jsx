import React from 'react';
import { toString, isArray } from 'lodash/lang';

import { parseOptions } from '../../../../../../../helpers';

import BaseField from './base';
import ReferenceToList from '../../../../../inputs/reference-to-list';

export default class extends BaseField {
  renderRTLControl = () => {
    const { field, value, onChange } = this.props;
    const preparedValue = value && !isArray(value) ? [value] : value || [];

    const {
      foreign_model,
      foreign_label: label,
      view = 'default',
      form = 'default',
    } = parseOptions(field.options);

    return (
      <ReferenceToList
        value={preparedValue}
        multiple
        config={{ foreignModel: toString(foreign_model), label, view, form }}
        className="ui input"
        onChange={onChange}
      />
    );
  }

  renderControl = () => {
    return ['like', 'not_like'].includes(this.props.operator)
      ? this.renderInput()
      : this.renderRTLControl();
  }
}
