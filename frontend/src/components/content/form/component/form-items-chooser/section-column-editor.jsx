import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'semantic-ui-react';

import ObjectEditor from '../../../../shared/object-editor';
import Reference from "../../../../shared/inputs/reference";

const ALIGN_OPTIONS = [
  { text: "Left", value: 'left' },
  { text: "Center", value: 'center' },
  { text: "Right", value: 'right' }
];

const EMBEDDED_DATA_OPTIONS = [
  { text: "None", value: 'none' },
  { text: "Current model", value: 'current_model' },
  { text: "Referenced model", value: 'referenced_model' },
  { text: "Any model", value: 'any_model' },
];

export default class SectionColumnEditor extends Component {
  static propTypes = {
    model: PropTypes.number.isRequired,
    options: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  handleDataChanged = (_, {value}) => {
    const embedded_view = { type: value };

    if (value === 'current_model') {
      embedded_view.model = this.props.model;
    }
    this.props.onChange({ embedded_view });
  }

  handleModelChanged = (_, {value}) => {
    const { onChange, options: { embedded_view }} = this.props;
    onChange({ embedded_view: { ...embedded_view, model: value, view: null } });
  }

  handleViewChanged = (_, {value, record}) => {
    const { onChange, options: { embedded_view: oldEmbeddedView }} = this.props;
    const embedded_view = value ? { ...oldEmbeddedView, view: value, field: null } : { ...oldEmbeddedView, view: null, model: null, field: null };

    if (record) embedded_view.model = record.model;
    embedded_view.model && onChange({ embedded_view });
  }

  handleFieldChanged = (_, {value}) => {
    const { onChange, options: { embedded_view }} = this.props;
    onChange({ embedded_view: { ...embedded_view, field: value }});
  }

  renderEmbeddedDataModel = () => {
    const { options: { embedded_view = {} }} = this.props;
    const { model } = embedded_view;

    if (embedded_view.type !== 'any_model') return;

    return (
      <Reference
        name='Specify model'
        value={model}
        config={{
          foreignModel: 'model',
          label: 'name',
          view: 'default',
          form: 'default',
        }}
        inline={false}
        onChange={this.handleModelChanged}
      />
    );
  }

  renderEmbeddedDataView = () => {
    const { options: { embedded_view = {} } } = this.props;
    const { model, view } = embedded_view;
    let filter = '';

    if (!embedded_view.type || embedded_view.type === 'none') return;
    if (['current_model', 'any_model'].includes(embedded_view.type) && !model) return;

    if (embedded_view.type === 'referenced_model') {
      filter = `\`model\` IN 'js:p.service.referencedModelIds(${this.props.model})'`;
    } else {
      filter = `\`model\` = ${model}`;
    }

    return (
      <Reference
        name='Specify view'
        value={view}
        config={{
          foreignModel: 'view',
          label: 'name',
          view: 'default',
          form: 'default',
          filter: filter,
        }}
        inline={false}
        onChange={this.handleViewChanged}
      />
    );
  }

  renderEmbeddedDataField = () => {
    const { options: { embedded_view = {} }, model } = this.props;

    if (embedded_view.type !== 'referenced_model' || !embedded_view.view) return;

    return (
      <Reference
        name='... through field'
        value={embedded_view.field}
        config={{
          foreignModel: 'field',
          label: 'name',
          view: 'default',
          form: 'default',
          filter: `\`type\` IN ('reference', 'reference_to_list', 'global_reference') AND \`model\` = ${embedded_view.model} AND \`id\` IN 'js:p.service.referencedFieldIds(${this.props.model})'`,
        }}
        inline={false}
        onChange={this.handleFieldChanged}
      />
    );
  }


  render() {
    const { options = {}, onChange } = this.props;

    const data = {
      expanded: true,
      align: 'left',
      background_color: 'rgba(255, 255, 255, 1)',
      text_color: 'rgba(0, 0, 0, 1)',
      embedded_view: {},
      ...options,
    };
    
    const defaultData = {
      background_color: 'rgba(255, 255, 255, 1)',
      text_color: 'rgba(0, 0, 0, 1)',
    }

    return (
      <ObjectEditor data={data} defaultData={defaultData} onChange={onChange}>
        <ObjectEditor.Input
          as="text"
          name="name"
          label="Name"
        />
        <ObjectEditor.Input
          as="colorpicker"
          name="background_color"
          label="Background color"
        />
        <ObjectEditor.Input
          as="colorpicker"
          name="text_color"
          label="Text color"
        />
        <ObjectEditor.Input
          as="dropdown"
          name="align"
          label="Align"
          params={{ options: ALIGN_OPTIONS }}
        />
        {this.props.children}
        <Form.Select
          label="Embedded data"
          value={data.embedded_view.type || 'none'}
          options={EMBEDDED_DATA_OPTIONS}
          onChange={this.handleDataChanged}
        />
        {this.renderEmbeddedDataModel()}
        {this.renderEmbeddedDataView()}
        {this.renderEmbeddedDataField()}
      </ObjectEditor>
    );
  }
}
