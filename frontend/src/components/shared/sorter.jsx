import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { sortBy, map } from 'lodash/collection';

import Messenger from '../../messenger';
import Dropdown from './inputs/dropdown';

export default class Sorter extends Component {
  static propTypes = {
    fields: PropTypes.array.isRequired,
    viewOptions: PropTypes.object.isRequired,
    updateView: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = this.getSortState(this.props.viewOptions.sort);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.getSortState(nextProps.viewOptions.sort));
  }

  getSortState = (sort) => {
    const [_, direction, fieldsValue] = (sort || 'none').match(/(-?)(\w+)/);
    const ordersValue = direction === '-' ? 'descending' : 'ascending';

    return { fieldsValue, ordersValue };
  }

  handleFieldsDropdownChange = (_, { value }) => {
    if (value === 'none') return this.props.updateView({ sort: '' });

    const field = this.props.fields.find((f) => f.alias === value);

    const orderSign = this.state.ordersValue === 'descending' ? '-' : '';
    this.props.updateView({ sort: `${orderSign + field.alias}` });
  }

  handleOrdersDropdownChange = (_, { value }) => {
    if (this.state.fieldsValue === 'none') return this.setState({ ordersValue: value });

    const orderSign = value === 'descending' ? '-' : '';

    this.props.updateView({ sort: `${orderSign + this.state.fieldsValue}` });
  }

  renderFieldsDropdown() {
    const options = map(sortBy(this.props.fields, 'alias'), ({ alias, name }) => ({ text: name, value: alias }));
    options.unshift({ text: i18n.t('none', { defaultValue: 'None' }), value: 'none' });

    return (
      <div style={{ marginLeft: '10px', marginRight: '5px' }}>
        <Dropdown
          style={{ width: '120px', minWidth: '120px' }}
          value={this.state.fieldsValue}
          onChange={this.handleFieldsDropdownChange}
          selectOnBlur={false}
          options={options}
          selection
        />
      </div>
    );
  }

  renderOrdersDropdown() {
    const options = [
      { text: i18n.t('top_down', { defaultValue: 'Top-down' }), value: 'descending' },
      { text: i18n.t('bottom_up', { defaultValue: 'Bottom-up' }), value: 'ascending' }
    ];

    return (
      <Dropdown
        style={{ width: '105px', minWidth: '105px' }}
        value={this.state.ordersValue}
        onChange={this.handleOrdersDropdownChange}
        selectOnBlur={false}
        options={options}
        selection
      />
    );
  }

  render() {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }} >
        <span>{i18n.t('sort_by', { defaultValue: 'Sort by' })}</span>
        {this.renderFieldsDropdown()}
        {this.renderOrdersDropdown()}
      </div>
    );
  }
}
