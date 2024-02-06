import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'semantic-ui-react';
import { isEmpty } from 'lodash/lang';

import { parseOptions } from '../../../../helpers';

import Content from './content';

export default class FormBody extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    fields: PropTypes.array.isRequired,
    actions: PropTypes.array,
    record: PropTypes.object.isRequired,
    uploadAttachments: PropTypes.func,
    handleAction: PropTypes.func,
    enabled: PropTypes.bool,
  }

  static defaultProps = {
    uploadAttachments: () => {},
    handleAction: () => {},
    enabled: true,
  };

  shouldComponentUpdate(nextProps) {
    if (isEmpty(nextProps.record.attributes)) return false;

    return true;
  }

  render() {
    const { form, fields, actions, model, uploadAttachments, handleAction, enabled, record } = this.props;
    const formOptions = parseOptions(form.options);
    formOptions.formId = form.id;
    formOptions.components = formOptions.components || { list: [], options: {}};
    formOptions.permissions = form.__permissions;

    const options = formOptions.components.list.length
      ? formOptions
      : {
        ...formOptions,
        components: { ...formOptions.components, list: fields.map(({ alias }) => alias) },
      };

    return (
      <Form className="form-body" style={{ position: 'relative' }}>
        <Content
          model={model}
          record={record}
          fields={fields}
          form={form}
          actions={actions}
          options={options}
          uploadAttachments={uploadAttachments}
          handleAction={handleAction}
          enabled={enabled}
        />
        {this.props.children}
      </Form>
    );
  }
}
