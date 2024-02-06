import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';
import styled from 'styled-components';

const CreatorStyled = styled.div`
  position: relative;
  display: inline-block;
  height: 100%;
  width: 100%;

  .icon {
    height: 100%;
    width: 100%;
    margin: 0;
    font-size: 1.7em;
    line-height: 1.5em;
    cursor: pointer;
  }
`;

export default class Creator extends Component {
  static propTypes = {
    onClick: PropTypes.func.isRequired,
  }

  render() {
    return (
      <CreatorStyled className="record-creator">
        <Icon name="plus square outline" onClick={this.props.onClick} />
      </CreatorStyled>
    );
  }
}
