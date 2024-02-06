import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isNil } from 'lodash/lang';

import ObjectEditor from '../../../../shared/object-editor';
import * as CONSTANTS from '../../../../../constants';

export default class WorklogEditor extends Component {
  static propTypes = {
    options: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  render() {
    const options = { ...this.props.options };

    if (isNil(options.audit_text_pattern)) {
      options.audit_text_pattern = CONSTANTS.DEFAULT_AUDIT_TEXT_PATTERN;
    }

    if (isNil(options.audit_text_limit)) {
      options.audit_text_limit = CONSTANTS.DEFAULT_AUDIT_TEXT_LIMIT;
    }

    return (
      <ObjectEditor data={options} onChange={this.props.onChange}>
        <ObjectEditor.Input name="name" label="Name of control" as="text" />
        <ObjectEditor.Input name="audit_text_pattern" label="Audit text pattern" as="text" />
        <ObjectEditor.Input name="audit_text_limit" label="Audit text limit" as="text" />
      </ObjectEditor>
    );
  }
};
