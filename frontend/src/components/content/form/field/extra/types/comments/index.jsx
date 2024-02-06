import React from 'react';
import { Icon } from 'semantic-ui-react';

import BaseExtraAttribute from '../base';
import Modal from './modal';

export default class FieldComments extends BaseExtraAttribute {
  renderIconPlain = () => <Icon name="comment alternate outline" disabled={this.props.disabled} />;

  renderIconRequired = () => {
    const { disabled } = this.props;

    return [
      <Icon key="1" name="comment outline" disabled={disabled} />,
      <Icon key="2" name="exclamation triangle" disabled={disabled} style={{ position: 'absolute', top: -1, fontSize: 5 }} />
    ];
  }

  getIconRenderer = () => (this.props.required ? this.renderIconRequired : this.renderIconPlain)

  getModal = () => Modal
}
