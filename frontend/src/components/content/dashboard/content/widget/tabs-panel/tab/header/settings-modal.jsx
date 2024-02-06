import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Header, Divider, Form, Input, Button, Dropdown } from 'semantic-ui-react';

import Reference from '../../../../../../../shared/inputs/reference';

export default class SettingsModal extends Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    onRemoveTab: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.object.isRequired,
    removable: PropTypes.bool.isRequired,
    dataToRelate: PropTypes.array.isRequired,
  }

  static defaultProps = {
    options: {},
  }

  constructor(props) {
    super(props);

    this.state = { options: props.options, errors: [] };
  }

  isInputValid = (key) => {
    const { options } = this.state;

    const REQUIRED_OPTIONS = ['model', 'view', 'name'];
    const REQUIRED_RELATED_OPTIONS = ['tab', 'by_field'];
    options.widget && REQUIRED_RELATED_OPTIONS.forEach(option => REQUIRED_OPTIONS.push(option));

    const errors = key ? [...this.state.errors].filter(error => error !== key) : [];

    key
      ? REQUIRED_OPTIONS.includes(key) && !options[key] && errors.push(key)
      : REQUIRED_OPTIONS.forEach(key => !options[key] && errors.push(key));

    this.setState({ errors });

    return !errors.length;
  }

  handleApply = () => {
    const { onClose, onChange } = this.props;
    const { options, errors } = this.state;

    if (this.isInputValid()) {
      onClose();
      onChange(options);
    }
  }

  handleChangeInput = (key, value) => {
    const options = { ...this.state.options };

    if (key === 'model') options.view = undefined;
    if ((key === 'widget') && (value === 'none')) options.tab = options.by_field = undefined;

    options[key] = (value === 'none') ? undefined : value;

    this.setState({ options }, () => this.isInputValid(key));
  }

  handleRemoveTab = () => {
    const { onClose, onRemoveTab } = this.props;
    const isConfirmed = confirm(i18n.t('dashboard_view_widget_tab_remove_confirmation', { defaultValue: 'Tab will be completely removed. Proceed?' }));

    if (isConfirmed) {
      onClose();
      onRemoveTab();
    }
  }

  renderControls = () => {
    const { onClose, onClick, removable } = this.props;

    return (
      <div style={{ position: 'absolute', top: '18px', right: '18px'}}>
        <Button basic content={i18n.t('apply', { defaultValue: 'Apply' })} onClick={this.handleApply} />
        <Button basic content={i18n.t('cancel', { defaultValue: 'Cancel' })} onClick={onClose} />
        {removable && <Button basic content={i18n.t('delete', { defaultValue: 'Delete' })} onClick={this.handleRemoveTab} />}
      </div>
    );
  }

  renderRelatedToSection = () => {
    const { dataToRelate } = this.props;
    const { options, errors } = this.state;

    if (!dataToRelate.length) return;

    const widgets = [{ text: 'None', value: 'none' }].concat(dataToRelate.map(({ id, name }) => ({ text: name, value: id })));
    const tabs = options.widget ? dataToRelate.find(({ id }) => id === options.widget).tabs.map(({ id, options: { name } }) => ({ text: name, value: id })) : [];
    const fields = []; // waiting for dynamic widgets

    return (
      <div>
        <Header as="h3" floated="left">{i18n.t('dashboard_view_widget_tab_settings_related_to_section', { defaultValue: 'Related to' })}</Header>
        <Divider clearing />
        <Form.Select
          label={i18n.t('widget', { defaultValue: 'Widget' })}
          value={options.widget}
          options={widgets}
          onChange={(e, { value }) => this.handleChangeInput('widget', value)}
        />
        <Form.Select
          label={i18n.t('tab', { defaultValue: 'Tab' })}
          value={options.tab}
          options={tabs}
          error={errors.includes('tab')}
          onChange={(e, { value }) => this.handleChangeInput('tab', value)}
        />
        <Form.Select
          label={i18n.t('by_field', { defaultValue: 'By field' })}
          value={options.by_field}
          options={fields}
          error={errors.includes('by_field')}
          onChange={(e, { value }) => this.handleChangeInput('by_field', value)}
        />
      </div>
    );
  }

  renderBody = () => {
    const { options, errors } = this.state;

    return (
      <Form>
        <Reference
          name={i18n.t('model', { defaultValue: 'Model' })}
          value={options.model}
          config={{
            foreignModel: 'model',
            label: 'name',
            view: 'default',
            form: 'default',
          }}
          inline={false}
          error={errors.includes('model')}
          onChange={(e, { value }) => this.handleChangeInput('model', value)}
        />
        <Reference
          name={i18n.t('view', { defaultValue: 'View' })}
          value={options.view}
          config={{
            foreignModel: 'view',
            label: 'name',
            view: 'default',
            form: 'default',
            filter: `model = ${options.model}`,
          }}
          disabled={!options.model}
          inline={false}
          error={errors.includes('view')}
          onChange={(e, { value }) => this.handleChangeInput('view', value)}
        />
        <Form.Field
          control={Input}
          error={errors.includes('name')}
          label={i18n.t('dashboard_view_widget_tab_name', { defaultValue: 'Tab name' })}
          value={options.name}
          onChange={(e, { value }) => this.handleChangeInput('name', value)}
        />
        <Form.Checkbox
          label={i18n.t('active', { defaultValue: 'Active' })}
          checked={options.active}
          onChange={(e, { checked }) => this.handleChangeInput('active', checked)}
          style={{ margin: 0 }}
        />
        {this.renderRelatedToSection()}
      </Form>
    );
  }

  render() {
    const mountNode = document.getElementById('root');

    return (
      <Modal mountNode={mountNode} open={true} onClose={this.props.onClose} className="form-modal" size="large" closeIcon="close">
        <Modal.Content>
          <Header as="h2" floated="left">{i18n.t('dashboard_view_widget_tab_settings', { defaultValue: 'View tab settings' })}</Header>
          {this.renderControls()}
          <Divider clearing />
          {this.renderBody()}
        </Modal.Content>
      </Modal>
    );
  }
}
