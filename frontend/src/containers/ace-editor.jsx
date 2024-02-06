import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { find } from 'lodash/collection';

import AceEditor from '../components/shared/ace-editor';

class AceEditorContainer extends Component {
  render() {
    return <AceEditor {...this.props} />;
  }
}

const mapStateToProps = (state) => {
  const { themes, theme } = state.app.settings;
  const { codeEditorTheme } = find(themes, { alias: theme }) || {};

  return { theme: codeEditorTheme };
};

export default connect(mapStateToProps)(AceEditorContainer);
