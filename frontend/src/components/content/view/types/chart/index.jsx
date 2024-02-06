import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash/lang';

import * as HELPERS from '../../../../../helpers';

import Chart from '../../../../shared/chart';

export default class ViewChart extends Component {
  static propTypes = {
    props: PropTypes.shape({
      model: PropTypes.object.isRequired,
      fields: PropTypes.array.isRequired,
      actions: PropTypes.array.isRequired,
      view: PropTypes.object.isRequired,
      error: PropTypes.object,
      scope: PropTypes.object.isRequired,
      builder: PropTypes.string.isRequired,
      viewOptions: PropTypes.object.isRequired,
    }),
  };

  constructor(props) {
    super(props);

    this.state = {
      scope: props.props.scope,
      height: this.getHeight(),
    };
  }

  componentDidMount = async () => {
    window.addEventListener('resize', this.onWindowResize);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.children) return;

    if (!isEqual(this.props.props.scope, nextProps.props.scope)) {
      this.setState({ scope: nextProps.props.scope });
    }
  }

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.onWindowResize);
  }

  handleError = (error) => {
    const name = `Client script: ${error.stack.slice(0, error.stack.indexOf(':'))}`;
    const description = error.message;

    this.setState({ error: { name, description } });
  }

  getHeight = () => {
    return HELPERS.isTablet() ? window.innerHeight - 255 : 500;
  }

  onWindowResize = () => {
    this.setState({ height: this.getHeight() });
  }

  renderChart() {
    const { builder, version } = this.props.props;
    const { scope } = this.state;

    const error = this.props.props.error || this.state.error;
    const style = { position: 'relative', height: 'calc(100% - 52px)' };

    return (
      <div style={style}>
        <Chart
          error={error}
          scope={scope}
          builder={builder}
          version={version}
          handleError={this.handleError}
        />
        {this.props.children}
      </div>
    );
  }

  render() {
    const className = 'view-chart';
    const style = { height: this.state.height };

    return (
      <div className={className} style={style}>
        {this.renderChart()}
      </div>
    );
  }
}
