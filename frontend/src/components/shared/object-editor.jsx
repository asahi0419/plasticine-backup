import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'semantic-ui-react';
import { isNil } from 'lodash/lang';

import Reference from './inputs/reference';
import ColorPicker from './inputs/colorpicker';
import FAIcon from './inputs/fa-icon';

class Input extends Component {
  static propTypes = {
    data: PropTypes.object,
    name: PropTypes.string,
    label: PropTypes.string.isRequired,
    as: PropTypes.string,
    params: PropTypes.object,
    onChange: PropTypes.func,
    valueGetter: PropTypes.string,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
  }

  static defaultProps = {
    data: {},
    as: 'text',
  };

  onChange = (_, params) => {
    const { name, onChange, as } = this.props;
    const value = (as === 'checkbox') ? params.checked : params.value;
    if (onChange) onChange(name, value);
  }

  render() {
    const { data = {}, defaultData = {}, name, as, label, params, required, disabled } = this.props;

    switch (as) {
      case 'text':
        const value = isNil(data[name]) ? '' : data[name];

        return (
          <Form.Input
            required={required}
            disabled={disabled}
            label={label}
            value={value}
            onChange={this.onChange}
          />
        );
      case 'checkbox':
        return (
          <Form.Checkbox
            required={required}
            disabled={disabled}
            label={label}
            checked={[true, 'true'].includes(data[name])}
            onChange={this.onChange}
            style={{ marginBottom: 0, height: '51px' }}
          />
        );
      case 'dropdown':
        return (
          <Form.Select
            required={required}
            disabled={disabled}
            label={label}
            value={data[name]}
            options={params.options}
            onChange={this.onChange}
          />
        );
      case 'reference':
        return (
          <div style={{ marginBottom: '1em' }}>
            <Reference
              inline={false}
              required={required}
              disabled={disabled}
              name={label}
              value={data[name]}
              config={params.config}
              onChange={this.onChange}
            />
          </div>
        );
      case 'colorpicker':
        return (
          <Form.Field inline={false}>
            <ColorPicker
              label={label}
              color={data[name]}
              defaultColor={defaultData[name]}
              onChange={this.onChange}
            />
          </Form.Field>
        );
      case 'fa-icon':
        return (
          <Form.Field inline={false}>
            <label>{label}</label>
            <FAIcon value={data[name]} onChange={this.onChange}/>
          </Form.Field>
        );
    }
  }
}

class ObjectEditor extends Component {
  static propTypes = {
    data: PropTypes.object,
    defaultData: PropTypes.object,
    onChange: PropTypes.func
  }

  static defaultProps = {
    data: {},
    defaultData: {},
  };

  static Input = Input;

  onChange = (inputName, value) => {
    const newData = Object.assign({}, this.props.data, { [inputName] : value });
    if (this.props.onChange) this.props.onChange(newData);
  }

  render() {
    const { children, data, defaultData } = this.props;

    return (
      <div className="floated">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && !child.props.onChange) {
            return React.cloneElement(child, { data, defaultData, onChange: this.onChange });
          } else {
            return child;
          }
        })}
      </div>
    );
  }
}

export default ObjectEditor;
