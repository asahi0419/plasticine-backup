import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Header, Divider, Form, Input, Button } from 'semantic-ui-react';
import styled from 'styled-components';

export default class SettingsModal extends Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = { options: props.options, errors: [] };
  }

  isInputValid = () => {
    const errors = [];

    if (!this.state.options.name) errors.push('name');

    this.setState({ errors });

    return !errors.length;
  }

  handleApply = () => {
    const { onClose, onChange } = this.props;
    const { options, errors } = this.state;

    if (this.isInputValid()) {
      Object.keys(options).forEach(key => onChange(key, options[key]));
      onClose();
    }
  }

  handleChangeInput = (key, value) => this.setState({ options: { ...this.state.options, [key]: value } }, this.isInputValid);

  renderControls = () => {
    return (
      <div style={{ position: 'absolute', top: '18px', right: '18px'}}>
        <Button basic content={i18n.t('apply_changes_on_dashboard', { defaultValue: 'Apply' })} onClick={this.handleApply} />
        <Button basic content={i18n.t('cancel_changes_on_dashboard', { defaultValue: 'Cancel' })} onClick={this.props.onClose} />
      </div>
    );
  }

  renderBody = () => {
    const { errors } = this.state;

    return (
      <Form>
        <Form.Field
          control={Input}
          error={errors.includes('name')}
          label={i18n.t('dashboard_view_widget_name', { defaultValue: 'Widget name' })}
          value={this.state.options.name}
          onChange={(e, { value }) => this.handleChangeInput('name', value)}
        />
      </Form>
    );
  }

  render() {
    const mountNode = document.getElementById('root');

    return (
      <Modal mountNode={mountNode} open={true} onClose={this.props.onClose} className="form-modal" size="large" closeIcon="close">
        <Modal.Content>
          <Header as="h2" floated="left">{i18n.t('dashboard_view_widget_settings', { defaultValue: 'View widget settings' })}</Header>
          {this.renderControls()}
          <Divider clearing />
          {this.renderBody()}
        </Modal.Content>
      </Modal>
    );
  }
}
