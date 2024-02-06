import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { find, filter } from 'lodash/collection';
import { values } from 'lodash/object';
import { isEqual } from 'lodash/lang';
import qs from 'qs';

import { loadForm } from '../../../actions/db';
import { closeForm, openForm } from '../../../actions/view/form';
import { handleAction } from '../../../actions/view/actions';
import { uploadAttachments } from '../../../actions/background';
import { WithRecordSandboxComponent } from '../../hoc/with-record-sandbox';
import Provider from './provider';

const ACTION_TYPES = [
  'form_button',
  'form_menu_item',
  'context_menu',
  'form_field',
];

class FormContainer extends Component {
  static propTypes = {
    ready: PropTypes.bool.isRequired,
    location: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,

    props: PropTypes.object.isRequired,

    loadForm: PropTypes.func.isRequired,
    openForm: PropTypes.func.isRequired,
    closeForm: PropTypes.func.isRequired,
    handleAction: PropTypes.func.isRequired,
    uploadAttachments: PropTypes.func.isRequired,
  }

  shouldComponentUpdate(nextProps) {
    return !isEqual(nextProps, this.props);
  }

  componentDidMount() {
    this.openForm(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps.location, this.props.location)) {
      this.openForm(nextProps);
    }
  }

  componentWillUnmount () {
    this.props.closeForm();
  }

  openForm(props) {
    const { params: { modelAlias, recordId }, location, handleAction, openForm, loadForm } = props;
    const params = qs.parse(location.search.substring(1));
    if (location.pathname.split('/')[3] === 'new') params.new = true

    openForm(modelAlias, recordId, loadForm, params);
  }

  render() {
    const { ready, props, handleAction, uploadAttachments } = this.props;
    const callbacks = { handleAction, uploadAttachments }

    return (
      <WithRecordSandboxComponent {...props} ready={ready} callbacks={callbacks}>
        <Provider props={props} callbacks={callbacks} />
      </WithRecordSandboxComponent>
    );
  }
}

function mapStateToProps(state) {
  const { app: { user }, view: { content = {} }, db, metadata } = state;
  const { ready, params = {} } = content;
  const { recordId, variables } = params;

  const parsedId = parseInt(content.model);
  const modelAliasOrIdKey = parsedId ? 'id' : 'alias';
  const modelAliasOrId = parsedId || content.model;

  const model = find(metadata.app.model, { [modelAliasOrIdKey]: modelAliasOrId }) || {};
  const record = (db[model.alias] || {})[recordId];

  const formMetadata = metadata[`${model.alias}/form`] || {};

  const form = find(formMetadata.form, { model: model.id });
  const fields = filter(formMetadata.field, { model: model.id });
  const actions = filter(formMetadata.action, (a) => isEqual(a.model, model.id) && ACTION_TYPES.includes(a.type));
  const uiRules = values(formMetadata.ui_rule);
  const extraFieldsAttributes = values(formMetadata.extra_fields_attribute);

  const { page: formPage } = form || {};
  const page = formPage && (metadata.app.page[formPage] || formMetadata.page[formPage]);

  return {
    ready,
    props: {
      model,
      record,
      form,
      page,
      fields,
      actions,
      uiRules,
      extraFieldsAttributes,
      user,
      variables,
    },
  };
}

export default connect(mapStateToProps, { loadForm, openForm, closeForm, handleAction, uploadAttachments })(FormContainer);
