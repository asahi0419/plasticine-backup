import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Divider } from 'semantic-ui-react';
import { filter, map } from 'lodash/collection';

import { parseOptions } from '../../../helpers';

import FormBody from './body';
import Header from './header';
import RelatedViews from './related-views';
import Modals from '../../modals';
import LoaderContainer from '../../../containers/content/form/loader';

export default class Form extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    fields: PropTypes.array,
    actions: PropTypes.array,
    record: PropTypes.object.isRequired,
    mode: PropTypes.string,
    callbacks: PropTypes.shape({
      handleAction: PropTypes.func,
      uploadAttachments: PropTypes.func,
      exportForm: PropTypes.func,
      goBack: PropTypes.func,
      refresh: PropTypes.func,
      changeRecord: PropTypes.func,
    }),
  }

  static defaultProps = {
    fields: [],
    actions: [],
    worklogs: [],
    users: [],
    callbacks: {
      handleAction: () => {},
      uploadAttachments: () => {},
    }
  };

  static childContextTypes = {
    componentsCache: PropTypes.object,
    record: PropTypes.object,
  }

  constructor(props) {
    super(props);

    this.componentsCache = {};
  }

  getChildContext() {
    return {
      componentsCache: this.componentsCache,
      record: this.props.record,
    };
  }

  handleAction = (model, action, options) => {
    const { form, callbacks: { handleAction } } = this.props;
    handleAction(model, action, { ...options, exec_by: { type: 'form', alias: form.alias }});
  }

  renderHeader() {
    const { model, form, record, mode, callbacks: { exportForm, goBack, refresh, changeRecord } } = this.props;

    const callbacks = { exportForm, goBack, refresh, changeRecord, handleAction: this.handleAction };
    const actions = filter(this.props.actions, (a = {}) => {
      return a.group || [ 'form_button', 'form_menu_item', 'context_menu' ].includes(a.type);
    });

    return (
      <Header
        model={model}
        record={record}
        form={form}
        actions={actions}
        mode={mode}
        callbacks={callbacks}
        className="form-header"
      />
    );
  }

  renderBody() {
    const { model, form, fields, record, callbacks: { uploadAttachments }, children } = this.props;

    const actions = filter(this.props.actions, (a = {}) => {
      return a.group || ['form_field'].includes(a.type);
    });

    return (
      <FormBody
        model={model}
        fields={fields}
        actions={actions}
        record={record}
        form={form}
        uploadAttachments={uploadAttachments}
        handleAction={this.handleAction}
      >{children}</FormBody>
    );
  }

  renderRelatedViews() {
    const { model, record, form, callbacks: { handleAction } } = this.props;

    const { related_components = {} } = parseOptions(form.options);
    const { list = [], options = {} } = related_components;

    if (!list.length) return;

    const componentsVisible = filter(list, (component = {}) => {
      return record.isFieldVisible((component.field || {}).alias);
    });

    if (!componentsVisible.length) return;

    const components = map(componentsVisible, (component = {}, key) => {
      const componentOptions = options[component.id] || {};
      return { ...component, options: componentOptions, key };
    });
    const parent = { type: 'form', alias: form.alias, id: form.id, name: form.name };

    return (
      <RelatedViews
        model={model}
        record={record}
        components={components}
        asTabs={form.show_rel_lists_as_tabs}
        handleAction={handleAction}
        parent={parent}
      />
    );
  }

  render() {
    return (
      <div className="form">
        {this.renderHeader()}
        {this.renderBody()}
        {this.renderRelatedViews()}
      </div>
    );
  }
}
