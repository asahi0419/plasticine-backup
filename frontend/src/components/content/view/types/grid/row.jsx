import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, Icon } from 'semantic-ui-react';
import { keys } from 'lodash/object';
import { some } from 'lodash/collection';

import Cell from './cell';
import { showInlineEditor } from './inline-editor/trigger';
import { processError } from '../../../../../actions/helpers';
import PlasticineApi from '../../../../../api';
import normalize from '../../../../../api/normalizer';

export default class Row extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    columns: PropTypes.array.isRequired,
    hasIdColumn: PropTypes.bool,
    menuId: PropTypes.string.isRequired,
    viewOptions: PropTypes.object.isRequired,
    record: PropTypes.object.isRequired,
    quickAction: PropTypes.func,
    selected: PropTypes.bool,
    selectable: PropTypes.bool,
    rowselect: PropTypes.bool,
    onSelect: PropTypes.func,
    onClick: PropTypes.func,
    onTextHighlight: PropTypes.func,
    editable: PropTypes.bool,
    withFirstCellLink: PropTypes.bool,
  };

  static defaultProps = {
    selected: false,
    selectable: true,
    rowselect: false,
    editable: true,
    onSelect: () => null,
    onClick: () => null,
    onTextHighlight: () => null,
    quickAction: () => null,
  };

  constructor(props) {
    super(props);

    this.state = {
      record: props.record,
      loadingCells: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ record: nextProps.record });
  }

  onCellEdit = (target, data) => {
    const { menuId } = this.props;
    const { record } = this.state;
    const options = {
      x: target.offsetLeft,
      y: target.offsetTop,
      width: target.offsetWidth || target.clientWidth,
      onApply: this.handleUpdateRecord,
      record,
      ...data,
    };
    showInlineEditor(menuId, options);
  };

  handleUpdateRecord = async (attributes) => {
    const { model, record } = this.props;

    this.setState({ loadingCells: keys(attributes) });

    try {
      const { data } = await PlasticineApi.updateRecord(
        model.alias,
        record.id,
        { data: { attributes: { ...this.state.record, ...attributes } } },
        { humanize: true },
      );
      const { entities } = normalize(data);
      const newRecord = entities[model.alias][record.id];

      await this.props.onCellEdit(newRecord)
    } catch (error) {
      processError(error);
    }

    this.setState({ loadingCells: [] });
  };

  renderFirstCell = () => {
    const { model, selected, selectable, quickAction, onSelect, hasIdColumn } = this.props;
    const { record } = this.state;

    if (!hasIdColumn) return;
    const quickActionElement = quickAction && quickAction(model, record);

    return (
      <Table.Cell>
        {selectable && (
          <Icon
            name={selected ? 'checkmark box' : 'square outline'}
            onClick={() => onSelect(record.id)}
            link
          />
        )}
        {quickActionElement}
      </Table.Cell>
    );
  };

  // TODO: get rid of viewOptions
  processAppearance = (column) => {
    const { viewOptions = {} } = this.props;
    const { appearance = [] } = viewOptions;
    const { record } = this.state;
    const recordAppearances = appearance.filter((a) => a.records.includes(record.id));
    let style = {};

    if (recordAppearances.length) {
      const rules = recordAppearances.map((a) => a.options);

      rules.forEach((rule) => {
        const condition = column
          ? rule.apply_to === 'column' && rule.field === column.id
          : rule.apply_to === 'row';

        if (condition) {
          style = {
            color: rule.color,
            backgroundColor: rule.background_color,
            fontWeight: rule.bold ? 'bold' : 'normal',
            fontStyle: rule.italic ? 'italic' : 'normal',
          };
        }
      });
    }

    return style;
  };

  onRowClick = (e) => {
    const { record, rowselect, onClick, onSelect } = this.props;
    if (some(e.target.classList, (c) => c === 'icon')) return;

    if (rowselect) {
      onSelect(record.id);
    } else {
      onClick({ value: record.id, text: record.name, record });
    }
  };

  render() {
    const { columns, model, menuId, viewOptions, editable, rowselect, selectable, hasIdColumn, withFirstCellLink } = this.props;
    const { record, loadingCells } = this.state;
    const style = this.processAppearance();

    return (
      <Table.Row key={record.id} style={style} onClick={this.onRowClick}>
        {this.renderFirstCell()}
        {columns.map((column, index) => {
          const asFormLink = withFirstCellLink && (index === 0 && hasIdColumn)
          const style = this.processAppearance(column)
          const loading = loadingCells.includes(column.alias)

          return (
            <Cell
              key={index}
              asFormLink={asFormLink}
              column={column}
              model={model}
              record={record}
              style={style}
              interactive={!rowselect}
              contextMenuId={menuId}
              viewOptions={viewOptions}
              editable={editable}
              selectable={selectable}
              loading={loading}
              onEdit={this.onCellEdit}
              onTextHighlight={this.props.onTextHighlight}
            />
          )
        })}
      </Table.Row>
    );
  }
}
