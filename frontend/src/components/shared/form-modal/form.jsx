import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Provider from '../../../containers/content/form/provider';
import { WithRecordSandboxComponent } from '../../../containers/hoc/with-record-sandbox';

export default class Form extends Component {
  static propTypes = {
    props: PropTypes.shape({
      model: PropTypes.object.isRequired,
      form: PropTypes.object.isRequired,
      fields: PropTypes.array.isRequired,
      actions: PropTypes.array.isRequired,
      record: PropTypes.object.isRequired,
      mode: PropTypes.string,
    }),
    callbacks: PropTypes.shape({
      uploadAttachments: PropTypes.func.isRequired,
      onClose: PropTypes.func.isRequired,
      goBack: PropTypes.func,
      refresh: PropTypes.func,
      changeRecord: PropTypes.func,
      handleAction: PropTypes.func.isRequired,
    }),
  }

  render() {
    return (
      <WithRecordSandboxComponent {...this.props.props} callbacks={this.props.callbacks}>
        <Provider
          props={this.props.props}
          callbacks={this.props.callbacks}
        />
      </WithRecordSandboxComponent>
    );
  }
}
