import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Input, Icon, Popup } from 'semantic-ui-react';
import { find, map, filter, each } from 'lodash/collection';
import { isEmpty, isEqual } from 'lodash/lang';
import styled from 'styled-components';
import moment from 'moment';
import DatetimeDropdown from '../../../../shared/inputs/datetime-dropdown';

import * as CONSTANTS from '../../../../../constants';
import * as HELPERS from './helpers';
import AstTreeProcessor from '../../../../shared/filter/ast-processor';
import { loadUpReferencedFields } from "../../../../shared/filter/helpers";
import { parseOptions } from '../../../../../helpers';
import db from '../../../../../db'

const QuicksearchManagerStyled = styled.div`
  .ui[class*="left action"].input > input {
    max-width: initial !important;
  }

  .ui.fluid.input > input {
    width: 200px !important;
  }

  .ui.fluid .datetime-dropdown-wrapper {
    display: flex;
    z-index: 10;
    margin-left: -2px;
  }

  .menu {
    margin: 5px 0 !important;
    max-height: 300px;
    overflow-y: auto;
  }

  @media only screen and (max-width: ${CONSTANTS.UI_TABLET_MAX_SIZE}px) {
    width: 100%;
  }
`;

export default class QuicksearchManager extends Component {
  static propTypes = {
    props: PropTypes.shape({
      columns: PropTypes.array.isRequired,
      filter: PropTypes.string,
      viewOptions: PropTypes.object.isRequired,
    }),

    configs: PropTypes.shape({
      showQuicksearch: PropTypes.bool,
    }),

    callbacks: PropTypes.shape({
      updateView: PropTypes.func.isRequired,
    }),
  }

  constructor(props) {
    super(props);

    this.state = {
      selectedField: null,
      searchTerm: '',
    };
  }

  async componentDidMount() {
    const { props } = this.props || {};
    const { model } = props || {};
    const refFields = model ? await loadUpReferencedFields(model) : [];
    this.getContent(this.props, refFields);
  }

  componentWillReceiveProps(nextProps) {
    this.getContent(nextProps);
  }

  getContent = (props, refFields) => {
    const tree = new AstTreeProcessor(props.props.columns).process(props.props.viewOptions.filterTree);

    let qsExpression;

    each(tree.content, (group) => {
      each(group.items, (item) => {
        if (/__qs__/.test(item.field.__alias)) {
          qsExpression = item;
        }
      });
    });

    const optionsFiltered = filter(props.props.columns, (field) => field.type !== 'global_reference' && !field.__parentField);
    const options = map(optionsFiltered, ({ name, id }) => ({ text: name, value: id }));

    let selectedField = (options[0] || {}).value;
    let searchTerm = this.state.searchTerm;
    if (isEqual(props.props.columns, this.props.props.columns)) {
      if (find(options, { value: this.state.selectedField })) {
        selectedField = this.state.selectedField;
      }
      if (find(options, { value: ((qsExpression || {}).field || {}).id }) && searchTerm) {
        selectedField = qsExpression.field.id;
      }
    } else {
      if (!find(options, { value: this.state.selectedField })) {
        searchTerm = '';
      }
      if (!find(options, { value: ((qsExpression || {}).field || {}).id })) {
        searchTerm = '';
      }
    }

    this.setState({
      options,
      qsExpression,
      selectedField,
      searchTerm,
      refFields : this.state.refFields ? this.state.refFields : refFields
    });
  }

  getSelectedField = () => {
    return find(this.props.props.columns, { id: this.state.selectedField });
  }

  getFilterExpression = () => {
    const field = this.getSelectedField();

    let searchTerm = this.state.searchTerm;
    if (field.type === 'datetime' && !CONSTANTS.DATE_INTERVALS.includes(searchTerm)) {
      const utcOffset = new Date().getTimezoneOffset();
      searchTerm = moment.utc(searchTerm).utcOffset(utcOffset);
    }

    return HELPERS.filterExpression(field, searchTerm, this.state.refFields);
  }

  handleFieldChange = (e, { value }) => {
    this.setState({ selectedField: value, searchTerm: '' })
  } ;

  handleInputChange = (e, { value }) => this.setState({ searchTerm: value });
  handleInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.handleSearchApply();
      return;
    }
    const field = this.getSelectedField();
    const params = {
      field,
      key: e.key,
      searchText: this.state.searchTerm,
      refFields: this.state.refFields
    }
    if(!HELPERS.isValidSymbol(params))
      e.preventDefault();
  };

  handleDatetimeDropdownChange = (value) => {
    this.setState({ searchTerm: value }, this.handleSearchApply);
  }

  handleSearchApply = () => {
    const { props = {}, callbacks = {} } = this.props;
    const filter = props.viewOptions.filter ? props.viewOptions.filter.replace(/ AND .?__qs__.*/, '').replace(/.?__qs__.*/, '') : '';

    if (this.state.qsExpression && isEmpty(this.state.searchTerm)) {
      return callbacks.updateView({ filter });
    }

    const expression = this.getFilterExpression();
    if (!expression) return;

    return callbacks.updateView({ filter: filter ? `${filter} AND ${expression}` : expression, page: { number: 1 } });
  }

  renderIcon() {
    return (
      <Icon
        link
        name="search"
        onClick={this.handleSearchApply}
      />
    );
  }

  renderAction() {
    const { options = [], selectedField } = this.state || {};
    if (!selectedField) return;

    return (
      <Dropdown
        style={{ zIndex: 11 }}
        options={options}
        value={selectedField}
        onChange={this.handleFieldChange}
        button
      />
    );
  }

  renderDatetimeDropdown(field, searchTerm) {
    const options = parseOptions(field && field.options);
    const { field_date_notime } = db.state.app.settings.format;

    return (
      <div className="ui fluid left action icon input">
        {this.renderAction()}
        <DatetimeDropdown
          clearable
          value={searchTerm}
          format={field_date_notime}
          date_only={options.date_only}
          onChange={this.handleDatetimeDropdownChange}
        />
      </div>
    );
  }

  renderManager() {
    const { searchTerm = '', refFields } = this.state || {};

    const icon = this.renderIcon();
    const action = this.renderAction();

    const field = this.getSelectedField();
    const placeholder = HELPERS.getPlaceholderContent(field, refFields);

    if (field && field.type === 'datetime') {
      return this.renderDatetimeDropdown(field, searchTerm);
    } else {
      return (
        <Popup trigger ={
          <Input
              fluid
              icon={icon}
              action={action}
              actionPosition="left"
              value={searchTerm}
              placeholder={placeholder}
              onChange={this.handleInputChange}
              onKeyPress={this.handleInputKeyPress}
          />}
              content = {HELPERS.getPopupContent(field, refFields)}
        />
      );
    }
  }
  render() {
    if (!this.props.configs.showQuicksearch) return null;

    return (
      <QuicksearchManagerStyled className="view-manager quicksearch-manager">
        {this.renderManager()}
      </QuicksearchManagerStyled>
    );
  }
}
