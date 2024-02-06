import qs from 'qs';
import React from 'react';
import PropTypes from 'prop-types';
import { assign } from 'lodash/object';
import { isEqual, isUndefined } from 'lodash/lang';
import { findIndex, flatten } from 'lodash/array';
import { filter, find, sortBy, reduce, map, some } from 'lodash/collection';

import history from '../../../../../history';
import localStore from '../../../../../store/local';
import PlasticineApi from '../../../../../api';
import { createLayout } from './helpers';
import { parseOptions, getModel } from '../../../../../helpers';

import * as Field from '../../field';
import Tabs from '../../../../shared/tabs';
import AttachmentsManager from '../../attachments-manager';
import AttachmentPaster from '../../attachments-manager/paster';
import AttachmentUploader from '../../attachments-manager/uploader';
import EmbeddedView from '../../embedded-view';
import Section from './section';
import WorklogComponent from '../worklog';
import ChartComponent from '../chart';
import DashboardTabContainer from '../../../../../containers/content/form/tabs/dashboard';
import ActionsBar from '../../../action/actions-bar';
import AttachmentViewer from './attachment-viewer';
import { FieldLabelContextMenu, TabLabelContextMenu } from './context-menu';
import FormItemsChooser from '../../component/form-items-chooser';
import RelatedDataChooser from '../../component/related-data-chooser';

