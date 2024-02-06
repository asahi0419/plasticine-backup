import React from 'react';
import styled from 'styled-components';
import { Icon } from 'semantic-ui-react';

import IconShared from '../../../shared/icon';

const ControlsStyled = styled.div`
  .view-map-control-button {
    width: 29px;
    height: 29px;
    margin-top: 6px;
    font-size: 20px;
    line-height: 29px;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, .1);
    border-radius: 4px;
    cursor: pointer;

    &:first-child {
      margin-top: 0;
    }

    i {
      position: relative;
      left: 6px;
      top: -2px;
      font-size: 14px;

      &.caret {
        font-size: 20px;
        left: 4px;
        top: 0px;

        &.left {
          left: 1px;
        }
      }
    }
  }
`;

export default class ConfigsControls extends React.Component {
  renderControl = (props = {}) => {
    if (props.hidden) return;

    const style = {};
    const onClick = props.disabled ? null : props.onClick;
    const classNames = ['view-map-control-button'];

    if (props.active) {
      classNames.push('active');
    }

    if (props.disabled) {
      style.cursor = 'default';
      classNames.push('disabled');
    }

    return (
      <div
        style={style}
        onClick={onClick}
        className={classNames.join(' ')}
        title={props.title}
      >{props.icon}</div>
    )
  }

  render() {
    const { draw, configs, actions } = this.props; 
    
    return (
      <ControlsStyled className="view-map-control configs">
        
        {this.renderControl({
          icon: <Icon name={configs.fullScreen ? 'compress' : `expand arrows alternate`} />,
          title: configs.fullScreen ? i18n.t('exit_fullscreen', { defaultValue: 'Exit Fullscreen' }) : i18n.t('view_fullscreen', { defaultValue: 'View Fullscreen' }),
          onClick: actions.onFullScreenClick,
        })}
        {this.renderControl({
          icon: <Icon name={configs.legendShow ? `caret left` : 'caret right'} />,
          title: configs.legendShow ? i18n.t('hide_panel', { defaultValue: 'Hide panel' }) : i18n.t('show_panel', { defaultValue: 'Show panel' }),
          onClick: actions.onToggleClick,
        })}
      </ControlsStyled>
    );
  }
};
