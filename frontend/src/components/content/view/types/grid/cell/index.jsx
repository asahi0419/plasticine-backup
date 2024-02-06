import qs from 'qs';
import PubSub from 'pubsub-js';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Table, Icon, Loader, Dimmer } from 'semantic-ui-react';
import { Link } from 'react-router';
import { map } from 'lodash/collection';
import { compact } from 'lodash/array';
import { ContextMenuTrigger } from 'react-contextmenu';
import { isPlainObject, isUndefined, isArray, isNil } from 'lodash/lang';

import * as HELPERS from '../../../../../../helpers';

const DEFAULT_NO_WRAP_TEXT_LIMIT = 50;
const CELL_EDITOR_TYPES = [
  'integer',
  'float',
  'string',
  'boolean',
  'datetime',
  'array_string',
  'reference',
];

const CELL_NOT_EDITABLE_ALIASES = [
  'updated_at',
  'created_at',
  'updated_by',
  'created_by',
];

const StylingWrapper = styled(Table.Cell)`
  padding: 0 !important;

  .react-contextmenu-wrapper {
    padding: .5em .7em;
    min-height: 34px;
  }
`;

export default class Cell extends Component {
  static propTypes = {
    column: PropTypes.object.isRequired,
    model: PropTypes.object.isRequired,
    record: PropTypes.object.isRequired,
    style: PropTypes.object.isRequired,
    interactive: PropTypes.bool.isRequired,
    contextMenuId: PropTypes.string.isRequired,
    viewOptions: PropTypes.object.isRequired,
    editable: PropTypes.bool.isRequired,
    loading: PropTypes.bool,
    asFormLink: PropTypes.bool,
    onEdit: PropTypes.func,
    onTextHighlight: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleMouseUp = () => {
    const selection = window.getSelection().toString();
    if (selection) this.props.onTextHighlight(selection);
  };

  handleDoubleClick = (event) => {
    const { onEdit, column, editable } = this.props;

    if(CELL_NOT_EDITABLE_ALIASES.includes(column.alias)){
      return PubSub.publish('messages', {
        type: 'info',
        content: i18n.t('cell_edit_is_disabled_for_this_type_of_field', { defaultValue: `The cell edit is disabled for this type of field ({{type}})`, type: column.alias }),
      });
    }

    if (!CELL_EDITOR_TYPES.includes(column.type)) {
      return PubSub.publish('messages', {
        type: 'info',
        content: i18n.t('cell_edit_is_disabled_for_this_type_of_field', { defaultValue: `The cell edit is disabled for this type of field ({{type}})`, type: column.type }),
      });
    }

    if (column.alias === 'virtual' && column.model === 2) {
      return PubSub.publish('messages', {
        type: 'info',
        content: i18n.t('cell_edit_is_disabled_for_the_attribute', { defaultValue: `The cell edit is disabled for this attribute of record ({{attribute}})`, attribute: column.alias }),
      });
    }

    if (!editable || this.isSignature()) {
      return PubSub.publish('messages', {
        type: 'info',
        content: i18n.t('cell_edit_is_disabled', { defaultValue: 'The cell edit is disabled' }),
      });
    }

    if (onEdit) onEdit(event.currentTarget, { column, value: this.getValue() });
  };

  getValue = () => {
    const { column, record } = this.props;
    return record[column.alias];
  };

  getHumanValue = () => {
    const { column, record } = this.props;
    const humanValue = record.__metadata.human_attributes[column.alias];
    return isPlainObject(humanValue) ? humanValue.text : humanValue; // global reference
  };

  isSignature = () => {
    const { column } = this.props;
    const options = HELPERS.parseOptions(column.options);
    return options.syntax_hl && options.syntax_hl === 'signature';
  }

  formatValue = (value) => {
    const { column, record } = this.props;

    switch (column.type) {
      case 'reference':
      case 'reference_to_list':
        return isArray(value)
          ? compact(map(value, (v, i) => (v === '') ? record[column.alias][i] : v)).join(', ')
          : (value === '') ? record[column.alias] : value;
      case 'array_string':
        return isArray(value)
          ? value.join(', ')
          : value;
      case 'geo_point':
      case 'geo_line_string':
      case 'geo_polygon':
      case 'geo_geometry':
        return isNil(value)
          ? ''
          : JSON.stringify(value);
      case 'string':
        if (this.isSignature()) {
          return isNil(value) ? 'Unsigned' : HELPERS.validateSignature(value) ? 'Signed' : 'Error';
        }
        return isNil(value) ? '' : value;
      default:
        return isNil(value)
          ? ''
          : value;
    }
  }

  renderValueWrapper = (value, isValueMissed) => {
    const { column, asFormLink, record, model, viewOptions } = this.props;
    const style = {};

    if (['reference', 'array_string', 'global_reference'].includes(column.type)) {
      style.color = isValueMissed ? '#db2828' : 'inherit';
    }

    if (['reference', 'global_reference'].includes(column.type)) {
      style.textDecoration = 'underline';
      style.textDecorationColor = isValueMissed ? '#db2828' : 'inherit';
    }

    if (asFormLink) {
      const linkOptions = {};
      if (viewOptions.sort !== '-id') linkOptions.sort = viewOptions.sort;
      if (viewOptions.filter) linkOptions.filter = viewOptions.filter;

      const linkOptionsString = qs.stringify(linkOptions);
      const queryString = linkOptionsString ? `?${linkOptionsString}` : '';

      return (
        <Link to={`/${model.alias}/form/${record.id}${queryString}`}>
          {value}
        </Link>
      );
    }
    
    if (column.type === 'reference') {
      const options = HELPERS.parseOptions(column.options);
      const to = this.props.selectable ? `/${options.foreign_model}/form/${record[column.alias]}` : null

      return (
        <Link
          style={style}
          target="_blank"
          to={to}
        >
          {value}
        </Link>
      );
    }

    if (['reference_to_list', 'array_string'].includes(column.type)) {
      return <span style={style}>{value}</span>;
    }

    if (column.type === 'global_reference') {
      return <Link style={style}>{value}</Link>;
    }

    if (column.type === 'datetime') {
      return <span style={style}>{value}</span>;
    }

    if (column.type === 'fa_icon') {
      return <Icon style={style} name={value} />;
    }

    return <span style={style}>{value}</span>;
  };

  trimValue = (value, limit) => {
    if (!value) return value;
    if (isArray(value)) value = value.join(', ');

    const textLimit = +limit || DEFAULT_NO_WRAP_TEXT_LIMIT;

    try {
      return value.length > textLimit ? `${value.substring(0, textLimit)}...` : value;
    } catch (error) {
      console.log(value, typeof value);
      throw new Error(error);
    }
  };

  contextMenuCollect = (props) => ({
    record: props.record,
    column: props.column,
  });

  renderLoader = () => (
    <Dimmer active inverted style={{ padding: 0 }}>
      <Loader size="tiny" inline="centered" />
    </Dimmer>
  );

  render() {
    const { column, record, style, interactive, contextMenuId, loading } = this.props;
    const value = this.getValue();
    let humanValue = this.getHumanValue();

    let isValueMissed = false;
    if (isUndefined(humanValue)) {
      isValueMissed = true;
      if (column.type === 'global_reference') {
        humanValue = isPlainObject(value) ? value.id : value;
      } else {
        humanValue = value;
      }
    }

    if (!column.wrap_text) humanValue = this.trimValue(humanValue, column.no_wrap_text_limit);

    const formatValue = this.formatValue(humanValue);

    return (
      <StylingWrapper
        key={`column-${column.id}`}
        style={{ ...style }}
        onMouseUp={this.handleMouseUp}
        onDoubleClick={this.handleDoubleClick}
        className={loading ? 'dimmable' : null}
      >
        <ContextMenuTrigger
          holdToDisplay={-1}
          id={contextMenuId}
          record={record}
          column={column}
          selection={this.state.selection}
          collect={this.contextMenuCollect}
        >
          {loading && this.renderLoader()}
          {interactive
            ? this.renderValueWrapper(formatValue, isValueMissed)
            : formatValue}
        </ContextMenuTrigger>
      </StylingWrapper>
    );
  }
}