export default class Content extends React.Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    record: PropTypes.object.isRequired,
    fields: PropTypes.array.isRequired,
    form: PropTypes.object.isRequired,
    actions: PropTypes.array,
    options: PropTypes.object.isRequired,
    uploadAttachments: PropTypes.func.isRequired,
    handleAction: PropTypes.func.isRequired,
    enabled: PropTypes.bool.isRequired,
  }

  static defaultProps = {
    actions: [],
  }

  static contextTypes = {
    sandbox: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = { layout: [], tabs: {} };
  }

  componentDidMount() {
    this.setFormState(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const { options: prevOptions = {}, record: prevRecord } = this.props;
    const { options: nextOptions = {}, record: nextRecord } = nextProps;

    const { components: prevComponents = {} } = prevOptions;
    const { components: nextComponents = {} } = nextOptions;

    if (!isEqual(prevComponents, nextComponents)) {
      return this.setFormState(nextProps);
    }
  }

  setFormState = (props) => {
    const { record, fields, options } = props;
    const layout = createLayout(options.components, fields);
    const tabs = reduce(layout, (result, tab) => {
      result[tab.id] = {};
      return result;
    }, {});

    this.setState({ layout, tabs });
  }

  onOpenReferenceCreator = (field) => () => {
    const { model, record } = this.props;

    const storedAttributesKey = `stored_attributes/${model.alias}/${record.id}`;
    const storedRecord = localStore.get(storedAttributesKey) || {};

    localStore.set(storedAttributesKey, { ...storedRecord, ...record.changedAttributes });

    const { foreign_model } = parseOptions(field.options);
    const associateWith = [field.model, record.id, field.id].join('/');

    history.push({
      pathname: `/${foreign_model}/form/new`,
      search: `?${qs.stringify({ associate: associateWith })}`,
    });
  }

  getRecordValue = (record) => (fieldAlias) => record.get(fieldAlias);

  setRecordValue = (record) => (fieldAlias, value) => record.set(fieldAlias, value);

  setRecordVisibleValue = (record) => (fieldAlias, value) => record.setVisible(fieldAlias, value);

  getField = (record, component) => {
    const field = record.getField(component.id);

    return field ? { ...field } : { id: component.id, alias: component.id, virtual: true };
  }

  getFieldChangeHandler = (record, field) => (e, data) => {
    const dynamicOnChange = record.dynamicOnChangeStorage[field.alias];
    if (dynamicOnChange) return record.onChangeWithDynamics(field.alias, data.value);

    return record.onChange(field.alias, data.value);
  }

  renderWorklog = (component = {}) => {
    const { record, model, form } = this.props;
    const { label_position } = form;

    const inline = label_position === 'left';

    return (
      <WorklogComponent
        key={component.id}
        label={component.params.name}
        inline={inline}
        model={model}
        record={record}
        options={component.params}
      />
    );
  }

  renderChart = (component) => {
    const { record, form } = this.props;
    const { label_position } = form;

    const inline = label_position === 'left';

    return (
      <ChartComponent
        key={component.id}
        label={component.params.name}
        inline={inline}
        record={record.attributes}
      />
    );
  }

  renderLabel = (component) => {
    return <div>{component.params.name}</div>;
  }

  renderComponentActionsBar = (model, field, style) => {
    const actions = this.props.actions.filter((a = {}) => {
      return (parseOptions(a.options).field_related === field.alias) 
        && this.context.sandbox.executeScript(a.condition_script, {
          modelId: a.model
        }, `action/${a.id}/condition_script`)
    }) 

    if (!actions.length) return null;

    return (
      <div style={style}>
        <ActionsBar
          model={model}
          record={this.props.record}
          actions={actions}
          handleAction={this.props.handleAction}
          context={'form_field'}
          buttonsAsIcons={true}
        />
      </div>
    )
  }

  renderAttachmentViewer = (record) => {
    const { options: { formId }} = this.props;

    return <AttachmentViewer formId={formId} record={record.attributes} />;
  }

  getFieldLabelContextMenuRenderer = (record, model, field) => (content) => {
    const getRecordValue = this.getRecordValue(record);

    return (
      <FieldLabelContextMenu model={model} field={field} getRecordValue={getRecordValue}>
        {content}
      </FieldLabelContextMenu>
    );
  }

  getTabLabelContextMenuRenderer = (tab) => (content) => {
    const { model, options = {} } = this.props;
    const { formId } = options;
    const type = 'components'
    const label = tab.params.name

    return (
      <TabLabelContextMenu model={model} tabId={tab.id} formId={formId} type={type} label={label}>
        {content}
      </TabLabelContextMenu>
    );
  }

  renderFieldExtraAttribute = (record, model, props) => {
    const { enabled } = this.props;
    const { extra_attributes = [] } = props.field;

    return extra_attributes.map((attribute) => {
      const { type, options } = record.getExtraFieldAttribute(attribute);
      const Component = Field.getComponent(type, { extra: true });

      return (
        <Component
          key={attribute}
          id={attribute}
          field={props.field}
          record={record}
          model={model}
          options={parseOptions(options)}
          required={record.isExtraAttributeRequired(attribute)}
          enabled={record.isExtraAttributeEnabled(attribute)}
          visible={record.isExtraAttributeVisible(attribute)}
          disabled={!enabled}
        />
      );
    });
  }

  renderField = (record, model, props, asOption) => {
    const { field, onChange } = props;
    const { metadata = {} } = record;
    const { human_attributes = {}, extra_attributes = {} } = metadata;

    const { fields, form } = this.props;

    const value = record.get(field.alias);
    const humanizedValue = human_attributes[field.alias];
    const extraAttributes = extra_attributes;
    const isFieldChanged = !!record.fieldsChanged[field.alias];
    const isValueChanged = !!record.isChanged(field.alias);
    const getRecordValue = this.getRecordValue(record);
    const setRecordValue = this.setRecordValue(record);
    const setRecordVisibleValue = this.setRecordVisibleValue(record);
    const labelContextMenuRenderer = this.getFieldLabelContextMenuRenderer(record, model, field);
    const required = record.isFieldRequired(field.alias);
    const enabled = this.props.enabled ? record.isFieldEnabled(field.alias) : false;
    const error = !!record.getErrors(field.alias).length;
    const parent = { type: 'form', alias: form.alias, id: form.id };

    const Component = Field.getComponent((field.__access || asOption) ? field.type : 'no_access');

    return (
      <Component
        {...props}
        model={model}
        fields={fields}
        value={value}
        humanizedValue={humanizedValue}
        extraAttributes={extraAttributes}
        getRecordValue={getRecordValue}
        setRecordValue={setRecordValue}
        setRecordVisibleValue={setRecordVisibleValue}
        isFieldChanged={isFieldChanged}
        isValueChanged={isValueChanged}
        onChange={onChange}
        labelContextMenuRenderer={labelContextMenuRenderer}
        required={required}
        enabled={enabled}
        parent={parent}
        error={error}
      />
    );
  }

  renderFieldWrapper = (record, model, component, asOption) => {
    const { actions, form } = this.props;
    const { params = {} } = component;
    const { label_position } = form
    const inline = label_position === 'left';

    const field = asOption ? record.getField(component.alias) : this.getField(record, component);
    if ((model.alias === 'field') && (field.alias === 'options')) return this.renderOptions(record, model);

    const options = parseOptions(field.options);
    if (!lodash.isEmpty(options.ref_model)) {
      model = getModel(options.ref_model);
      if (!model) {
        const referredField = record.getField(options.ref_model);
        if (referredField) {
          const modelName = record.get(options.ref_model) || 'model';
          model = getModel(modelName);
        }
      }

      if (!model) {
        model = { alias: options.ref_model }
      }
    }

    const props = { field, inline, onChange: this.getFieldChangeHandler(record, field) };
    const className = `field ${field.type}`;
    const style = {
      wrapper: { display: 'flex', alignItems: 'start' },
      field: { flex: 1, width: actions.length ? `calc(100% - ${actions.length * 25}px)` : '100%' },
      fieldExtra: { position: 'relative', top: (inline ? 'initial' : 23), display: 'flex' },
      actionsBar: { position: 'relative', top: (inline ? 'initial' : 23), display: 'flex', marginLeft: 5 },
    };

    if (!record.isFieldVisible(field.alias)) return null;

    assign(field, { name: params.name || field.name, placeholder: params.placeholder });

    (field.type === 'reference_to_list') && assign(props, {
      forceLoad: asOption || record.isChanged(field.alias),
      showReferenceCreator: params.show_add_button,
      onOpenReferenceCreator: this.onOpenReferenceCreator(field),
    });
    (['reference', 'global_reference'].includes(field.type)) && assign(props, {
      showRecordDetail: params.show_preview_button,
      showReferenceCreator: params.show_add_button,
      onOpenReferenceCreator: this.onOpenReferenceCreator(field),
    });
    (field.type === 'data_visual') && assign(props, {
      componentRenderer: (record, model, section) => this.renderSection(record, model, section),
    });
    (field.type === 'file') && assign(props, {
      onUpload: async (attachments) => {
        const [ attachment ] = await this.props.uploadAttachments(attachments);

        if (attachment) {
          const newAttachments = [ ...record.getRelationships('attachment'), attachment.attributes ];
          record.setRelationships('attachment', newAttachments);
          record.setCounts('attachment', newAttachments.length);
          props.onChange(null, { value: attachment.attributes.file_name });
        }
      },
      onDelete: async () => {
        const attachments = record.getRelationships('attachment');
        const attachment = find(attachments, { field: field.id });

        if (attachment) {
          if (confirm(i18n.t('file_delete_confirmation', { defaultValue: 'Are you sure? The file will be deleted' }))) {
            await PlasticineApi.deleteRecord('attachment', attachment.id, {
              embedded_to: {
                model: this.props.model.alias,
                record_id: this.props.record.id
              }
            });

            const newAttachments = filter(attachments, ({ id }) => id !== attachment.id);
            record.setRelationships('attachment', newAttachments);
            record.setCounts('attachment', newAttachments.length);
            props.onChange(null, { value: null });
          }
        }
      },
    });

    return (
      <div key={component.id} style={style.wrapper} className={className}>
        <div style={style.field}>{this.renderField(record, model, props, asOption)}</div>
        <div style={style.fieldExtra}>{this.renderFieldExtraAttribute(record, model, props)}</div>
        {this.renderComponentActionsBar(model, field, style.actionsBar)}
      </div>
    );
  }

  renderFormItemsChooser = (record) => {
    const options = parseOptions(record.get('options'))

    return (
      <FormItemsChooser
        model={record.attributes.model}
        config={options.components}
        onChange={(data = {}) => {
          const value = JSON.stringify({ ...options, components: data })
          record.onChange('options', value)
        }}
      />
    )
  }

  renderRelatedDataChooser = (record) => {
    const options = parseOptions(record.get('options'))

    return (
      <RelatedDataChooser
        model={record.attributes.model}
        record={record.attributes}
        config={options.related_components}
        onChange={(data = {}) => {
          const value = JSON.stringify({ ...options, related_components: data })
          record.onChange('options', value)
        }}
      />
    )
  }

  renderComponent = (record, model) => (component) => {
    if (!component) {
      return null;
    }

    if (component.id === '__form_items_chooser__') {
      return this.renderFormItemsChooser(record, model)
    }

    if (component.id === '__related_data_chooser__') {
      return this.renderRelatedDataChooser(record, model)
    }

    if (component.id.startsWith('__label__')) {
      return this.renderLabel(component);
    }

    if (component.id.startsWith('__worklog__')) {
      return this.renderWorklog(component);
    }

    if (component.id.startsWith('__attachment_viewer__')) {
      return this.renderAttachmentViewer(record);
    }

    if (component.id.startsWith('__section__')) {
      return this.renderSection(record, model, component);
    }

    if (component.id.startsWith('__chart__')) {
      return this.renderChart(component);
    }

    return this.renderFieldWrapper(record, model, component);
  }

  renderOptions(record, model) {
    return (
      <div>
        {map(record.metadata.options, (option) => this.renderFieldWrapper(record, model, option, true))}
      </div>
    );
  }

  renderSection(record, model, section) {
    const { form } = this.props
    const { label_position } = form
    const inlined = label_position === 'left'
    const marginLeft = inlined ? 0 : 130;
    const { params = {} } = section;
    const { expanded = true } = params;

    const opened = !!expanded;
    const elementRenderer = this.renderComponent(record, model);

    return (
      <Section
        key={section.id}
        section={section}
        opened={opened}
        inlined={inlined}
        style={{ marginLeft }}
        elementRenderer={elementRenderer}
        embeddedViewRenderer={this.renderEmbeddedView}
      />
    )
  }

  renderSections(sections) {
    const { record, model } = this.props;

    const style = { marginTop: 20, marginBottom: 20, marginLeft: 0 };

    if (sections.length === 1 && !sections[0].params.name) {
      sections[0].params.expanded = true;
    }

    return (
      <div className="form-content-sections-container" style={style}>
        {sections.map(section => this.renderSection(record, model, section))}
      </div>
    );
  }

  renderEmbeddedView = (options = {}) => {
    const { model, record, form, handleAction } = this.props;
    const parent = { type: 'form', alias: form.alias, id: form.id, name: form.name };

    if (!options.type || options.type === 'none' || !options.view) return;

    return (
      <EmbeddedView
        model={model}
        record={record}
        options={options}
        statical={true}
        handleAction={handleAction}
        parent={parent}
        type={'embedded_view'}
      />
    );
  }

  renderAttachmentsTab = (tab, i) => {
    const { model, fields, record, options, handleAction, enabled } = this.props;
    const { components, permissions } = options;
    const { hash } = window.location;

    const key = `tab-${i}`;
    const count = record.getCounts('attachment');
    const label = `${tab.params.name} (${!isUndefined(count) ? count : 0})`;
    const withCache = !some(fields, { type: 'file' });
    const labelContextMenuRenderer = this.getTabLabelContextMenuRenderer(tab);
    const syncCount = (count) => {
      record.setCounts('attachment', count);
      this.setState({ count });
    };

    return (
      <Tabs.Pane key={key} label={label} labelContextMenuRenderer={labelContextMenuRenderer}>
        <AttachmentsManager
          model={model}
          record={record}
          config={components.options.__attachments__}
          handleAction={handleAction}
          syncCount={syncCount}
          enabled={enabled}
          editable={permissions.update_attachment}
          hash={hash}
          withCache={withCache}
        />
      </Tabs.Pane>
    );
  }

  renderDashboardTab = (tab, i) => {
    const { record } = this.props;

    const label = `${tab.params.name}`;
    const changeHandler = ({ options }) => record.onChange('options', options);

    return (
      <Tabs.Pane label={label} key={`tab-${i}`}>
        <DashboardTabContainer record={record} onChange={changeHandler} />
      </Tabs.Pane>
    );
  }

  tabContainsErrors = (sections) => {
    const { record } = this.props;

    const columns = flatten(map(sections, 'columns'));
    const components = flatten(map(columns, 'components'));

    return some(components, ({ id }) => record.getErrors(id).length > 0);
  }

  renderCommonTab = (tab, i) => {
    const { id, params: { name }, sections } = tab;

    const key = `tab-${i}`;
    const error = this.tabContainsErrors(sections);
    const labelContextMenuRenderer = this.getTabLabelContextMenuRenderer(tab);

    return (
      <Tabs.Pane key={key} label={name} labelContextMenuRenderer={labelContextMenuRenderer} error={error}>
        {this.renderSections(sections, i)}
      </Tabs.Pane>
    );
  }

  renderTab = (tab, i) => {
    if (!tab) return;

    if (tab.id.startsWith('__attachments__')) return this.renderAttachmentsTab(tab, i);
    if (tab.id.startsWith('__dashboard__')) return this.renderDashboardTab(tab, i);

    return this.renderCommonTab(tab, i);
  }

  hasAttachments = () => {
    const { options: { components: { list } } } = this.props;
    return !!list.find((component) => component.startsWith('__attachments__'));
  }

  renderAttachmentHandlers = () => {
    if (!this.hasAttachments()) return;

    const { record, options, uploadAttachments } = this.props;

    const onPaste = (files) => {
      const count = record.getCounts('attachment') + files.length;
      record.setCounts('attachment', count);
      this.setState({ count });
    };

    return (
      <div>
        <AttachmentUploader onUpload={uploadAttachments} />
        <AttachmentPaster record={record} onPaste={onPaste} />
      </div>
    );
  }

  hasTabs = () => {
    const { options: { components: { list } } } = this.props;
    return !!list.find((component) => component.startsWith('__tab__'));
  }

  renderTabs = (layout) => {
    const { model, record } = this.props;

    let [ visibleTab ] = sortBy(layout, [(l) => !l.params.expanded]);
    if (!visibleTab) return;
    if (!visibleTab.params.expanded) visibleTab = layout[0];
    const indexOfVisibleTab = findIndex(layout, { id: visibleTab.id });

    return (
      <Tabs
        pointing
        storeToKey={`form/${model.alias}/${record.id}`}
        selected={indexOfVisibleTab}
      >
        {layout.map(this.renderTab)}
      </Tabs>
    );
  }

  renderContent() {
    const { options } = this.props;
    let { layout } = this.state;

    if (!options.permissions.view_attachment) {
      layout = layout.filter(({ id }) => !id.startsWith('__attachments__'));
    }

    return (layout.length > 1 || this.hasTabs())
      ? this.renderTabs(layout)
      : this.renderTab(layout[0]);
  }

  render() {
    return (
      <div className="form-content">
        {this.renderAttachmentHandlers()}
        {this.renderContent()}
      </div>
    );
  }
}
