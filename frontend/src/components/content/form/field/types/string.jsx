import React from 'react';
import { Form, TextArea, Input } from 'semantic-ui-react';
import { isObject, isEmpty, isArray } from 'lodash/lang';

import BaseField from './base';
import StringSignatureField from './string-types/signature';
import AceEditor from '../../../../../containers/ace-editor';
import EditorJS from '../../../../../containers/editor-js';
import Connection from '../../../../../containers/connection-editor';
import ErrorConnection from '../../../../../containers/error-connection-editor';
import { parseOptions } from '../../../../../helpers';
import { validateGraph } from '../../../../../helpers';

export default class StringField extends BaseField {
  prepareValue = (v) => {
    if (this.props.isValueChanged && !isObject(v)) return v;
    let value = isObject(v) ? JSON.stringify(v) : v;

    if (this.options.syntax_hl === 'json') {
      const parsed = parseOptions(value);
      if (!isEmpty(parsed)) value = JSON.stringify(parsed, null, 2);
    }

    return value;
  }

  renderAceEditor() {
    const { field, enabled, inline, error, value: v } = this.props;
    const { rows = 10, syntax_hl } = this.options;

    const value = this.prepareValue(v);
    const label = this.renderLabel({ style: { opacity: 1 } });
    const minHeight = rows * 15 - 10;

    return (
      <AceEditor
        key={field.id}
        id={`editor-${field.id}`}
        label={label}
        inline={inline}
        error={error}
        disabled={!enabled}
        value={value}
        syntax={syntax_hl}
        onChange={this.onChange}
        minHeight={minHeight}
      />
    );
  }

  renderPlainInput() {
    const { field, inline, error } = this.props;
    const control = (this.options.length > 255) || (this.options.rows > 1) ? TextArea : Input;
    const rows = this.options.rows || 6;
    const value = isArray(this.props.value) ? JSON.stringify(this.props.value) : this.props.value;

    // temporary stub for inventory DVF fields
    const disabled = ['inventory', 'subcategory', 'unit'].includes(this.options.subtype) || !this.props.enabled;

    return (
      <Form.Input
        control={control}
        label={this.renderLabel()}
        value={value || ''}
        rows={rows}
        key={field.id}
        id={'' + field.id}
        disabled={disabled}
        inline={inline}
        error={error}
        onChange={this.onChange}
        placeholder={field.placeholder}
      />
    );
  }

  renderEditorJS(){
    const { getRecordValue, model, field, enabled, inline, value: v } = this.props;

    const { height, syntax_hl } = this.options;

    const value = this.prepareValue(v);
    const label = this.renderLabel({ style: { opacity: enabled ? 1 : 0.6 } });

    return (
      <EditorJS
        key={field.id}
        record={{id:getRecordValue('id')}}
        model={{id:model.id, alias: model.alias}}
        label={label}
        inline={inline}
        disabled={!enabled}
        value={value}
        syntax={syntax_hl}
        onChange={this.onChange}
        minHeight={height}
      />
    );
  }


  renderConnection(){
    const { field, enabled, value: v } = this.props;
    const value = this.prepareValue(v);
    return (
      <Connection
        label={this.renderLabel()}
        value={value}
        onChange={this.onChange}
        disabled={!enabled}
        fieldId = {field.id}
      />
    );
  }

  renderConnectionError(status) {
    return <ErrorConnection label={this.renderLabel()} status={status}/>
  }

  renderSignature() {
    return (
      <StringSignatureField
        {...this.props}
        label={this.renderLabel({inline: true})}
      />
    );
  }

  render() {
    const { model, field, getRecordValue, value: v } = this.props;

    if (this.options.syntax_hl && (this.options.syntax_hl === 'signature')) {
      return this.renderSignature();
    }

    if (this.options.syntax_hl && (this.options.syntax_hl === 'connection')) {
      const value = this.prepareValue(v);
      const status = value == null ? "Empty" : "Break";
      return validateGraph(value) ? this.renderConnection() : this.renderConnectionError(status)
    }

    if (this.options.syntax_hl && (this.options.syntax_hl === 'editorjs')) {
        return this.renderEditorJS();
    }

    return (this.options.syntax_hl && (this.options.syntax_hl !== 'none'))
      ? this.renderAceEditor()
      : this.renderPlainInput();
  }
}
