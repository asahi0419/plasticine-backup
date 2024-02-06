import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Preview from '../../attachments-manager/preview';

export default class AttachmentViewer extends Component {
  static propTypes = {
    formId: PropTypes.number.isRequired,
    record: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = { attachment: props.record };
  }

  componentDidMount() {
    const { formId } = this.props;

    this.token = PubSub.subscribe(`attachment_viewer.${formId}.set_record`, (topic, attachment) => {
      this.setState({ attachment: attachment });
    });
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.token);
  }

  onClose = () => this.setState({ attachment: null })

  render() {
    return <Preview attachment={this.state.attachment} onClose={this.onClose} />;
  }
}
