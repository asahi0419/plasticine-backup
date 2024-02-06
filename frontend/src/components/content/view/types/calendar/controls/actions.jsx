import React from 'react';
import styled from 'styled-components';
import { Icon } from 'semantic-ui-react';

const ControlsStyled = styled.div`
  .view-calendar-control-button {
    height: 29px;
    line-height: 29px;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, .1);
    cursor: pointer;

    &.active {
      background-color: lightgrey;
    }

    &.disabled {
      opacity: 0.5;
    }

    &:hover:not(.disabled) {
      background-color: lightgrey;
    }

    &.icon {
      width: 29px;
      margin-left: 0;
      border-radius: 4px;
    }

    &.left-btn {
      margin-left: 6px;
      border-radius: 4px 0px 0px 4px;
    }

    &.right-btn {
      border-radius: 0px 4px 4px 0px;
    }

    &.btn-margin {
      padding-left: 10px;
      padding-right: 10px;
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

export default class ActionControls extends React.Component {
  renderControl = (props = {}) => {
    if (props.hidden) return;

    const style = {};
    const onClick = props.disabled ? null : props.onClick;
    const classNames = ['view-calendar-control-button'];
    const addClasses = ` ${props.addClasses}` || '';
    const iconOrTitle = props.icon || props.title;

    if (props.active) {
      classNames.push('active');
    }

    if (props.disabled) {
      style.cursor = 'default';
      classNames.push('disabled');
    }

    if (!props.icon) {
      classNames.push('btn-margin');
    }
    return (
      <div
        style={style}
        onClick={onClick}
        className={classNames.join(' ') + addClasses}
        title={props.title}
      >{iconOrTitle}</div>
    )
  }

  render() {
    const { configs, actions, viewType, loading } = this.props;

    return (
      <ControlsStyled className="view-calendar-control">
        <div className="actions">
          {this.renderControl({
            icon: <Icon name={configs.legendShow ? `caret left` : 'caret right'} />,
            title: configs.legendShow ? i18n.t('hide_panel', { defaultValue: 'Hide panel' }) : i18n.t('show_panel', { defaultValue: 'Show panel' }),
            onClick: actions.onToggleClick,
            addClasses: 'icon',
            disabled: loading,
          })}
          {this.renderControl({
            title: i18n.t('today', { defaultValue: 'Today' }),
            onClick: actions.onTodayClick,
            addClasses: 'left-btn',
            disabled: loading,
          })}
          {this.renderControl({
            title: i18n.t('previous', { defaultValue: 'Previous' }),
            onClick: actions.onPreviousClick,
            addClasses: 'center-btn',
            disabled: loading,
          })}
          {this.renderControl({
            title: i18n.t('next', { defaultValue: 'Next' }),
            onClick: actions.onNextClick,
            addClasses: 'right-btn',
            disabled: loading,
          })}
        </div>
        <div className="actions-right">
          {this.renderControl({
            title: i18n.t('month', { defaultValue: 'Month' }),
            onClick: actions.onMonthClick,
            addClasses: 'left-btn',
            active: viewType === 'month',
            disabled: loading,
          })}
          {this.renderControl({
            title: i18n.t('week', { defaultValue: 'Week' }),
            onClick: actions.onWeekClick,
            addClasses: 'center-btn',
            active: viewType === 'week',
            disabled: loading,
          })}
          {this.renderControl({
            title: i18n.t('day', { defaultValue: 'Day' }),
            onClick: actions.onDayClick,
            addClasses: 'right-btn',
            active: viewType === 'day',
            disabled: loading,
          })}
        </div>
      </ControlsStyled>
    );
  }
};
