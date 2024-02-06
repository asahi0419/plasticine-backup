import React, { Component } from 'react';
import PubSub from 'pubsub-js';
import styled from 'styled-components';
import { isPlainObject } from 'lodash/lang';
import { reject, filter } from 'lodash/collection';

import { makeUniqueID } from '../../helpers';
import Message from './message';

const StyleWrapper = styled.div`
  position: fixed;
  z-index: 10000;
  display: flex;
  justify-content: center;
  width: 100%;
  pointer-events: none;
`;

export default class NotificationPanel extends Component {
  constructor(props) {
    super(props);

    this.state = { messages: [] };
  }

  componentWillMount() {
    this.createMessagesToken = PubSub.subscribe('messages', (topic, data) => {
      const message = isPlainObject(data) ? data : { content: data };

      message.id = message.id || makeUniqueID();
      message.position = message.position || 'right';
      message.component = message.component || Message;
      message.onDismiss = (id) => {
        message.onClose && message.onClose(id);
        this.handleRemove(id);
      }

      this.setState({ messages: [ ...this.state.messages, message ] });
    });
    this.removeMessagesToken = PubSub.subscribe('messages-remove', (topic, data) => {
      const message = isPlainObject(data) ? data : { content: data };
      message.id && this.handleRemove(message.id);
    });
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.createMessagesToken);
    PubSub.unsubscribe(this.removeMessagesToken);
  }

  handleRemove = (id) => {
    setTimeout(() => this.setState({ messages: reject(this.state.messages, { id }) }));
  }

  renderItem = (message = {}, i) => {
    return <message.component key={i} {...message} />;
  }

  render() {
    const lMessages = filter(this.state.messages, { position: 'left' });
    const cMessages = filter(this.state.messages, { position: 'center' });
    const rMessages = filter(this.state.messages, { position: 'right' });

    return (
      <StyleWrapper className="notification-panel">
        <div style={{ position: 'absolute', left: 0 }}>{lMessages.map(this.renderItem)}</div>
        <div>{cMessages.map(this.renderItem)}</div>
        <div style={{ position: 'absolute', right: 0 }}>{rMessages.map(this.renderItem)}</div>
      </StyleWrapper>
    );
  }
}
