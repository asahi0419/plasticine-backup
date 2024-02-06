import React from 'react';
import PropTypes from 'prop-types';
import DateTime from './datetime';
import DropDown from './dropdown';
import styled from 'styled-components';
import DatePicker from 'rc-calendar/lib/Picker';
import { Icon } from 'semantic-ui-react';
import { DATE_INTERVALS } from '../../../constants';

const DatePickerStyled = styled.div`
  position: relative;
  display: inline-flex;

  .datetime-calendar {
    z-index: 1000;
    box-shadow: none;
    border-radius: .28rem;
  }
`;

const optionsDropDown = DATE_INTERVALS.map((value) => ({ key: value, value: value, text: value }));

export default class DatetimeDropdown extends DateTime {
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

		let pickerValue;
		if (!DATE_INTERVALS.includes(this.state.value)) pickerValue = this.state.value;
    this.state.pickerValue = pickerValue;
  }

  handleDocumentClick = (e) => {
    const { target = {} } = e;
    const { classList = [] } = target;
    const [ id = '' ] = classList;

    if (this.state.open === false) return;
    if (this.state.id === id) return;
    if (target.id === this.state.id + '-calendar') return;

    if (id.startsWith('rc-calendar-today-btn') ||
        id.startsWith('rc-calendar-clear-btn') ||
       !id.startsWith('rc-')) return this.handleOk();
	}

	handlePickerChange = (value) => {
    this.setState({ pickerValue: value });
	}

	handleOk = () => {
    this.setState({ open: false, value: this.getPickerValue(true) }, () => this.props.onChange(this.state.value || null));
	}

	handleDropDownChange = (value) => {
		this.setState({ value, pickerValue: undefined }, () => this.props.onChange(this.state.value || null));
	}

	getValue = () => {
		let { value } = this.state;
		if (value && !DATE_INTERVALS.includes(value)) {
			value = moment.utc(value).utcOffset(-this.utcOffset).format(this.props.format);
		}
    return value;
	}

	getPickerValue = (formatted = false) => {
		let { pickerValue } = this.state;
		if (pickerValue === '') pickerValue = undefined;
		if (pickerValue) pickerValue = moment.utc(pickerValue).utcOffset(-this.utcOffset);
		if (pickerValue && formatted) pickerValue = pickerValue.format(this.props.format);
    return pickerValue;
	}

	getI18nOptionsDropDown = () => {
		let options = Array.from(optionsDropDown);
		options.forEach((item) => {
			item['text'] = i18n.t(item['text'].toLowerCase().replace(' ', '_'), { defaultValue: item['text'] })
		});
		return options;
	}

  renderDropDown = () => {
		const value = this.getValue();
		const pickerValue  = this.getPickerValue(true);
		const className = `${this.state.id} datetime-dropdown`;
		const placeholder = this.props.placeholder || i18n.t('select_date', { defaultValue: 'Select the date' });

		let options = this.getI18nOptionsDropDown();
		if (value && !DATE_INTERVALS.includes(value)) options.push({ key: value, value: value, text: value });
		if (pickerValue && pickerValue !== value) options.push({ key: pickerValue, value: pickerValue, text: pickerValue });

		return (
			<DropDown
				selection
				clearable={this.props.clearable}
				placeholder={placeholder}
				className={className}
				value={value}
				options={options}
				onChange={(e, { value }) => this.handleDropDownChange(value)}
			/>
		);
  };

  renderCalendarIcon = () => {
		return (
			<Icon
				id={this.state.id + '-calendar'}
				name="calendar alternate outline"
				size="big"
				style={{ margin: '0 0 0 5px', fontSize: '1.8em', lineHeight: '1.2' }}
				onClick={this.handleInputClick}
			/>
		);
  };

  render() {
		const calendar = this.renderCalendar();
		const pickerValue = this.getPickerValue();

		return (
			<div className="datetime-dropdown-wrapper">
				{this.renderDropDown()}
				<DatePickerStyled style={this.props.style} className="datetime-picker">
					<DatePicker
						calendar={calendar}
						value={pickerValue}
						onChange={this.handlePickerChange}
						open={this.state.open}
					>{this.renderCalendarIcon}</DatePicker>
				</DatePickerStyled>
			</div>
		);
  }
}