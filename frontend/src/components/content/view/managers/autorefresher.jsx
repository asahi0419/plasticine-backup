import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash/lang';

import { makeUniqueID } from '../../../../helpers';

export default class AutorefresherManager extends Component {
  static propTypes = {
    withAutorefresh: PropTypes.shape({
      options: PropTypes.array.isRequired,
      enabled: PropTypes.bool.isRequired,
      rate: PropTypes.number.isRequired,
    }),

    callbacks: PropTypes.shape({
      updateView: PropTypes.func.isRequired,
    }),
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.configs.withAutorefresh.rate, nextProps.configs.withAutorefresh.rate)) {
      this.clearExecuteInterval();
      this.setExecuteInterval(nextProps);
    }
  }

  componentWillMount() {
    this.setExecuteInterval(this.props);
  }

  componentWillUnmount() {
    this.clearExecuteInterval();
  }

  setExecuteInterval = (props) => {
    const { withAutorefresh = {} } = props.configs;
    const { updateView } = props.callbacks;

    if (!withAutorefresh.enabled) return;
    if (!withAutorefresh.rate) return;

    this.execute = setInterval(() => {
      updateView({ autorefresh: { refreshId: `#${makeUniqueID()}` } });
    }, withAutorefresh.rate);
  }

  clearExecuteInterval = () => {
    clearTimeout(this.execute);
  }

  render() {
    const { withAutorefresh = {} } = this.props.configs;

    if (!withAutorefresh.enabled) return null;
    if (!withAutorefresh.rate) return null;

    return (
      <div className="view-manager autorefresher" style={{ display: 'none' }}></div>
    );
  }
}
