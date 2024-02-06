import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

export default function(ComposedComponent) {
  class Embedder extends Component {
    static propTypes = {
      embedded: PropTypes.bool.isRequired,
    }

    render() {
      return <ComposedComponent {...this.props} />;
    }
  }

  function mapStateToProps(state) {
    return {
      embedded: state.app.embedded,
    };
  }

  return connect(mapStateToProps)(Embedder);
}
