import React, { Component } from 'react';
import { connect } from 'react-redux';
import { find } from 'lodash/collection';

import ErrorConnectionEditor from '../components/shared/connection/error-connection';
import {uploadAttachments} from "../actions/background";

class ErrorConnectionContainer extends Component {
  render() {
    return <ErrorConnectionEditor {...this.props} />;
  }
}

const mapStateToProps = (state) => {
  const { themes, theme } = state.app.settings;
  const { codeEditorTheme } = find(themes, { alias: theme }) || {};

  return { theme: codeEditorTheme };
};

export default connect(mapStateToProps, { uploadAttachments })(ErrorConnectionContainer);
