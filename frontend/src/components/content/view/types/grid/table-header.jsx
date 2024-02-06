import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, Icon } from 'semantic-ui-react';
import { some } from 'lodash/collection';

export default class TableHeader extends Component {
  static propTypes = {
    allSelector: PropTypes.bool,
    hasIdColumn: PropTypes.bool,
    allRecordsSelected: PropTypes.bool,
    showLayoutManager: PropTypes.bool,
    columns: PropTypes.array.isRequired,
    sortOrder: PropTypes.string.isRequired,
    updateView: PropTypes.func.isRequired,
    onSelectAllRecords: PropTypes.func.isRequired,
    onOpenLayoutManager: PropTypes.func.isRequired,
    renderContextMenuColumn: PropTypes.func.isRequired,
    renderContextMenuSettings: PropTypes.func.isRequired,
  }

  static defaultProps = {
    allSelector: true,
    hasIdColumn: true,
    allRecordsSelected: false,
    showLayoutManager: true,
  }

  handleCellClick(field, sortOrder) {
    const orderSign = sortOrder === 'descending' ? '-' : '';
    this.props.updateView({ sort: `${orderSign + field.alias}` });
  }

  renderSelectControl() {
    const { allSelector, allRecordsSelected, onSelectAllRecords } = this.props;
    if (!allSelector) return;

    return (
      <Icon
        name={allRecordsSelected ? 'checkmark box' : 'square outline'}
        onClick={onSelectAllRecords}
      />
    );
  }

  renderSettingsControl() {
    const { showLayoutManager, onOpenLayoutManager, renderContextMenuSettings } = this.props;
    if (!showLayoutManager) return;

    return (
      <div style={{ display: 'inline-block' }}>
        {renderContextMenuSettings(
          <Icon
            name="setting"
            onClick={onOpenLayoutManager}
          />,
        )}
      </div>
    );
  }

  renderFirstCell() {
    const { hasIdColumn } = this.props;
    if (!hasIdColumn) return;

    return (
      <Table.HeaderCell>
        {this.renderSelectControl()}
        {this.renderSettingsControl()}
      </Table.HeaderCell>
    );
  }

  renderCell(field, order) {
    const key = `layout-field-${field.id}`;
    const style = { padding: 0 };
    const sorted = ['descending', 'ascending'].includes(order);
    const className = sorted ? 'sorted' : '';
    const linkOrder = { ascending: 'descending', descending: 'ascending' }[order];
    const renderContextMenu = this.props.renderContextMenuColumn(field);

    const onClick = (e) => {
      if (some(e.target.classList, (c) => c === 'react-contextmenu-item')) return;
      this.handleCellClick(field, linkOrder);
    }

    const content = (
      <div style={{ padding: '6px 9px' }}>
        {field.name}
        {sorted && <Icon name={`sort alphabet ${order}`} style={{ marginLeft: "5px !important" }} />}
      </div>
    );

    return (
      <Table.HeaderCell key={key} onClick={onClick} className={className} style={style}>
        {renderContextMenu(content)}
      </Table.HeaderCell>
    );
  }

  render() {
    const { columns, sortOrder } = this.props;
    const sortOrdersMap = {};

    sortOrder.split(',').forEach((order) => {
      const [_, direction, column] = order.match(/(-?)(\w+)/);
      sortOrdersMap[column] = (direction === '-') ? 'descending' : 'ascending';
    });

    return (
      <Table.Header>
        <Table.Row>
          {this.renderFirstCell()}
          {columns.map(f => this.renderCell(f, sortOrdersMap[f.alias]))}
        </Table.Row>
      </Table.Header>
    );
  }
}
