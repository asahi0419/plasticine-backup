import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Divider } from 'semantic-ui-react';

import FormBody from '../../content/form/body/index';
import FormHeader from '../../content/form/header';
import { downloadView } from '../../../helpers';
import { WithRecordSandboxComponent } from '../../../containers/hoc/with-record-sandbox';

export default class FormPreview extends Component {
  static propTypes = {
    props: PropTypes.shape({
      model: PropTypes.object.isRequired,
      record: PropTypes.object.isRequired,
      form: PropTypes.object.isRequired,
      fields: PropTypes.array.isRequired,
      mode: PropTypes.string.isRequired,
    }),
    callbacks: PropTypes.shape({
      goBack: PropTypes.func,
      refresh: PropTypes.func,
      changeRecord: PropTypes.func,
    })
  }

  exportForm = (options) => {
    const { props: { model, record } } = this.props;
    const params = { filter: `id = ${record.id}` };

    downloadView(model.alias, options.format, params);
  }

  render() {
    const props = this.props.props;
    const callbacks = { ...this.props.callbacks, exportForm: this.exportForm };

    return (
      <WithRecordSandboxComponent {...props} ready={true} callbacks={callbacks}>
        <FormPreviewBody props={props} callbacks={callbacks} />
      </WithRecordSandboxComponent>
    );
  }
}

class FormPreviewBody extends Component {
  static propTypes = {
    props: PropTypes.shape({
      model: PropTypes.object.isRequired,
      record: PropTypes.object.isRequired,
      form: PropTypes.object.isRequired,
      fields: PropTypes.array.isRequired,
      mode: PropTypes.string.isRequired,
    }),
    callbacks: PropTypes.shape({
      goBack: PropTypes.func,
      refresh: PropTypes.func,
      changeRecord: PropTypes.func,
      exportForm: PropTypes.func,
    }),
  }

  static childContextTypes = {
    componentsCache: PropTypes.object,
  }

  static contextTypes = {
    record: PropTypes.object.isRequired,
  }

  getChildContext() {
    return { componentsCache: {} };
  }

  render() {
    const { props, callbacks } = this.props;
    const { record } = this.context;

    const { model, form, fields, actions, mode } = props;

    return (
      <div>
        <FormHeader
          record={record}
          model={model}
          actions={actions}
          form={form}
          callbacks={callbacks}
          mode={mode}
        />
        <Divider clearing fitted />
        <FormBody
          record={record}
          model={model}
          fields={fields}
          form={form}
          enabled={false}
        />
      </div>
    );
  }
}
