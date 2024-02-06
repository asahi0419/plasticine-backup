import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { Link } from 'react-router';
import { Form, Icon, Label } from 'semantic-ui-react';
import { compact, flatten, uniqBy, intersection } from 'lodash/array';
import { map, find, filter, reduce, each, sortBy } from 'lodash/collection';
import { isArray, isEmpty, isString, isEqual, isNumber } from 'lodash/lang';

import PlasticineApi from '../../../../api';
import WidthProvider from './width-provider';
import { extractAliases, getSetting } from '../../../../helpers';

const AbstractInput = WidthProvider(Form.Select);

const getTitle = (value, options, multiple) => multiple
  ? (reduce(value, (result, v) => (compact([ ...result, getTitle(v, options) ])), []).join(', '))
  : (find(options, { value }) || {}).text || '';

export default class AbstractReference extends Component {
  static propTypes = {
    name: PropTypes.any,
    value: PropTypes.any,
    options: PropTypes.array,

    hash: PropTypes.string,
    model: PropTypes.string,
    valuePattern: PropTypes.string,
    filter: PropTypes.string,
    placeholder: PropTypes.string,

    inline: PropTypes.bool,
    error: PropTypes.bool,
    multiple: PropTypes.bool,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    searchable: PropTypes.bool,

    className: PropTypes.string,
    onChange: PropTypes.func.isRequired,

    showRecordDetail: PropTypes.bool,
    showReferenceCreator: PropTypes.bool,

    detailRenderer: PropTypes.func,
    creatorRenderer: PropTypes.func,
    chooserRenderer: PropTypes.func,

    setValue: PropTypes.func,
    setVisibleValue: PropTypes.func,

    optionsFilter: PropTypes.func.isRequired,
    blankValue: PropTypes.any,

    maxWidth: PropTypes.number
  }

  static defaultProps = {
    records: [],
    options: [],
    inline: true,
    error: false,
    multiple: false,
    required: false,
    disabled: false,
    searchable: true,
    className: 'field',
    showRecordDetail: true,
    showReferenceCreator: false,
    setValue: () => null,
    setVisibleValue: () => null,
    detailRenderer: () => null,
    creatorRenderer: () => null,
    chooserRenderer: () => null,
  }

  constructor(props) {
    super(props);

    this.state = {
      records: props.records,
      options: props.options,
      hash: this.getHash(props),
    };
  }

