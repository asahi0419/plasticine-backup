import React from 'react';
import { Form, Icon } from 'semantic-ui-react';

import BaseField from './base';
import FAIcon from '../../../../shared/inputs/fa-icon';

export default class FAIconField extends BaseField {
  render() {
    const { field, enabled, inline, error, value } = this.props;

    return (
      <Form.Field key={field.id} id={field.id} inline={inline} error={error}>
        {this.renderLabel()}
        {enabled
          ? <FAIcon value={value} onChange={this.onChange} />
          : <Icon name={value} style={{ fontSize: '1.5em', lineHeight: '1.5em' }} />}
      </Form.Field>
    );
  }
}
