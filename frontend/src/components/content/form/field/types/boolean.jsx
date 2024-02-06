import React from 'react';
import { Form } from 'semantic-ui-react';
import { some } from 'lodash/collection';
import { isString } from 'lodash/lang';

import BaseField from './base';

const STRING_VALUES = { true: true, false: false };

export default class BooleanField extends BaseField {
  onChange = (e, data) => {
    if (some(e.target.classList, (className) => className === 'hint-icon')) return;
    if (!this.props.enabled) return;

    this.props.onChange(e, data);
  }

  render() {
    const { field, inline, enabled, error } = this.props;
    let { value } = this.props;
    value = isString(value) ? STRING_VALUES[value] : value;

    return (
      <Form.Checkbox
        label={this.renderLabel()}
        checked={value || false}
        disabled={!enabled}
        key={field.id}
        onChange={(e, { checked }) => this.onChange(e, { value: checked })}
        className={inline ? ' inline' : ''}
        error={error}
        style={{ marginRight: inline ? 47 : 0 }}
      />
    );
  }
}
