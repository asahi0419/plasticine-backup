import React from 'react';
import { Form } from 'semantic-ui-react';
import { map } from 'lodash/collection';
import { isBoolean, isNull, isObject } from 'lodash/lang';
import styled from 'styled-components';

import BaseField from './base';
import Dropdown from '../../../../shared/inputs/dropdown';
import { parseOptions } from '../../../../../helpers';

const StyledDropdown = styled(Dropdown)`
  .default.text {
    color: inherit !important;
    opacity: ${props => props.placeholderOpacity} !important;
  }
`;

export default class ArrayStringField extends BaseField {
  renderInput() {
    const { value, field } = this.props;
    const { multi_select: multiple } = this.options;

    const clearable = !this.options.default && !this.options.booleans && !!value;
    const placeholder = field.placeholder || ((this.options.booleans && isNull(value)) ? 'Null' : '');
    const placeholderOpacity = this.options.booleans ? 1 : 0.4;

    const values = isObject(this.options.values) ? this.options.values : parseOptions(this.options.values);
    const options = map(values, (v, k) => {
      const parsed = parseOptions(k);
      const value = (isBoolean(parsed) || isNull(parsed)) ? parsed : k;

      return { text: v, value };
    });

    return (
      <div className="ui input">
        <StyledDropdown
          value={value}
          options={options}
          multiple={multiple}
          default={this.options.default}
          disabled={!this.props.enabled}
          clearable={clearable}
          placeholder={placeholder}
          placeholderOpacity={placeholderOpacity}
          onChange={this.onChange}
          style={{ width: 'inherit' }}
        />
      </div>
    );
  }

  render() {
    const { field, enabled, inline, error } = this.props;

    return (
      <Form.Field key={field.id} disabled={!enabled} inline={inline} error={error}>
        {this.renderLabel()}
        {this.renderInput()}
      </Form.Field>
    );
  }
}
