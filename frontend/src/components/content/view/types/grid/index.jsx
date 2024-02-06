import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Table } from 'semantic-ui-react';
import { uniq } from 'lodash/array';
import { isEqual, isEmpty } from 'lodash/lang';
import { map, find, reduce } from 'lodash/collection';

import Row from './row';
import TableHeader from './table-header';
import CellContextMenu from './context-menu/cell';
import SettingsContextMenu from './context-menu/settings';
import EditorDialog from './inline-editor/dialog';
import * as HELPERS from '../../../../../helpers';
import { FieldLabelContextMenu } from '../../../form/body/content/context-menu';

// horizontal scrolling of the Table does not work without this container :(
// and we need .nowrap class to control wrapping layout option
const ViewGridStyled = styled.div`
  position: relative;
  overflow-x: ${({ context }) => context === 'dashboard-widget' ? 'initial' : 'auto'};

  &.nowrap td {
    white-space: nowrap;
  }

  table {
    th:first-child {
      width: 36px;
    }

    &.selectable tr {
      cursor: pointer;
    }
  }
`;

export default class ViewGrid extends Component {
  static propTypes = {
    children: PropTypes.any,

    props: PropTypes.shape({
      hash: PropTypes.string,
      model: PropTypes.object.isRequired,
      fields: PropTypes.array.isRequired,
      columns: PropTypes.array.isRequired,
      actions: PropTypes.array,
      view: PropTypes.object.isRequired,
      layout: PropTypes.object.isRequired,
      records: PropTypes.array.isRequired,
      selectedRecords: PropTypes.array,
      viewOptions: PropTypes.object.isRequired,
      context: PropTypes.string.isRequired,
      error: PropTypes.string,
    }),

    configs: PropTypes.shape({
      showLayoutManager: PropTypes.bool,
      showGroupActions: PropTypes.bool,
      withCellEdit: PropTypes.bool,
      selectable: PropTypes.bool,
      rowselect: PropTypes.bool,
      statical: PropTypes.bool,
      compact: PropTypes.bool,
      withFirstCellLink: PropTypes.bool,
    }),

    callbacks: PropTypes.shape({
      handleAction: PropTypes.func.isRequired,
      updateView: PropTypes.func.isRequired,
      exportView: PropTypes.func.isRequired,
      itemQuickAction: PropTypes.func.isRequired,
      updateUserSettings: PropTypes.func.isRequired,
      onItemClick: PropTypes.func,
      syncCount: PropTypes.func,
    }),
  };

  static contextTypes = {
    sandbox: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.state = {
      records: [],
      sortOrder: 'none',
      allRecordsSelected: false,
      selectedRecords: [],
      columns: [],
    };
    this.contextMenuId = `grid-${HELPERS.makeUniqueID()}`;
  }

  componentWillMount() {
    this.token = PubSub.subscribe('set_view_grid_state', (_, state) => this.setState(state));
  }