  componentDidMount() {
    this.mounted = true;

    const node = ReactDOM.findDOMNode(this);
    const input = node.getElementsByClassName('search')[2];

    if (input) node.addEventListener('click', () => input.focus());
    if (isEmpty(this.props.options)) this.setupValue(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.value, nextProps.value)
    || (!isEqual(this.state.hash, this.getHash(nextProps)))) {
      return nextProps.value
        ? this.setupValue(nextProps)
        : this.setState({ options: [] });
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  getHash = (props = {}) => {
    const { hash } = props;
    return hash || window.location.hash
  }

  clearValue = () => {
    this.setState({ options: [] });

    if (!isEqual(this.props.value, this.props.blankValue)) {
      this.props.onChange(null, { value: this.props.blankValue });
    }
  }

  setupValue = async (props, validate = true) => {
    const { data: { records = [], options = {} } } = await this.fetchOptions(props) || { data: {} };
    const state = this.processState({
      records: uniqBy([ ...this.state.records, ...records ], 'id'),
      options: this.processOptions(options, props, validate),
    }, props);

    this.mounted && this.setState(state);
  }

  fetchOptions = async (props) => {
    const { value, model, extra_fields, searchFilter, valuePattern: label } = props;
    const filter = this.state.searchFilter || searchFilter || props.optionsFilter(value);
    if (!model || !label || !filter) return;

    return PlasticineApi.loadFieldOptions(model, { filter, label, extra_fields });
  }

  processOptions = (options = [], props = {}, validate) => {
    if (validate) {
      if (props.multiple) {
        each(props.value || [], (value) => {
          if (!find(options, { value })) {
            options.push({ value, text: value, className: 'not-valid' })
          }
        });
      } else {
        if (props.value && !options.length) {
          options = [{ value: props.value, text: props.value, className: 'not-valid' }];
        }
      }
    }

    const getText = (o, v) => (find(o, { value: v }) || {}).text || v;

    const oldOptions = this.state.options || [];
    const newOptions = map(options, (o) => ({ ...o, text: o.text || getText(oldOptions, o.value) }));
    const setOptions = uniqBy([ ...newOptions, ...oldOptions ], 'value');

    return filter(setOptions, (o) => this.props.multiple
      ? !compact(flatten(this.state.value || [])).includes(o.value)
      : (this.state.value !== o.value));
  }

  processState = (state, props) => {
    this.setValueVisible(state, props);
    this.setValueConverted(state, props);

    state.hash = this.getHash(props);
    state.searchFilter = '';
    state.noResultsMessage = this.getNoResultsMessage('no_results_found');

    return state;
  }

  setValueVisible = (state, props) => {
    const getValue = (value, options) => (find(options, { value }) || {}).text;
    this.props.setVisibleValue(props.multiple
      ? map(props.value, (value) => getValue(value, state.options))
      : getValue(props.value, state.options));
  }

  setValueConverted = (state, props) => {
    const record = find(state.records, { alias: props.value }) || {};
    state.convertedValue = isString(props.value) ? record.id : null;
  }

  getNoResultsMessage = (key) => {
    const min_symb_search = getSetting('limits.lookup_min_symb_search')
    const messages = {
      no_results_found: i18n.t('no_results_found', { defaultValue: 'No results found.' }),
      type_characters: i18n.t('type_characters', { defaultValue: `Type at least ${min_symb_search} characters...` }),
    };

    return messages[key];
  };

  getValueOptions = () => {
    const { value, multiple } = this.props;
    return filter(this.state.options, (o) => multiple
      ? value.includes(o.value)
      : value === o.value);
  }

  handleFocus = () => {
    this.setState({
      active: true,
    });
  }

  handleBlur = () => {
    this.setState({
      active: false,
      options: this.getValueOptions(),
      noResultsMessage: this.getNoResultsMessage('type_characters'),
    });
  }

  handleChange = (e, { value }) => {
    if (isEqual(value, this.props.value)) return;

    const record = find(this.state.records, { id: value });
    this.props.onChange(e, { value, record });
  }

  handleSearchChange = (e, { searchQuery }) => {
    const min_symb_search = getSetting('limits.lookup_min_symb_search') || 3;
    if (searchQuery.length < min_symb_search) return this.setState({
      options: this.getValueOptions(),
      noResultsMessage: this.getNoResultsMessage('type_characters'),
    });

    const searchAliases = extractAliases(this.props.valuePattern);
    const search = map(searchAliases, (alias) => `(\`${alias}\` LIKE '%${searchQuery}%')`).join(' OR ');
    const searchFilter = map(compact([this.props.filter, search]), (part) => `(${part})`).join(' AND ');

    this.setupValue({ ...this.props, searchFilter }, false);
  }

  isValuePresent = () => {
    const { value } = this.props;
    return isArray(value) ? !!value.length : !!value;
  }

  isValueValid = () => {
    const { options = [] } = this.state;
    const [ option = {} ] = options;

    return option.className !== 'not-valid';
  }

  getInputWidth = () => {
    const { multiple, maxWidth, showRecordDetail, showReferenceCreator } = this.props;
    if (multiple) return '100%';

    const width = maxWidth ? (maxWidth + 'px') : '100%';
    const valid = this.isValueValid();
    const present = this.isValuePresent();

    let offsetWidth = 0;
    if (showRecordDetail && valid && present) offsetWidth += 25;
    if (showReferenceCreator) offsetWidth += 25;

    return `calc(${width} - ${offsetWidth}px)`;
  }

  handleLabelRemove = (e, { value }) => {
    e.preventDefault();
    this.props.onChange(e, { value: this.props.value.filter(v => v !== value) });
  }

  renderLabel = ({ value, text, className }) => {
    const to = className === 'not-valid' ? null : `/${this.props.model}/form/${value}`;
    const target = '_blank';
    const onRemove = !this.props.disabled ? this.handleLabelRemove : null;

    return (
      <Label
        as={Link}
        to={to}
        target={target}
        content={text}
        onRemove={onRemove}
        className={className}
      />
    )
  }

  renderValueCleaner() {
    if (this.isValuePresent()) return <Icon name="remove" onClick={this.clearValue} />;
  }

  renderInputControls() {
    if (this.props.disabled) return;

    return (
      <div className="controls">
        {this.renderValueCleaner()}
        {this.props.chooserRenderer()}
      </div>
    );
  }

  renderInput() {
    const { name, inline, error, required, disabled, multiple, searchable, placeholder } = this.props;
    const { convertedValue, options = [], noResultsMessage } = this.state;

    const value = multiple
      ? intersection(map(sortBy(options, 'text'), 'value'), (this.props.value || []))
      : this.props.value ? (convertedValue || this.props.value) : '';
    const title = getTitle(value, options, multiple);

    return (
      <AbstractInput
        title={title}
        label={name}
        inline={inline}
        error={error}
        required={required}
        options={options}
        value={value}
        icon={null}
        disabled={disabled}
        readOnly={disabled}
        search={!disabled && searchable}
        placeholder={placeholder}
        multiple={multiple}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        onChange={this.handleChange}
        onSearchChange={this.handleSearchChange}
        noResultsMessage={noResultsMessage}
        renderLabel={this.renderLabel}
      />
    );
  }

  renderReferenceInput() {
    const { model, valuePattern: label, disabled, searchable } = this.props;
    const { options = [] } = this.state;
    const [ option = {} ] = options;

    const style = { width: this.getInputWidth() };
    const className = `input ${option.className || ''}`;
    const inputRenderer = this.renderInput();

    return (
      <div style={style} className={className}>
        {this.renderInputControls()}
        {inputRenderer}
      </div>
    );
  }

  renderReferenceCreator() {
    if (this.props.showReferenceCreator) return this.props.creatorRenderer();
  }

  renderReferenceDetail() {
    if (this.props.showRecordDetail) {
      const { options = [] } = this.state;
      const [ option = {} ] = options;

      return this.props.detailRenderer(this.isValueValid(), option.value);
    }
  }

  render() {
    const valid = this.isValueValid() ? '' : ' invalid';
    const inline = this.props.inline ? ' inline' : '';
    const active = this.state.active ? ' active' : '';

    const className = `reference-field${inline}${valid}${active} ${this.props.className}`;

    return (
      <div className={className}>
        <div>
          {this.renderReferenceInput()}
          {this.renderReferenceCreator()}
          {this.renderReferenceDetail()}
        </div>
      </div>
    );
  }
}
