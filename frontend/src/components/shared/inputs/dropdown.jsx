import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Dropdown, Icon } from 'semantic-ui-react';
import { omit } from 'lodash/object';
import { map, each, find, filter } from 'lodash/collection';
import { isEmpty, isArray, isString, isUndefined, isBoolean, isNull } from 'lodash/lang';

const SharedDropdownStyled = styled.div`
  .ui.selection.dropdown {
    width: 100%;
  }
`;

export default class SharedDropdown extends Component {
  static propTypes = {
    options: PropTypes.array,
    placeholder: PropTypes.string,
    multiple: PropTypes.bool,
    disabled: PropTypes.bool,
    clearable: PropTypes.bool,
    selection: PropTypes.bool,
    onChange: PropTypes.func,
    style: PropTypes.object,
  }

  static defaultProps = {
    options: [],
    multiple: false,
    disabled: false,
    clearable: false,
    selection: true,
    style: {},
  }

  validateValue = (value, options) => {
    if (value) {
      const found = find(options, { value });
      if (!found && !isUndefined(found)) options.push(found);
    }
  }

  isValuePresent = () => {
    const { value } = this.props;

    if (isBoolean(value)) return true;
    if (isNull(value)) return true;
    if (isArray(value)) return !!value.length;

    return !!value;
  }

  clearValue = (e) => {
    this.props.onChange && this.props.onChange(e, { value: null });
  }

  onBlur = (e, data) => this.onBlurClick = true;
  onClick = (e, data) => this.onBlurClick = false;
  onChange = (e, data) => {
    if (!this.onBlurClick) this.props.onChange(e, data);
  }

  renderClearControl({ clearable }) {
    if (!clearable) return;
    return <Icon name="remove" onClick={this.clearValue} />;
  }

  renderControls({ clearable, disabled }) {
    return (
      <div className={`${disabled ? 'disabled ' : ''}controls`}>
        {this.renderClearControl({ clearable })}
      </div>
    );
  }

  renderInput() {
    const props = omit(this.props, ['clearable', 'placeholderOpacity']);

    props.options = map(props.options, o => ({ ...o, title: o.text }));

    if (props.value) {
      if (props.multiple) {
        if (isString(props.value)) {
          props.value = props.value.split(',');
        }
      }
    } else {
      props.value = props.multiple ? [] : (isBoolean(props.value) || isNull(props.value)) ? props.value : '';
    }

    if (props.multiple) {
      each(props.value, v => this.validateValue(v, props.options));
    } else {
      this.validateValue(props.value, props.options);
    }

    if (isEmpty(props.title)) {
      props.title = props.value
        ? props.multiple
          ? filter(props.options, o => props.value.includes(o.value)).map(o => o.text).join(', ')
          : (find(props.options, o => (o.value === props.value)) || {}).text
        : props.placeholder;
    }
    if (!props.multiple) {
      props.onChange = this.onChange;
      props.onBlur = this.onBlur;
      props.onClick = this.onClick;
    } else {
      props.value = props.value.sort();
    }

    return <Dropdown {...props} />;
  }

  render() {
    const filled = this.isValuePresent();
    const clearable = this.props.clearable && filled;
    const disabled = this.props.disabled;

    const className = `${disabled ? 'disabled ' : ''}${clearable ? 'clearable ' : ''}${filled ? 'filled ' : ''}shared-dropdown`;

    return (
      <SharedDropdownStyled className={className} style={this.props.style}>
        {this.renderInput()}
        {this.renderControls({ clearable, disabled })}
      </SharedDropdownStyled>
    );
  }
}
