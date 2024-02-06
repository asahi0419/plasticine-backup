import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { mergeWith } from 'lodash/object';
import { isPlainObject } from 'lodash/lang';

const mergeStrategy = (objValue, srcValue) => {
  if (isPlainObject(srcValue)) return mergeWith(objValue, srcValue, (o, s) => s);
  return srcValue;
};

export default class BaseManager extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
  }

  onChange = (record) => {
    const newRecord = mergeWith(this.state.record, record, mergeStrategy);
    this.setState({ record: newRecord });
    this.props.onChange(newRecord);
  }
}
