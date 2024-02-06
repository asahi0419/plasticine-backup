import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Loader, Icon } from 'semantic-ui-react'

import { getSetting } from '../../helpers';

const TICK = 100;
const TICK_LIMIT = 4000;

export default class LongAction extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    onDismiss: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      tick: 0,
    };
  }

  componentDidMount() {
    let tickElment = document.getElementById('tick');
    let tick = 0;
    let delay = (1000 / 10);
    let now, before = new Date();

    this.tickInterval = setInterval(() => {
      now = new Date();

      let elapsedTime = (now.getTime() - before.getTime());
      if (elapsedTime > delay) {
        tick = tick + Math.floor(elapsedTime / delay);
      } else {
        tick = tick + 1;
      }
      tickElment.innerHTML = `${(tick / 10).toFixed(1)}s`;
      this.setState({ tick });

      before = new Date();
    }, delay);
  }

  componentWillUnmount() {
    clearInterval(this.tickInterval);
  }

  handleDismiss = () => {
    const { id, onDismiss } = this.props;
    onDismiss(id);
  }

  renderDismissIcon() {
    if (this.state.tick < (getSetting('timeout.action') / TICK)) return;

    const title = i18n.t('stop_waiting_response', { defaultValue: 'Stop waiting response' });
    const style = {
      margin: 0,
      lineHeight: '16px',
      color: '#7d6555',
      cursor: 'pointer',
    };

    return (
      <Icon
        name="remove"
        title={title}
        style={style}
        onClick={this.handleDismiss}
      />
    );
  }

  render() {
    const styles = {
      wrapper: {
        display: (this.state.tick > (TICK_LIMIT / TICK)) ? 'flex' : 'none',
        alignItems: 'center',
        padding: '6px',
        margin: '10px',
        borderRadius: '5px',
        backgroundColor: '#f1e2d3',
        color: '#563926',
        pointerEvents: 'all',
      },
    }

    const content = i18n.t('still_working', { defaultValue: 'Still working..' });

    return (
      <div style={styles.wrapper}>
        <Loader style={{ margin: '0 8px 0 4px' }} active inline size="tiny" />
        <span style={{ marginRight: '5px' }}>{content}</span>
        <span style={{ marginRight: '5px' }} id="tick"></span>
        {this.renderDismissIcon()}
      </div>
    );
  }
}
