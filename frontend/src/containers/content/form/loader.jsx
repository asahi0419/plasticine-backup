import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Loader from '../../../components/shared/loader';


class LoaderContainer extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
  }

  render() {
    if (!this.props.visible) return null;

    return <Loader dimmer={true} />;
  }
}

function mapStateToProps(state) {
  const { view = {} } = state;
  const { content = {} } = view;

  return { visible: !content.ready };
}

export default connect(mapStateToProps, {})(LoaderContainer);
