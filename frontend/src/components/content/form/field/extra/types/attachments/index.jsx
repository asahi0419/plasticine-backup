import React from 'react';
import { Icon } from 'semantic-ui-react';

import BaseExtraAttribute from '../base';
import Modal from './modal';

export default class FieldAttachments extends BaseExtraAttribute {
  renderIconPlain = () => <Icon name="attach" disabled={this.props.disabled} />;

  getIconRenderer = () => this.renderIconPlain;

  getModal = () => Modal
}
