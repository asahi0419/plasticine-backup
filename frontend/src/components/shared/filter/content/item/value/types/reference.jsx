import React from 'react';
import { toString } from 'lodash/lang';

import { parseOptions } from '../../../../../../../helpers';

import BaseField from './base';
import Reference from '../../../../../inputs/reference';

export default class extends BaseField {
  renderReference = () => {
    const { field, operator, value, onChange } = this.props;
    const {
      foreign_model,
      foreign_label: label,
      view = 'default',
      form = 'default',
    } = parseOptions(field.options);

    return (
      <Reference
        value={parseInt(value)}
        multiple={['in', 'not_in'].includes(operator)}
        config={{ foreignModel: toString(foreign_model), label, view, form }}
        className="ui input"
        onChange={onChange}
      />
    );
  }

  renderControl = () => {
    return (this.props.operator === 'contains') ? this.renderInput() : this.renderReference();
  }
}
