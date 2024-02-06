import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Icon } from 'semantic-ui-react';
import moment from 'moment';

import normalize from '../../../../../../../api/normalizer';
import Worklog from '../../../../body/worklog';
import messenger from '../../../../../../../messenger';

export default class CommentModal extends Component {
  static propTypes = {
    enabled: PropTypes.bool.isRequired,
    field: PropTypes.object.isRequired,
    record: PropTypes.object.isRequired,
    model: PropTypes.object.isRequired,
    options: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = { value: '' };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleDocumentKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleDocumentKeyDown);
  }

  onChange = (e, { value }) => this.setState({ value });

  setComment = async () => {
    const { value: data } = this.state;
    const { model, record, field, onClose, options } = this.props;
    const comment = { data };

    if (!data) return;
    if (data.length > options.length) return messenger.error({ content: i18n.t('comment_for_field_cannot_be_longer_than_length', { defaultValue: 'Comment for {{field}} can\'t be longer than {{length}} characters', field: field.name, length: options.length }) });

    await record.setComment(field.alias, comment);
    onClose();
  };

  handleDocumentKeyDown = ({ keyCode }) => {
    if (keyCode === 13) this.setComment();
    if (keyCode === 27) this.props.onClose();
  }

  renderInput = () => {
    const { enabled, required, field } = this.props;
    const { value } = this.state;

    if (!required && !enabled) return;

    const label = i18n.t('put_your_comment_to_field', { defaultValue: `Put your comment to field "${field.name}"`, fieldName: field.name });
    const style = {
      wrapper: { display: 'flex', alignItems: 'flex-end', marginBottom: '1em' },
      inputWrapper: { flex: 1 },
      iconWrapper: { marginLeft: 6, width: 21, height: 32 },
      icon: { height: '100%', width: '100%', margin: 0, fontSize: '1.4em', lineHeight: '1.6em', cursor: value ? 'pointer' : 'default', opacity: value ? 1: 0.5 },
    };

    return (
      <div style={style.wrapper} className="field-extra-comments-input">
        <div style={style.inputWrapper}><Form.Input label={label} value={value} onChange={this.onChange} /></div>
        <div style={style.iconWrapper}><Icon name="paper plane" style={style.icon} onClick={this.setComment} /></div>
      </div>
    );
  }

  renderWorklog = () => {
    const { field, record, model } = this.props;
    const label = i18n.t('comments_to_field', { defaultValue: `Comments to field "${field.name}"`, fieldName: field.name });

    return (
      <Form.Field>
        <Worklog
          inline={false}
          label={label}
          record={record}
          model={model}
          options={{ field: field.id }}
        />
      </Form.Field>
    );
  }

  render() {
    return (
      <Modal mountNode={document.getElementById('root')} open={true} onClose={this.props.onClose} style={{ position: 'relative' }} size="large" closeIcon="close">
        <Modal.Content>
          <Form>
            {this.renderInput()}
            {this.renderWorklog()}
          </Form>
        </Modal.Content>
      </Modal>
    );
  }
}
