import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'semantic-ui-react';

const WidgetHeaderStyled = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 45px;
  font-size: 14px;
  font-weight: bold;

  .widget-header-button {
    width: 35px;
    height: 100%;
    line-height: 45px;
    margin: 0;

    &.menu {
      margin-left: -15px;
    }

    &.remove {
      margin-right: -15px
    }
  }

  .widget-header-title {
    flex: 1;
    height: 100%;
    line-height: 45px;
    text-align: center;
    margin-right: -15px;
  }
`;

export default class WidgetHeader extends Component {
  static propTypes = {
    content: PropTypes.string.isRequired,
    onRemoveClick: PropTypes.func.isRequired,
    onSettingsClick: PropTypes.func.isRequired,
    editable: PropTypes.bool.isRequired,
  }

  renderMenuButton() {
    if (!this.props.editable) return;

    return (
      <Icon
        link
        name="ellipsis vertical"
        className="widget-header-button menu"
        onClick={this.props.onSettingsClick}
      />
    );
  }

  renderRemoveButton() {
    if (!this.props.editable) return;

    return (
      <Icon
        link
        name="remove"
        className="widget-header-button remove"
        onClick={this.props.onRemoveClick}
      />
    );
  }

  renderTitle() {
    return (
      <div className="widget-header-title">
        {this.props.content}
      </div>
    );
  }

  render() {
    return (
      <WidgetHeaderStyled className="widget-header" editable={this.props.editable}>
        {this.renderMenuButton()}
        {this.renderTitle()}
        {this.renderRemoveButton()}
      </WidgetHeaderStyled>
    );
  }
}
