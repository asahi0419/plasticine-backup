import React from 'react';
import { Form } from 'semantic-ui-react';

import BaseField from './base';
import ColorInput from '../../../../shared/inputs/color';

export default class FAIconField extends BaseField {

  shouldComponentUpdate = null;

  onChange = (color) => {
    if (!this.props.enabled) return;
    const value = (color && color.rgb) ? `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})` : null;

    this.props.onChange(null, { value });
  };

  render() {
    const { field, inline, enabled, error, value } = this.props;

    return (
      <Form.Field key={field.id} id={field.id} inline={inline} error={error}>
        {this.renderLabel()}
        <ColorInput value={value} onChange={this.onChange} enabled={enabled} />
      </Form.Field>
    )
  }
}
