import React from 'react';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash/lang';

import Page from '../../../components/content/page';

export default class FormPage extends Page {
  static propTypes = {
    ...Page.propTypes,
    onChange: PropTypes.func.isRequired,
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.serialize) return;
    if (isEqual(this.state, prevState)) return;

    const { variables: { record }, onChange } = this.props;
    onChange({ id: record.id, ...this.serialize() });
  }
}
