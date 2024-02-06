import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Table, Icon } from 'semantic-ui-react';
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc';
import { every } from 'lodash/collection';

import '../../../styles/sortable-table.css';

const DragHandle = SortableHandle(() => <Icon name="sidebar" color="grey" />);

const SortableRow = SortableElement(({ number, item, columns, propagator }) => {
  return <Row index={number} item={item} columns={columns} propagator={propagator} />;
});

const SortableTableBody = SortableContainer(({ items, columns, propagator }) => {
  return (
    <Table.Body>
      {items.map((item, i) =>
        <SortableRow
          item={item}
          key={i}
          index={i}
          number={i}
          columns={columns}
          propagator={propagator}
        />
      )}
    </Table.Body>
  );
});

class Column extends Component {
  static propTypes = {
    label: PropTypes.string.isRequired,
    valueKey: PropTypes.string.isRequired,
    checker: PropTypes.object,
  }
}

class Row extends Component {
  static propTypes = {
    item: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    columns: PropTypes.array.isRequired,
    propagator: PropTypes.func.isRequired,
  }

  onChange = (valueKey, _, { value }) => {
    const { item, index, propagator } = this.props;
    propagator({ ...item, [valueKey] : value }, index);
  }

  renderCell(column, index) {
    const { item } = this.props;
    const { valueKey, value, checker } = column.props;

    if (checker) {
      const checked = every(checker, (value, key) => item[valueKey] === value);
      return (
        <Table.Cell key={index}>
          <Form.Checkbox value={value}
                         checked={checked}
                         onChange={this.onChange.bind(this, valueKey)} />
        </Table.Cell>
      );
    } else {
      return <Table.Cell key={index}>{item[valueKey]}</Table.Cell>;
    }
  }

  render() {
    const { columns } = this.props;

    return (
      <Table.Row>
        <Table.Cell className="dragHandle"><DragHandle /></Table.Cell>
        {columns.map((column, i) => this.renderCell(column, i))}
      </Table.Row>
    );
  }
}

class RadioTable extends Component {
  static propTypes = {
    items: PropTypes.array.isRequired,
    onChange: PropTypes.func,
  }

  static Column = Column;

  constructor(props) {
    super(props);
    this.state = { items: props.items };
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.items !== nextProps.items) {
      this.setState({ items: nextProps.items });
    }
  }

  handlePropagate = (newItem, index) => {
    const items = this.state.items.map((item, i) => i === index ? { ...newItem } : item);
    this.setState({ items });
    if (this.props.onChange) this.props.onChange(items);
  }

  onSortEnd = ({ oldIndex, newIndex }) => {
    const items = arrayMove(this.state.items, oldIndex, newIndex);
    this.setState({ items });
    if (this.props.onChange) this.props.onChange(items);
  };

  renderHeaderCell(column, index) {
    return <Table.HeaderCell key={index}>{column.props.label}</Table.HeaderCell>;
  }

  render() {
    const { items } = this.state;
    const { children: columns } = this.props;

    return (
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell className="dragHandle"/>
            {columns.map((column, i) => this.renderHeaderCell(column, i))}
          </Table.Row>
        </Table.Header>

        <SortableTableBody
          items={items}
          columns={columns}
          onSortEnd={this.onSortEnd}
          propagator={this.handlePropagate}
          helperClass="sortable"
          lockAxis="y"
          useDragHandle
        />
      </Table>
    );
  }
}

export default RadioTable;
