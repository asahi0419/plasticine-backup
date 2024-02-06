import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Message } from 'semantic-ui-react';
import { find, filter } from 'lodash/collection';
import { values } from 'lodash/object';
import { connect } from 'react-redux';

import Loader from '../loader';
import Modal from '../modal';
import Form from './form'
import FormPreview from './form-preview';

import { loadForm } from '../../../actions/db/load-form';
import { getErrorMessage } from '../../../actions/helpers';
import { uploadAttachments } from '../../../actions/background';
import { handleAction } from '../../../actions/view/actions';

class FormModal extends Component {
  static propTypes = {
    modelAlias: PropTypes.string.isRequired,
    recordId: PropTypes.number.isRequired,
    opened: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onContentLoaded: PropTypes.func,
    fullMode: PropTypes.bool,
    options: PropTypes.object,
    parent: PropTypes.object,
    options: PropTypes.object,
  }

  constructor(props) {
    super(props);

    this.state = {
      ready: false,
      loaded: false,
      error: null,
    };
  }

  componentDidMount() {
    this.setContent(this.props);
  }

  setContent = async (props) => {
    const { modelAlias, recordId, onContentLoaded, fullMode, parent } = props;

    try {
      this.setState({ loaded: false });

      const options = { ...(props.options || {}), exec_by: { popup: (fullMode ? 'full' : 'preview') }};
      const formProps = await loadContent(modelAlias, recordId, options);

      onContentLoaded && onContentLoaded();
      this.setState({
        ready: true,
        loaded: true,
        error: null,
        props: formProps,
      });
    } catch (error) {
      this.setState({ error: getErrorMessage(error) });
    }
  }

  handleActionSuccess = (response = {}) => {
    const { action } = response.data || {};
    this.setState({ loaded: true })

    if (['go_back', 'open_view', 'open_form', 'open_self_view', 'open_page', 'open_url'].includes(action)) {
      this.props.onClose(response);
    }
  }

  handleAction = (model, action, options) => {
    options.callbacks = options.callbacks || {};
    options.callbacks.success = this.handleActionSuccess;
    options.exec_by = options.exec_by || {};
    options.exec_by.popup = 'full';

    this.setState({ loaded: false })
    this.props.handleAction(model, action, options);
  }

  goBack = () => {
    this.props.onClose();
  }

  refresh = (e) => {
    e && e.preventDefault();
    this.setContent(this.props);
  }

  changeRecord = (e, recordId) => {
    e.preventDefault();
    this.setContent({ ...this.props, recordId });
  }

  renderContent() {
    if (!this.state.ready) return;

    const { options = {} } = this.props;
    const mode = options.popup === 'full' || !options.popup ? 'full-popup' : 'preview';

    const props = {
      ...this.state.props,
      ready: this.state.ready,
      mode,
    }

    const callbacks = {
      uploadAttachments,
      onClose: this.props.onClose,
      goBack: this.goBack,
      refresh: this.refresh,
      changeRecord: this.changeRecord,
      handleAction: this.handleAction,
    };

    if (mode === 'full-popup') {
      return <Form props={props} callbacks={callbacks} />
    }

    if (mode === 'preview') {
      return <FormPreview props={props} callbacks={callbacks} />
    }
  }

  renderLoader() {
    if (this.state.error) return;
    if (!this.state.ready) return <Loader compact={true} />;
    if (!this.state.loaded) return <Loader dimmer={true} />;
  }

  renderError() {
    if (!this.state.error) return;

    return (
      <Message negative style={{ margin: '14px 0' }} {...this.state.error} />
    );
  }

  render() {
    return (
      <Modal opened={this.props.opened} onClose={() => this.props.onClose()}>
        {this.renderContent()}
        {this.renderLoader()}
        {this.renderError()}
      </Modal>
    );
  }
}

const loadContent = (modelAlias, recordId, params) => {
  return loadForm(modelAlias, recordId, params)
    .then(({ payload: { metadata, db }, record }) => {
      const model = find(metadata.model, { alias : modelAlias });
      const form = find(metadata.form, { model: model.id });
      const fields = filter(metadata.field, { model: model.id });
      const actions = filter(metadata.action, { model: model.id });
      const uiRules = values(metadata.ui_rule);
      const extraFieldsAttributes = values(metadata.extra_fields_attribute);

      return { model, form, fields, actions, uiRules, extraFieldsAttributes, record };
    });
};

function mapStateToProps(state) {
  return {};
}

export default connect(mapStateToProps, {
  handleAction,
  uploadAttachments
})(FormModal);