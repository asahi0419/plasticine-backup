import React from 'react';
import { isNaN, isUndefined, isString } from 'lodash/lang';
import { Form } from 'semantic-ui-react';

import BaseField from './base';
import Number from '../../../../shared/inputs/number';
import Slider from '../../../../shared/inputs/slider';

export default class NumberField extends BaseField {
  renderSlider = () => (
    <Slider
      id={this.props.field.id}
      value={this.props.value}
      min={this.options.min}
      max={this.options.max}
      step={this.options.step}
      nulled={this.options.use_null}
      onChange={value => this.onChange(null, { value })}
    />
  );

  renderNumber = () => (
    <Number
      id={this.props.field.id}
      value={this.props.value}
      placeholder={this.props.field.placeholder}
      onChange={value => this.onChange(null, { value })}
    />
  )

  renderInput = (type) => ({ slider: this.renderSlider(), number: this.renderNumber() })[type]

  render() {
    const { enabled, inline, value } = this.props;
    if (!enabled) return this.renderDisabledField(value);

    const type = (this.options.step ? 'slider' : 'number') || (this.options.use_null ? 'number' : 'slider') ;
    const error = this.props.error || (!isUndefined(value) && (
      (this.props.field.type === 'integer')
        ? isString(value) && value.includes('.')
        : isNaN(+value)
    ));

    return (
      <Form.Field inline={inline} error={error}>
        {this.renderLabel()}
        {this.renderInput(type)}
      </Form.Field>
    );
  }
}
