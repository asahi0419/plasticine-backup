import React from 'react';
import { Form } from 'semantic-ui-react';
import moment from 'moment';

import BaseField from './base';
import Datetime from '../../../../shared/inputs/datetime';
import { parseDateFormat } from '../../../../../helpers';

export default class DateTimeField extends BaseField {
  render() {
    const { enabled, inline, error, field: { placeholder }, value } = this.props;
    const format = parseDateFormat(this.options);

    if (!enabled) {
      return this.renderDisabledField(value ? moment(value).format(format) : '');
    }

    return (
      <Form.Field inline={inline} error={error}>
        {this.renderLabel()}
        <Datetime
          value={value || ''}
          onChange={value => this.onChange(null, { value })}
          placeholder={placeholder}
          date_only={this.options.date_only}
          format={format}
        />
      </Form.Field>
    );
  }
}