  componentDidMount() {
    this.setContent(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.children) return;

    return this.setContent(nextProps);
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.token);
  }

  setContent = (props) => {
    if (props.props.context === 'main_view') {
      document.documentElement.scrollTop = 0;
    }

    const { hash, viewOptions, columns } = props.props;

    const records = lodash.compact(props.props.records);

    const sortOrder = viewOptions.sort || 'none';
    const selectedRecords = hash === this.state.hash
      ? uniq([
        ...this.state.selectedRecords,
        ...(props.props.selectedRecords || []),
      ])
      : props.props.selectedRecords || [];
    const allRecordsSelected = {
      [this.getCurrentPage()]: this.allSelectedOnCurrentPage(selectedRecords, records)
    }

    this.setState({ hash, records, columns, sortOrder, selectedRecords, allRecordsSelected, textHighlight: '' }, () => {
      PubSub.publish('set_view_manager_action_selector_state', { allRecordsSelected, selectedRecords });
      this.setUIObjectOptions({ selectedRecords });
    });
  };

  setUIObjectOptions = (state) => {
    const { this: uiObject } = this.context.sandbox.getContext();
    if (uiObject) uiObject.setOptions({ selectedRecords: state.selectedRecords });
  };

  handleSelectAllRecords = () => {
    const curPage = this.getCurrentPage();
    let curPageSelected = this.state.allRecordsSelected[curPage];
    const ids = map(this.props.props.records, 'id');
    const selectedRecords = curPageSelected
      ? this.state.selectedRecords.filter((sr) => !ids.includes(sr))
      : uniq([...this.state.selectedRecords, ...ids]);

    const state = {
      selectedRecords,
      allRecordsSelected: { ...this.state.allRecordsSelected, [curPage]: !curPageSelected }
    };

    this.setState(state, () => {
      PubSub.publish('set_view_manager_action_selector_state', state);
      this.setUIObjectOptions(state);
    });
  };

  handleSelectRecord = (id) => {
    const selectedRecords = this.state.selectedRecords.includes(id)
      ? this.state.selectedRecords.filter((sr) => sr !== id)
      : this.state.selectedRecords.concat(id);

    let allRecordsSelected = this.state.allRecordsSelected;
    allRecordsSelected[this.getCurrentPage()] = this.allSelectedOnCurrentPage(selectedRecords, this.props.props.records) ? true : false;
    const state = { selectedRecords, allRecordsSelected };

    this.setState(state, () => {
      PubSub.publish('set_view_manager_action_selector_state', state);
      this.setUIObjectOptions(state);
    });
  };

  handleTextHighlight = (data) => {
    this.setState({ textHighlight: data });
  };

  handleOpenLayoutManager = () => {
    PubSub.publish('set_view_manager_layout_state', { open: true });
  };

  allSelectedOnCurrentPage = (selectedRecords, records) => {
    const ids = map(records, 'id');
    return isEmpty(ids.filter((r) => !selectedRecords.includes(r)));
  }

  getCurrentPage = () => {
    const { viewOptions = {} } = this.props.props;
    const { page = {} } = viewOptions;
    return +page.number;
  }

  renderContextMenuSettings = (content) => {
    const { model, view } = this.props.props;

    return (
      <SettingsContextMenu model={model} view={view}>
        {content}
      </SettingsContextMenu>
    );
  };

  renderContextMenuColumn = (field) => (content) => {
    const { model } = this.props.props;

    return (
      <FieldLabelContextMenu model={model} field={field}>
        {content}
      </FieldLabelContextMenu>
    );
  };

  renderContextMenuCell = () => {
    return (
      <CellContextMenu
        id={this.contextMenuId}
        model={this.props.props.model}
        updateView={this.props.callbacks.updateView}
        viewOptions={this.props.props.viewOptions}
        textHighlight={this.state.textHighlight}
      />
    );
  };

  renderRow = (record, hasIdColumn) => {
    const { model, viewOptions } = this.props.props;
    const { selectable, rowselect, showGroupActions, withCellEdit, withFirstCellLink } = this.props.configs;
    const { itemQuickAction, onItemClick } = this.props.callbacks;
    const { columns } = this.state;

    return (
      <Row
        model={model}
        columns={columns}
        hasIdColumn={hasIdColumn}
        menuId={this.contextMenuId}
        viewOptions={viewOptions}
        record={record}
        key={record.id}
        selected={this.state.selectedRecords.includes(record.id)}
        selectable={showGroupActions || selectable}
        rowselect={rowselect}
        quickAction={itemQuickAction}
        onClick={onItemClick}
        onSelect={this.handleSelectRecord}
        onTextHighlight={this.handleTextHighlight}
        editable={withCellEdit}
        onCellEdit={this.props.callbacks.updateView}
        withFirstCellLink={withFirstCellLink}
      />
    );
  };

  renderTable() {
    const { records = [], sortOrder, columns } = this.state;

    const selectable = this.props.configs.rowselect || !this.props.configs.selectable;
    const allSelector = this.props.configs.showGroupActions || this.props.configs.selectable;
    const hasIdColumn = !!find(this.props.props.fields, { alias: 'id' });

    if (records.length) {
      return (
        <Table
          compact
          celled
          selectable={selectable}
          unstackable={true}
          className="sortable"
        >
          <TableHeader
            columns={columns}
            hasIdColumn={hasIdColumn}
            sortOrder={sortOrder}
            allSelector={allSelector}
            updateView={this.props.callbacks.updateView}
            allRecordsSelected={this.state.allRecordsSelected[this.getCurrentPage()]}
            onSelectAllRecords={this.handleSelectAllRecords}
            onOpenLayoutManager={this.handleOpenLayoutManager}
            showLayoutManager={this.props.configs.showLayoutManager}
            renderContextMenuColumn={this.renderContextMenuColumn}
            renderContextMenuSettings={this.renderContextMenuSettings}
          />
          <Table.Body>
            {map(records, (r) => this.renderRow(r, hasIdColumn))}
          </Table.Body>
        </Table>
      );
    }

    if (this.props.children) {
      return (
        <div style={{ position: 'relative', height: '250px' }}>
          {this.props.children}
        </div>
      );
    }

    return (
      <div>
        {i18n.t('records_not_found', { defaultValue: 'Records not found' })}
      </div>
    );
  }

  renderEditorDialog() {
    return (
      <EditorDialog
        id={this.contextMenuId}
        fields={this.props.props.fields}
      />
    );
  }

  render() {
    const { context, layout } = this.props.props;

    const classNames = [
      'view-grid',
      'table-container',
      'table-scroll-container',
    ];
    if (!HELPERS.parseOptions(layout.options).wrap_text) classNames.push('nowrap');

    return (
      <ViewGridStyled className={classNames.join(' ')} context={context}>
        {this.renderTable()}
        {this.renderEditorDialog()}
        {this.renderContextMenuCell()}

        {this.props.children}
      </ViewGridStyled>
    );
  }
}
