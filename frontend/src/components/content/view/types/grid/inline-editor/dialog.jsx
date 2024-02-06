import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { pick } from 'lodash/object';

import { subscribeInlineEditor, unsubscribeInlineEditor } from './trigger.js';
import EditorFactory from './editor/'

export default class EditorWrapper extends Component {

  static propTypes = {
    id: PropTypes.string.isRequired,
    fields: PropTypes.array.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = { isOpened: props.isOpened };
  }

  componentDidMount() {
    this.token = subscribeInlineEditor(this.props.id, (options) => {
      this.opts = pick(options, ['x', 'y', 'width', 'record', 'column', 'value', 'onApply']);
      this.show();
    });
  }

  componentWillUnmount() {
    unsubscribeInlineEditor(this.token);
  }

  show = () => this.setState({ isOpened: true });
  hide = () => this.setState({ isOpened: false });

  render() {
    if (!this.state.isOpened) return null;
    const props = {
      x: this.opts.x,
      y: this.opts.y,
      width: this.opts.width,
      value: this.opts.value,
      record: this.opts.record,
      fields: this.props.fields,
      column: this.opts.column,
      onApply: this.opts.onApply,
      onClose: this.hide,
    };

    return EditorFactory(this.opts.column.type, props);
  }
}
