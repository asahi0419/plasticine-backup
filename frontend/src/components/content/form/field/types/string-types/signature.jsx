import React, { Component } from 'react';
import { Form, Modal, Button, Icon, Image } from 'semantic-ui-react';
import styled from 'styled-components';

import { validateSignature, getImageDimensions } from '../../../../../../helpers';
import WatermarkWrapper from '../../../../../shared/watermark-wrapper';

const StyledSignature = styled.div`
  .ui.button.red {
    background-color: #db2828!important;
    color: #fff!important;
  }
  .ui.button.red:hover {
    background-color: #d01919!important;
  }
  .ui.button.lightgrey {
    background-color: #f2f2f2!important;
    color: #00000099!important;
    text-decoration: underline;
    i.icon {
      text-decoration: none;
    }
  }
  .ui.button.lightgrey:hover {
    background-color: #cacbcd!important;
  }
`;

export default class StringSignatureField extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
    };
    this.dimensions = { width: 200, height: 400 };
  }

  async componentDidMount() {
    // const { value } = this.props;
    // if (!lodash.isEmpty(value)) {
    //   const img = validateSignature(value);
    //   if (img) {
    //     this.dimensions = await getImageDimensions(img);
    //   }
    // }
  }

  setOpen(newState) {
    this.setState({open: newState});
  }

  render() {
    const { inline, value, label } = this.props;
    let status = 'Unsigned';
    let img = '';
    if (!lodash.isEmpty(value)) {
      img = validateSignature(value);
      status = img ? 'Signed' : 'Error';
    }
    const iconName = status == 'Error' ? 'warning' : 'signup';
    const colors = {
      Unsigned: 'grey',
      Signed: 'lightgrey',
      Error: 'red'
    };
    const currentColor = colors[status];

    return (
      <StyledSignature>
        <Form.Field inline={inline}>
          {label}
          <Modal
            className='signature-modal'
            style={{width: `${this.dimensions.width + 24}px`}}
            closeIcon
            onClose={() => this.setOpen(false)}
            onOpen={() => this.setOpen(true)}
            open={this.state.open}
            trigger={<Button className={currentColor} disabled={ status != 'Signed' }><Icon name={iconName}/> {status}</Button>}
          >
            <Modal.Content image style={{padding: '0.28rem'}}>
              <WatermarkWrapper dimensions={this.dimensions}>
                <Image size='medium' src={ img }
                  width={`${this.dimensions.width}px`}
                  height={`${this.dimensions.height}px`}
                />
              </WatermarkWrapper>
            </Modal.Content>
          </Modal>
        </Form.Field>
      </StyledSignature>
    );
  }
}