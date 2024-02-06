import React from 'react';
import { Form } from 'semantic-ui-react';

import BaseField from './base';

export default class Autonumber extends BaseField {
  render() {
    const { field, value, inline, error } = this.props;

    return (
      <Form.Input
        label={this.renderLabel()}
        value={value || ''}
        key={field.id}
        disabled
        readOnly={true}
        inline={inline}
        error={error}
      />
    );
  }
}
