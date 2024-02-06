import React from 'react';
import { Form, Icon } from 'semantic-ui-react';
import styled from 'styled-components';
import PubSub from 'pubsub-js';

import BaseField from './base';
import { openFileDialog, uploadFiles } from '../../../../../helpers';

const StyledInput = styled.div`
  display: flex;

  > .field {
    width: calc(100% - 25px) !important;
    margin-bottom: 0 !important;
  }

  .icon {
    width: 20px;
    margin: 0 5px;
    height: 1.5em;
    font-size: 1.5em;
    line-height: 1.5em;
    margin-top: ${({ inline }) => inline ? '0' : '23px'};
    cursor: pointer;
  }
`;

export default class FileField extends BaseField {
  componentWillMount() {
    const { field, onUpload } = this.props;

    this.selectedFileToken = PubSub.subscribe('file_selected', (_, files) => {
      const file = files.find(({ context = {} }) => context.field.id === field.id);
      if (file) uploadFiles([ file ], onUpload);
    });
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.selectedFileToken);
  }

  handleAttachFile = (e) => {
    openFileDialog({ multiple: false, context: { field: this.props.field }}, 'file_selected');
  }

  renderControls() {
    if (this.props.value) {
      return <>
      <Icon name="attach" onClick={this.handleAttachFile} link />
      <Icon name="trash" onClick={this.props.onDelete} />
      </>;
      } else {
        return <Icon name="attach" onClick={this.handleAttachFile} link />;
    }
  }

  render() {
    const { field, inline, error, enabled, value } = this.props;

    return (
      <StyledInput className='file-field' inline={inline}>
        <Form.Input
          label={this.renderLabel()}
          value={value || ''}
          key={field.id}
          id={field.id}
          disabled={true}
          inline={inline}
          error={error}
        />
        {enabled && this.renderControls()}
      </StyledInput>
    );
  }
}
