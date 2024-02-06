import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from 'semantic-ui-react'
import styled from 'styled-components';

import BaseField from '../base';
import AceEditor from '../../../../../../containers/ace-editor';
import filterUpdater from '../../../../../shared/filter/updater';
import FilterContent from '../../../../../shared/filter/content';
import { completeFields } from '../../../../../shared/filter/helpers';
import { generateHumanizedQuery } from '../../../../../shared/filter/query-generator';

import ConditionMenu from './menu';
import { generateScript } from './script-generator';
import ScriptParser from './script-parser';
import ValueHumanizer from './value-humanizer';
import { parseOptions } from '../../../../../../helpers';
import PlasticineApi from '../../../../../../api';

const StyledConditionField = styled.div`
  flex-wrap: wrap;

  .condition-field-value {
    display: flex;
    flex-direction: row;
    min-height: 32px;

    flex-direction: row;
    min-height: 32px;
    align-items: center;

    .ui.dropdown {
      margin-top: 0;
    }

    .condition-field-label {
      .condition-string {
        margin-right: 10px;
      }
    }
  }

  .icon.code {
    margin-right: 0.5em;
    line-height: 32px;
  }

  &.inline {
    label {
      width: 115px;
      min-width: 115px;
      max-width: 115px;
      margin-right: 15px;
      text-align: right;
    }

    .filter-content {
      margin-left: 100px;
      width: 100%;
    }

    .condition-editor {
      width: 100%;
      margin-left: 130px;
    }
  }
`;


export default class ConditionField extends BaseField {
  static propTypes = {
    ...BaseField.propTypes,
    fields: PropTypes.array.isRequired,
  };

  state = {}

  constructor(props) {
    super(props);
    this.valueHumanizer = new ValueHumanizer();
    this.scriptParser = new ScriptParser();
  }

  componentDidMount = async () => {
    await this.setContent(this.props);
  }

  componentWillReceiveProps = async (nextProps) => {
    await this.setContent(nextProps);
  }

  shouldComponentUpdate = null;

  setContent = async (props) => {
    const fields = await this.completeFields(props);
    this.scriptParser.setFields(fields);
    this.setState({
      ...this.state,
      ...await this.stateFromValue(props.value),
      fields,
      active: false,
    });
  }

  getRefModelValue = (props) => {
    const { field, getRecordValue } = props;
    const refModel = parseOptions(field.options).ref_model;
    if (!refModel) return;
    return getRecordValue(refModel);
  }

  completeFields = async (props) => {
    const refModelValue = this.getRefModelValue(props);

    if (refModelValue) {
      this.cachedFields = this.cachedFields || {};
      if (this.cachedFields[refModelValue]) return this.cachedFields[refModelValue];

      const modelFields = await this.fetchFields(refModelValue);
      const fields = completeFields(modelFields, { booleanItems: true, emptyItem: true, currentUserItem: true });

      this.cachedFields[refModelValue] = fields;
      this.scriptParser.setFields(fields);

      return fields;
    } else {
      return completeFields(props.fields, { booleanItems: true, emptyItem: true, currentUserItem: true });
    }
  }

  fetchFields = async (modelId) => {
    const result = await PlasticineApi.loadFields(modelId);
    return result.data.data;
  }

  generateHumanizedQuery = async (content) => {
    const humanizedQuery = generateHumanizedQuery(content);
    const humanizedContent = await this.valueHumanizer.process(content);

    this.setState({ content: humanizedContent, humanizedValue: generateHumanizedQuery(humanizedContent) });

    return humanizedQuery;
  }

  stateFromValue = async (value) => {
    const content = this.scriptParser.process(value);
    const humanizedValue = content ? await this.generateHumanizedQuery(content) : null;

    return {
      content: content,
      originalContent: content,
      humanized: (!!humanizedValue || !value),
      humanizedValue: humanizedValue || value,
      editorValue: value,
      value: value,
    }
  }

