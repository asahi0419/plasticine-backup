import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Message } from 'semantic-ui-react'
import styled from 'styled-components';

import * as CONSTANTS from '../../constants';

const MessageStyled = styled(Message)`
  width: 350px;
  margin: 15px !important;
  padding: 12px 28px 12px 14px !important;
  pointer-events: all;

  @media only screen and (max-width: ${CONSTANTS.UI_TABLET_MAX_SIZE}px) {
    width: auto;
  }
`;

export default class MessageItem extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['positive', 'negative', 'info', 'warning']),
    header: PropTypes.string,
    content: PropTypes.string,
    list: PropTypes.array,
    ttl: PropTypes.number,
    onDismiss: PropTypes.func.isRequired,
  }

  static defaultProps = {
    type: 'info',
    ttl: 5000,
  }

  componentWillMount() {
    const { id, header, onDismiss, ttl } = this.props;
    this.ttlInterval = setInterval(() => this.handleDismiss(id), ttl);
  }

  handleDismiss = () => {
    const { id, onDismiss } = this.props;
    clearTimeout(this.ttlInterval);
    onDismiss(id);
  }

  render() {
    const { type, header, content, list } = this.props;

    const props = { [type]: true };
    if (header) props.header = header;
    if (content) props.content = content;
    if (list) props.list = list;

    return <MessageStyled {...props} onDismiss={this.handleDismiss} />;
  }
}
