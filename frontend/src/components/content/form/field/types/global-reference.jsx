import React from 'react';
import { isArray, isNumber, isString } from 'lodash/lang';

import ReferenceField from './reference';
import GlobalReference from '../../../../shared/inputs/global-reference';
import { getModel, parseOptions } from '../../../../../helpers';

export default class GlobalReferenceField extends ReferenceField {
  getValue = () => {
    const { value } = this.props;
    return isNumber(value) ? value : ((value || {}).id || null);
  }

  getForeignModel = () => {
    const model = (this.props.value || {}).model;
    return model ? (getModel(model) || {}).alias : null;
  }

  render() {
    const { enabled, inline, error, getRecordValue, extraAttributes, parent } = this.props;
    const references = isString(this.options.references)
      ? parseOptions(this.options.references)
      : this.options.references;

    isArray(references) && references.forEach((ref) => {
      if (ref.filter || ref.depends_on_filter) {
        ref.hidden_filter = this.compileFilter(ref);
      }
    });

    const name = this.renderLabel();
    const value = this.getValue();
    const options = this.getOptions();
    const foreignModel = this.getForeignModel();

    return (
      <GlobalReference
        name={name}
        value={value}
        options={options}
        inline={inline}
        error={error}
        config={{ foreignModel, references }}
        parent={parent}
        disabled={!enabled || !references}
        onChange={this.onChange}
        setVisibleValue={this.setVisibleValue}
      />
    );
  }
}
