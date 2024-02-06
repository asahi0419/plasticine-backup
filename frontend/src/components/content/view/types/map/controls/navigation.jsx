import React from 'react';
import styled from 'styled-components';
import { Icon } from 'semantic-ui-react'

const ControlsStyled = styled.div`
  .view-map-control-button {
    width: 29px;
    height: 29px;
    font-size: 20px;
    line-height: 29px;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, .1);
    cursor: pointer;

    &:first-child {
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
    }

    &:last-child {
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
      margin-bottom: 6px;
    }

    i {
      position: relative;
      left: 6px;
      top: -2px;
      font-size: 14px;

      &.location {
        top: -2px;
        left: 0px;
        margin: 0px;
        width: 100%;
        height: 100%;
        font-size: 12px;
        transform: rotate(-45deg);
        transform-origin: center center;

        &::before {
          position: relative;
          top: 1px;
          left: -1px;
        }
      }
    }
  }
`;

export default class ConfigsControls extends React.Component {
  renderControl = (props) => {
    const classNames = ['view-map-control-button'];
    if (props.className) classNames.push(props.className);

    return (
      <div onClick={props.onClick} style={props.style} className={classNames.join(' ')}>
        <Icon name={props.icon} title={props.title} />
      </div>
    )
  }

  render() {
    const { configs, actions } = this.props;

    if (configs.freeze) return null;

    return (
      <ControlsStyled className="view-map-control navigation">
        {this.renderControl({
          icon: 'plus',
          title: i18n.t('zoom_in', { defaultValue: 'Zoom in' }),
          onClick: actions.onZoomIn,
        })}
        {this.renderControl({
          icon: 'minus',
          title: i18n.t('zoom_out', { defaultValue: 'Zoom out' }),
          onClick: actions.onZoomOut,
        })}
        {this.renderControl({
          icon: 'location arrow',
          title: i18n.t('rotate_reset_bearing_to_north', { defaultValue: 'Rotate\Reset bearing to north' }),
          onClick: actions.onBearing,
        })}
      </ControlsStyled>
    );
  }
};
