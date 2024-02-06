import React from 'react';
import styled from 'styled-components';
import { Icon } from 'semantic-ui-react';

import IconShared from '../../../../../shared/icon';

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

    const style = props.style || {};
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
          icon: <Icon name="home" />,
          title: i18n.t('reset_view', { defaultValue: 'Reset view' }),
          onClick: actions.onHomeClick,
          hidden: configs.freeze,
        })}
        {this.renderControl({
          icon: <Icon name="expand" />,
          title: i18n.t('zoom_area', { defaultValue: 'Zoom area' }),
          onClick: actions.onZoomAreaClick,
          active: configs.zoomArea,
          hidden: configs.freeze,
        })}
        {this.renderControl({
          icon: <Icon name={configs.fullScreen ? 'compress' : `expand arrows alternate`} />,
          title: configs.fullScreen ? i18n.t('exit_fullscreen', { defaultValue: 'Exit Fullscreen' }) : i18n.t('view_fullscreen', { defaultValue: 'View Fullscreen' }),
          onClick: actions.onFullScreenClick,
        })}
        {this.renderControl({
          icon: <Icon name={configs.source === 'osmbuildings' ? 'map outline' : `building outline`} />,
          title: configs.source === 'osmbuildings' ? i18n.t('2d_view', { defaultValue: '2D View' }) : i18n.t('3d_view', { defaultValue: '3D View' }),
          onClick: () => actions.onSourceClick(configs.source === 'osmbuildings' ? 'osm-tiles' : 'osmbuildings'),
          hidden: configs.freeze,
        })}
        {this.renderControl({
          icon: <Icon name="map marker alternate" />,
          title: i18n.t('draw_point', { defaultValue: 'Draw Point' }),
          onClick: () => actions.onDrawModeChange(draw.mode === 'point' ? null : 'point'),
          active: draw.mode === 'point',
          hidden: !draw.enable,
        })}
        {this.renderControl({
          icon: <IconShared name="map-line" />,
          title: i18n.t('draw_line', { defaultValue: 'Draw Line' }),
          onClick: () => actions.onDrawModeChange(draw.mode === 'lineString' ? null : 'lineString'),
          active: draw.mode === 'lineString',
          hidden: !draw.enable,
        })}
        {this.renderControl({
          icon: <Icon name="edit" />,
          title: i18n.t('transform_selected', { defaultValue: 'Transform selected' }),
          onClick: () => actions.onDrawModeChange(draw.mode === 'transform' ? null : 'transform'),
          disabled: !draw.selection.length || ((draw.selection.length === 1) && (lodash.first(draw.selection).geometry.type === 'Point')),
          active: draw.mode === 'transform',
          hidden: !draw.enable,
          style: { fontSize: '18px', padding: '0 1px' },
        })}
        {this.renderControl({
          icon: <Icon name="trash alternate outline" />,
          title: i18n.t('delete_selected', { defaultValue: 'Delete selected' }),
          onClick: () => actions.onDeleteSelectedClick(draw.selection),
          disabled: !draw.selection.length,
          hidden: !draw.enable,
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
