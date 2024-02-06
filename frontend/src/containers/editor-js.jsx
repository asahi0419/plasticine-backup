import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { find } from 'lodash/collection';

import EditorJS from '../components/shared/editor-js';
import {uploadAttachments} from "../actions/background";

class EditorJSContainer extends Component {
  render() {
    return <EditorJS {...this.props} />;
  }
}

const mapStateToProps = (state) => {
  const { themes, theme } = state.app.settings;
  const { codeEditorTheme } = find(themes, { alias: theme }) || {};

  return { theme: codeEditorTheme };
};

export default connect(mapStateToProps, { uploadAttachments })(EditorJSContainer);
