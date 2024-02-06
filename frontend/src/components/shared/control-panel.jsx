import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import * as CONSTANTS from '../../constants';

const ControlPanelStyled = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  height: 30px;

  .icon {
    font-size: 1.15em !important;
    line-height: 1.1em;
    cursor: pointer;
  }

  @media only screen and (max-width: ${CONSTANTS.UI_TABLET_MAX_SIZE}px) {
    height: 32px !important;

    .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 33%;
      height: 100%;
      margin: 0;
    }
  }
`;

export default class ControlPanel extends Component {
  static propTypes = {
    style: PropTypes.object,
  }

  static defaultProps = {
    style: {},
  }

  render() {
    const { children, style } = this.props;

    return (
      <ControlPanelStyled className="control-panel" style={style}>
        {children}
      </ControlPanelStyled>
    );
  }
}
