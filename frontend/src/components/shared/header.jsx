import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon, Divider } from 'semantic-ui-react';
import styled from 'styled-components';

const SectionHead = styled.div`
  .ui.divider.horizontal { padding: 7px 0; margin: 0 0 10px; }
  .ui.divider.horizontal .icon { margin-right: 0.3em; }
  .ui.divider.horizontal.align-left:after { width: 100%; }
  .ui.divider.horizontal.align-left:before { width: 0%; }
  .ui.divider.horizontal.align-right:after { width: 0%; }
  .ui.divider.horizontal.align-right:before { width: 100%; }
  .ui.divider {
    text-transform: inherit;
    font-weight: 500;
    white-space: normal;
  }
  .ui.divider span {
    flex-shrink: 0;
    max-width: 100%;
    margin-left: -20px;
    padding-left: 20px;
    text-align: left;
  }
  ${({ hasBGColor }) => hasBGColor ? '.ui.divider:after, .ui.divider:before { background: transparent !important; }' : ''};
`;

export default class extends Component {
  static propTypes = {
    name: PropTypes.string,
    background_color: PropTypes.string,
    text_color: PropTypes.string,
    align: PropTypes.string,
    opened: PropTypes.bool,
    toggleable: PropTypes.bool,
    onClick: PropTypes.func,
  }

  static defaultProps = {
    align: 'left',
    opened: true,
    toggleable: false,
  }

  renderIcon = () => {
    const { toggleable, opened, onClick } = this.props;
    const stateIcon = opened ? 'down' : 'right';

    if (!toggleable) return null;

    return (
      <Icon
        name={`triangle ${stateIcon}`}
        onClick={onClick}
        link
      />
    );
  }


  render() {
    const { name, align, text_color, background_color } = this.props;

    const style = {};
    const defaultWhite = 'rgba(255, 255, 255, 1)'
    const defaultBlack = 'rgba(0, 0, 0, 1)'

    style.backgroundColor = background_color || defaultWhite
    style.color = text_color || defaultBlack

    return(
      <SectionHead hasBGColor={style.backgroundColor !== defaultWhite} className="section-header-shared">
        <Divider horizontal className={`align-${align}`} style={style}>
          {this.renderIcon()}
          <span>{name}</span>
        </Divider>
      </SectionHead>
    );
  }
}
