import React from 'react';
import { Form, Input, TextArea } from 'semantic-ui-react';

import BaseField from './base';

export default class JournalField extends BaseField {
  render() {
    const { field, enabled, inline, error, value = '' } = this.props;
    const control = this.options.rows ? TextArea : Input;
    const rows = this.options.rows || 1;

    return (
      <div>
        <Form.Input
          rows={rows}
          control={control}
          label={this.renderLabel()}
          value={value}
          disabled={!enabled}
          inline={inline}
          error={error}
          onChange={this.onChange}
        />
      </div>
    );
  }
}
