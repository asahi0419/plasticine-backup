import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Progress } from 'semantic-ui-react';
import styled from 'styled-components';
import PubSub from 'pubsub-js';
import { sum } from 'lodash/math';

const StyledProgress = styled(Progress)`
  position: absolute !important;
  top: 0;
  left: 0;
  z-index: 10000;
  width: 100%;
  margin: 0 !important;

  .bar {
    border-radius: 0 !important;
    height: 4px !important;
  }
`;

export default class Background extends Component {
  constructor(props) {
    super(props);
    this.state = { progress: {} };
  }

  componentWillMount() {
    this.token = PubSub.subscribe('background.progress.uploading', (topic, data) => {
      this.setState({ progress: { ...this.state.progress, [data.key] : data.progress }});
    });
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.token);
  }

  render() {
    if (!this.props.active) return null;

    return (
      <StyledProgress
        percent={sum(Object.values(this.state.progress))}
        size='tiny'
        color='yellow'
        active
      />
    );
  }
}
