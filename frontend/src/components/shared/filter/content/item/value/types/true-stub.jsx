import React from 'react';
import { Input } from 'semantic-ui-react';

import BaseField from './base';

export default class extends BaseField {
  onChange = (_, { value }) => {
    if (value.length < 3) return;
    this.props.onChange(null, { value });
  }

  renderControl = () => {
    const value = this.props.value ? `js:${this.props.value.replace('js:', '')}` : 'js:';
    return <Input value={value} onChange={this.onChange} />;
  }
}