  stateFromContent = async (value, content) => {
    const humanizedValue = content ? await this.generateHumanizedQuery(content) : null;

    return {
      originalContent: content,
      humanized: (!!humanizedValue || !value),
      humanizedValue: humanizedValue || value,
      value: generateScript(content),
    }
  }

  handleOpen = () => {
    if (!this.props.enabled) return;
    const { content } = this.state;

    if (content && !content.length) { this.updateFilter('ADD_GROUP') }
    this.setState({ active: true });
  }

  handleApply = async () => {
    const { humanized, content, editorValue } = this.state;

    const state = humanized
      ? await this.stateFromContent(editorValue, content)
      : await this.stateFromValue(editorValue);

    this.setState({ ...state, active: false, editorValue: state.value });
    this.onChange({}, { value: state.value });
  }

  handleCancel = () => {
    const { originalContent } = this.state;

    this.setState({
      active: false,
      humanized: !!originalContent,
      content: originalContent,
      editorValue: this.state.value,
    });
  }

  handleJSOpen = () => this.setState({ humanized: false, active: true });

  handleChangeEditor = (e, { value }) => this.setState({ editorValue: value });

  handleAddGroup = () => this.updateFilter('ADD_GROUP');

  updateFilter = (command, options) => {
    const { content, fields } = this.state;

    let newContent = filterUpdater(content, fields)(command, options);
    if (!newContent.length) {
      newContent = filterUpdater(newContent, fields)('ADD_GROUP');
    }
    this.setState({ content: newContent });
  }

  renderAceEditor() {
    const { field, enabled, error } = this.props;

    return (
      <AceEditor
        key={field.id}
        id={`editor-${field.id}`}
        label={null}
        error={error}
        inline={false}
        disabled={!enabled}
        value={this.state.value}
        syntax={'js'}
        onChange={this.handleChangeEditor}
      />
    );
  }

  renderButtons = () => {
    const { humanized } = this.state;

    return (
      <span>
        {this.props.enabled && <Button basic onClick={this.handleApply}>{i18n.t('apply', { defaultValue: 'Apply' })}</Button>}
        <Button basic onClick={this.handleCancel}>{i18n.t('cancel', { defaultValue: 'Cancel' })}</Button>
        {humanized && <Button basic onClick={this.handleAddGroup} style={{ marginLeft: '20px', textTransform: 'uppercase' }}>
          {i18n.t('or', { defaultValue: 'Or' })}
        </Button>}
      </span>
    );
  }

  renderContent = () => {
    const { model } = this.props;
    const { content, humanized, fields } = this.state;

    return (
      humanized ?
        <FilterContent
          content={content}
          model={model}
          fields={fields}
          templates={[]}
          compact={false}
          updater={this.updateFilter}
          isCondition={true}
        />
        :
        <div className="condition-editor" style={{ marginTop: '10px' }}>
          {this.renderAceEditor()}
        </div>
    );
  }

  render() {
    const { inline } = this.props;
    const { active, humanizedValue } = this.state;
    const wrapperStyle = { width: inline ? 'calc(100% - 130px)' : '100%' };

    return (
      <StyledConditionField className={`${inline ? 'inline ' : ''}field`}>
        <div style={wrapperStyle} className={`${inline ? 'inline ' : ''}condition-field-value`}>
          {this.renderLabel()}
          <ConditionMenu handleJSOpen={this.handleJSOpen} />
          <div className="condition-field-label">
            <Icon name="code" onClick={this.handleOpen} link />
            {/*<span className="condition-label" onClick={onClick}>*/}
              {/*{i18n.t('condition', { defaultValue: 'Condition' })}*/}
            {/*</span>*/}
            {/*:&nbsp;&nbsp;*/}
            {this.props.children || <span className="condition-string" onClick={this.handleOpen}>{humanizedValue}</span>}
            {active && this.renderButtons()}
          </div>
        </div>
        {active && this.renderContent()}
      </StyledConditionField>
    );
  }
}
