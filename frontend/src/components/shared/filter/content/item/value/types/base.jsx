import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'semantic-ui-react';
import { isNil } from 'lodash/lang';

import Wrapper from '../wrapper';

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    field: PropTypes.object.isRequired,
    operator: PropTypes.string.isRequired,
    value: PropTypes.any,
    compact: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  renderInput() {
    const value = isNil(this.props.value) ? '' : this.props.value;

    return (
      <Input
        value={value}
        onChange={this.props.onChange}
      />
    );
  }

  renderControl() {
    return null;
  }

  render() {
    const { field: { type }, value, compact, onChange } = this.props;

    return (
      <Wrapper
        type={type}
        value={value}
        compact={compact}
        onChange={onChange}
      >
        {this.renderControl()}
      </Wrapper>
    );
  }
}
