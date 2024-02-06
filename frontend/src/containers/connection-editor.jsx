import React, { Component } from 'react';
import { connect } from 'react-redux';
import { find } from 'lodash/collection';

import ConnectionEditor from '../components/shared/connection';
import {uploadAttachments} from "../actions/background";

class ConnectionContainer extends Component {
  render() {
    return <ConnectionEditor {...this.props} />;
  }
}

const mapStateToProps = (state) => {
  const { themes, theme } = state.app.settings;
  const { codeEditorTheme } = find(themes, { alias: theme }) || {};

  return { theme: codeEditorTheme };
};

export default connect(mapStateToProps, { uploadAttachments })(ConnectionContainer);
