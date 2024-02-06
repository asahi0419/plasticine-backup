import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { Icon } from 'semantic-ui-react';
import styled from 'styled-components';

import * as CONSTANTS from '../../constants';

const IconButtonStyled = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  font-family: Icons;
  font-size: 20px;
  cursor: pointer;

  .icon {
    margin: 0;
  }

  @media only screen and (max-width: ${CONSTANTS.UI_TABLET_MAX_SIZE}px) {
    border-radius: 4px;
  }
`;

export default class IconButton extends React.Component {
  static propTypes = {
    icon: PropTypes.string,
    link: PropTypes.string,
    style: PropTypes.object,
    title: PropTypes.string,
    className: PropTypes.string,
    onClick: PropTypes.func,
  }

  static defaultProps = {
    style: {},
    onClick: () => null,
  }

  render() {
    const { link, icon, style, title, onClick, className } = this.props;

    const classNames = ['icon-button'];
    if (className) classNames.push(className);

    return (
      <IconButtonStyled className={classNames.join(' ')} title={title} style={style} onClick={onClick}>
        <Link to={link}><Icon name={icon} /></Link>
      </IconButtonStyled>
    );
  }
}
