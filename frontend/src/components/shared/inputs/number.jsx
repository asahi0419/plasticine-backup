import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'semantic-ui-react';
import { isNaN } from 'lodash/lang';
import { NUMBER_MAX_LENGTH } from '../../../constants';

export default class Number extends Component {
  static propTypes = {
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
  }

  handleChange = (e, { value }) => this.props.onChange(value)

  render() {
    const { id, value, placeholder } = this.props;
    return <Input id={id} value={value || value === 0 ? value : ''} placeholder={placeholder} onChange={this.handleChange} maxLength={NUMBER_MAX_LENGTH}/>;
  }
}
