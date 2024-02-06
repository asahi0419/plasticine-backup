import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { compact } from 'lodash/array';

import * as CONSTANTS from '../../../../constants';

const HeaderStyled = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  padding: 12px 0;

  > .header-section {
    display: flex;
    align-items: center;
  }

  > .header-section-m {
    flex: 1;
    justify-content: center;
  }

  @media only screen and (max-width: ${CONSTANTS.UI_TABLET_MAX_SIZE}px) {
    flex-wrap: wrap;
    padding: 18px 0;

    > .header-section-l {
      flex: 1;
    }

    > .header-section-m {
      flex: initial;
      order: 3;
      width: 100%;
      margin-top: 14px;
    }
  }
`;

export default class Header extends Component {
  static propTypes = {
    configs: PropTypes.shape({
      statical: PropTypes.bool.isRequired,
    }),
    sections: PropTypes.shape({
      left: PropTypes.array.isRequired,
      middle: PropTypes.array.isRequired,
      right: PropTypes.array.isRequired,
    }),
    className: PropTypes.string,
  }

  render() {
    if (this.props.configs.statical) return null;

    return (
      <HeaderStyled className={compact([this.props.className, 'header']).join(' ')}>
        <div className="header-section header-section-l">{this.props.sections.left}</div>
        <div className="header-section header-section-m">{this.props.sections.middle}</div>
        <div className="header-section header-section-r">{this.props.sections.right}</div>
      </HeaderStyled>
    );
  }
}
