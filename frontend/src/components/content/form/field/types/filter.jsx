import React from 'react';

import BaseField from './base';
import Filter from '../../../../shared/filter';

export default class FilterField extends BaseField {
  componentDidUpdate() {
    this.props.reloadField();
  }

  applyFilter = (filter, options = {}) => {
    this.props.onChange(null, { value: filter });
  };

  renderFilter = () => {
    const { enabled, model, fields, value, templates, inline } = this.props;
    const wrapperStyle = { width: inline ? 'calc(100% - 130px)' : '100%' };

    return (
      <div style={wrapperStyle}>
        <Filter
          key="filter"
          disabled={!enabled}
          model={model}
          filter={value}
          fields={fields}
          templates={templates}
          resettable={false}
          onApply={this.applyFilter}
        />
      </div>
    );
  }

  render() {
    const inline = this.props.inline ? 'inline' : '';
    const disabled = this.props.enabled ? '' : 'disabled';

    const className = `${inline} ${disabled} field filter-field`;

    return (
      <div className={className}>
        {this.renderLabel()}
        {this.renderFilter()}
      </div>
    );
  }
}
