import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'semantic-ui-react';
import { isEqual, isNil } from 'lodash/lang';
import { pick } from 'lodash/object';

import Label from './label';
import { parseOptions } from '../../../../../helpers';

export default class BaseField extends Component {
  static propTypes = {
    field: PropTypes.object.isRequired,
    value: PropTypes.any,
    humanizedValue: PropTypes.any,
    required: PropTypes.bool,
    enabled: PropTypes.bool,
    inline: PropTypes.bool,
    error: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    getRecordValue: PropTypes.func,
    setRecordValue: PropTypes.func,
    setRecordVisibleValue: PropTypes.func,
    labelContextMenuRenderer: PropTypes.func,
    isFieldChanged: PropTypes.bool,
    isValueChanged: PropTypes.bool,
    parent: PropTypes.object,
  }

  static defaultProps = {
    inline: true,
    error: false,
    required: false,
    enabled: true,
    getRecordValue: () => null,
    setRecordValue: () => null,
    setRecordVisibleValue: () => null,
  };

  static changeableProps = ['field', 'value', 'error', 'required', 'enabled'];

  constructor(props) {
    super(props);

    this.options = parseOptions(this.props.field.options);
  }

  componentWillReceiveProps(nextProps) {
    this.options = parseOptions(nextProps.field.options);
  }

  shouldComponentUpdate(nextProps) {
    const { changeableProps } = this.constructor;

    return !isEqual(
      pick(this.props, changeableProps),
      pick(nextProps, changeableProps),
    );
  }

  onChange = (e, data) => {
    if (!this.props.enabled) return;

    this.props.onChange(e, data);
  }

  renderLabel(props = {}) {
    const { field, required, inline, labelContextMenuRenderer } = this.props;
    const { subtype } = this.options;

    return (
      <Label
        {...props}
        id={field.id}
        hint={field.hint}
        tutorial={field.tutorial}
        content={field.name}
        required={required}
        inline={inline}
        contextMenuRenderer={labelContextMenuRenderer}
      />
    );
  }

  renderDisabledField(value) {
    const { field, inline, error } = this.props;
    const label = this.renderLabel();

    if (isNil(value)) value = '';

    return (
      <Form.Input
        disabled
        readOnly
        label={label}
        value={value}
        key={field.id}
        inline={inline}
        error={error}
      />
    );
  }

  render() {
    const { field, value, inline } = this.props;
    const label = this.renderLabel();

    if (!field.__access) {
      const value = i18n.t('no_access', { defaultValue: 'No access' });
      return this.renderDisabledField(value);
    }

    return (
      <Form.Input
        id={'' + field.id}
        key={field.id}
        label={label}
        value={value || ''}
        onChange={this.onChange}
        inline={inline}
      />
    );
  }
}
