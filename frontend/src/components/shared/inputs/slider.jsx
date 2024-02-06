import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Slider from 'rc-slider';
import InputNumber from 'rc-input-number';
import { isUndefined } from 'lodash/lang';
import 'rc-slider/assets/index.css';

const NULL_SEGMENT_WIDTH = 10; // in percentages
const MIN_DEFAULT = 0;
const MAX_DEFAULT = 100;

export default class SliderInput extends Component {
  static propTypes = {
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    value: PropTypes.any,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    onChange: PropTypes.func,
    nulled: PropTypes.bool,
    default: PropTypes.any,
  }

  static defaultProps = {
    onChange: () => null,
    min: MIN_DEFAULT,
    max: MAX_DEFAULT,
  }

  constructor(props) {
    super(props);

    let { min, max, nulled, step, value } = this.props;
    const marks = { [min]: min, [max]: max };

    if (nulled) {
      min = min - (max - min) / NULL_SEGMENT_WIDTH;
      marks[min] = 'Off';
    }

    this.state = { marks, min, step, value };
  }

  componentWillReceiveProps(nextProps) {
    this.setSliderOptions(nextProps)
  }

  componentDidMount() {
    this.setSliderOptions(this.props)
  }

  handleChange = (value = '') => {
    const { min, max, onChange, nulled } = this.props;

    if (nulled && (value < min)) return onChange(null);

    if (!isUndefined(min) && (value < min)) value = min;
    if (!isUndefined(max) && (value > max)) value = max;

    return onChange(value);
  }

  setSliderOptions = (props) => {
    const { min, max, nulled, step, value } = props;
    let marks = {}

    if (min && max && step) {
      marks[min] = min
      marks[max] = max

      this.setState({ marks, min, step, nulled, value })
    }
  }

  getValue = () => {
    const { value } = this.props;

    return (value === 0) ? 0 : (value || '');
  }

  setSliderValue = () => {
    const { value, nulled } = this.props;

    const hasNoValue = (!value && (value !== 0)) || isNaN(value);
    const minValue = nulled ? this.state.min : this.props.min;

    return parseFloat(hasNoValue ? minValue : this.getValue());
  }

  setNumberValue = () => {
    const { nulled, value } = this.props;

    return (nulled && (value === this.state.min)) ? '' : this.getValue();
  }

  render() {
    const { id, max, step } = this.props;
    const { marks, min } = this.state;

    return (
      <div id={id} className="slider">
        <Slider
          value={this.setSliderValue()}
          min={min}
          max={max}
          step={step}
          marks={marks}
          onChange={this.handleChange}
        />
        <InputNumber value={this.setNumberValue()} onChange={this.handleChange} />
      </div>
    );
  }
}
