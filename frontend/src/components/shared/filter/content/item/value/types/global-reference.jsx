import React from 'react';
import { isPlainObject, isString } from 'lodash/lang';

import { parseOptions, getModel } from '../../../../../../../helpers';

import BaseField from './base';
import GlobalReference from '../../../../../inputs/global-reference';

export default class extends BaseField {
  getValue = () => {
    return (this.props.value || {});
  }

  getForeignModel = () => {
    const model = (this.props.value || {}).model;
    return model ? getModel(model).alias : null;
  }

  renderControl = () => {
    const { value, field, onChange } = this.props;
    const { references = [] } = parseOptions(field.options);
    const { id, model } = isString(value) ? this.valueFromString(value) : this.getValue();
    const foreignModel = model || this.getForeignModel();

    return (
      <GlobalReference
        value={id}
        config={{ foreignModel, references }}
        onChange={onChange}
        className="ui input"
        context="filter"
      />
    );
  }

  valueFromString = (value) => {
    const [ model, id ] = value.split('/');
    return { id: parseInt(id), model };
  }
}
