import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const IconStyled = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .map-line {
    position: relative;
    width: 20px;
    height: 2px;
    transform: rotate(135deg);

    &:after,
    &:before {
      display: block;
      content: '';
      position: absolute;
      z-index: 1;
      top: -1px;
      width: 4px;
      height: 4px;
      border: 1px solid;
      transform: rotate(45deg);
    }

    &:before {
      left: 0;
    }

    &:after {
      right: 0;
    }
  }
`;

export default class Icon extends React.Component {
  static propTypes = {
    name: PropTypes.string,
  }

  renderIcon = () => {
    switch (this.props.name) {
      case 'map-line':
        return <div className={this.props.name}></div>
    }
  }

  render() {
    return (
      <IconStyled className="icon-shared">
        {this.renderIcon()}
      </IconStyled>
    );
  }
}
