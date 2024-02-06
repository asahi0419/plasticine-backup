import Promise from 'bluebird';
import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react'
import { uniqBy } from 'lodash/array';
import { keys } from 'lodash/object';
import { isEqual, isEmpty } from 'lodash/lang';
import { sortBy, orderBy, filter, some, find, every } from 'lodash/collection';

import FilterMenu from './menu';
import FilterLabel from './label';
import FilterContent from './content';

import updater from './updater';
import AstTreeProcessor from './ast-processor';
import { makeUniqueID } from '../../../helpers';
import { processError, fetchFilterTree } from '../../../actions/helpers';
import { generatePlainQuery, generateHumanizedQuery } from './query-generator';
import { loadUpReferencedFields, loadUpTemplatesFields, completeFields } from './helpers';

export default class Filter extends React.Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    fields: PropTypes.array.isRequired,
    templates: PropTypes.array,
    predefinedFilters: PropTypes.array,
    filter: PropTypes.string,
    filterTree: PropTypes.object,
    onApply: PropTypes.func.isRequired,
    compact: PropTypes.bool,
    resettable: PropTypes.bool,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    onOpenContent: PropTypes.func,
    onCloseContent: PropTypes.func,
    interactiveLabel: PropTypes.bool,
  }

  static defaultProps = {
    disabled: false,
    readOnly: false,
    compact: false,
    interactiveLabel: false,
    resettable: true,
    templates: [],
    predefinedFilters: [],
    onOpenContent: () => null,
    onCloseContent: () => null,
  }

  constructor(props) {
    super(props);

    this.state = {
      active: false,
      query: props.filter,
      originalQuery: props.filter,
      content: [],
      originalContent: [],
      fields: sortBy(props.fields, 'name'),
    };
  }

  componentDidMount() {
    this.loadContent(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const isFiltersEqual = this.props.filter === nextProps.filter;
    const isFieldsEqual = isEqual(this.props.fields.sort(), nextProps.fields.sort());

    if (!isFiltersEqual || !isFieldsEqual) {
      this.loadContent(nextProps);
    }
  }

  loadContent = async (props) => {
    const fields = completeFields(props.fields);
    const { content = [] } = props.filter ? await this.prepareContent(props.model, fields, props.filter, props.filterTree) : {};

    const query = content.length ? props.filter : '';
    const humanizedQuery = content.length ? generateHumanizedQuery(content) : '';

    const state = {
      active: false,
      fields,
      query,
      content,
      humanizedQuery,
      originalQuery: query,
      originalContent: content,
      originalHumanizedQuery: humanizedQuery,
    };

    const templatedFields = filter(state.fields, 'templated');
    const referencedFields = filter(state.fields, 'referenced');

    if (templatedFields.length) state.fields = await this.processTemplatedFields(state.fields, templatedFields);
    if (referencedFields.length) state.fields = await this.mergeWithReferenceFields(state.fields);

    this.setState(state);
  }

  processTemplatedFields = async (fields, templatedFields) => {
    await Promise.each(templatedFields, async (field) => {
      const template = {};
      const [dvfAlias, dtfAlias] = field.alias.replace('__dvf__', '').split('/')

      find(this.props.templates, ({ dvf, models, dtfs }) => {
        if (dvf.alias === dvfAlias) {
          template.dvf = dvf;
          template.models = models;
          find(dtfs, (dtf) => (dtf.alias === dtfAlias) && (template.dtf = dtf));
        }
      });

      every(keys(template), (key) => ['dvf', 'models', 'dtf'].includes(key)) && (fields = await this.mergeWithTemplateFields(fields, template));
    });

    return fields;
  }

  prepareContent = async (model, fields, filter, filterTree, params) => {
    if (!filterTree) {
      const { data: result = {} } = await fetchFilterTree(model.alias, filter) || {}
      const { data = {} } = result;

      filterTree = data;
    }

    return new AstTreeProcessor(fields, params).process(filterTree);
  }

  mergeFields = (fields) => {
    return orderBy(uniqBy(fields, 'alias'), ['dvf', 'name'], ['desc', 'asc']);
  }

  mergeWithTemplateFields = async (fields, template) => {
    const templateFields = await loadUpTemplatesFields(template);
    return this.mergeFields([...filter(fields, ({ templated }) => !templated), ...templateFields]);
  }

  mergeWithReferenceFields = async (fields) => {
    const referenceFields = await loadUpReferencedFields(this.props.model);
    return this.mergeFields([...fields, ...referenceFields]);
  }

  loadTemplateFields = async (template) => {
    const fields = await this.mergeWithTemplateFields(this.state.fields, template);
    this.setState({ fields });
  }

  loadReferenceFields = async () => {
    const fields = await this.mergeWithReferenceFields(this.state.fields);
    this.setState({ fields });
  }

  updateFilter = (command, options) => {
    const { content, fields } = this.state;

    let newContent = updater(content, fields)(command, options);
    if (!newContent.length) {
      newContent = updater(newContent, fields)('ADD_GROUP');
    }

    const newQuery = generatePlainQuery(newContent);
    const newHumanizedQuery = generateHumanizedQuery(newContent);

    this.setState({ content: newContent, query: newQuery, humanizedQuery: newHumanizedQuery });
  }

  apply = async (e) => {
    e.preventDefault()

    const fields = completeFields(this.props.fields);
    const filterTree = null;
    const { content = [] } = await this.prepareContent(this.props.model, fields, this.state.query, filterTree, { silent: false });

    if ((this.state.query && content.length) || !this.state.query) {
      const query = content.length ? generatePlainQuery(content) : '';
      this.setState({ active: false }, () => this.props.onApply(query));
    }
  }

  applyFilter = (query) => this.props.onApply(query, { page: { number: 1 }, refreshId: makeUniqueID() })

  openContent = () => {
    const state = { active: true };
    const { content, fields } = this.state;

    if (!content.length) {
      state.content = updater(content, fields)('ADD_GROUP');
    }

    this.setState(state);
    this.props.onOpenContent(state);
  }

  closeContent = () => {
    const state = {
      active: false,
      content: this.state.originalContent,
      query: this.state.originalQuery,
      humanizedQuery: this.state.originalHumanizedQuery,
    };

    this.setState(state);
    this.props.onCloseContent(state);
  }

  addGroup = () => this.updateFilter('ADD_GROUP');

  renderMenu() {
    const { readOnly, disabled, onApply, predefinedFilters } = this.props;
    const { query } = this.state;

    return (
      <FilterMenu
        query={query}
        applyFilter={onApply}
        filters={predefinedFilters}
        asDropdown={!readOnly}
      />
    );
  }

  renderLabel() {
    const { interactiveLabel, resettable, disabled, readOnly } = this.props;
    const { active, query, humanizedQuery } = this.state;

    if (readOnly) return;

    return (
      <FilterLabel
        query={query}
        active={active}
        disabled={disabled}
        resettable={resettable}
        interactive={interactiveLabel}
        humanizedQuery={humanizedQuery}
        onOpenFilter={this.openContent}
        applyFilter={this.applyFilter}
      >
        <Button key='1' basic onClick={this.apply}>{i18n.t('apply', { defaultValue: 'Apply' })}</Button>
        <Button key='2' basic onClick={this.closeContent}>{i18n.t('cancel', { defaultValue: 'Cancel' })}</Button>
        <Button key='3' basic onClick={this.addGroup} style={{ marginLeft: '20px', textTransform: 'uppercase' }}>{i18n.t('or', { defaultValue: 'Or' })}</Button>
      </FilterLabel>
    );
  }

  renderControls() {
    return (
      <div className="filter-controls" style={{ display: 'flex', alignItems: 'baseline' }}>
        {this.renderMenu()}
        {this.renderLabel()}
      </div>
    );
  }

  renderContent() {
    const { model, templates, compact, readOnly } = this.props;
    const { active, content, fields } = this.state;

    if (readOnly) return;
    if (!active) return;

    return (
      <FilterContent
        content={content}
        model={model}
        fields={fields}
        compact={compact}
        updater={this.updateFilter}
        templates={templates}
        loadTemplateFields={this.loadTemplateFields}
        loadReferenceFields={this.loadReferenceFields}
      />
    );
  }

  render() {
    return (
      <div className="filter">
        {this.renderControls()}
        {this.renderContent()}
      </div>
    );
  }
}
