import React from 'react';

import BaseField from './base';

export default class extends BaseField {
  renderControl = () => this.renderInput();
}
