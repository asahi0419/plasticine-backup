import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { map } from 'lodash/collection';
import { ContextMenu, MenuItem } from 'react-contextmenu';
import { isNull, isArray, isEmpty, isString } from 'lodash/lang';

import PlasticineApi from '../../../../../../api';
import * as HELPERS from '../../../../../../helpers';
import * as CONSTANTS from '../../../../../../constants';
import { escapeValue } from '../../../../../shared/filter/query-generator/expression-generators/helpers';
import db from '../../../../../../db';

export default class GridContextMenu extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    model: PropTypes.object.isRequired,
    updateView: PropTypes.func.isRequired,
    viewOptions: PropTypes.object.isRequired,
    textHighlight: PropTypes.string,
  };

  static defaultProps = {
    textHighlight: '',
  };

  handleFilter = (e, data) => {
    const { filter } = this.props.viewOptions || {};
    const { column, record, exclude } = data;

    let value = this.props.textHighlight || record[column.alias];

    if (isNull(value) || (isArray(value) && isEmpty(value))) {
      value = 'NULL';
    } else if (['string', 'array_string', 'filter', 'condition', 'color'].includes(column.type)) {
      value = this.props.textHighlight
        ? `'%${escapeValue(value)}%'`
        : `'${escapeValue(value)}'`;
    } else {
      value = this.props.textHighlight
        ? `'%${value}%'`
        : `'${value}'`;
    }

    let operator = exclude ? '!=' : '=';

    if (this.props.textHighlight) {
      operator = exclude ? 'NOT LIKE' : 'LIKE';
    }

    const query = `\`${column.alias}\` ${operator} ${value}`;
    if (filter && filter.indexOf(query) !== -1) return;

    this.props.updateView({
      filter: filter ? `${filter} AND ${query}` : query,
      page: { number: 1 },
    });
  };

  handleCopyValueToClipboard = (e, data) => {
    const { column, record } = data;
    const options = HELPERS.parseOptions(column.options);

    let value = this.props.textHighlight || record[column.alias];
    if (isArray(value) || HELPERS.isPlainObject(value)) value = JSON.stringify(value);
    if (isNull(value)) value = 'null';
    if (isString(value) && moment(value).isValid()) {
      const { settings = {} } = db.state.app;
      const format = (options.date_only
        ? settings.format.field_date_notime
        : settings.format.field_date_time) || CONSTANTS.ISO_DATE_FORMAT;

      const offset = -new Date().getTimezoneOffset();
      value = moment(value).utcOffset(offset).format(format);
    }

    HELPERS.copyToClipboard(value, {
      message: i18n.t('copied_value_to_clipboard', { defaultValue: "Value '{{value}}' has copied to clipboard", value }),
    });
  };

  handleCopyUrlToClipboard = (e, data) => {
    const value = `${window.location.origin}${PlasticineApi.getAttachmentURL(data.record)}`;

    HELPERS.copyToClipboard(value, {
      message: i18n.t('copied_url_to_clipboard', { defaultValue: 'Url has been copied to clipboard' }),
    });
  };

  renderActions = (actions) => map(actions, (a = {}, key) => {
    if (!a.condition_script()) return;

    return (
      <MenuItem key={key} onClick={a.client_script}>
        {a.name}
      </MenuItem>
    );
  });

  render() {
    const actions = [
      {
        alias: 'filter_matching',
        name: i18n.t('filter_matching', { defaultValue: 'Filter matching' }),
        client_script: (e, data) => this.handleFilter(e, data),
        condition_script: () => true,
      },
      {
        alias: 'exclude',
        name: i18n.t('exclude', { defaultValue: 'Exclude' }),
        client_script: (e, data) => this.handleFilter(e, { ...data, exclude: true }),
        condition_script: () => true,
      },
      {
        alias: 'copy_value_to_clipboard',
        name: i18n.t('copy_value_to_clipboard', { defaultValue: 'Copy to clipboard' }),
        client_script: (e, data) => this.handleCopyValueToClipboard(e, data),
        condition_script: () => true,
      },
      {
        alias: 'copy_url_to_clipboard',
        name: i18n.t('copy_url_to_clipboard', { defaultValue: 'Copy url to clipboard' }),
        client_script: (e, data) => this.handleCopyUrlToClipboard(e, data),
        condition_script: () => this.props.model.alias === 'attachment',
      },
    ];

    return (
      <ContextMenu id={this.props.id}>
        {this.renderActions(actions)}
      </ContextMenu>
    );
  }
}
