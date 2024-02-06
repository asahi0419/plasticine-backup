import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Calendar from 'rc-calendar';
import TimePickerPanel from 'rc-time-picker/lib/Panel';
import DatePicker from 'rc-calendar/lib/Picker';
import moment from 'moment';
import styled from 'styled-components';
import 'rc-calendar/assets/index.css';
import 'rc-time-picker/assets/index.css';

import { makeUniqueID, getIsoFormat } from '../../../helpers';

const DatetimeStyled = styled.div`
  position: relative;
  display: inline-flex;

  .datetime-calendar {
    z-index: 1000;
    box-shadow: none;
    border-radius: .28rem;
  }
`;

export default class Datetime extends Component {
  static propTypes = {
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
    ]),
    onChange: PropTypes.func.isRequired,
    style: PropTypes.object,
    placeholder: PropTypes.string,
    date_only: PropTypes.bool,
    format: PropTypes.string,
  }

  constructor(props) {
    super(props);

    this.state = { id: makeUniqueID(), value: props.value, open: false };
    this.utcOffset = new Date().getTimezoneOffset();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.value || '' });
  }

  componentDidMount() {
    document.addEventListener('click', this.handleDocumentClick);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleDocumentClick);
  }

  handleInputClick = () => {
    this.setState({ open: true });
  }

  handleDocumentClick = (e) => {
    const { target = {} } = e;
    const { classList = [] } = target;
    const [ id = '' ] = classList;

    if (this.state.open === false) return;
    if (this.state.id === id) return;

    if (id.startsWith('rc-calendar-today-btn') ||
        id.startsWith('rc-calendar-clear-btn') ||
       !id.startsWith('rc-')) return this.handleOk();
  }

  handleChange = (value) => {
    this.setState({ value });
  }

  handleOk = () => {
    this.setState({ open: false }, () => this.props.onChange(this.state.value || null));
  }

  getPickerValue = () => {
    let { value = '' } = this.state;
    if (value) value = moment.utc(value).utcOffset(-this.utcOffset).format(this.props.format);
    return value;
  }

  getCalendarValue = () => {
    let { value } = this.state;
    if (value) value = moment.utc(value).utcOffset(-this.utcOffset);
    return value || null;
  }

  renderPicker = () => {
    const value = this.getPickerValue();
    const className = `${this.state.id} ant-calendar-picker-input ant-input datetime-picker`;
    const placeholder = this.props.placeholder || i18n.t('select_date', { defaultValue: 'Select the date' });

    return (
      <input
        readOnly
        tabIndex="-1"
        value={value || ''}
        className={className}
        placeholder={placeholder}
        onClick={this.handleInputClick}
      />
    );
  };

  renderTimePickerPanel = () => !this.props.date_only
    ? <TimePickerPanel defaultValue={moment('00:00:00', 'HH:mm:ss')} />
    : <div></div>

  renderCalendar = () => (
    <Calendar
      className="datetime-calendar"
      dateInputPlaceholder={i18n.t('enter_date', { defaultValue: 'Enter the date' })}
      format={getIsoFormat(this.props.format)}
      timePicker={this.props.date_only ? null : this.renderTimePickerPanel()}
      showOk={true}
      onOk={this.handleOk}
    />
  );

  render() {
    const calendar = this.renderCalendar();
    const value = this.getCalendarValue()

    return (
      <DatetimeStyled style={this.props.style} className="datetime ui input">
        <DatePicker
          calendar={calendar}
          value={value}
          onChange={this.handleChange}
          open={this.state.open}
        >{this.renderPicker}</DatePicker>
      </DatetimeStyled>
    );
  }
}
