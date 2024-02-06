import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Grid, Image, Icon } from 'semantic-ui-react'

import { attachmentToDataURL } from '../../../../helpers';

const ItemStyled = styled.div`
  width: 100%;
  height: ${({ height }) => height}px;
  background-position: center center;
  background-image: ${({ src }) => `url('${src}')`};
  background-size: cover;
`;

export default class ImageRenderer extends Component {
  static propTypes = {
    onLoad: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired,
    attachment: PropTypes.object.isRequired,
    imageHeight: PropTypes.number,
    style: PropTypes.object,
  }

  static defaultProps = {
    style: { width: '100%' },
  }

  constructor(props) {
    super(props);

    this.state = { src: '', error: false };
  }

  componentDidMount() {
    return this.loadAttachment(this.props.attachment);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.attachment.id !== nextProps.attachment.id) {
      return this.loadAttachment(nextProps.attachment);
    }
  }

  loadAttachment = async (attachment) => {
    try {
      const src = await attachmentToDataURL(attachment);

      this.props.onLoad && this.props.onLoad();
      this.setState({ src, error: false });
    } catch (error) {
      if (this.props.onError) {
        this.props.onError();
      } else {
        this.setState({ error: true });
      }
    }
  }

  render() {
    if (this.state.error) return <Icon name="file image outline" disabled size="massive" />;
    if (!this.state.src) return null;

    const { imageHeight } = this.props;

    return (
      imageHeight
        ?
      <ItemStyled src={this.state.src} height={imageHeight} />
        :
      <Grid.Column>
        <Image src={this.state.src} style={this.props.style} />
      </Grid.Column>
    );
  }
};
